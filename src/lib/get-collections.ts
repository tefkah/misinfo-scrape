import { writeFile } from 'fs/promises'
import { join } from 'path'
import { rateLimitedClient } from './rate-limited-axios'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const getCollections = async (
  input: { start: number; end: number; baseUrl: string },
  destinationDir: string
) => {
  const { start, end, baseUrl } = input
  const axios = rateLimitedClient({ maxRPS: 10 })

  const rawSnopePages = []
  for (let i = start; i < end; i++) {
    console.log(`fetching collection ${i}`)
    const url = `${baseUrl}${i}`

    const snopePage = axios.get(url)
    rawSnopePages.push(snopePage)
  }

  const Pages = (await Promise.all(rawSnopePages)).map((page) => page.data)

  const rawWrittenCollections = []
  for (let i = 0; i <= Pages.length; i++) {
    try {
      console.log(Pages[i])
      const writtenFile = await writeFile(join(destinationDir, `${i + start}.html`), `${Pages[i]}`)
      rawWrittenCollections.push(writtenFile)
    } catch (e) {
      rawWrittenCollections.push(e)
      console.error(e)
    }
  }

  const writtenCollections = await Promise.all(rawWrittenCollections)
  console.log('Done!')
}
