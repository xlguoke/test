/* eslint-disable jsdoc/require-returns-description */
import { BaseService } from './basic/base-service'

export class CommonBodyReportService extends BaseService {
  /**
   * 自动匹配报告印章
   * @param {string[]} reportIds
   * @returns
   */
  async autoSet(reportIds) {
    return await this.Request({
      method: 'POST',
      url: '/rest/common-body/report/seal/auto-set',
      data: reportIds,
    })
  }

  /**
   * 设置签章页码
   */
  async file(data) {
    return await this.Request({
      method: 'POST',
      url: '/rest/common-body/report/seal/file',
      data,
    })
  }

  /**
   * 获取已设置的印章
   */
  async batch(reportIds) {
    return await this.Request({
      method: 'GET',
      url: '/rest/common-body/report/seal/batch',
      params: {
        reportIds,
      },
    })
  }

  /**
   * 保存设置印章
   */
  async batchSave(data) {
    return await this.Request({
      method: 'POST',
      url: '/rest/common-body/report/seal/batch-save',
      data,
    })
  }
}
