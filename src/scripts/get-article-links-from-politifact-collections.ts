import { readdir, readFile, writeFile } from 'fs/promises'
import { JSDOM } from 'jsdom'
import path, { join } from 'path'
import { fileURLToPath } from 'url'
import { findArticleLinksInPolitifactCollection } from '../lib/find-article-links-in-politifact-collection'
import { getArticlesFromCollection } from '../lib/get-articles-from-collection'

/**
 * Set __dirname to the directory of the current file
 */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const out = join(__dirname, '../../data/politifcat-articles.json')
const directoryIn = join(__dirname, '../../data/politifact-collections')

const articles = await getArticlesFromCollection({
  directoryIn,
  findLinkFunc: findArticleLinksInPolitifactCollection,
})
// filter out duplicates
const uniqueArticles = [...new Set(articles)].map((link) => `https://politifact.com${link}`)
await writeFile(out, JSON.stringify(uniqueArticles))

console.log(`Done writing articles to ${out}`)
