import { JSDOM } from 'jsdom'
import { CollectionLink } from './get-articles-from-collection'

/**
 * Find all the links which start with /factchecks/2020/ in an html file
 */
export const findArticleLinksInPoynterCollection = async (
  fileOrUrl: string
): Promise<CollectionLink[]> => {
  const dom = fileOrUrl.startsWith('http') ? await JSDOM.fromURL(fileOrUrl) : new JSDOM(fileOrUrl)
  const document = dom.window.document
  const articles = document.querySelectorAll('article')
  const factCheckLinks = []
  for (const article of articles) {
    const rating = article
      .querySelector('.entry-title--red')
      ?.textContent?.replace(':', '')
      .toLowerCase()
    const [rawDate, rawLoc] = article.querySelector('strong')?.textContent?.split('|') || []
    const date = new Date(rawDate.trim()).toISOString()
    const locations = rawLoc.trim().split(/ ?, ?/)

    const factChecker = article
      .querySelector('p')
      ?.textContent?.trim()
      .replace(/Fact-Checked by: ?/, '')
    const link = article.querySelector('a')
    const url = link?.getAttribute('href')!
    const claim = link?.textContent?.replace(/\w+?: ?/, '')

    factCheckLinks.push({ date, locations, source: factChecker, claim, url, rating })
  }
  return factCheckLinks
}
