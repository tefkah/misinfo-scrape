import { readdir, readFile, writeFile } from 'fs/promises'
import { JSDOM } from 'jsdom'
import path, { join } from 'path'
import { fileURLToPath } from 'url'
import { collectionsToLinkStream } from '../lib/collection-to-link-stream'
import { findArticleLinksInPolitifactCollection } from '../lib/find-article-links-in-politifact-collection'
import { findArticleLinksInPoynterCollection } from '../lib/find-article-links-in-poynter-collection'
import { getArticlesFromCollection } from '../lib/get-articles-from-collection'

/**
 * Set __dirname to the directory of the current file
 */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const out = join(__dirname, '../../data/poynter-articles.json')
const directory = join(__dirname, '../../data/poynter-collections')

await collectionsToLinkStream({
  directory,
  findLinkFunc: findArticleLinksInPoynterCollection,
  out,
})
// filter out duplicates
//const uniqueArticles = [...new Set(articles)] //.map((link) => `https://politifact.com${link}`)
