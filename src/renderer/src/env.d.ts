import type { AuteoApi } from '../../shared/types'

declare global {
  interface Window {
    auteo: AuteoApi
  }
}

export {}
