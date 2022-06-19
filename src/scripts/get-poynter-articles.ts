import { writeArticles } from '../lib/get-articles'

import poynter from '../../data/poynter-links.json'

import path, { join } from 'path'
import { fileURLToPath } from 'url'

/**
 * Set __dirname to the directory of the current file
 */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

await writeArticles({
  articles: poynter,
  destinationDir: join(__dirname, '../../data/poynter-articles'),
})
