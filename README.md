# Node Delete Your Tweets
A script to run at a scheduled interval to delete your tweets and likes at a certain threshold. Work in progress.

## Note
This script performs a very permanent function of deleting tweets after a defined time period. You cannot undo this!

## Installation
- `npm install`
- Copy `.envSample` to `.env` and update the values appropriately.

## Running
- `node index.js`
- You may want to add this to a cron job to periodically clear out old tweets.

## TODO
- Fetching likes
- Deleting old likes
- Tests
- Fleshing out this README
