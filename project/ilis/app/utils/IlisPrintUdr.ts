import { useIndustryStore } from '~/store/industryStore'
import { usePermissionStore } from '~/store/permissionStore.ts'
import openHitekUdrTool, { setServerCacheData } from '~/utils/UDR.ts'

export enum PrintUdrTempleteType {
  温湿度台账打印 = 'HumitureLedgerParam',
  设备授权台账打印 = 'EquipmentAuth',
  核查记录打印 = 'EquipmentFunctionCheckRecord',
  废物登记打印 = 'ChemicalWasteMaterial',
  废物处置打印 = 'ChemicalWasteMaterialHandle',
  设备出入库登记表 = 'EquipmentEgressTable',
  设备盘点记录打印 = 'AssetsInventory',
  委托单打印 = 'printConsign',
  设备授权管理打印 = 'EquipmentAuthLedger',
  标准物质购置登记表 = 'EquipmentBuyRegistration',
  打印标准物质使用记录 = 'EquipmentStandardSubstanceUsageRecord',
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
   * 打印台账/列表
   * @param {string} templateType 模板标识
   * @param {object} [jsonParam] 列表查询的json参数
   */
  printLedger(templateType: string, jsonParam?: any) {
    const url = `${location.origin}/ilis2/udrController.do?goUdrTemplatePrint`
    const data = {
      templateType,
      jsonParam,
    }

    // 执行打印
    this.execute(url, data)
  }

  /**
   * 前端将数据缓存，打印页面直接根据数据缓存key进行打印
   * 注：打印页面将缓存的key作为objectId进行打印
   * 注：该方法与printByJsonParam2高度相似，后端能统一下逻辑就更好了
   * @param {string} templateType 打印模板
   * @param {object} jsonParam 打印参数
   */
  printByJsonParam1(templateType: string, jsonParam: any) {
    let url = `${location.origin}/ilis2/udrController.do?goUdrTemplatePrint`
    url += `&templateType=${templateType}`
    url += '&isPrintByJsonParam=1'

    // 执行打印
    this.execute(url, jsonParam)
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
    const { industryId, industry } = useIndustryStore()
    if (industry)
      data.industry = industry
    const cacheKey = await setServerCacheData(data)
    let openUrl = url + (!url.includes('?') ? '?' : '&')
    openUrl += `module=${this.module}`
    openUrl += `&paramId=${cacheKey}`

    if (industry)
      openUrl += `&industryId=${industryId}`

    // 开启调试打印功能，开启后，打印会展示要打印的资料详情
    const enableDebugPrint = usePermissionStore().hasPermission('debugPrint')
    if (enableDebugPrint) {
      openUrl += '&isDebugPrint=1'
    }

    openHitekUdrTool(openUrl, enableDebugPrint ? 'max' : 'hide', true)
  }

  /**
   * # 将UDR转换为PDF
   * @param consignId 委托单ID
   * @param preConsignId 预委托单ID
   * @param callback 转换完成回调
   */
  static async convertUdr2Pdf(consignId: string, preConsignId: string, callback?: () => void) {
    await AnyDriverHelper.createScriptByUrl('webpage/com/hitek/demo/udr/udrClientPrint.js')
    return window.convertUdr2Pdf(consignId, preConsignId, callback)
  }
}
