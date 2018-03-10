require('dotenv').config()
const Twitter = require('./lib/twitter')
const _ = require('lodash')
const Moment = require('moment')

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
        console.log(`Could not delete tweet: ${tweet.text} (ID ${tweet.id_str}) - Reason: ${error}`)
      })
    })
  }
}).catch((error) => {
  console.error(`Error: ${error}`)
})
