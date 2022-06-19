import { createWriteStream } from 'fs'
import { readdir, readFile } from 'fs/promises'
import { JSDOM } from 'jsdom'
import { join } from 'path'
import { Stream } from 'stream'
import { isPolitifact } from './determine-source'
import { ratingMapNumbers } from './rating-map'

const illegalTwitterRegex = /(share\?|\/Politifact)/i

/**
 * Find all twitter links in the main body of an article which aren't "intent" type links.
 * Returns an object with the article title and the links.
 */
export const findTwitterLinksInArticle = (file: string) => {
  const dom = new JSDOM(file)
  const document = dom.window.document
  const links = document.querySelectorAll('body a')
  const twitterLinks = []
  for (const link of links) {
    const href = link.getAttribute('href')

    if (href && href.includes('twitter.com') && !illegalTwitterRegex.test(href)) {
      twitterLinks.push({ url: href, id: href.match(/status\/(\d+)/i)?.[1] })
    }
  }

  return twitterLinks || []
}

/**
 * Find the title of the article by metadata
 */
export const findDescriptionInArticle = (file: string, isPolitifact: boolean) => {
  const dom = new JSDOM(file)
  const document = dom.window.document
  const title = document
    .querySelector('meta[property="og:title"]')
    ?.getAttribute('content')
    ?.replace('PolitiFact - ', '')
  // get description
  const description = document
    .querySelector('meta[property="og:description"]')
    ?.getAttribute('content')

  const date = isPolitifact
    ? document.querySelector('.m-author__date')?.textContent
    : document.querySelector('time')?.textContent

  const url = document.querySelector('meta[property="og:url"]')?.getAttribute('content')

  return { title, date: date ? new Date(date).toISOString() : undefined, description, url }
}

const normalizeRating = (rating: string) => {
  const lowerrating = rating.toLowerCase().replace(/\!/, '').replace(/-/, ' ')
  if (lowerrating in ratingMapNumbers) {
    // @ts-expect-error shush
    return ratingMapNumbers[lowerrating] || rating
  }
  return rating
}
/**
 * Find the date of the article by metadata
//  */
// export const findDateInArticle = async (file: string) => {
//   const dom = new JSDOM(file)
//   const document = dom.window.document
//   if (date) {
//     return new Date(date.getAttribute('content') as string)
//   }
//   return null
// }

export const findSnopesMeta = (file: string) => {
  const snopesRatingRegexp = /'https:\/\/www\.snopes.com\/fact-check\/([\^'])'/
  const snopesRating = file.match(snopesRatingRegexp)

  return { rating: snopesRating?.[1] }
}

export const findPolitifactMeta = (file: string) => {
  const politifactMetaBad = file.match(/targeting: (\{.*?\})/ims)?.[1] || ''
  const politifactMeta = politifactMetaBad.replace(/'/g, '"').replace(/,[^\w,"]+?\}/ms, '}')
  return JSON.parse(politifactMeta)
}

/**
 * Find all the twitter links from a directory of html files
 */
export const getArticleInfoForDir = async (directory: string, out: string, minified = false) => {
  const files = await readdir(directory)
  const output = createWriteStream(out)

  output.write('[\n')

  const write = async (file: string, minified = false, last: boolean) => {
    console.log(`Processing ${file}`)
    const htmlFile = await readFile(join(directory, file), 'utf8')
    const politifact = isPolitifact(htmlFile)
    const twitter = findTwitterLinksInArticle(htmlFile)
    const desc = findDescriptionInArticle(htmlFile, politifact)

    const meta = politifact ? findPolitifactMeta(htmlFile) : findSnopesMeta(htmlFile)
    console.log(`Finished processing ${desc.title}
  Tweets: ${JSON.stringify(twitter) || 'none lmao'}
  Verdict: ${meta.rating || meta['Truth-O-Meter']}`)

    const rating = normalizeRating(meta.rating || meta['Truth-O-Meter'])

    const data = {
      source: politifact ? 'PolitiFact' : 'Snopes',
      tweets: twitter,
      ...desc,
      meta,
      normalizedRating: rating,
    }
    const res = output.write(`${JSON.stringify(data, null, 2)}${last ? '' : ','}${'\n'}`)
  }

  for (let i = 0; i < files.length; i++) {
    await write(files[i], minified, i === files.length - 1)
  }

  output.write(']')
  output.close()

  //  return links
}
