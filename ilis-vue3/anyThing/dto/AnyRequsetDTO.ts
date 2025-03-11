import { getSearchFileldConfigObj } from '../decorator/SearchField'
import { AnyBaseModel } from '../model/AnyBaseModel'

export class AnyRequsetDTO extends AnyBaseModel {
  toWebSQL() {
    const configObj = getSearchFileldConfigObj(this)
    const keys = Object.keys(configObj)
    let sql = ''
    for (const key of keys) {
      const config = configObj[key]
      sql += `${key}${config.type}${this[key]};`
    }
    return sql
  }
}
