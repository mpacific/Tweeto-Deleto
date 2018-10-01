require('dotenv').config()
const Twitter = require('./lib/twitter')
const _ = require('lodash')
const Moment = require('moment')
const Promise = require('bluebird')

if (process.env.TWITTER_DELETE_TWEETS === 'true') {
  console.log(`Started tweet deleting at: ${new Moment().format()}`)

  Twitter.get_timeline().then((tweets) => {
    if (tweets.length === 0) {
      console.warn('No tweets found!')
      return
    }

    console.log(`Total tweets: ${tweets.length}`)

    let tweetCounter = 0
    let oldTweets = []
    _.forEach(tweets, (tweet) => {
      if ((parseInt(process.env.MAX_TWEETS) && tweetCounter > parseInt(process.env.MAX_TWEETS)) || new Moment().diff(new Moment(new Date(tweet.created_at)), 'days') >= process.env.TWEET_MAX_DAYS) {
        if (!parseInt(process.env.MIN_TWEETS) || (parseInt(process.env.MIN_TWEETS) && tweetCounter >= parseInt(process.env.MIN_TWEETS))) {
          oldTweets.push(tweet)
        }
      }
      tweetCounter++
    })

    console.log(`Old tweets: ${oldTweets.length}`)
    if (oldTweets.length > 0) {
      Promise.mapSeries(oldTweets, (tweet) => {
        return Twitter.request(`statuses/destroy/${tweet.id_str}`, 'POST', {
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

if (process.env.TWITTER_DELETE_RETWEETS === 'true') {
  console.log(`Started deleting retweets at: ${new Moment().format()}`)

  Twitter.get_timeline().then(tweets => {
    // filter out non-retweets
    let retweets = tweets.filter(tweet => {
      return typeof tweet.retweeted_status !== 'undefined'
    })

    if (retweets.length === 0) {
      console.warn('No retweets found!')
      return
    }

    console.log(`Total retweets: ${retweets.length}`)

    let oldRetweets = retweets.filter(retweet => {
      return new Moment().diff(new Moment(new Date(retweet.created_at)), 'days') >= process.env.RETWEET_MAX_DAYS
    })

    console.log(`Old retweets: ${oldRetweets.length}`)
    if (oldRetweets.length > 0) {
      Promise.mapSeries(oldRetweets, retweet => {
        return Twitter.request(`statuses/destroy/${retweet.id_str}`, 'POST', {
          id: retweet.id_str
        }).then(deletedRetweet => {
          console.log(`Deleted retweet: ${retweet.text} (ID ${retweet.id_str})`)
        }).catch(error => {
          console.error(`Could not delete retweet: ${retweet.text} (ID ${retweet.id_str}) - Reason: ${error}`)
        })
      })
    }
  }).catch((error) => {
    console.error(`Retweet error: ${error}`)
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
      if (like.favorited === true && new Moment().diff(new Moment(new Date(like.created_at)), 'days') >= process.env.LIKE_MAX_DAYS) {
        oldLikes.push(like)
      }
    })

    console.log(`Old likes: ${oldLikes.length}`)
    if (oldLikes.length > 0) {
      Promise.mapSeries(oldLikes, (like) => {
        return Twitter.request(`favorites/destroy`, 'POST', {
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
