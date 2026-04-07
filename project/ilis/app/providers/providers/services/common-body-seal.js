/* eslint-disable jsdoc/check-param-names */
/* eslint-disable jsdoc/require-returns-description */
import { BaseService } from './basic/base-service'

/**
 * 印章管理
 */
export class SealService extends BaseService {
  /**
   * 获取印章管理列表
   * @returns
   */
  async pagination() {
    return await this.Request({
      url: '/rest/common-body/seal/pagination',
    })
  }

  /**
   * 获取印章列表
   */
  async list() {
    return await this.Request({
      url: '/rest/common-body/seal/list',
    })
  }

  /**
   * 根据系统控制参数获取印章列表
   */
  async seals(reportIds) {
    return await this.Request({
      method: 'get',
      url: 'rest/report/seals',
      params: {
        reportIds,
      },
    })
  }

  /**
   * 获取印章信息
   * @param {string} id 印章ID
   * @returns
   */
  async getSeal(id) {
    return await this.Request({
      url: `/rest/common-body/seal/${id}`,
    })
  }

  /**
   * 获取印章版本信息
   * @param {string} id 印章版本ID
   * @returns
   */
  async getVersion(id) {
    return await this.Request({
      url: `/rest/common-body/seal/version/${id}`,
    })
  }

  /**
   * 新增印章
   * @param {object} data
   * @returns
   */
  async add(data) {
    return await this.Request({
      method: 'POST',
      url: '/rest/common-body/seal',
      data,
    })
  }

  /**
   * 编辑印章
   * @param {object} data
   * @returns
   */
  async update(data) {
    return await this.Request({
      method: 'PUT',
      url: '/rest/common-body/seal',
      data,
    })
  }

  /**
   * 删除印章
   * @param {string} id 印章ID
   * @param {boolean} deleteQualification 是否删除资质
   * @returns
   */
  async delete(id, deleteQualification) {
    return await this.Request({
      method: 'DELETE',
      url: `/rest/common-body/seal/${id}`,
      params: {
        deleteQualification,
      },
    })
  }

  /**
   * 根据印章ID查询印章版本信息
   * @param {string} sealId
   * @returns
   */
  async versions(sealId) {
    return await this.Request({
      url: '/rest/common-body/seal/version/list',
      params: { sealId },
    })
  }

  /**
   * 新增印章版本
   * @param {object} data
   * @returns
   */
  async addVersion(data) {
    return await this.Request({
      method: 'POST',
      url: '/rest/common-body/seal/version',
      data,
    })
  }

  /**
   * 编辑印章
   * @param {object} data
   * @returns
   */
  async updateVersion(data) {
    return await this.Request({
      method: 'PUT',
      url: '/rest/common-body/seal/version',
      data,
    })
  }

  /**
   * 印章坐标信息更新
   * @param {object} data
   * @returns
   */
  async updateSealLocation(data) {
    return await this.Request({
      method: 'PUT',
      url: '/rest/common-body/seal/location',
      data,
    })
  }

  /**
   * 打印自动标记为已签章状态切换
   * @param {string} id 印章ID
   * @returns
   */
  async switcher(id) {
    return await this.Request({
      method: 'POST',
      url: `/rest/common-body/seal/switcher/${id}`,
    })
  }

  /**
   * 资质证书上传
   * @param {object} data
   * @returns
   */
  async upload(data) {
    return await this.Request({
      method: 'POST',
      url: '/rest/common-body/seal/cert/upload',
      data,
    })
  }

  /**
   * 拖动排序
   * @param {object} data
   * @returns
   */
  async sort(data) {
    return await this.Request({
      method: 'PUT',
      url: '/rest/common-body/seal/drag/sort',
      data,
    })
  }

  /**
   * 获取资质信息
   * @param {object} sealid
   * @returns
   */
  async getQualificationInfoBySeal(sealId) {
    return await this.Request({
      url: `/rest/common-body/seal/qualification/${sealId}`,
    })
  }
}
