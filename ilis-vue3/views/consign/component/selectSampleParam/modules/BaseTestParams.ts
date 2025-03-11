import type { ParamPriceItem } from './UseParamPrice.ts'
import { PRICE_TYPE } from './UseParamPrice.ts'
import type { ParamStandardItem } from './UseParamStandard.ts'
import { UseModuleEmit } from '~/views/consign/component/selectSample/modules/UseBase.ts'
import type { SampleParamStandardItem } from '~/views/unit-config/standard/interface/SampleParamStandard.ts'

/** 参数列表数据项 */
export class TestParamsItem {
  /**
   * 是否自动添加掺配
   */
  autoAddBlendSample? = false
  criteria: Array<{
    basis: SampleParamStandardItem[]
    standard: SampleParamStandardItem
  }> = []

  /**
   * 检测依据
   * 实际接口返回的数据结构为SampleParamStandardItem，需要将其转为ParamStandardItem
   */
  basis: ParamStandardItem[] = []
  /**
   * 评定标准
   * 实际接口返回的数据结构为SampleParamStandardItem，需要将其转为ParamStandardItem
   */
  standards: ParamStandardItem[] = []
  /**
   * 是否被删除
   */
  deleted = false
  /**
   * 显示名称
   */
  displayName = ''
  /**
   * 是否按样品组数生成样品
   */
  generateAcceptSampleInfoByCount = false
  /**
   * 是否需要生成流转样品
   */
  generateProcessObject = false
  /**
   * ID
   */
  id = ''
  /**
   * 是否需要生成样品编号
   */
  buildSampleCode = false
  /**
   * 是否现场检测项目
   */
  localeItem = false
  /**
   * 是否为临时参数
   */
  tempParam = false
  /**
   * 名称
   */
  name = ''
  /**
   * 排序号
   */
  orderNum = 0
  /**
   * 参数附注
   */
  paramNote = ''
  /**
   * 检测周期（天）
   */
  paramWorkDay?: number
  /**
   * 预委托需要显示该字段
   */
  preConsignShow = false
  /**
   * 价格
   */
  prices: ParamPriceItem[] = []
  /**
   * 备注
   */
  remark = ''
  /**
   * 数据中心参数ID
   */
  systemId: string | null = null
  /**
   * 检测项目ID
   */
  testItemId?: string
  /**
   * 试验数量
   */
  testQuantity?: number
  /**
   * 单位
   */
  unitMeasure?: string
  /**
   * 共享试验数量
   */
  shareTestQuantity?: number
  /**
   * 共享试验数量名称
   */
  shareTestQuantityIdent?: string
}

/** 前端展示参数 */
export class ViewTestParamsItem extends TestParamsItem {
  /** 是否选中参数 */
  selected?: boolean
  /** 禁用行选择 */
  disabled?: boolean
  /** 是否合并行 */
  isGroup?: boolean
  /** 分组小计 */
  displayTotalAmount?: number
  /** 选择的参数价格 */
  price: number = 0
  /** 是否在搜索范围 */
  isSearch?: boolean
  sharePrice?: number | null
  /** 共享单价分组 */
  shareQualifier?: string | null
  sharedPriceQualifier?: string | null
  /** 脚本参数 */
  paramScript?: string | null
  scriptPrice?: number | null
  /** 选择的依据 */
  selectedBasis?: string[] = []
  /** 选择的规程 */
  selectedStandards?: string[] = []
  /** 选择价格id */
  selectedPriceId?: string
  /** 选择价格类型 */
  selectedPriceType?: PRICE_TYPE
  /** 应用的试验数量 */
  selectedTestQuantity?: number

  /** 下列自定义属性主要用于样品页面展示所选参数 */
  /** 检测组数 */
  count = 1
  /** 设计要求 */
  designRequirements?: string
  /** 数量/检测点数 */
  checkPoint = 1
  /** 小计 */
  paramAmount?: number
  /** 父页面设置的费用标准 */
  // priceStandardId: string = parent.$("#chargeStandardSelect").val()
  priceStandardId: string = ''
  /** 选择价格类型 */
  priceType?: PRICE_TYPE
}

/** 参数列表过滤 */
export interface ParamListFilterObj {
  /** 检测参数名称 */
  queryParam?: string
  /** 规程唯一标识 */
  queryStandard?: string
  /** 只看已选中 */
  showSelectedOnly?: boolean
}

