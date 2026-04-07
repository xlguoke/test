import { IDictionary } from "./IDictionary"
export class AnyDictionaryModel implements IDictionary {
  key!: string | number | symbol | boolean
  label!: any
  description?: string
}
