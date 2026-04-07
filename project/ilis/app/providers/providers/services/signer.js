/* eslint-disable jsdoc/require-returns-description */
import { BaseService } from './basic/base-service'

export class SignerService extends BaseService {
  /**
   * @param {string} reportIds 报告id
   * @returns
   */
  async allocatedUser(reportIds) {
    return await this.Request({
      url: '/rest/signer/allocatedUser',
      params: {
        reportIds,
      },
    })
  }

  /**
   * @param data
   * @returns
   */
  async allocate(data) {
    return await this.Request({
      method: 'POST',
      url: '/rest/signer/allocate',
      data,
    })
  }
}
