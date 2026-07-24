import type { LogcutApi } from '../../shared/types'

declare global {
  interface Window {
    logcut: LogcutApi
  }
}

export {}
