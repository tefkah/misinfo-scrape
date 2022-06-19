import axios from 'axios'
import axiosRateLimit from 'axios-rate-limit'
import axiosRetry from 'axios-retry'
import { writeFile } from 'fs/promises'
import input from '../../input/snopes-collections.json'
import { archive } from '../lib/archive'
import { rateLimitedClient } from '../lib/rate-limited-axios'

const retryDelay = (retryCount: number) => retryCount * 1000

export const archiveCollections = async (): Promise<
  {
    link: string
    archivedUrl: string
  }[]
> => {
  const { start, end, baseUrl } = input

  const data = []

  const rateLimited = rateLimitedClient({ type: 'archive' })

  for (let i = start; i < end; i++) {
    const url = `${baseUrl}/${i}`
    const archivedUrl = archive(url, rateLimited)
    data.push(archivedUrl)
  }

  const archivedCollections = (await Promise.all(data)).map((archivedUrl, index) => ({
    url: `${baseUrl}/${index + start}`,
    archivedUrl,
  }))

  // @ts-expect-error shh for now
  return archivedCollections
}

export const writeArchivesToFile = async (file: string) => {
  const archives = await archiveCollections()
  await writeFile(file, JSON.stringify(archives))
  console.log(`Done writing archived snopes collections to ${file}`)
}

await writeArchivesToFile('../../data/snopes-collections-archived.json')
