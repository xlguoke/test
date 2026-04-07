/* eslint-disable jsdoc/require-returns-description */
import { BaseService } from './basic/base-service'

/**
 * 法大大签名签章
 */
export class FddSignService extends BaseService {
  /**
   * 法大大创建用户
   * @returns
   */
  async userCreate(userId) {
    return await this.Request({
      method: 'POST',
      url: `/rest/fdd/sign/user/create/${userId}`,
    })
  }

  /**
   * 企业用户创建
   * @returns
   */
  async enterpriseCreate() {
    return await this.Request({
      method: 'POST',
      url: '/rest/fdd/sign/enterprise/create',
    })
  }

  /**
   * 法大大企业认证
   * @returns
   */
  async enterpriseAuth() {
    return await this.Request({
      method: 'POST',
      url: '/rest/fdd/sign/enterprise/auth',
    })
  }

  /**
   * 法大大用户认证
   * @returns
   */
  async userAuth(userId) {
    return await this.Request({
      method: 'POST',
      url: `/rest/fdd/sign/user/auth/${userId}`,
    })
  }

  /**
   * 刷新企业认证状态
   * @returns
   */
  async enterpriseStatus(data) {
    return await this.Request({
      method: 'POST',
      url: '/rest/fdd/sign/refresh/enterprise/auth/status',
      data,
    })
  }

  /**
   * 刷新个人用户认证状态
   * @returns
   */
  async authStatus(userId) {
    return await this.Request({
      method: 'POST',
      url: `/rest/fdd/sign/refresh/user/auth/status/${userId}`,
    })
  }

  /**
   * 企业认证信息详情
   * @returns
   */
  async configure(data) {
    return await this.Request({
      method: 'POST',
      url: '/rest/fdd/sign/configure',
      data,
    })
  }

  /**
   * 法大大用户签字授权
   * @returns
   */
  async signAuth(userId) {
    return await this.Request({
      method: 'POST',
      url: `/rest/fdd/sign/user/sign/auth/${userId}`,
    })
  }

  /**
   * 法大大用户签字授权状态刷新
   * @returns
   */
  async signAuthStatus(userId) {
    return await this.Request({
      method: 'POST',
      url: `/rest/fdd/sign/refresh/sign/auth/${userId}`,
    })
  }

  /**
   * 法大企业用户签字授权
   * @returns
   */
  async enterpriseSignAuth() {
    return await this.Request({
      method: 'POST',
      url: '/rest/fdd/sign/enterprise/sign/auth',
    })
  }

  /**
   * 法大企业用户签字授权状态更新
   * @returns
   */
  async enterpriseSignAuthStatus() {
    return await this.Request({
      method: 'POST',
      url: '/rest/fdd/sign/refresh/enterprise/sign/auth',
    })
  }
}
