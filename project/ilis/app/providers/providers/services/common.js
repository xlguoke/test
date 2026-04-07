/* eslint-disable jsdoc/require-returns-description */
import { BaseService } from './basic/base-service'

export class CommonService extends BaseService {
  /**
   * 获取已选列
   * @param {string} type
   * @returns
   */
  async chosenColumns(type) {
    return await this.Request({
      url: '/rest/common/chosen-columns',
      params: {
        type,
      },
    })
  }

  /**
   * 获取系统参数
   * @param {string} key
   * @returns
   */
  async getBusinessParam(key) {
    return await this.Request({
      url: '/tSBusinessParamController.do?getBusinessParam',
      params: { key },
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
  }
}
