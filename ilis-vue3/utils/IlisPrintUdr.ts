import openHitekUdrTool, { setServerCacheData } from '~/utils/UDR.ts'

export enum PrintUdrTempleteType {
  温湿度台账打印 = 'HumitureLedgerParam',
  设备授权台账打印 = 'EquipmentAuth',
  核查记录打印 = 'EquipmentFunctionCheckRecord',
}

/**
 * 打印UDR
 */
export class IlisPrintUdr {
  /** 打印来源 */
  module: string = 'none'

  constructor(module?: string) {
    if (module) {
      this.module = module
    }
  }

  /**
   * 通用打印方法
   * PS:大部分打印可直接调用该方法，但部分打印逻辑较复杂的，后续在该类中继续完善
   * @param ids 要打印的资料ID
   * @param templateType 模板类型
   * @param params 额外需要传递的参数（后端说要加的一些参数，在这里传递过去处理）
   */
  commonPrint(ids: string[], templateType: PrintUdrTempleteType | string, params?: any) {
    const url = `${location.origin}/ilis2/udrController.do?goUdrTemplatePrint`
    const data = {
      ids: ids.join('@@'),
      templateType,
    }

    // 合并额外参数
    Object.assign(data, params)

    // 执行打印
    this.execute(url, data)
  }

  /**
   * # 通用打印方法(静态调用)
   * PS:大部分打印可直接调用该方法，但部分打印逻辑较复杂的，后续在该类中继续完善
   * @param ids 要打印的资料ID
   * @param templateType 模板类型
   * @param params 额外需要传递的参数（后端说要加的一些参数，在这里传递过去处理）
   */
  static commonPrint(ids: string[], templateType: PrintUdrTempleteType | string, params?: any) {
    new IlisPrintUdr().commonPrint(ids, templateType, params)
  }

  /**
   * 执行打印，将传递给udr的参数缓存并打开udr
   * @param {string} url 打开UDR地址
   * @param {object} data 向udr传递的参数
   */
  async execute(url: string, data: any) {
    const cacheKey = await setServerCacheData(data)
    let openUrl = url + (!url.includes('?') ? '?' : '&')
    openUrl += `module=${this.module}`
    openUrl += `&paramId=${cacheKey}`

    openHitekUdrTool(openUrl, 'hide', true)
  }
}
