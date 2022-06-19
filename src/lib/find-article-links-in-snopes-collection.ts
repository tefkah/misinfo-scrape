import { JSDOM } from 'jsdom'

// read htmlfile and find anchor tags in article
export function findArticleLinksInSnopeCollection(htmlFile: string): string[] {
  const dom = new JSDOM(htmlFile)
  const anchors = dom.window.document.querySelectorAll('article a') as NodeListOf<HTMLAnchorElement>
  const articles = Array.from(anchors).map((anchor) => anchor.href)

  // filter out news articles
  return articles.filter((article) => !article.includes('/news/'))
}
