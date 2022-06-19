export interface Info {
  source: string
  tweets: Tweet[]
  title: string
  date: string
  description: string
  url: string
  meta: Meta
  normalizedRating: number
}

type Meta =
  | {
      DOMAIN: string
      'PAGE-TYPE': string
      Editions: string[]
      'Truth-O-Meter': string
    }
  | { rating: string }

interface Tweet {
  url: string
  id: string
}
