import { readFile, writeFile } from 'fs/promises'
import { JSDOM } from 'jsdom'
import path from 'path'
import { getPreEmitDiagnostics } from 'typescript'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Extracts fact check links from an html file by looking for <article> tags which contain an
 * <a> tag with a class of "card-layout__link" and a <div> with a class of card-layout__date which contains
 * a date no later than the specified date.
 */

export const findLinksInPoynterArticle = async (
  file: string,
  date: string,
  destination?: string
): Promise<string[]> => {
  const dom = new JSDOM(file)
  const document = dom.window.document
  const articles = document.querySelectorAll('article')
  const links = []
  console.log(articles)
  for (const article of articles) {
    const link = article.querySelector('a.card-layout__link')
    console.log(article)
    if (!link) {
      continue
    }
    const dateDiv = article.querySelector('div.card-layout__date')
    if (!dateDiv) {
      continue
    }

    const dateText = dateDiv.textContent
    if (!dateText) {
      continue
    }

    const textDate = new Date(dateText)

    if (textDate.getTime() <= new Date(date).getTime() && link.getAttribute('href')) {
      links.push(link.getAttribute('href')!)
    }
  }

  /**
   * Write the Poynet links to a json file
   */
  await writeFile(
    destination || path.join(__dirname, '../../data/poynter-links.json'),
    JSON.stringify(links, null, 2)
  )

  return links
}

const poynterArticle = await readFile(
  path.join(__dirname, '../../data/poynter-2020/Fact-Checking - Poynter.html'),
  'utf8'
)

await findLinksInPoynterArticle(poynterArticle, '2020-07-18')
