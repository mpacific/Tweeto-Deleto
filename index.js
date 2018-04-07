require('dotenv').config()
const Twitter = require('./lib/twitter')
const _ = require('lodash')
const Moment = require('moment')

if (process.env.TWITTER_DELETE_TWEETS === 'true') {
  console.log(`Started tweet deleting at: ${new Moment().format()}`)

  Twitter.get_timeline().then((tweets) => {
    if (tweets.length === 0) {
      console.warn('No tweets found!')
      return
    }

    console.log(`Total tweets: ${tweets.length}`)

    let oldTweets = []
    _.forEach(tweets, (tweet) => {
      if (new Moment().diff(new Moment(new Date(tweet.created_at)), 'days') >= process.env.TWITTER_MAX_DAYS) {
        oldTweets.push(tweet)
      }
    })

    console.log(`Old tweets: ${oldTweets.length}`)
    if (oldTweets.length > 0) {
      _.forEach(oldTweets, (tweet) => {
        Twitter.request(`statuses/destroy/${tweet.id_str}`, 'POST', {
          id: tweet.id_str
        }).then((deletedTweet) => {
          console.log(`Deleted tweet: ${tweet.text} (ID ${tweet.id_str})`)
        }).catch((error) => {
          console.error(`Could not delete tweet: ${tweet.text} (ID ${tweet.id_str}) - Reason: ${error}`)
        })
      })
    }
  }).catch((error) => {
    console.error(`Tweet error: ${error}`)
  })
}

if (process.env.TWITTER_DELETE_LIKES === 'true') {
  console.log(`Started unliking at: ${new Moment().format()}`)

  Twitter.get_likes().then((likes) => {
    if (likes.length === 0) {
      console.warn('No likes found!')
      return
    }

    console.log(`Total likes: ${likes.length}`)

    let oldLikes = []
    _.forEach(likes, (like) => {
      if (new Moment().diff(new Moment(new Date(like.created_at)), 'days') >= process.env.TWITTER_MAX_DAYS) {
        oldLikes.push(like)
      }
    })

    console.log(`Old likes: ${oldLikes.length}`)
    if (oldLikes.length > 0) {
      _.forEach(oldLikes, (like) => {
        Twitter.request(`favorites/destroy`, 'POST', {
          id: like.id_str
        }).then((deletedLike) => {
          console.log(`Unliked: ${like.text} (ID ${like.id_str})`)
        }).catch((error) => {
          console.error(`Could not unlike: ${like.text} (ID ${like.id_str}) - Reason: ${error}`)
        })
      })
    }
  }).catch((error) => {
    console.error(`Like error: ${error}`)
  })
}
