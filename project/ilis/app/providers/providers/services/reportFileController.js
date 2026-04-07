/* eslint-disable jsdoc/require-returns-description */
import { BaseService } from './basic/base-service'

export class ReportFileControllerService extends BaseService {
  /**
   * @returns
   */
  async reconvertReport(reportId) {
    return await this.Request({
      url: `/rest/reportFileController/reconvert/report/${reportId}`,
    })
  }
}
