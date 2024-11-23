import axios, { AxiosError, AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'

const client: AxiosInstance = axios.create()

axiosRetry(client, {
  retries: 3,
  retryDelay: (retryCount: number) => retryCount * 1000,
  retryCondition: (error: AxiosError) => {
    return error.response?.status === 406 || error.response?.status === 429
  }
})

export { client } 