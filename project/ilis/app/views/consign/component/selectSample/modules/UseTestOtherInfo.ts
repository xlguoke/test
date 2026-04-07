import type { Dayjs } from 'dayjs'
import type { MetaDataEntity } from '~/views/consign/component/selectSample/modules/services/MetaDataBuilder.ts'
import type { Specifications, StandardField } from '~/views/consign/component/selectSpecification'
import type { IConsginPageParam } from '~/views/consign/consignDetail/interface'
import dayjs from 'dayjs'
import { getTestOtherInfo } from '~/views/consign/component/selectSample/api.ts'

import { UseBase } from '~/views/consign/component/selectSample/modules/UseBase.ts'
import { SYSTEM_FIELDS_ENUM, SYSTEM_FIELDS_NAME, VIEW_TYPE } from '~/views/consign/component/selectSpecification'

import { mergeMetaSpecifications } from '~/views/consign/component/selectSpecification/modules/mergeSpecifications'

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

export type StandardMeta = StandardField | 'delegatesNum' | 'sampleNum'

/** 收样辅助信息元数据 */
export interface TestOtherInfoMetaDataItem extends TestOtherInfoItem {
  attributeId: string
  /** 用于规格型号，在编辑规格型号时是否可删除 */
  deleteAble?: boolean
  /** 控制下拉选项面板展开 */
  listOpen?: boolean
}

export class TestOtherInfoEntity {
  otherInfos: TestOtherInfoMetaDataItem[] = []
}

/**
 * 收样辅助信息
 */
export class UseTestOtherInfo extends UseBase<TestOtherInfoEntity> {
  /** 规格型号字段 */
  standardFields = SYSTEM_FIELDS_NAME

  /** 需要隐藏的字段（由规格型号 和 通用的 代表批量 和 试验数量组成） */
  // hideFields = ['型号', '规格', '等级', '标号', '代表批量', '试样数量']
  hideFields = ['代表批量', '试样数量']

  /** 规格型号编辑状态 */
  specificationsView: VIEW_TYPE = VIEW_TYPE.ADD

  /** 规格型号系统字段对应名称 */
  systemField2NameEnum: { [key: string]: StandardMeta } = {
    ...SYSTEM_FIELDS_ENUM,
    代表批量: 'delegatesNum',
    试样数量: 'sampleNum',
  }

  constructor(private _consginPageParam: IConsginPageParam) {
    super(new TestOtherInfoEntity())
  }

  get pageState() {
    return this._consginPageParam.pageState
  }

  /** 获取收样辅助信息中下拉的label */
  static getListValueLabel(listValueItem: string) {
    if (!listValueItem) {
      return ''
    }

    // 通过@_@连接值和说明字段，使用时需要分开
    if (listValueItem.includes('@_@')) {
      const arr = listValueItem.split('@_@')
      if (arr[1]) {
        return `${arr[0]}（${arr[1]}）`
      }
      else {
        return arr[0]
      }
    }
    return listValueItem
  }

  /** 获取收样辅助信息中下拉的value */
  static getListValueValue(listValueItem: string) {
    if (!listValueItem) {
      return ''
    }

    if (listValueItem.includes('@_@')) {
      return listValueItem.split('@_@')[0]
    }
    return listValueItem
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
        item.value = locationItem.value || ''
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
   * @param {TestOtherInfoMetaDataItem[]} metaSpecInfo 保存在元数据的规格型号详细信息
   */
  mergeSpecifications(metaSpecInfo: TestOtherInfoMetaDataItem[]) {
    const specInfo = this.data.otherInfos as Specifications[]
    return mergeMetaSpecifications(specInfo, metaSpecInfo as Specifications[])
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
        // 不同样品下的同一个辅助信息，id不一致，故不通过id匹配
        const specItem = specificationConfig.find(i => i.displayName === item.displayName)
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
        item.value = dayjs(item.value).format('YYYY-MM-DD')
      }
    })

    this.setDataField('otherInfos', otherInfos)

    // 非查看详情时，需要获取最新的辅助信息对比
    if (!this.pageState.isDetailPage) {
      const testItemIds = [...new Set(metaData.testParams.map(i => i.testItemId))].join(',')
      this.initOtherInfos(metaData.testUnitTestSampleId, testItemIds)
    }
  }
}
