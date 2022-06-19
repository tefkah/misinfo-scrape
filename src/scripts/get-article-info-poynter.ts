import { writeArticles } from '../lib/get-articles'

import snopes from '../../data/politifact-articles.json'

import path, { join } from 'path'
import { fileURLToPath } from 'url'
import { getArticleInfoForDir } from '../lib/get-tweets-from-article'
import { writeFile } from 'fs/promises'

/**
 * Set __dirname to the directory of the current file
 */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('Getting article info for politifact articles...')

const articleInfo = await getArticleInfoForDir(
  join(__dirname, '../../data/poynter-articles'),
  join(__dirname, '../../data/poynter-info.json')
)

// const politifactInfo = await writeFile(
//   join(__dirname, '../../data/politifact-info.json'),
//   JSON.stringify(articleInfo, null, 2)
// )
// const politifactInfoMin = await writeFile(
//   join(__dirname, '../../data/politifact-info-minified.json'),
//   JSON.stringify(articleInfo)
// )
