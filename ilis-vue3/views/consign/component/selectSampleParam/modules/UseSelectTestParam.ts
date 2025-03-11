import type { ParamStandardItem } from './UseParamStandard.ts'
import { PRICE_TYPE } from './UseParamPrice.ts'
import type {
  BuildParamsOpts,
  ParamListFilterObj,
  TestParamsItem,
  ViewTestParamsItem,
} from '~/views/consign/component/selectSampleParam/modules/BaseTestParams.ts'
import { BaseTestParams } from '~/views/consign/component/selectSampleParam/modules/BaseTestParams.ts'

interface ShareMapEntity {
  [key: string]: ViewTestParamsItem[]
}

/** 检查是否禁用价格选择 */
export function checkPriceDisabled(item: ViewTestParamsItem) {
  return item.selectedPriceType === PRICE_TYPE.SCRIPT || item.selectedPriceType === PRICE_TYPE.SHARE
}

/** 合并行 */
export function customCell(row: ViewTestParamsItem) {
  if (row.isGroup) {
    return { colSpan: 0 }
  }
  return { colSpan: 1 }
}

/**
 * ## 表格行自定义class类名
 */
export function rowClassName(record: any) {
  return record.isGroup ? 'group-row' : ''
}

/**
 * 使用参数
 * 基础逻辑：保持cacheData与data的数据引用，避免双向绑定丢失
 */
export class UseSelectTestParam extends BaseTestParams {
  /** 【系统参数】是否强制选到最后一级 */
  SELECTED_SAMPLE_LAST_LAYER = false

  /** 【系统参数】选择样品及参数时，显示检测周期 */
  DISPLAYS_TEST_PERIOD = false

  /** 【系统参数】选择样品及参数时，显示试验数量 */
  DISPLAYS_TEST_QUANTITY = false

  /** 【系统参数】开启推荐规程逻辑 */
  USING_RECOMMENDED_PARAMETER_STANDARD = false

  // 页面渲染的全部数据，主要用于过滤后赋值给data，与data之间保持引用关系
  cacheData: ViewTestParamsItem[] = []

  // 页面渲染数据
  data: ViewTestParamsItem[] = []

  // 规程过滤下拉数据
  standardOptions: ParamStandardItem[] = []

  constructor() {
    super('UseTestSample')

    getBusinessParam('USING_RECOMMENDED_PARAMETER_STANDARD').then((val) => {
      this.USING_RECOMMENDED_PARAMETER_STANDARD = val
    })
  }

  /** 试验数量计量单位 */
  get unitMeasure() {
    if (this.selectedRows.length > 0) {
      return this.selectedRows[0].unitMeasure
    }

    return ''
  }

  /** 预估试验数量 */
  get totalTestQuantity() {
    const shareTestQuantityArr: string[] = []
    let sum = 0

    this.selectedRows.forEach((item) => {
      // 共享试验数量只加一次
      if (item.shareTestQuantityIdent) {
        if (!shareTestQuantityArr.includes(item.shareTestQuantityIdent)) {
          shareTestQuantityArr.push(item.shareTestQuantityIdent)
          sum += item.selectedTestQuantity || 0
        }
      }
      else {
        sum += item.testQuantity || 0
      }
    })

    return sum
  }

  /** 预估费用 */
  get totalPrice() {
    const sharedPriceQualifierArr: string[] = []
    let sum = 0

    this.selectedRows.forEach((item) => {
      // 共享单价只加一次
      if (
        (item.priceType === PRICE_TYPE.SHARE && item.sharedPriceQualifier)
        || (item.priceType === PRICE_TYPE.SCRIPT && item.sharedPriceQualifier)
      ) {
        if (!sharedPriceQualifierArr.includes(item.sharedPriceQualifier)) {
          // 共享价格不需要计算检测点数，直接共享单价乘样品组数
          sum += (item.sharePrice || 0)
          sharedPriceQualifierArr.push(item.sharedPriceQualifier)
        }
      }
      else {
        sum += item.price || 0
      }
    })

    return sum
  }

  /** 选中的参数 */
  get selectedRows() {
    return this.cacheData.filter(i => i.selected && !i.isGroup)
  }

  /** 选中的参数id */
  get selectedRowKey() {
    return this.selectedRows.map(i => i.id)
  }

  get testItemIds() {
    return [...new Set(this.selectedRows.map(i => i.testItemId))].join(',')
  }

