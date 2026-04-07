/* eslint-disable jsdoc/require-returns-description */
import { BaseService } from './basic/base-service'

export class NoticeControllerService extends BaseService {
  /**
   * @param data
   * @returns
   */
  async doConsignModifyNotice(data) {
    return await this.Request({
      method: 'POST',
      url: '/noticeController.do?doConsignModifyNotice',
      data: this.toFormData(data),
    })
  }
}
