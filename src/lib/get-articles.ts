import { rateLimitedClient } from './rate-limited-axios'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { appendFile, readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { RateLimitedAxiosInstance } from 'axios-rate-limit'

export interface Report {
  [key: string]: {
    status: 'success' | 'failure'
    reason?: string
    location?: string
  }
}

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
  maxRPS,
  greedy = false,
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
  maxRPS?: number
  /**
   * Whether to open multiple connections at once. Doable if you are connecting to different websites
   */
  greedy?: boolean
}) => {
  const rawWrittenSnopesArticles = []
  // const snopesArticles = await getSnopesArticles(articles)
  const axios = rateLimitedClient({ maxRPS: maxRPS || 10 })
  const oldReport =
    existsSync(join(destinationDir, '__article-fetch-report.json')) &&
    JSON.stringify(await readFile(join(destinationDir, '__article-fetch-report.json'), 'utf8'))

  const reportObject: Report = {}
  for (const url of articles) {
    try {
      const filename = join(
        destinationDir,
        `${url
          .replace(/https?:\/\//, '')
          .replace(/\//g, '_')
          .substring(0, 100)}.html`
      )
      if (force || !existsSync(filename)) {
        console.log(url)
        const article = axios
          .get(url)
          .then((article) => {
            writeFile(filename, `${article.data}`)
            reportObject[url] = { status: 'success', location: filename }
          })
          .catch((e) => {
            console.log(e)
            appendFile(
              path.join(destinationDir, '__error.log'),
              `${url}: ${e?.response?.status} - ${e?.response?.statusText}\n`
            )
            reportObject[url] = {
              status: 'failure',
              reason: `${e?.response?.status || e} - ${e?.response?.statusText}`,
            }
          })
        if (!greedy) {
          const awaitedArticle = await article
          rawWrittenSnopesArticles.push(awaitedArticle)
        } else {
          rawWrittenSnopesArticles.push(article)
        }
      }
    } catch (e) {
      rawWrittenSnopesArticles.push(e)
      console.error(e)
    }
  }
  const writtenSnopesArticles = await Promise.all(rawWrittenSnopesArticles)
  const writtenReport = await writeFile(
    join(destinationDir, '__article-fetch-report.json'),
    JSON.stringify(reportObject, null, 2)
  )
  console.log('Done!')
}
