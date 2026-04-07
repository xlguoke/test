/* eslint-disable jsdoc/require-returns-description */
import { BaseService } from './basic/base-service'

/**
 * 用印申请
 */
export class StampAuditService extends BaseService {
  /**
   * 用印列表查询
   * @returns
   */
  async list(params) {
    return await this.Request({
      url: '/rest/stamp/audit/list',
      params,
    })
  }

  /**
   * 报告资质以及资质覆盖情况
   * @returns
   */
  async paramDetail(reportIds) {
    return await this.Request({
      url: '/rest/stamp/audit/param/qua/detail',
      params: { reportIds },
    })
  }

  /**
   * 提交审核
   * @returns
   */
  async submit(data) {
    return await this.Request({
      method: 'POST',
      url: '/rest/stamp/audit/submit',
      data: this.toFormData(data),
    })
  }

  /**
   * 用印撤回
   * @returns
   */
  async recall(reportId) {
    return await this.Request({
      method: 'POST',
      url: `/rest/stamp/audit/recall/${reportId}`,
    })
  }

  /**
   * 验证报告是否需要重转
   * @returns
   */
  async verify(params) {
    return await this.Request({
      url: `/rest/stamp/audit/convert/verify`,
      params,
    })
  }

  /**
   * 审核详情
   * @returns
   */
  async auditNext(reportId, ignoreErrorTip) {
    return await this.Request({
      ignoreErrorTip,
      url: `/rest/stamp/audit/next/audit/user/${reportId}`,
    })
  }

  /**
   * 审核详情
   * @returns
   */
  async auditDetail(reportId, ignoreErrorTip) {
    return await this.Request({
      ignoreErrorTip,
      url: `/rest/stamp/audit/audit/detail/${reportId}`,
    })
  }

  /**
   * 审核详情处获取报告信息
   * @returns
   */
  async getReportInfo(businessKey) {
    return await this.Request({
      url: `/rest/stamp/audit/detail/${businessKey}`,
    })
  }

  /**
   * 自动匹配资质章 ，验证报告变化情况
   * @returns
   */
  async autoSetVerify(reportsId) {
    return await this.Request({
      url: '/rest/stamp/audit/auto/set/verify',
      params: { reportsId },
    })
  }

  /**
   * 获取报告详情
   * @returns
   */
  async reoortDetail(reportId) {
    return await this.Request({
      url: `rest/stamp/audit/reoort/detail/${reportId}`,
    })
  }
}
