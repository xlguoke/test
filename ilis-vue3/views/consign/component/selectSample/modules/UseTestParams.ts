import type {
  SharePriceGroupObjItem,
  TestParamsItem,
} from '~/views/consign/component/selectSampleParam/modules/BaseTestParams.ts'
import {
  BaseTestParams,
  EmptyPriceId,
  ViewTestParamsItem,
} from '~/views/consign/component/selectSampleParam/modules/BaseTestParams.ts'
import type { QueryParams } from '~/views/consign/component/selectSampleParam/api.ts'
import { paramsApi } from '~/views/consign/component/selectSampleParam/api.ts'
import { UseParamPack } from '~/views/consign/component/selectSample/modules/UseParamPack.ts'
import { PRICE_TYPE, ParamPriceItem } from '~/views/consign/component/selectSampleParam/modules/UseParamPrice.ts'
import type { ParamStandardItem } from '~/views/consign/component/selectSampleParam/modules/UseParamStandard.ts'
import type { UseSampleInfo } from '~/views/consign/component/selectSample/modules/UseSampleInfo.ts'
import type { UseTestOtherInfo } from '~/views/consign/component/selectSample/modules/UseTestOtherInfo.ts'
import type { MetaDataEntity } from '~/views/consign/component/selectSample/modules/MainController.ts'
import { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'
import { STANDARD_TYPE } from '~/types/standard.ts'
import { UseParamStandard } from '~/views/consign/component/selectSampleParam/modules/UseParamStandard.ts'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'

/** 检测参数元数据 */
export class TestParamsMetaDataItem {
  'priceStandardId' = ''
  'testParamId' = ''
  'price' = 0
  /** 公用单价 */
  'sharePrice': number | null = null
  /** 公用单价描述 */
  'sharedPriceQualifier'?: string
  /** 价格类型 */
  'priceType'?: PRICE_TYPE
  /** 检测点数 */
  'checkPoint' = 1
  'unit': string | null = null
  /** 检测参数名称 */
  'testParamDisplayName' = ''
  designRequirements? = ''
  /** 检测参数名称 */
  'displayName' = ''
  'remark' = ''
  /** 检测依据，逗号分隔字符串 */
  'basis' = ''
  /** 评定标准，逗号分隔字符串 */
  'standard' = ''
  /** 检测依据id，逗号分隔字符串 */
  'basisIds' = ''
  /** 评定标准id，逗号分隔字符串 */
  'standardIds' = ''
  /** 检测依据 通过@符号分隔名称和编号，并通过$符号分隔数据 */
  'concatBasis' = ''
  /** 评定标准 通过@符号分隔名称和编号，并通过$符号分隔数据 */
  'concatStandards' = ''
  'isBuildSampleCode' = 'false'
  'isLocaleItem' = 'false'
  'count' = 1
  'paramScript'?: string | null
  'generateAcceptSampleInfoByCount' = false
  'generateProcessObject' = true
  'testItemId'? = ''
  'criterion': ParamStandardItem[] = []
  paramWorkDay?: number
  priceId?: string

  'autoAddBlendSample'?: boolean
  'prices': Array<{
    id: string
    type: number
    price: number
    qualifier?: string
    selected: boolean
  }> = []
}

/**
 * 参数信息
 */
export class UseTestParams extends BaseTestParams {
  useParamStandard: UseParamStandard
  useBasicInfo: UseBasicInfo

  // 【系统参数】开启推荐规程逻辑
  USING_RECOMMENDED_PARAMETER_STANDARD = false

  /** 表格加载状态 */
  tableLoading = false
  /** 打包参数id */
  paramPackId?: string
  /** 只展示勾选的参数 */
  onlyShowSelected = true
  /** 检测组数，数据来自UseBaseInfo中的检测组数 */
  sampleAmount: number = 1

  /** 所有参数数据，包含未勾选 */
  testParams: ViewTestParamsItem[] = []
  /** 用于界面展示绑定的参数数据（保持与testParams的引用） */
  testParamsBindView: ViewTestParamsItem[] = []

  /** 选中的参数 */
  get selectedRows() {
    return this.testParams.filter(i => i.selected && !i.isGroup)
  }

  /** 选中的参数id */
  get selectedRowKey() {
    return this.selectedRows.map(i => i.id)
  }

  /** 是否根据计价数量生成样品，只要有一个参数为true，就需要 */
  get generateAcceptSampleInfoByCount() {
    return this.selectedRows.some(i => i.generateAcceptSampleInfoByCount)
  }

  /** 参数费用总计 */
  get testObjectPrice() {
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
          sum += (item.sharePrice || 0) * this.sampleAmount
          sharedPriceQualifierArr.push(item.sharedPriceQualifier)
        }
      }
      else {
        sum += item.paramAmount || 0
      }
    })

    return sum
  }

  get testItemIds() {
    return [...new Set(this.selectedRows.map(i => i.testItemId))].join(',')
  }

  constructor(useBasicInfo: UseBasicInfo) {
    super('UseTestParams')

    this.useBasicInfo = useBasicInfo
    this.useParamStandard = new UseParamStandard(useBasicInfo.data.isNeedConclusion)

    getBusinessParam('USING_RECOMMENDED_PARAMETER_STANDARD').then((val) => {
      this.USING_RECOMMENDED_PARAMETER_STANDARD = val
    })
  }

  /** 设置特殊字符 */
  setSpecialCharacter(id: string) {
    const e = event as any
    const testParams = this.testParams
    let selectionStart: null | number = null

    return (str: string) => {
      if (selectionStart === null && e && e.target) {
        selectionStart = e.target.selectionStart
      }

      const item = testParams.find(i => i.id === id)
      if (item) {
        const val = (item.designRequirements || '') as string
        const nowValArr = val.split('')

        if (selectionStart !== null && selectionStart !== undefined) {
          nowValArr.splice(selectionStart, 0, (str || ''))
          item.designRequirements = nowValArr.join('')
          selectionStart++
        }
        else {
          item.designRequirements = (item.designRequirements || '') + (str || '')
        }
      }
    }
  }

  /** 返回元数据 */
  getMetaData() {
    return {
      testParams: this.formatTestParams2MetaData(this.selectedRows),
    }
  }

  /**
   * 渲染参数列表
   * @param params 请求参数列表接口参数
   * @param localTestParams 本地维护的参数数据/选择样品参数中选择的参数数据/元数据中读取的参数数据
   */
  async initTestParamList(params: QueryParams, localTestParams: ViewTestParamsItem[]) {
    const useParamStandard = this.useParamStandard

    // 回显已选参数逻辑下，传递参数id字段到后端用于后端返回被删除的参数
    let testParamIds: string[] | undefined
    if (!MainController.isAddPage) {
      testParamIds = localTestParams.map(i => i.id)
    }

    this.tableLoading = true
    // 始终从接口获取最新数据，然后将本地选择数据或者元数据中存储的数据合并至接口数据中
    const res = await paramsApi({
      ...params,
      testParamIds,
    }).finally(() => {
      this.tableLoading = false
    })

    // 格式化一下规程数据，逻辑基本同选择参数界面
    res.data.forEach((item) => {
      useParamStandard.formatStandard(item as ViewTestParamsItem)

      if (this.USING_RECOMMENDED_PARAMETER_STANDARD) {
        const newItem = item as ViewTestParamsItem;

        // 上面的逻辑主要针对选择参数页面，而选择样品页面是通过规程的selected来控制选中，此处做下处理
        (newItem.basis || []).forEach((i) => {
          if ((newItem.selectedBasis || []).includes(i.uniqKey)) {
            i.selected = true
          }
          else {
            i.selected = false
          }
        })
      }
    })

    // 将本地数据合并入最新列表数据
    const data = this.mergeTestParams(localTestParams, res.data)

    // 构建分组视图
    const testParams = this.buildParamsData({
      data,
      isInit: false,
    })

    // 设置数据
    this.testParams = testParams
    // 刷新视图
    this.refreshViewData()

    // 发布参数列表变更事件
    this.publishFieldChange('testParams')
  }

  /**
   * 将选择参数弹窗中的数据或元数据存储的数据 合并至 接口返回的参数列表
   * @param localTestParams 选择参数弹窗中的数据或元数据存储的数据
   * @param newTestParams 接口返回的最新数据
   */
  mergeTestParams(localTestParams: ViewTestParamsItem[], newTestParams: TestParamsItem[]) {
    const result: ViewTestParamsItem[] = []

    for (let i = 0; i < newTestParams.length; i++) {
      // 接口数据
      const newDataItem = newTestParams[i]
      // 本地操作过的数据
      const localDataItem = localTestParams.find(j => j.id === newDataItem.id)

      const dataItem = new ViewTestParamsItem()

      if (localDataItem) {
        // 从接口返回的数据中，更新一些字段
        localDataItem.paramWorkDay = newDataItem.paramWorkDay
        Object.assign(dataItem, localDataItem)
      }
      else {
        Object.assign(dataItem, newDataItem)
        // 设置默认规程
        this.setDefaultParamData(dataItem)
      }

      // 构建价格下拉
      dataItem.prices = this.buildTestParamPrices(newDataItem, dataItem)

      // 计算价格
      this.calcTestParamPrice(dataItem)

      result.push(dataItem)
    }

    return result
  }

  /**
   * 构建价格信息
   * 老数据没有共享和脚本价格，价格下拉数据合并
   */
  buildTestParamPrices(newDataItem: TestParamsItem, localDataItem: ViewTestParamsItem) {
    const result = newDataItem.prices || []

    // 公用单价
    if (localDataItem.selectedPriceType === PRICE_TYPE.SHARE && !result.find(i => i.type === PRICE_TYPE.SHARE)) {
      if (MainController.isDetailPage) {
        const originPriceItem = new ParamPriceItem()
        originPriceItem.id = localDataItem.selectedPriceId || generateGUID()
        originPriceItem.price = localDataItem.price
        originPriceItem.type = PRICE_TYPE.SHARE
        originPriceItem.qualifier = localDataItem.sharedPriceQualifier || localDataItem.shareQualifier || ''
        result.unshift(originPriceItem)
      }
      else {
        localDataItem.selectedPriceType = PRICE_TYPE.CUSTOM
        localDataItem.priceType = PRICE_TYPE.CUSTOM
        localDataItem.shareQualifier = null
        localDataItem.sharedPriceQualifier = null
        localDataItem.sharePrice = null
        result.unshift(this.buildCustomPriceItem(localDataItem.selectedPriceId, localDataItem.price, PRICE_TYPE.CUSTOM, '原价格'))
      }
    }

    // 异常数据处理
    // 预委托来的数据可能会出现有脚本价格标识，但selectedPriceType却不是脚本价格，若遇到该类数据，先去价格下拉中找下是否有脚本价格，若存在，则按脚本价格选中
    if (localDataItem.paramScript && localDataItem.selectedPriceType !== PRICE_TYPE.SCRIPT) {
      const scriptPriceItem = result.find(i => i.type === PRICE_TYPE.SCRIPT)
      if (scriptPriceItem) {
        localDataItem.selectedPriceType = PRICE_TYPE.SCRIPT
        localDataItem.selectedPriceId = scriptPriceItem.id
      }
    }

    // 选中数据为脚本单价，但数据下拉中没有脚本单价，按原价格处理
    if (localDataItem.selectedPriceType === PRICE_TYPE.SCRIPT && !result.find(i => i.type === PRICE_TYPE.SCRIPT)) {
      localDataItem.selectedPriceType = PRICE_TYPE.CUSTOM
      localDataItem.priceType = PRICE_TYPE.CUSTOM
      localDataItem.scriptPrice = null
      localDataItem.paramScript = null
      result.unshift(this.buildCustomPriceItem(localDataItem.selectedPriceId, localDataItem.price, PRICE_TYPE.CUSTOM, '原价格'))
    }

    if (
      localDataItem.selectedPriceType === PRICE_TYPE.PRICE
      || localDataItem.selectedPriceType === PRICE_TYPE.SAMPLE
      || localDataItem.selectedPriceType === PRICE_TYPE.CHILD
      || localDataItem.selectedPriceType === PRICE_TYPE.CUSTOM
    ) {
      const selectedItem = result.find(i => i.id === localDataItem.selectedPriceId)
      if (selectedItem && selectedItem.price !== localDataItem.price) {
        localDataItem.selectedPriceType = PRICE_TYPE.CUSTOM
        localDataItem.selectedPriceId = generateGUID()
        result.unshift(this.buildCustomPriceItem(localDataItem.selectedPriceId, localDataItem.price, PRICE_TYPE.CUSTOM, '原价格'))
      }
      else if (!selectedItem) {
        if (localDataItem.selectedPriceId === EmptyPriceId) {
          result.unshift(this.buildCustomPriceItem(localDataItem.selectedPriceId, localDataItem.price, PRICE_TYPE.PRICE, '参数价格'))
        }
        else {
          result.unshift(this.buildCustomPriceItem(localDataItem.selectedPriceId, localDataItem.price, PRICE_TYPE.CUSTOM, '原价格'))
        }
      }
    }

    // 若没有价格或只有一个共享价格，需要往里面加入一个参数为0的价格
    if (result.length === 0 || (result.length === 1 && result[0].type === PRICE_TYPE.SHARE)) {
      const originPriceItem = new ParamPriceItem()
      originPriceItem.id = EmptyPriceId
      originPriceItem.price = 0
      originPriceItem.type = PRICE_TYPE.PRICE
      originPriceItem.qualifier = '参数价格'
      result.push(originPriceItem)
    }

    return result
  }

  // 构建自定义价格项（前端用）
  buildCustomPriceItem(id?: string, price?: number, type?: PRICE_TYPE, qualifier?: string) {
    const originPriceItem = new ParamPriceItem()
    originPriceItem.id = id || generateGUID()
    originPriceItem.price = price || 0
    originPriceItem.type = type || PRICE_TYPE.CUSTOM
    originPriceItem.qualifier = qualifier
    return originPriceItem
  }

  /**
   * 计算检测列表参数价格
   * 将本地参数列表数据中的检测点数/组数/价格等数据相乘，更新小计数据
   */
  calcTestParamPrice(item: ViewTestParamsItem) {
    const sampleAmount = this.sampleAmount

    if (item.isGroup) {
      return
    }

    // 检测点数
    const checkPoint = item.checkPoint || 1
    // 检测组数
    const count = sampleAmount || 1
    // 价格
    const price = item.price || 0

    item.count = count
    item.checkPoint = checkPoint
    item.price = price
    item.paramAmount = checkPoint * count * price
  }

  /**
   * 控制视图展示的数据
   */
  refreshViewData() {
    // 计算价格
    // 由于共用单价组会导致合计分组变化，重新构建视图前需要计算一次价格
    this.testParams.forEach((item) => {
      this.calcTestParamPrice(item)
    })

    this.testParamsBindView = this.filterData(this.testParams, {
      showSelectedOnly: this.onlyShowSelected,
    })

    // 计算价格
    // 由于共用单价组会导致合计分组变化，重新构建视图后需要计算一次价格
    this.testParams.forEach((item) => {
      this.calcTestParamPrice(item)
    })
  }

  /**
   * 渲染公共价格提示列
   * @param item 共享单价分组项
   * @param shareQualifier 共享单价名
   */
  renderSharePriceRow(item: SharePriceGroupObjItem, shareQualifier: string): ViewTestParamsItem {
    const sampleAmount = this.sampleAmount
    const tipRow = new ViewTestParamsItem()

    tipRow.displayName = `以下试验参数共用单价（￥${item.price}） - ${shareQualifier}`
    tipRow.id = 'share-param'
    tipRow.displayTotalAmount = item.price * sampleAmount
    tipRow.isGroup = true
    tipRow.disabled = true

    return tipRow
  }

  /**
   * 渲染非公共单价信息列
   */
  renderNotSharePriceRow() {
    const tipRow = new ViewTestParamsItem()
    // 去掉共用单价
    const rows = this.selectedRows.filter(i => !i.sharedPriceQualifier)

    tipRow.displayName = '以下试验参数非共用单价试验参数'
    tipRow.id = 'not-share-param'
    tipRow.displayTotalAmount = rows.reduce((sum, i) => sum + (i.paramAmount || 0), 0)
    tipRow.isGroup = true
    tipRow.disabled = true

    return tipRow
  }

  /**
   * 计算脚本价格
   * 样品信息和收样辅助信息变化都会触发该方法重新计算
   * @param useSampleInfo
   * @param useTestOtherInfo
   */
  calcScriptPrice(useSampleInfo: UseSampleInfo, useTestOtherInfo: UseTestOtherInfo) {
    const { selectedRows, testParams } = this
    const consignWindow = MainController.consignWindow

    // 只计算已勾选的参数，脚本价格
    const scriptPriceRows = selectedRows.filter(i => i.selectedPriceType === PRICE_TYPE.SCRIPT)

    if (scriptPriceRows.length === 0) {
      return
    }

    const calculateWithScript = consignWindow.fee && consignWindow.fee.calculateWithScript

    // 依靠父页面的方法来计算
    if (calculateWithScript) {
      // 基于性能考虑，父页面的计算方法实际上只用到了样品信息和收样辅助信息，没必要构建一次元数据传过来，直接把样品和辅助信息对象传递过来组装后传过去
      const TObject = {
        ...useSampleInfo.getMetaData(),
        ...useTestOtherInfo.getMetaData(),
      }
      const result: ViewTestParamsItem[] = calculateWithScript('calculateWithParamScript', TObject, scriptPriceRows)
      // 是否刷新视图，若没有脚本价格变动，则不刷新
      let shouldRefresh = false

      // 由于该计算结果返回的元数据是旧版的，不能直接赋值，直接取出计算的结果赋值就阔以了
      testParams.forEach((item) => {
        if (item.selectedPriceType === PRICE_TYPE.SCRIPT) {
          const cItem = result.find(i => i.id === item.id)
          if (cItem && (cItem.scriptPrice || cItem.scriptPrice === 0)) {
            item.price = cItem.scriptPrice

            const pItem = item.prices.find(i => i.type === PRICE_TYPE.SCRIPT)
            if (pItem) {
              pItem.price = cItem.scriptPrice
            }

            // 将最新的脚本价格拿去计算小计
            this.calcTestParamPrice(item)
            shouldRefresh = true
          }
        }
      })

      if (shouldRefresh) {
        this.refreshViewData()
      }
    }
  }

  /**
   * 更新参数数据
   */
  updateParamData(id: string, key: keyof ViewTestParamsItem, value: any) {
    const testParams = this.testParams
    const index = testParams.findIndex(i => i.id === id)
    const item = testParams[index]

    // 价格分组信息列不管
    if (item.isGroup) {
      return
    }

    if (index !== -1) {
      (item[key] as any) = value
    }
  }

  /**
   * 切换查看未勾选参数
   */
  switchOnlyShowSelected() {
    this.onlyShowSelected = !this.onlyShowSelected
    this.refreshViewData()
  }

  /**
   * 使用参数打包
   */
  async useParamPack() {
    if (!this.paramPackId) {
      return
    }

    const useParamPack = new UseParamPack(this.paramPackId)

    this.tableLoading = true
    await useParamPack.init(this.testParams).finally(() => {
      this.tableLoading = false
    })

    this.refreshViewData()
  }

  /**
   * 更新使用规程
   */
  updateUseStandards(data: { [key: string]: ParamStandardItem[] }) {
    const testParams = this.testParams

    // 将选择规程弹窗里选择的数据应用到参数列表
    testParams.forEach((item) => {
      if (item.id in data) {
        const standards = data[item.id] || []
        item.basis = this.useSelectStandards(standards, STANDARD_TYPE.BASIS)
        item.standards = this.useSelectStandards(standards, STANDARD_TYPE.STANDARD)
      }
    })
  }

  /**
   * 应用选择的规程项
   * 逻辑备注：
   * 1.参数列表的规程由basis和standards区分依据和评定标准，且通过对应数据对象下的selected来标记选中
   * 2.选择规程弹窗中处理过的数据不区分依据还是标准，只通过baseStandardUseType字段标记应用到依据还是标准
   */
  useSelectStandards(newStandards: ParamStandardItem[], standardType: STANDARD_TYPE) {
    const result: ParamStandardItem[] = []
    const data: ParamStandardItem[] = JSON.parse(JSON.stringify(newStandards))

    data.forEach((newItem) => {
      newItem.selected = false

      if (newItem.baseStandardUseType === STANDARD_TYPE.ALL) {
        newItem.selected = true
      }
      else if (newItem.baseStandardUseType === standardType) {
        newItem.selected = true
      }

      result.push(newItem)
    })

    return result
  }

  /** 格式化参数列表数据，转为旧版元数据所需的格式 */
  formatTestParams2MetaData(testParams: ViewTestParamsItem[]) {
    const { useBasicInfo, USING_RECOMMENDED_PARAMETER_STANDARD } = this
    const result: TestParamsMetaDataItem[] = []

    for (let i = 0; i < testParams.length; i++) {
      // 界面视图使用的参数列表数据
      const item = testParams[i]
      // 需转换成元数据保存的参数数据
      // 注：后续需要后端确认，是否还有转成旧版的必要
      const metaDataItem = new TestParamsMetaDataItem()

      if (USING_RECOMMENDED_PARAMETER_STANDARD && !useBasicInfo.data.isNeedConclusion) {
        item.standards.forEach((j) => {
          j.selected = false
        })
      }

      const basis = item.basis.filter(j => j.selected)
      const standards = item.standards.filter(j => j.selected)

      metaDataItem.basis = basis.map(j => `${j.baseStandardName}${j.publishCode}`).join(',')
      metaDataItem.basisIds = basis.map(j => j.baseStandardId).join(',')
      metaDataItem.standard = standards.map(j => `${j.baseStandardName}${j.publishCode}`).join(',')
      metaDataItem.standardIds = standards.map(j => j.baseStandardId).join(',')
      metaDataItem.concatBasis = basis.map(j => `${j.baseStandardName}@${j.publishCode}`).join('$')
      metaDataItem.concatStandards = standards.map(j => `${j.baseStandardName}@${j.publishCode}`).join('$')
      metaDataItem.criterion = this.buildCriterion(item)
      metaDataItem.priceStandardId = item.priceStandardId
      metaDataItem.unit = null
      metaDataItem.autoAddBlendSample = item.autoAddBlendSample
      metaDataItem.testItemId = item.testItemId
      metaDataItem.displayName = item.displayName
      metaDataItem.testParamDisplayName = item.displayName
      metaDataItem.designRequirements = item.designRequirements
      metaDataItem.testParamId = item.id
      metaDataItem.count = item.count
      metaDataItem.checkPoint = item.checkPoint
      metaDataItem.generateAcceptSampleInfoByCount = item.generateAcceptSampleInfoByCount
      metaDataItem.generateProcessObject = item.generateProcessObject
      metaDataItem.isBuildSampleCode = String(item.buildSampleCode)
      metaDataItem.isLocaleItem = String(item.localeItem)
      metaDataItem.remark = item.remark
      metaDataItem.price = item.price
      metaDataItem.priceType = item.selectedPriceType
      metaDataItem.priceId = item.selectedPriceId
      metaDataItem.prices = []
      metaDataItem.paramWorkDay = item.paramWorkDay

      metaDataItem.paramScript = item.paramScript
      metaDataItem.sharePrice = item.sharePrice || null
      metaDataItem.sharedPriceQualifier = item.sharedPriceQualifier || undefined

      item.prices.forEach((j) => {
        if (j.id === item.selectedPriceId) {
          if (item.selectedPriceType === PRICE_TYPE.SCRIPT) {
            metaDataItem.paramScript = j.qualifier
          }

          if (item.selectedPriceType === PRICE_TYPE.SHARE) {
            metaDataItem.sharePrice = j.price
            metaDataItem.sharedPriceQualifier = j.qualifier
          }
        }

        metaDataItem.prices.push({
          id: j.id,
          type: j.type,
          price: j.price,
          qualifier: j.qualifier,
          selected: item.selectedPriceId === j.id,
        })
      })

      result.push(metaDataItem)
    }

    return result
  }

  /**
   * 构建元数据需要的规程信息
   * 将选中状态通过baseStandardUseType的1、2、3来标记
   */
  buildCriterion(item: ViewTestParamsItem) {
    const criterion: ParamStandardItem[] = []

    item.basis.forEach((ib) => {
      if (ib.selected) {
        const sameItem = criterion.find(j => j.uniqKey === ib.uniqKey)
        if (sameItem) {
          sameItem.baseStandardUseType = STANDARD_TYPE.ALL
        }
        else {
          // 设置使用规程字段
          ib.baseStandardUseType = STANDARD_TYPE.BASIS
          criterion.push(ib)
        }
      }
    })

    item.standards.forEach((ib) => {
      if (ib.selected) {
        const sameItem = criterion.find(j => j.uniqKey === ib.uniqKey)
        if (sameItem) {
          sameItem.baseStandardUseType = STANDARD_TYPE.ALL
        }
        else {
          // 设置使用规程字段
          ib.baseStandardUseType = STANDARD_TYPE.STANDARD
          criterion.push(ib)
        }
      }
    })

    return criterion
  }

  /**
   * 格式化元数据中取出的参数列表数据，转为该页面逻辑所需的格式
   * 注：后续看能不能把界面用的数据和元数据统一下，目前这样转来转去，有点繁琐
   */
  formatTestParams2View(testParams: TestParamsMetaDataItem[]) {
    const result: ViewTestParamsItem[] = []

    for (let i = 0; i < testParams.length; i++) {
      const metaDataItem = testParams[i]
      const viewItem = new ViewTestParamsItem()

      // 处理脏数据
      if (!metaDataItem.criterion) {
        metaDataItem.criterion = []
      }

      // 合并
      Object.assign(viewItem, metaDataItem)
      viewItem.localeItem = metaDataItem.isLocaleItem === 'true'
      viewItem.buildSampleCode = metaDataItem.isBuildSampleCode === 'true'

      viewItem.id = metaDataItem.testParamId
      viewItem.basis = []
      viewItem.standards = []

      if (!viewItem.displayName) {
        viewItem.displayName = metaDataItem.testParamDisplayName
      }

      metaDataItem.criterion.forEach((j) => {
        if ([STANDARD_TYPE.BASIS, STANDARD_TYPE.ALL].includes(j.baseStandardUseType)) {
          j.selected = true
          viewItem.basis.push(j)
        }
        if ([STANDARD_TYPE.STANDARD, STANDARD_TYPE.ALL].includes(j.baseStandardUseType)) {
          j.selected = true
          viewItem.standards.push(j)
        }
      })

      viewItem.scriptPrice = metaDataItem.priceType === PRICE_TYPE.SCRIPT ? metaDataItem.price : undefined
      viewItem.selected = true
      viewItem.selectedPriceId = this.getSelectedPriceId(metaDataItem)
      viewItem.selectedPriceType = metaDataItem.priceType

      result.push(viewItem)
    }

    return result
  }

  /**
   * 兼容选择价格逻辑
   * 若有priceId，则直接用priceId
   * 若没有priceId，则用价格类型和价格进行比较
   */
  getSelectedPriceId(metaDataItem: TestParamsMetaDataItem) {
    if (Object.prototype.hasOwnProperty.call(metaDataItem, 'priceId')) {
      return metaDataItem.priceId
    }

    const { priceType, price, prices } = metaDataItem
    const priceItem = (prices || []).find(i => i.type === priceType && i.price === price)
    if (priceItem) {
      return priceItem.id
    }
  }

  /** 设置回显数据 */
  setData(metaData: MetaDataEntity) {
    this.sampleAmount = metaData.sampleAmount

    // 初始化参数列表
    this.initTestParamList({
      bigCategoryId: metaData.bigCategoryId,
      sampleId: metaData.testUnitTestSampleId,
    }, this.formatTestParams2View(metaData.testParams))
  }
}
