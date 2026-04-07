import type { IUserInfo } from './types/IUserInfo'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

export enum OpenType {
  /** # 内嵌（项目内打开） */
  INSET = '0',
  /** # 外链（项目外打开） */
  OUTSIDE = '1',
}
export interface MenuTree {
  id: string
  functionName: string
  functionExplain?: string
  functionCode?: string
  functionUrl: string
  functionIconStyle?: string
  functionType: number
  functionLevel: number
  functionOrder?: string
  iconUrl?: string
  _parentId?: string
  openType?: OpenType
  subFunctions: MenuTree[]
  type?: string
  boardUrl?: string
  publicKey?: string
  privateKey?: string
  browser?: string
}

export interface TransformMenuTree {
  data: MenuTree
  key: string
  title: string
  label: string
  icon?: () => VNode
  children?: TransformMenuTree[]
}

/** # 获取用户功能树（菜单） */
export function getMenuList() {
  return IlisApiHelper.postForm<{ obj: MenuTree[] }>('functionController.do?getUserFunctionTreeJson', {
    functionType: 0,
    platform: 1,
  })
}

export function getWebConfigs() {
  return IlisApiHelper.get<{ companyLogo: string, companyDeploy: string }>('rest/profileController/getWebConfigs')
}

/** 获取当前用户信息 */
export function getCurrentUserApi() {
  return IlisApiHelper.get<{ obj: IUserInfo }>('userController.do?getCurrentUser')
}
