# Node Delete Your Tweets
A script to run at a scheduled interval to delete your tweets and likes at a certain threshold. Work in progress.

## Notes
- **This script performs a very permanent function of deleting tweets after a defined time period. You cannot undo this!**
- This script will only analyze your last 2000 tweets so as to not trigger rate limiting within the Twitter API. This may be updated in the future.

## Installation
- `npm install`
- Copy `.envSample` to `.env` and update the values appropriately. You can get most of these values by creating a Twitter app at https://apps.twitter.com/.

## Running
- `node index.js`
- You may want to add this to a cron job to periodically clear out old tweets.

## TODO
- Fetching likes
- Deleting old likes
- Tests
- Fleshing out this README
