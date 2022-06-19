import { rateLimitedClient } from './rate-limited-axios'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { RateLimitedAxiosInstance } from 'axios-rate-limit'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// /**
//  * Fetches the snopes articles using the rate limited axios client.
//  */
// export const getArticles = async (articles: string[] = snopesLinks) => {
//   const axios = rateLimitedClient({ maxRPS: 10 })
//   const rawSnopesArticles = []
//   for (const url of articles) {
//     console.log(`fetching article ${url}`)
//     const snopeArticle = axios.get(url)
//     rawSnopesArticles.push(snopeArticle)
//   }

//   const snopesArticles = (await Promise.all(rawSnopesArticles)).map((article) => article.data)
//   return snopesArticles.map((article, index) => ({ url: articles[index], article: `${article}` }))
// }

/**
 * Write snopes articles to directory
 */
export const writeArticles = async ({
  articles,
  force,
  destinationDir,
  trailingSlash = true,
}: {
  /**
   * List of links to articles to fetch and write to disk.
   */
  articles: string[]
  /**
   * Whether to regenerate the files if they already exist
   * @default false
   */
  force?: boolean
  /**
   * The directory to write the articles to
   */
  destinationDir: string
  /**
   * Whether the links have a trailing slash
   * @default true
   */
  trailingSlash?: boolean
}) => {
  const rawWrittenSnopesArticles = []
  // const snopesArticles = await getSnopesArticles(articles)
  const axios = rateLimitedClient({ maxRPS: 10 })
  for (const url of articles) {
    try {
      const filename = join(destinationDir, `${url.split('/').at(trailingSlash ? -2 : -1)}.html`)
      if (force || !existsSync(filename)) {
        console.log(url)
        const article = await axios.get(url)
        const writtenFile = writeFile(filename, `${article.data}`)
        rawWrittenSnopesArticles.push(writtenFile)
      }
    } catch (e) {
      rawWrittenSnopesArticles.push(e)
      console.error(e)
    }
  }
  const writtenSnopesArticles = await Promise.all(rawWrittenSnopesArticles)
  console.log('Done!')
}
