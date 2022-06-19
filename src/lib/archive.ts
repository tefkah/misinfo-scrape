import axios, { AxiosStatic } from 'axios'
import { RateLimitedAxiosInstance } from 'axios-rate-limit'

export const archive = async (
  link: string,
  /**
   * It's recommended to pass a ratelimited client here to avoid hameering the server.
   */
  axiosClient?: RateLimitedAxiosInstance
) => {
  const url = `https://web.archive.org/save/${link}`

  try {
    const response = await (axiosClient || axios).get(url)
    const data = response.headers['content-location']
    return `https://web.archive.org/${data}`
  } catch (error) {
    throw error
  }
}