  /** 价格说明 */
  get priceDescription() {
    const cacheData = this.cacheData
    const selectList = cacheData.filter(i => i.selected && !i.isGroup)
    const sharedPriceQualifierMap: { [key: string]: { price: string, name: string[] } } = {}
    const scriptPriceMap: { [key: string]: string[] } = {}

    selectList.forEach((item) => {
      if (item.selectedPriceType === PRICE_TYPE.SCRIPT) {
        const prices = item.prices
        const priceItem = prices.find(i => i.id === item.selectedPriceId)

        if (priceItem) {
          const scriptDescription = priceItem.scriptDescription || ''
          if (!scriptPriceMap[scriptDescription]) {
            scriptPriceMap[scriptDescription] = []
          }

          scriptPriceMap[scriptDescription].push(item.displayName)
        }
      }

      if (item.selectedPriceType === PRICE_TYPE.SHARE) {
        const prices = item.prices
        const priceItem = prices.find(i => i.id === item.selectedPriceId)

        if (priceItem) {
          const qualifier = `${priceItem.price}元`
          if (!sharedPriceQualifierMap[qualifier]) {
            sharedPriceQualifierMap[qualifier] = {
              price: `${priceItem.price}元`,
              name: [],
            }
          }

          sharedPriceQualifierMap[qualifier].name.push(item.displayName)
        }
      }
    })

    const text = []

    for (const key in scriptPriceMap) {
      text.push(`脚本单价[${scriptPriceMap[key].join('、')}]${key ? (`：${key}`) : ''}`)
    }

    for (const key in sharedPriceQualifierMap) {
      const item = sharedPriceQualifierMap[key]
      text.push(`共用单价[${item.name.join('、')}]：${item.price}`)
    }

    return text
  }

  init() {
    getBusinessParam('SELECTED_SAMPLE_LAST_LAYER').then((val) => {
      this.SELECTED_SAMPLE_LAST_LAYER = val
    })

    getBusinessParam('DISPLAYS_TEST_PERIOD').then((val) => {
      this.DISPLAYS_TEST_PERIOD = val
    })

    getBusinessParam('DISPLAYS_TEST_QUANTITY').then((val) => {
      this.DISPLAYS_TEST_QUANTITY = val
    })
  }

  /**
   * 初始化数据
   */
  initData(data: TestParamsItem[]) {
    this.cacheData = this.buildParamsData({
      data,
      isInit: true,
    })
    this.data = this.cacheData
    this.updateStandardOptions()
  }

  /**
   * 构建共用单价关联对象
   */
  getSharePriceMap() {
    const cacheData = this.cacheData
    const obj: ShareMapEntity = {}

    cacheData.forEach((item) => {
      const sharePriceItem = item.prices.find(i => i.type === PRICE_TYPE.SHARE)

      if (sharePriceItem && sharePriceItem.qualifier) {
        if (!obj[sharePriceItem.qualifier]) {
          obj[sharePriceItem.qualifier] = []
        }

        obj[sharePriceItem.qualifier].push(item)
      }
    })

    return obj
  }

  /**
   * 构建共用试验数量关联对象
   */
  getShareTestQuantityMap() {
    const cacheData = this.cacheData
    const obj: ShareMapEntity = {}

    cacheData.forEach((item) => {
      const shareTestQuantityIdent = item.shareTestQuantityIdent

      if (shareTestQuantityIdent) {
        if (!obj[shareTestQuantityIdent]) {
          obj[shareTestQuantityIdent] = []
        }

        obj[shareTestQuantityIdent].push(item)
      }
    })

    for (const key in obj) {
      if (obj[key].length === 1) {
        delete obj[key]
      }
    }

    return obj
  }

