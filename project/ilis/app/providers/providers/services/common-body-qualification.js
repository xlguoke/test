/* eslint-disable jsdoc/require-returns-description */
import { BaseService } from './basic/base-service'

/**
 * 资质管理
 */
export class QualificationService extends BaseService {
  /**
   * 获取资质管理列表（分页）
   * @param {number} page
   * @param {number} size
   * @returns
   */
  async pagination(page, size) {
    return await this.Request({
      url: '/rest/common-body/qualification/pagination',
      params: {
        page,
        size,
      },
    })
  }

  /**
   * 获取可关联印章的项目列表
   * @param {number} page
   * @param {number} size
   */
  async getAvailableProjects(page, size) {
    return await this.Request({
      url: '/rest/common-body/seal-project/available-projects',
      params: {
        page,
        size,
      },
    })
  }

  /**
   * 获取资质列表
   */
  async list() {
    return await this.Request({
      url: '/rest/common-body/qualification/list',
    })
  }

  /**
   * 获取资质信息
   * @param {string} id 资质ID
   * @returns
   */
  async getQualification(id) {
    return await this.Request({
      url: `/rest/common-body/qualification/${id}`,
    })
  }

  /**
   * 新增资质
   * @param {object} data
   * @returns
   */
  async add(data) {
    return await this.Request({
      method: 'POST',
      url: '/rest/common-body/qualification',
      data,
    })
  }

  /**
   * 编辑资质
   * @param {object} data
   * @returns
   */
  async update(data) {
    return await this.Request({
      method: 'PUT',
      url: '/rest/common-body/qualification',
      data,
    })
  }

  /**
   * 删除资质
   * @param {string} id 资质ID
   * @param {boolean} deleteSeal 是否删除印章
   * @returns
   */
  async delete(id, deleteSeal) {
    return await this.Request({
      method: 'DELETE',
      url: `/rest/common-body/qualification/${id}`,
      params: {
        deleteSeal,
      },
    })
  }

  /**
   * 根据资质获取与之关联的印章信息
   * @param {string} id
   * @returns
   */
  async relationSeals(id) {
    return await this.Request({
      url: `/rest/common-body/qualification/seals/${id}`,
    })
  }

  /**
   * 获取还没有绑定资质章的资质
   * @returns
   */
  async detached() {
    return await this.Request({
      url: '/rest/common-body/qualification/detached',
    })
  }

  /**
   * 绑定印章
   * @param {string} id 资质ID
   * @param {Array<{ sealId: string, sealName: string }>} data 绑定印章
   * @returns
   */
  async bind(id, data) {
    return await this.Request({
      method: 'POST',
      url: `/rest/common-body/qualification/bind/${id}`,
      data,
    })
  }

  /**
   * 是否默认，自动添加该资质状态切换
   * @param {string} type defaultFlag-是否默认，auto-自动添加该资质
   * @param {string} id 资质ID
   * @returns
   */
  async switcher(type, id) {
    return await this.Request({
      method: 'POST',
      url: `/rest/common-body/qualification/switcher/${type}/${id}`,
    })
  }

  /**
   * 资质声明时间修改
   * @param {string} data.id
   * @param {string} data.statementEnableDate
   * @param {string} data.statementExpiredDate
   */
  async updateStatementDate(data) {
    return await this.Request({
      method: 'PUT',
      data,
      url: `/rest/common-body/qualification/update/statement/date`,
    })
  }
}
