/* eslint-disable jsdoc/require-returns-description */
import { BaseService } from './basic/base-service'

export class CrossPageSealReportService extends BaseService {
  /**
   * @param {string} reportIds 报告id
   * @returns
   */
  async reportSealList(reportIds) {
    return await this.Request({
      url: '/rest/crossPageSealReport/reportSealList',
      params: {
        reportIds,
      },
    })
  }

  /**
   * @param data
   * @returns
   */
  async saveReportSeal(data) {
    return await this.Request({
      method: 'POST',
      url: '/rest/crossPageSealReport/saveReportSeal',
      data,
    })
  }
}