  /**
   * 构建参数列表数据
   * 渲染共享单价和非共享单价逻辑
   * 注：该方法也用于查询过滤，区别是入参的data在初始化时是接口返回的数据，而在查询时是缓存的cacheData数据
   * 注：该方法重写BaseTestParams中的方法，原因是后面的需求要求在选择参数列表中，不进行公用单价的分组展示
   * opts.data 接口返回参数 / 或用于查询时的本地缓存数据
   * opts.isInit 是否初始化选择规程/价格等默认数据
   * opts.queryParam 关键字高亮过滤
   */
  buildParamsData(opts: BuildParamsOpts): ViewTestParamsItem[] {
    const data = opts.data
    const isInit = opts.isInit
    const queryParam = opts.queryParam

    let result: ViewTestParamsItem[] = []

    for (let i = 0; i < data.length; i++) {
      const item = data[i] as ViewTestParamsItem
      const prices = item.prices || []
      // 共享价格项
      const sharePriceItem = prices.find(j => j.type === PRICE_TYPE.SHARE)

      item.isSearch = false
      item.disabled = false
      item.shareQualifier = null

      // 初始化前端渲染参数逻辑，界面过滤筛选等操作时，不进行初始化，避免保存的数据丢失
      if (isInit) {
        // 先赋值试验数量，后续刷新共用试验数量会调整该值
        item.selectedTestQuantity = item.testQuantity
        this.setDefaultParamData(item)
        this.setDefaultSelectedStandards(item)
      }

      // 过滤时，将满足条件的数据打上isSearch标记，利用该标记对过滤数据进行高亮和排序
      if (queryParam) {
        item.isSearch = item.displayName.includes(queryParam)
      }

      this.checkPrices(item, !!((sharePriceItem && sharePriceItem.qualifier)))
      this.setDefaultPrice(item)

      result.push(item)
    }

    result = this.handleDataSort(result)

    return result
  }

  /**
   * 设置默认的选中规程
   */
  setDefaultSelectedStandards(item: ViewTestParamsItem) {
    item.selectedStandards = item.standards.filter(j => j.selected).map(j => j.uniqKey)
    // 通过关联关系设置规程时，此处不需要默认选中依据，根据关联逻辑控制
    if (!this.USING_RECOMMENDED_PARAMETER_STANDARD) {
      item.selectedBasis = item.basis.filter(j => j.selected).map(j => j.uniqKey)
    }
  }

  /**
   * 本地过滤数据
   * @param filterObj 过滤参数
   */
  localFilterData(filterObj: ParamListFilterObj) {
    this.data = this.filterData(this.cacheData, filterObj)
  }

  /**
   * 更新参数数据
   */
  updateParamData(id: string, key: keyof ViewTestParamsItem, value: any) {
    const cacheData = this.cacheData
    const index = cacheData.findIndex(i => i.id === id)
    const item = cacheData[index]

    // 价格分组信息列不管
    if (item.isGroup) {
      return
    }

    if (index !== -1) {
      (item[key] as any) = value
    }
  }

  /**
   * 构建评定标准下拉项
   * 根据参数默认规程以及新增的规程来构建
   */
  updateStandardOptions() {
    const cacheData = this.cacheData
    const result: ParamStandardItem[] = []
    const keys: string[] = []

    cacheData.forEach((item) => {
      item.standards.forEach((sItem) => {
        if (!keys.includes(sItem.uniqKey)) {
          keys.push(sItem.uniqKey)
          result.push(sItem)
        }
      })
    })

    this.standardOptions = result
  }

  /**
   * 刷新共用单价展示
   */
  refreshSharePriceView() {
    const sharePriceMap = this.getSharePriceMap()

    for (const key in sharePriceMap) {
      const data = sharePriceMap[key]
      const selectedData = data.filter(i => i.selected)

      data.forEach((item) => {
        const prices = item.prices

        prices.forEach((pItem) => {
          if (pItem.type === PRICE_TYPE.SHARE) {
            pItem._disabled = selectedData.length === 1

            if (
              (pItem._disabled && (item.selectedPriceType === PRICE_TYPE.SHARE || item.selectedPriceId === pItem.id))
              || (!pItem._disabled && (item.selectedPriceType !== PRICE_TYPE.SHARE || item.selectedPriceId !== pItem.id))
            ) {
              item.selectedPriceId = undefined
              item.selectedPriceType = undefined
            }
          }
        })

        this.setDefaultPrice(item)
      })
    }
  }

  /**
   * 刷新共用试验数量展示
   */
  refreshShareTestQuantityView() {
    const shareTestQuantityMap = this.getShareTestQuantityMap()

    for (const key in shareTestQuantityMap) {
      const data = shareTestQuantityMap[key]
      const selectedData = data.filter(i => i.selected)

      data.forEach((item) => {
        if (selectedData.length === 1) {
          item.selectedTestQuantity = item.testQuantity
        }
        else {
          item.selectedTestQuantity = item.shareTestQuantity
        }
      })
    }
  }
}
