import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

export interface CollectionLink {
  url: string
  source?: string
  rating?: string
  claim?: string
  date?: string
  locations?: string[]
}
/**
 * Read all html files from the snopes collections folder and return an array of all articles
 */
export async function getArticlesFromCollection({
  directoryIn,
  findLinkFunc,
}: {
  directoryIn: string
  findLinkFunc: (file: string) => CollectionLink[]
}): Promise<CollectionLink[]> {
  /**
   * Read directory
   */
  const htmlFilesDirectory = await readdir(directoryIn)
  /**
   * Read all html files
   */
  const htmlFiles = await Promise.all(
    htmlFilesDirectory.map(async (file) => {
      const htmlFile = await readFile(join(directoryIn, file), 'utf8')
      return htmlFile
    })
  )

  const articles = htmlFiles.map((htmlFile) => findLinkFunc(htmlFile))
  return articles.flat()
}
