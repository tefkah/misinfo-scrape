import { readFileSync, writeFileSync } from 'fs'
import tweets from '../../data/poynter-info-tweets.json'

const theirData = readFileSync('../../input/dataset-i.csv', 'utf-8')

const whoTweets = tweets
  .flatMap((tweet) =>
    tweet.tweets.map((tweet) => {
      if (/\/.*?WHO.*?\//.test(tweet.url)) return tweet
    })
  )
  .filter(Boolean)

const uniqueWhoTweets = Array.from(new Set(whoTweets))

console.log(theirData)
const whoTweetsInTheirData = uniqueWhoTweets
  .filter((tweet) => new RegExp(`${tweet?.id}\\s*[\\w ]*false`, 'i').test(theirData))
  .map((tweet) => ({
    ...tweet,
    verdict: theirData.replace(new RegExp(`.*${tweet?.id}\\s*((partially )?false).*`, 'si'), '$1'),
  }))

writeFileSync(
  '../../data/who-tweets-labeled-false.json',
  JSON.stringify(whoTweetsInTheirData, null, 2)
)
console.log(whoTweetsInTheirData.length)

console.log(whoTweetsInTheirData)
