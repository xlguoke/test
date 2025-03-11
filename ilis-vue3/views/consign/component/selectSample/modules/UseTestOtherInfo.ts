import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { cloneDeep } from '@unovis/ts'
import { UseBase } from '~/views/consign/component/selectSample/modules/UseBase.ts'
import { getTestOtherInfo } from '~/views/consign/component/selectSample/api.ts'
import type { MetaDataEntity } from '~/views/consign/component/selectSample/modules/MainController.ts'
import { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'
import type { Specifications } from '~/views/consign/component/selectSpecification'
import { VIEW_TYPE } from '~/views/consign/component/selectSpecification'

export interface TestOtherInfoItem {
  /** 别名 */
  alias?: string
  customized?: boolean
  consignRemark?: boolean
  dataType?: number
  displayName?: string
  id?: string
  infoType?: number
  inputHistory?: string[]
  isDefaultValue?: boolean
  isDesignValue?: boolean
  isNotNull?: boolean
  isShowTest?: boolean
  listValue?: string
  name?: string
  orderNo: number
  parentID?: string
  systemFieldName: string
  testDataProcess?: boolean
  value?: string | Dayjs
  isJoinSpecification?: boolean
}

export type StandardMeta = 'model' | 'specification' | 'grade' | 'label' | 'delegatesNum' | 'sampleNum'

/** 收样辅助信息元数据 */
export interface TestOtherInfoMetaDataItem extends TestOtherInfoItem {
  attributeId: string
  /** 用于规格型号，在编辑规格型号时是否可删除 */
  deleteAble?: boolean
}

export class TestOtherInfoEntity {
  otherInfos: TestOtherInfoMetaDataItem[] = []
}

/**
 * 收样辅助信息
 */
export class UseTestOtherInfo extends UseBase<TestOtherInfoEntity> {
  /** 规格型号字段 */
  standardFields = ['型号', '规格', '等级', '标号']

  /** 需要隐藏的字段（由规格型号 和 通用的 代表批量 和 试验数量组成） */
  // hideFields = ['型号', '规格', '等级', '标号', '代表批量', '试样数量']
  hideFields = ['代表批量', '试样数量']

  /** 规格型号编辑状态 */
  specificationsView: VIEW_TYPE = VIEW_TYPE.ADD

  /** 规格型号系统字段对应名称 */
  systemField2NameEnum: { [key: string]: StandardMeta } = {
    型号: 'model',
    规格: 'specification',
    等级: 'grade',
    标号: 'label',
    代表批量: 'delegatesNum',
    试样数量: 'sampleNum',
  }

  constructor() {
    super(new TestOtherInfoEntity())
  }

  /** 设置特殊字符 */
  setSpecialCharacter(attributeId: string) {
    const e = event as any
    const otherInfos = this.data.otherInfos
    let selectionStart: null | number = null

    return (str: string) => {
      if (selectionStart === null && e && e.target) {
        selectionStart = e.target.selectionStart
      }

      const item = otherInfos.find(i => i.attributeId === attributeId)
      if (item) {
        const val = (item.value || '') as string
        const nowValArr = val.split('')

        if (selectionStart !== null && selectionStart !== undefined) {
          nowValArr.splice(selectionStart, 0, (str || ''))
          item.value = nowValArr.join('')
          selectionStart++
        }
        else {
          item.value = (item.value || '') + (str || '')
        }
      }
    }
  }

  /** 获取收样辅助信息 */
  async initOtherInfos(sampleId: string, testItemIds: string) {
    const res = await getTestOtherInfo({
      sampleId,
      testItemIds,
    })

    const list = res.data
    // 排序
    list.sort((a, b) => (a.orderNo - b.orderNo))

    this.setDataField('otherInfos', this.formatOtherInfos(list))
  }

  /**
   * 将接口返回的收样辅助信息转为本地使用数据，数据处理(元数据保存格式，多了几个字段)
   * @param newOtherInfos 接口返回的收样辅助信息
   */
  formatOtherInfos(newOtherInfos: TestOtherInfoItem[]) {
    const result: TestOtherInfoMetaDataItem[] = []
    const localOtherInfo = this.data.otherInfos

    for (let i = 0; i < newOtherInfos.length; i++) {
      const item = newOtherInfos[i] as TestOtherInfoMetaDataItem

      if (item.id) {
        item.attributeId = item.id
        delete item.id
      }

      if (item.customized === undefined) {
        item.customized = false
      }

      // 新旧收样辅助信息对比合并
      // 注：新增和编辑时才执行，查看详情按元数据的来
      const locationItem = localOtherInfo.find(j => j.attributeId === item.attributeId)
      if (locationItem) {
        if (!item.isJoinSpecification) {
          item.value = locationItem.value || ''
        }
      }
      else {
        if (item.dataType === 2 && item.value) {
          const dateVal = dayjs(item.value).format('YYYY-MM-DD')
          item.value = dateVal === 'Invalid Date' ? '' : dateVal
        }

        if (!item.value) {
          item.value = ''
        }
      }

      // #31643 辅助信息 同名（显示名称）+ 同系统字段的，进行去重，只保留数据中心的字段，包括是否盲样的控制也取数据中心的字段
      const sameItemIndex = result.findIndex(j => (j.displayName + j.systemFieldName) === (item.displayName + item.systemFieldName))
      if (sameItemIndex !== -1) {
        const sameItem = result[sameItemIndex]
        if (sameItem.customized) {
          result.splice(sameItemIndex, 1)
        }
        else {
          continue
        }
      }

      result.push(item)
    }

    result.sort((a, b) => a.orderNo - b.orderNo)
    return result
  }

  /**
   * 从辅助信息中获取规格型号配置
   */
  getSpecificationsList() {
    return this.data.otherInfos.filter(item => item.isJoinSpecification)
  }

  nameKey(item: TestOtherInfoMetaDataItem) {
    return item.displayName + item.systemFieldName
  }

  /**
   * 编辑样品时，合并规格型号
   * @param {TestOtherInfoMetaDataItem[]} configs 保存在元数据的规格型号详细信息
   */
  mergeSpecifications(configs: TestOtherInfoMetaDataItem[]) {
    const specInfo = cloneDeep(this.getSpecificationsList())
    if (!configs || configs.length === 0)
      return specInfo
    // 转json格式，方便查找
    const specInfoObj: Record<string, TestOtherInfoMetaDataItem> = {}
    for (let i = 0; i < specInfo.length; i++) {
      const item = specInfo[i]
      specInfoObj[this.nameKey(item)] = item
    }
    for (let i = 0; i < configs.length; i++) {
      const c = configs[i]
      const key = this.nameKey(c)
      if (!c.attributeId || !c.isJoinSpecification)
        continue
      const item = specInfoObj[key]
      if (!item) {
        c.deleteAble = true
        continue
      }
      delete specInfoObj[key]
      item.value = c.value
      configs[i] = item
    }
    const addSpec = Object.values(specInfoObj)
    addSpec.forEach(item => item.value = '')
    return addSpec.concat(configs)
  }

  /**
   * 根据样品信息填写的数据赋值收样辅助信息
   * 部分收样辅助信息中的字段隐藏了，展示在样品信息模块中，在样品模块信息中填写完成后需要同步更新下收样辅助信息
   */
  updateValueBySampleInfo(sampleInfoData: any) {
    const otherInfos = this.data.otherInfos
    const hideFields = this.hideFields
    const systemField2NameEnum = this.systemField2NameEnum

    otherInfos.forEach((item) => {
      if (hideFields.includes(item.systemFieldName)) {
        const field = systemField2NameEnum[item.systemFieldName]
        if (field && field in sampleInfoData) {
          item.value = sampleInfoData[field]
        }
      }
    })
  }

  /**
   * 根据规格型号配置更新收样辅助信息
   */
  updateValueByStandardConfig(specificationConfig: Specifications[]) {
    const otherInfos = this.data.otherInfos

    otherInfos.forEach((item) => {
      if (item.isJoinSpecification) {
        const specItem = specificationConfig.find(i => i.attributeId === item.attributeId)
        if (specItem) {
          item.value = specItem.value
        }
      }
    })
  }

  /** 从元数据回显数据 */
  setData(metaData: MetaDataEntity) {
    const otherInfos = metaData.otherInfos
    otherInfos.sort((a, b) => (a.orderNo - b.orderNo))

    otherInfos.forEach((item) => {
      // 转换时间格式
      if (item.dataType === 2 && item.value) {
        item.value = dayjs(item.value)
      }
    })

    this.setDataField('otherInfos', otherInfos)

    // 非查看详情时，需要获取最新的辅助信息对比
    if (!MainController.isDetailPage) {
      const testItemIds = [...new Set(metaData.testParams.map(i => i.testItemId))].join(',')
      this.initOtherInfos(metaData.testUnitTestSampleId, testItemIds)
    }
  }
}