/** 参数列表构建参数 */
export interface BuildParamsOpts {
  data: TestParamsItem[]
  // 是否初始化选择规程/价格等默认数据
  isInit?: boolean
  // 关键字高亮过滤
  queryParam?: string
}

export interface SharePriceGroupObjItem {
  /** 共享价格 */
  price: number
  /** 同一共享价格数据列表 */
  data: ViewTestParamsItem[]
}

/** 共享价格分组 */
interface SharePriceGroupObj {
  [key: string]: SharePriceGroupObjItem
}

/** 后端无价格返回信息时，前端模拟加入的价格信息ID */
export const EmptyPriceId = 'EmptyPriceId'

type SourceModuleType = 'UseTestSample' | 'UseTestParams'

/**
 * 参数控制基类，该类会在选择参数和样品页面使用
 * 处理参数列表数据
 */
export class BaseTestParams extends UseModuleEmit<{ testParams: any }> {
  /**
   * 实例化模块
   * UseTestSample - 选择样品参数弹窗
   * UseTestParams - 编辑样品信息界面
   */
  sourceModule?: SourceModuleType

  constructor(sourceModule: SourceModuleType) {
    super()

    this.sourceModule = sourceModule
  }

  /**
   * 构建参数列表数据
   * 渲染共享单价和非共享单价逻辑
   * 注：该方法也用于查询过滤，区别是入参的data在初始化时是接口返回的数据，而在查询时是缓存的cacheData数据
   * opts.data 接口返回参数 / 或用于查询时的本地缓存数据
   * opts.isInit 是否初始化选择规程/价格等默认数据
   * opts.queryParam 关键字高亮过滤
   */
  buildParamsData(opts: BuildParamsOpts): ViewTestParamsItem[] {
    const data = opts.data
    const isInit = opts.isInit
    const queryParam = opts.queryParam

    // 共享单价分组对象
    const sharePriceParamGroup: SharePriceGroupObj = {}
    // 非共用单价试验参数
    const notSharePriceParams: ViewTestParamsItem[] = []

    let result: ViewTestParamsItem[] = []

    for (let i = 0; i < data.length; i++) {
      const item = data[i] as ViewTestParamsItem
      const prices = item.prices || []
      // 共享价格项
      const sharePriceItem = prices.find(j => j.type === PRICE_TYPE.SHARE)

      item.isGroup = false
      item.isSearch = false
      item.disabled = false
      item.shareQualifier = null

      // 初始化前端渲染参数逻辑，界面过滤筛选等操作时，不进行初始化，避免保存的数据丢失
      if (isInit) {
        this.setDefaultParamData(item)
      }

      // 过滤时，将满足条件的数据打上isSearch标记，利用该标记对过滤数据进行高亮和排序
      if (queryParam) {
        item.isSearch = item.displayName.includes(queryParam)
      }

      // 共用价格数据关系构建
      if (sharePriceItem && sharePriceItem.qualifier) {
        item.shareQualifier = sharePriceItem.qualifier

        if (!sharePriceParamGroup[sharePriceItem.qualifier]) {
          sharePriceParamGroup[sharePriceItem.qualifier] = {
            price: 0,
            data: [],
          }
        }

        sharePriceParamGroup[sharePriceItem.qualifier].price = sharePriceItem.price
        sharePriceParamGroup[sharePriceItem.qualifier].data.push(item)
        continue
      }

      // 非共用单价试验参数
      notSharePriceParams.push(item)
    }

    // 共享单价分组对象中循环，渲染共享单价提示列和数据列
    for (const shareQualifier in sharePriceParamGroup) {
      const item = sharePriceParamGroup[shareQualifier]
      // 同一共享单价参数数据
      const sharePriceParamData = item.data

      // 如果共享单价组中只有一个参数，则按非共享单价参数处理
      // 注：选择参数页面不需要此逻辑，样品信息编辑页面展示参数时才需要该逻辑
      if (this.sourceModule === 'UseTestParams') {
        // 选中的共享单价
        const selectedSharePriceParamData = item.data.filter(i => i.selected)
        if (selectedSharePriceParamData.length === 1) {
          notSharePriceParams.push(...sharePriceParamData)
          continue
        }
      }

      if (data.length > 0) {
        // 渲染提示列
        result.push(this.renderSharePriceRow(item, shareQualifier))

        // 处理并设置默认价格
        sharePriceParamData.forEach((item) => {
          this.checkPrices(item, true)
          this.setDefaultPrice(item)
        })

        // 渲染数据列
        result = result.concat(this.handleDataSort(sharePriceParamData))
      }
    }

    // 非共享单价渲染
    if (notSharePriceParams.length > 0) {
      // 渲染提示列
      result.push(this.renderNotSharePriceRow())

      // 处理并设置默认价格
      notSharePriceParams.forEach((item) => {
        this.checkPrices(item, false)
        this.setDefaultPrice(item)
      })

      // 渲染数据列
      result = result.concat(this.handleDataSort(notSharePriceParams))
    }

    return result
  }

