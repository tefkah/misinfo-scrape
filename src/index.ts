import { cli, command } from 'cleye'
import { archiveCollections } from './scripts/archive-snopes-collections'

const argv = cli({
  name: 'scrape-misinfo',
  commands: [
    command({
      name: 'repro',
    }),
    command(
      {
        name: 'archive-snopes-collections',
      },
      async (args) => await archiveCollections()
    ),
  ],
})
