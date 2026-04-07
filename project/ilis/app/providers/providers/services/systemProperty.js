/* eslint-disable jsdoc/require-returns-description */
import { BaseService } from './basic/base-service'

export class SystemPropertyService extends BaseService {
  /**
   * @param {"QUALIFICATION_STATEMENT_AUTO_FORMAT"|"QUALIFICATION_STATEMENT_ALL_FORMAT"} key
   * @returns
   */
  async getKey(key) {
    return await this.Request({
      url: '/rest/systemProperty/getKey',
      params: {
        key,
      },
    })
  }

  /**
   * @param data
   * @returns
   */
  async save(data) {
    return await this.Request({
      method: 'put',
      url: '/rest/systemProperty',
      data,
    })
  }
}