  /**
   * 渲染公共单价信息列
   * 注：由于样品信息界面有计算逻辑，该方法会在样品信息页面继承时重写
   * @param item 共享单价分组项
   * @param shareQualifier 共享单价名
   */
  renderSharePriceRow(item: SharePriceGroupObjItem, shareQualifier: string) {
    const tipRow = new ViewTestParamsItem()
    tipRow.displayName = `以下试验参数共用单价（￥${item.price}） - ${shareQualifier}`
    tipRow.id = 'share-param'
    tipRow.isGroup = true
    tipRow.disabled = true

    return tipRow
  }

  /**
   * 渲染非公共单价信息列
   * 注：由于样品信息界面有计算逻辑，该方法会在样品信息页面继承时重写
   */
  renderNotSharePriceRow() {
    const tipRow = new ViewTestParamsItem()
    tipRow.displayName = '以下试验参数非共用单价试验参数'
    tipRow.id = 'not-share-param'
    tipRow.isGroup = true
    tipRow.disabled = true

    return tipRow
  }

  /**
   * 设置默认参数数据及字段
   */
  setDefaultParamData(item: ViewTestParamsItem) {
    // 判断是否
    if (!Object.prototype.hasOwnProperty.call(item, 'selected')) {
      item.price = 0
      // 默认不选中
      item.selected = false
      // 默认选中的依据和标准
      item.selectedPriceId = undefined
      item.selectedPriceType = undefined
    }
  }

  /** 处理价格脏数据 */
  handlePriceDirtyData(item: ViewTestParamsItem) {
    if (item.selected && !item.selectedPriceId) {
      if (item.scriptPrice !== null && item.scriptPrice !== undefined) {
        const pItem = item.prices.find(i => i.type === PRICE_TYPE.SCRIPT)
        if (pItem) {
          item.selectedPriceId = pItem.id
          item.selectedPriceType = pItem.type
        }
      }
    }
  }

  /**
   * 检查并处理价格下拉列表
   * @param item 参数项
   * @param isShareGroup 是否共享单价组
   */
  checkPrices(item: ViewTestParamsItem, isShareGroup: boolean) {
    item.prices = item.prices || []

    // 处理价格脏数据（没有选中价格id的，加上选中价格id）
    this.handlePriceDirtyData(item)

    // 价格处理
    item.prices.forEach((pItem) => {
      // 处理公用单价，若不在公用单价组，还存在公用单价，则打上禁用标记
      if (isShareGroup) {
        pItem.selected = false
      }

      if (pItem.type === PRICE_TYPE.SHARE) {
        pItem._disabled = !isShareGroup
      }

      // 若当前选中价格为脚本价格，则将下拉列表的脚本价格改为一致
      if (pItem.type === PRICE_TYPE.SCRIPT && item.selectedPriceType === PRICE_TYPE.SCRIPT) {
        pItem.price = item.price || 0
      }
    })

    // 若当前参数为共用单价，清空选中逻辑（后续会自动默认）
    // 若当前参数不为共用单价，检查选中价格是否为公用单价，若存在，则将选中数据清空
    if (
      isShareGroup
      || (!isShareGroup && (item.priceType === PRICE_TYPE.SHARE || item.selectedPriceType === PRICE_TYPE.SHARE))
    ) {
      item.priceType = undefined
      item.selectedPriceType = undefined
      item.selectedPriceId = undefined
      item.price = 0
      item.shareQualifier = null
      item.sharedPriceQualifier = null
      item.sharePrice = null
    }

    // 排除禁用掉的价格
    const prices = item.prices.filter(item => !item._disabled)

    // 检查价格下拉，若不存在下拉项则往里加入一个价格为0的参数价格
    if (prices.length === 0 && item.prices.length === 0) {
      item.prices.unshift({
        id: EmptyPriceId,
        type: PRICE_TYPE.CUSTOM,
        price: 0,
        qualifier: '参数价格',
        selected: true,
      })
    }
  }

