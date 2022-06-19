import { readdir, readFile, writeFile } from 'fs/promises'
import { JSDOM } from 'jsdom'
import path, { join } from 'path'
import { fileURLToPath } from 'url'
import { findArticleLinksInSnopeCollection } from '../lib/find-article-links-in-snopes-collection'
import { getArticlesFromCollection } from '../lib/get-articles-from-collection'

/**
 * Set __dirname to the directory of the current file
 */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const out = join(__dirname, '../../data/snopes-articles.json')
const directoryIn = join(__dirname, '../../data/snopes-collections')

const articles = await getArticlesFromCollection({
  directoryIn,
  findLinkFunc: findArticleLinksInSnopeCollection,
})
// filter out duplicates
const uniqueArticles = [...new Set(articles)]
await writeFile(out, JSON.stringify(uniqueArticles))

console.log(`Done writing articles to ${out}`)
