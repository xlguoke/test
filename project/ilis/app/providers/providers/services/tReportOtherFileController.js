/* eslint-disable jsdoc/require-returns-description */
import { BaseService } from './basic/base-service'

export class TReportOtherFileControllerService extends BaseService {
  /**
   * @param {string} reportId
   * @returns
   */
  async list(reportId) {
    return await this.Request({
      method: 'POST',
      url: '/rest/tReportOtherFileController/list',
      data: this.toFormData({ reportId }),
    })
  }

  async del(reportId) {
    return await this.Request({
      method: 'DELETE',
      url: `/rest/tReportOtherFileController/${reportId}`,
    })
  }
}
