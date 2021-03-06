import { JSDOM } from 'jsdom'
import { CollectionLink } from './get-articles-from-collection'

/**
 * Find all the links which start with /factchecks/2020/ in an html file
 */
export const findArticleLinksInPolitifactCollection = (file: string): CollectionLink[] => {
  const dom = new JSDOM(file)
  const document = dom.window.document
  const links = document.querySelectorAll('a[href^="/factchecks/2020/"]')
  const factCheckLinks = []
  for (const link of links) {
    const href = link.getAttribute('href')
    if (href) {
      factCheckLinks.push(href)
    }
  }
  return factCheckLinks
}
