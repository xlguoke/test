import type { IConsignUnitProject } from '~/views/consign/consignDetail/interface'

/**
 * 缓存服务
 */
export class ConsignStorageManager {
  unitCode = localStorage.getItem('unitCode') || ''

  /**
   * 依赖注入
   * @param industryStore 领域状态管理器
   */
  constructor(private industryStore: any) {}

  /** 根据单位和领域构建唯一key */
  private getKey() {
    return `${this.unitCode}-${this.industryStore.industryId}`
  }

  /** 委托编号类别本地缓存key */
  private getSnTypeStorageKey() {
    return `consign-storage-${this.getKey()}`
  }

  /** 委托单位工程项目本地缓存key */
  private getConsignUnitStorageKey() {
    return `consignUnit-project-sampleSender-${this.getKey()}`
  }

  /** 获取委托编号缓存数据 */
  getSnTypeStorage(): { synthesisConsignSnTypeId: string, consignSnTypeId: string } {
    return JSON.parse(localStorage.getItem(this.getSnTypeStorageKey()) || '{}')
  }

  /** 设置委托编号缓存数据 */
  setStorageSnType(key: 'consignSnTypeId' | 'synthesisConsignSnTypeId', value: string) {
    const storage = this.getSnTypeStorage()
    storage[key] = value
    localStorage.setItem(this.getSnTypeStorageKey(), JSON.stringify(storage))
  }

  /** 获取委托单位工程缓存数据 */
  getConsignUnitStorage(): IConsignUnitProject | null {
    let data = localStorage.getItem(this.getConsignUnitStorageKey())

    // 兼容旧版
    if (!data) {
      data = localStorage.getItem('consignUnit-project-sampleSender')
    }

    if (data) {
      try {
        const dataObj = JSON.parse(data) as IConsignUnitProject
        if (!dataObj.consignUnit && !dataObj.project)
          return null

        return dataObj
      }
      catch (e) {
        console.error('解析本地缓存的委托单位、工程项目信息失败：', e)
      }
    }

    return null
  }

  /** 设置委托单位工程项目缓存数据 */
  setConsignUnitStorage(data: IConsignUnitProject) {
    return localStorage.setItem(this.getConsignUnitStorageKey(), JSON.stringify(data))
  }
}
