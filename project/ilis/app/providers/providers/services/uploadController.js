/* eslint-disable jsdoc/require-returns-description */
import { BaseService } from './basic/base-service'

export class UploadControllerService extends BaseService {
  /**
   * 上传
   * @param {file} file
   * @returns
   */
  async upload(file) {
    return await this.Request({
      method: 'POST',
      url: '/uploadController.do?upload',
      data: this.toFormData({
        file,
      }),
    })
  }
}
