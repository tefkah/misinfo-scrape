import axios, { AxiosError } from 'axios'
import axiosRateLimit from 'axios-rate-limit'
import axiosRetry from 'axios-retry'

type RetryCondition = (error: AxiosError) => boolean
const retryCondition = (type?: string): RetryCondition => {
  switch (type) {
    case 'archive':
      return (error: AxiosError) => error?.response?.status === 429

    default:
      return (error: AxiosError) => !error.response
  }
}
export const rateLimitedClient = (options?: { type?: string; maxRPS?: number }) => {
  const rateLimited = axiosRateLimit(axios.create(), { maxRPS: options?.maxRPS || 5 })

  axiosRetry(rateLimited, {
    retries: 4,
    retryCondition: retryCondition(options?.type),
    retryDelay: axiosRetry.exponentialDelay,
  })

  return rateLimited
}