  /**
   * 设置默认价格
   */
  setDefaultPrice(item: ViewTestParamsItem) {
    // 先过滤被禁用的价格
    const prices = item.prices.filter(i => !i._disabled)

    // 价格下拉不可能为空数组，检查下checkPrices方法逻辑
    if (!prices.length) {
      throw new Error('参数价格下拉异常！')
    }

    // 价格展示排序
    // 自定义价格(被删除的选中价格) > 脚本单价 > 共享单价 > 样品价格 > 参数价格 > 参数子价格
    const priceOrder = [PRICE_TYPE.CUSTOM, PRICE_TYPE.SCRIPT, PRICE_TYPE.SHARE, PRICE_TYPE.SAMPLE, PRICE_TYPE.PRICE, PRICE_TYPE.CHILD]

    // 根据上面顺序排序
    prices.sort((a, b) => {
      const indexA = priceOrder.indexOf(a.type)
      const indexB = priceOrder.indexOf(b.type)

      // 根据索引进行排序，索引小的排在前面
      return indexA - indexB
    })

    // 判断是否有使用的价格，若没有则赋值
    if (!isDefined(item.priceType) || !item.selectedPriceId) {
      const priceItem = prices[0]
      item.selectedPriceId = priceItem.id
      item.selectedPriceType = priceItem.type
      // 旧版逻辑，兼容下，百八十年后数据都变成新版的数据就可以删了
      item.priceType = priceItem.type
      item.price = priceItem.price || 0

      priceItem.selected = true

      item.sharePrice = null
      item.shareQualifier = null
      item.sharedPriceQualifier = null
      item.paramScript = null

      // 共享单价赋值
      if (item.selectedPriceType === PRICE_TYPE.SHARE) {
        item.sharePrice = priceItem.price
        item.shareQualifier = priceItem.qualifier
        item.sharedPriceQualifier = priceItem.qualifier
      }

      // 脚本参数赋值
      if (item.selectedPriceType === PRICE_TYPE.SCRIPT) {
        item.paramScript = priceItem.qualifier

        // 如果选中为脚本参数，但下拉中有共用单价，也需要赋值共用单价信息
        // 因为脚本价格出现在共用组中时，按脚本价格展示，但最后计算还是共用单价
        const sharePriceItem = prices.find(i => i.type === PRICE_TYPE.SHARE)
        if (sharePriceItem) {
          item.sharePrice = sharePriceItem.price
          item.shareQualifier = sharePriceItem.qualifier
          item.sharedPriceQualifier = sharePriceItem.qualifier
        }
      }
    }
  }

  /**
   * 处理价格分组数据排序
   * 同一个数据组内根据orderNum进行排序，同时若为过滤数据，需要排在最前面
   * @param data 按价格分组的数据
   */
  handleDataSort(data: ViewTestParamsItem[]) {
    data.sort((a, b) => Number(a.orderNum) - Number(b.orderNum))
    data.sort((a, b) => Number(b.isSearch) - Number(a.isSearch))

    return data
  }

  /**
   * 本地过滤数据
   * @param testParams 所有参数列表
   * @param filterObj 过滤参数
   * @returns 过滤后的数据，与传进来的testParams保持引用关系
   */
  filterData(testParams: ViewTestParamsItem[] | TestParamsItem[], filterObj: ParamListFilterObj) {
    const { queryParam, queryStandard, showSelectedOnly } = filterObj
    let result = testParams as ViewTestParamsItem[]

    // 先去掉分组信息
    result = result.filter(item => !item.isGroup)

    // 按规程过滤
    if (queryStandard) {
      result = result.filter(item => (item.standards.some(i => i.uniqKey === queryStandard)))
    }

    // 按选中的数据过滤
    if (showSelectedOnly) {
      result = result.filter(item => item.selected)
    }

    // 按检测参数关键字设置高亮并排序
    result = this.buildParamsData({
      data: result,
      isInit: false,
      queryParam,
    })

    return result
  }
}
