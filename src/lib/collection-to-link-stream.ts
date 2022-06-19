import { createWriteStream } from 'fs'
import { readdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { CollectionLink } from './get-articles-from-collection'
import { hydratePoynterLink } from './hydrate-poynter-links'
export const collectionsToLinkStream = async ({
  directory,
  out,
  findLinkFunc,
}: {
  directory: string
  out: string
  findLinkFunc: (file: string) => CollectionLink[]
}) => {
  const writeStream = createWriteStream(out)

  writeStream.write('[\n')

  const write = async (file: string, last: boolean) => {
    const f = await readFile(path.join(directory, file), 'utf-8')
    const links = findLinkFunc(f)
    console.log(`Found ${links.length} links in ${file}`)
    const hydratedLinksPromises = []

    for (let i = 0; i < links.length; i++) {
      const link = links[i]
      const hydratedLink = hydratePoynterLink(link)
      hydratedLinksPromises.push(hydratedLink)
    }
    const hydratedLinks = await Promise.all(hydratedLinksPromises)

    for (let i = 0; i < hydratedLinks.length; i++) {
      const hydratedLink = hydratedLinks[i]
      writeStream.write(
        `${JSON.stringify(hydratedLink, null, 2)}${
          last && i === hydratedLinks.length - 1 ? '' : ','
        }\n${last ? ']' : ''}`
      )
    }
  }

  const files = (await readdir(directory)).sort(
    (a, b) => parseInt(b.replace('.html', '')) - parseInt(a.replace('.html', ''))
  )
  for (let i = 0; i < files.length; i++) {
    await write(files[i], i === files.length - 1)
  }

  writeStream.close()
  console.log(`Done writing to ${out}`)

  /**
   * Create minified version
   */
  const minifiedOut = out.replace('.json', '-minified.json')
  const json = await readFile(out, 'utf-8')
  await writeFile(minifiedOut, JSON.stringify(JSON.parse(json)))
}
