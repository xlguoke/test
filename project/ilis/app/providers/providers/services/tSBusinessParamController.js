/* eslint-disable jsdoc/require-returns-description */
import { BaseService } from './basic/base-service'

export class TSBusinessParamControllerService extends BaseService {
  /**
   * @returns
   */
  async qualificationStatementType() {
    return await this.Request({
      url: '/rest/tSBusinessParamController/detail/QUALIFICATION_STATEMENT_TYPE',
    })
  }

  /**
   * @returns
   */
  async updateBusinessParam(params) {
    return await this.Request({
      url: '/rest/tSBusinessParamController.do?updateBusinessParam',
      params,
    })
  }
}
