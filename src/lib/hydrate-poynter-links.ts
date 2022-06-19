import { JSDOM } from 'jsdom'
import { CollectionLink } from './get-articles-from-collection'

export const hydratePoynterLink = async (link: CollectionLink) => {
  const dom = await JSDOM.fromURL(link.url)
  const document = dom.window.document
  const article = document.querySelector('article')
  const hydrateLink = article?.querySelector('a')
  const hydratedUrl = hydrateLink?.getAttribute('href')
  const blameP = hydrateLink?.nextElementSibling?.textContent?.trim() || ''

  const blame = /This false claim originated from/i.test(blameP)
    ? blameP.replace(/This false claim originated from: ?/, '')
    : undefined

  return { ...link, url: hydratedUrl, poynterLink: link.url, blame: blame || null }
}
/**
 * Follow all the urls in the collectionlink object and in the document, find the link whose textcontent contains "Read the Full Article"
 * and the text following "This false claim originated from:"
 */
// export const hydratePoynterLinks = async (links: CollectionLink[]) => {
//   const hydratedLinks = []
//   for (const link of links) {
//     inks.push({ ...link, url: hydratedUrl, blame })
//   }
//   return hydratedLinks
// }
