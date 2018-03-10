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
      qs: Object.assign({}, params, oAuthParams),
      headers: {
        Authorization: oAuthHeaders.join(', ')
      },
      json: true
    }

    console.log(requestOptions)

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
      if (tweets.length > 0) {
        tweetList = tweetList.concat(tweets)
      }

      if (tweets.length === maxLength) {
        return this.get_timeline(tweets[tweets.length - 1].id, tweetList)
      }

      return tweetList
    })
  }
}
