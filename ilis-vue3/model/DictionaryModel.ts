import type { IDictionary } from '~/interface/IDictionary'

export class AnyDictionaryModel implements IDictionary {
  key!: string | number | symbol | boolean
  label!: any
  description?: string
  color?: string
}
