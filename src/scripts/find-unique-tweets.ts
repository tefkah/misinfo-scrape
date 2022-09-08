import { fstat, writeFileSync } from 'fs'
import tweets from '../../data/poynter-info-tweets.json'

const tweetids = tweets.map((tweet) => tweet.tweets.map((t) => t.id)).flat()
const uniqueTweetIds = Array.from(new Set(tweetids))

const csv = `id\n${uniqueTweetIds.join('\n')}`
writeFileSync('../../data/poynter-unique-tweet-ids.csv', csv)
console.log(tweetids.length)
console.log(uniqueTweetIds.length)
