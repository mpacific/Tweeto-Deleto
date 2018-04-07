const Request = require('request-promise')
const RandomString = require('randomstring')
const Moment = require('moment')
const CryptoJs = require('crypto-js')

module.exports = {
  baseUrl: 'https://api.twitter.com/1.1/',
  sign (url, method, params) {
    let signatureBase = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(params)}`
    let signingKey = `${encodeURIComponent(process.env.TWITTER_CONSUMER_SECRET)}&${encodeURIComponent(process.env.TWITTER_ACCESS_SECRET)}`

    return CryptoJs.enc.Base64.stringify(CryptoJs.HmacSHA1(signatureBase, signingKey))
  },
  formatParams (params) {
    let formattedParams = []

    Object.keys(params).sort().forEach(function (key) {
      let value = params[key]
      formattedParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    })

    return formattedParams.join('&')
  },
  request (uri, method, params) {
    let url = `${this.baseUrl}${uri}.json`
    let nonce = RandomString.generate()
    let timestamp = new Moment().unix()
    let oAuthParams = {
      include_entities: true,
      oauth_consumer_key: process.env.TWITTER_CONSUMER_KEY,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_token: process.env.TWITTER_ACCESS_TOKEN,
      oauth_version: '1.0'
    }
    let signature = this.sign(url, method, this.formatParams(Object.assign({}, params, oAuthParams)))

    let oAuthHeaders = [
      `OAuth oauth_consumer_key="${process.env.TWITTER_CONSUMER_KEY}"`,
      `oauth_nonce="${nonce}"`,
      `oauth_signature="${encodeURIComponent(signature)}"`,
      `oauth_signature_method="HMAC-SHA1"`,
      `oauth_timestamp="${timestamp}"`,
      `oauth_token="${process.env.TWITTER_ACCESS_TOKEN}"`,
      `oauth_version="1.0"`
    ]

    let requestOptions = {
      url: url,
      method: method,
      qs: Object.assign({}, params, oAuthParams),
      headers: {
        Authorization: oAuthHeaders.join(', ')
      },
      json: true
    }

    return Request(requestOptions)
  },
  get_timeline (maxId, tweetList = []) {
    let maxLength = 200
    let params = {
      screen_name: process.env.TWITTER_USERNAME,
      count: maxLength,
      exclude_replies: false,
      include_rts: true
    }
    if (maxId) {
      params.max_id = maxId
    }

    return this.request('statuses/user_timeline', 'GET', params).then((tweets) => {
      if (tweets.length > 1) {
        if (tweetList.length > 0 && tweets[0].id_str === tweetList[tweetList.length - 1].id_str) {
          tweets.shift()
        }

        tweetList = tweetList.concat(tweets)

        if (tweetList.length < 2000) {
          return this.get_timeline(tweets[tweets.length - 1].id_str, tweetList)
        }
      }

      return tweetList
    })
  },
  get_likes (maxId, likeList = []) {
    let maxLength = 200
    let params = {
      screen_name: process.env.TWITTER_USERNAME,
      count: maxLength
    }
    if (maxId) {
      params.max_id = maxId
    }

    return this.request('favorites/list', 'GET', params).then((likes) => {
      if (likes.length > 1) {
        if (likeList.length > 0 && likes[0].id_str === likeList[likeList.length - 1].id_str) {
          likes.shift()
        }

        likeList = likeList.concat(likes)

        if (likeList.length < 2000) {
          return this.get_likes(likes[likes.length - 1].id_str, likeList)
        }
      }

      return likeList
    })
  }
}
