import { BaseService } from './basic/base-service'

export class BusinessRollbackControllerService extends BaseService {
  /**
   * 退回
   * @param data
   */
  async rollback(data) {
    return await this.Request({
      method: 'POST',
      url: '/businessRollbackController.do?rollback',
      data: this.toFormData(data),
    })
  }
}
