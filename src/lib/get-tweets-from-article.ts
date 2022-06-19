import { createWriteStream } from 'fs'
import { readdir, readFile } from 'fs/promises'
import { JSDOM } from 'jsdom'
import { join } from 'path'
import { Stream } from 'stream'
import { isPolitifact } from './determine-source'

/**
 * Find all twitter links in the main body of an article which aren't "intent" type links.
 * Returns an object with the article title and the links.
 */

export const findTwitterLinksInArticle = (file: string) => {
  const dom = new JSDOM(file)
  const document = dom.window.document
  const links = document.querySelectorAll('a')
  const twitterLinks = []
  for (const link of links) {
    const href = link.getAttribute('href')

    if (href && href.includes('twitter.com') && !href.includes('intent')) {
      twitterLinks.push(link.getAttribute('href')!)
    }
  }

  return twitterLinks
}

/**
 * Find the title of the article by metadata
 */
export const findDescriptionInArticle = (file: string) => {
  const dom = new JSDOM(file)
  const document = dom.window.document
  const title = document.querySelector('meta[property="og:title"]')?.getAttribute('content')
  // get description
  const description = document
    .querySelector('meta[property="og:description"]')
    ?.getAttribute('content')

  const date = document
    .querySelector('meta[property="article:published_time"], .m-author__date, time')
    ?.getAttribute('content')

  return { title, date, description }
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
  const politifactMeta = politifactMetaBad.replace(/'/g, '"').replace(/,.*\n+ *?\}/ms, '}')
  console.log(politifactMeta)
  return JSON.parse(politifactMeta)
}

/**
 * Find all the twitter links from a directory of html files
 */
export const getArticleInfoForDir = async (directory: string, out: string) => {
  const files = await readdir(directory)
  const output = createWriteStream(out)
  output.write('[\n')
  const links = await Promise.all(
    files.map(async (file) => {
      console.log(`Processing ${file}`)
      const htmlFile = await readFile(join(directory, file), 'utf8')
      const politifact = isPolitifact(htmlFile)
      const twitter = findTwitterLinksInArticle(htmlFile)
      const desc = findDescriptionInArticle(htmlFile)

      const meta = politifact ? findPolitifactMeta(htmlFile) : findSnopesMeta(htmlFile)
      console.log(`Finished processing ${desc.title}
      Tweets: ${twitter}
      Verdict: ${meta.rating || meta['Truth-O-Meter']}`)
      const data = { tweets: twitter, desc, meta }
      output.write(JSON.stringify(data, null, 2) + '\n')
    })
  )
  output.write(']')
  output.close()

  return links
}
