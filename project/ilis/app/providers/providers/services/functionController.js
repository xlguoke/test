/* eslint-disable jsdoc/require-returns-description */
import { BaseService } from './basic/base-service'

export class FunctionControllerService extends BaseService {
  /**
   * @param {string} functionCode
   * @returns
   */
  async usersByCode(functionCode) {
    return await this.Request({
      url: '/rest/functionController/usersByCode',
      params: {
        functionCode,
      },
    })
  }
}
