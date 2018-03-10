require('dotenv').config()
const twitter = require('./lib/twitter.js')

twitter.get_timeline().then((timeline) => {
  console.log('Timeline', timeline.length)
}).catch((error) => {
  console.error(`Error: ${error}`)
})
