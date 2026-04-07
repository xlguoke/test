import { BaseService } from './basic/base-service'

/**
 * 流程
 */
export class AuditProcessService extends BaseService {
  async getProcessUserTaskList(auditTypeId) {
    return await this.Request({
      url: '/rest/auditProcess/getProcessUserTaskList',
      params: {
        auditTypeId,
      },
    })
  }

  async getStartFormData(auditTypeId) {
    return await this.Request({
      url: '/rest/auditProcess/getStartFormData',
      params: {
        auditTypeId,
      },
    })
  }

  async getProcessVariables(processInstanceId) {
    return await this.Request({
      url: '/rest/auditProcess/getProcessVariables',
      params: { processInstanceId },
    })
  }
}
