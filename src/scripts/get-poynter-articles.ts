import { writeArticles } from '../lib/get-articles'

import poynter from '../../data/poynter-articles-min.json'

import path, { join } from 'path'
import { fileURLToPath } from 'url'
import { HydratedCollectionLink } from '../lib/hydrate-poynter-links'

/**
 * Set __dirname to the directory of the current file
 */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const poynterArticles = (poynter as HydratedCollectionLink[]).map((article) => article.url)
await writeArticles({
  articles: poynterArticles,
  destinationDir: join(__dirname, '../../data/poynter-articles'),
  greedy: true,
  maxRPS: 50,
})
