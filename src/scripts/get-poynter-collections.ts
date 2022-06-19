import input from '../../input/poynter-collections.json'
import path, { join } from 'path'
import { fileURLToPath } from 'url'
import { getCollections } from '../lib/get-collections'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

await getCollections(input, join(__dirname, '../../data/poynter-collections'))
