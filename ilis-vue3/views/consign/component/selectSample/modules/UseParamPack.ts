import { getParamPackDetail } from '~/views/consign/component/selectSample/api.ts'
import type { ViewTestParamsItem } from '~/views/consign/component/selectSampleParam/modules/BaseTestParams.ts'
import type {
  UseParamStandard,
} from '~/views/consign/component/selectSampleParam/modules/UseParamStandard.ts'
import {
  ParamStandardItem,
} from '~/views/consign/component/selectSampleParam/modules/UseParamStandard.ts'
import { STANDARD_TYPE } from '~/types/standard.ts'

/** 打包参数 */
export interface ParamPackItem {
  categoryConcatName: string
  name: string
  exposed: boolean
  id: string
  categoryId: string
}

/** 打包参数详情 - 规程信息 */
export interface ParamPackDetailStandardEntity {
  id: string
  sysCompanyCode: string
  createName: string
  createBy: string
  createDate: string
  updateName: string
  updateBy: string
  updateDate: string
  unitCode: string
  standardId: string
  standardTypeId: string
  uniqueKey: string
  standardTypeName?: string
  standardName: string
  type: string
  sourceType: STANDARD_TYPE
  whetherThisUnit: string
  isDeleted: '0' | '1'
  publishDate: string
  executeDate: number
  expireDate?: number
  publishCode: string
  clauseCode?: string
  isDefault?: boolean
  remark?: string
  toReferral?: string
  fileId: string
  testParamId?: string
}

/** 打包参数详情 - 规程信息 */
export interface ParamPackDetailStandardItem {
  id: string
  unitCode: string
  baseStandard: ParamPackDetailStandardEntity
  type: string
  clauseCode: string
}

export interface ParamPackEntries {
  basis: ParamPackDetailStandardItem[]
  id: string
  param: any
  standards: ParamPackDetailStandardItem[]
  unitCode: string
}

/**
 * 打包参数详情
 */
export interface ParamPackDetailEntity {
  categoryConcatName: string
  entries: ParamPackEntries[]
  name: string
  exposed: false
  id: string
  categoryId: string
  samples: any[]
}

/**
 * 参数打包
 */
export class UseParamPack {
  /**
   * 该模块是否从选择样品参数弹窗初始化
   * 注：由于选择样品参数弹窗对规程处理逻辑不同，需要通过该变量控制处理逻辑
   */
  get isFormSelectParam() {
    return !!this.useParamStandard
  }

  constructor(private paramPackId: string, private useParamStandard?: UseParamStandard) {
    if (!paramPackId) {
      throw new Error('没有打包参数ID！')
    }
  }

  /**
   * 初始化应用打包参数
   * 将详情中的数据与当前参数列表数据做合并处理
   * @param testParams 参数列表
   */
  async init(testParams: ViewTestParamsItem[]) {
    // 开启推荐规程逻辑
    const USING_RECOMMENDED_PARAMETER_STANDARD = await getBusinessParam('USING_RECOMMENDED_PARAMETER_STANDARD')

    // 打包数据
    const res = await getParamPackDetail(this.paramPackId)
    const packData = res.data.entries

    // 处理合并
    testParams.forEach((item) => {
      const matchItem = packData.find(i => i.param.id === item.id)

      // 有匹配数据的，合并数据并设置勾选
      if (matchItem) {
        item.selected = true

        /**
         * 选择样品参数页面，并且开启按推荐规程逻辑时，特殊处理打包参数规程逻辑
         */
        if (this.isFormSelectParam && USING_RECOMMENDED_PARAMETER_STANDARD) {
          this.handleStandardByRelation(item, matchItem)
        }
        else {
          // 格式化打包参数规程数据
          const basis = this.formatPackStandard(matchItem.basis, STANDARD_TYPE.BASIS)
          const standards = this.formatPackStandard(matchItem.standards, STANDARD_TYPE.STANDARD)

          // 本地参数与打包参数规程合并
          item.basis = this.mergeStandards(item.basis, basis)
          item.standards = this.mergeStandards(item.standards, standards)
        }
      }
      else {
        item.selected = false
      }
    })
  }

  /**
   * 根据推荐规程的关联关系，处理打包参数中的规程
   * 主要逻辑：
   * 1.配置的规程关联关系不变；
   * 2.根据打包参数中已选的标准评定，选中推荐规程中配置的标准评定
   * 3.根据第2步中已选中的标准评定，加载对应的试验依据下拉，再根据打包参数已选试验依据进行匹配
   */
  handleStandardByRelation(item: ViewTestParamsItem, matchItem: ParamPackEntries) {
    // 格式化打包参数规程数据
    const basis = this.formatPackStandard(matchItem.basis, STANDARD_TYPE.BASIS)
    const standards = this.formatPackStandard(matchItem.standards, STANDARD_TYPE.STANDARD)

    item.selectedStandards = []
    item.basis = []

    // 根据打包信息选中评定标准
    item.standards.forEach((standardItem) => {
      if (standards.find(i => i.uniqKey === standardItem.uniqKey)) {
        standardItem.selected = true
        item.selectedStandards.push(standardItem.uniqKey)

        // 根据已选评定加载对应依据
        this.useParamStandard?.onSelectStandard(item, standardItem.uniqKey)
      }
      else {
        standardItem.selected = false
      }
    })

    item.selectedBasis = []

    // 根据打包信息选中检测依据
    item.basis.forEach((standardItem) => {
      if (basis.find(i => i.uniqKey === standardItem.uniqKey)) {
        standardItem.selected = true
        item.selectedBasis.push(standardItem.uniqKey)
      }
      else {
        standardItem.selected = false
      }
    })
  }

  /**
   * 合并本地参数的规程和打包参数中的规程
   * 逻辑说明：保留本地规程列表仅设为未选中状态，将打包参数的规程列表添加进本地规程列表并设为选中状态
   * @param paramStandards 本地参数数据项
   * @param packParamStandards 打包参数数据项（已格式化）
   */
  mergeStandards(paramStandards: ParamStandardItem[], packParamStandards: ParamStandardItem[]) {
    // 当前参数列表规程全部设为未选状态
    paramStandards.forEach((item) => {
      item.selected = false
    })

    packParamStandards.forEach((item) => {
      // 查找相同uniqKey的规程数据，若存在，则直接用打包参数的规程信息（已格式化）替换掉本地的
      const sameItemIndex = paramStandards.findIndex(i => item.uniqKey === i.uniqKey)

      // 设为选中
      item.selected = true

      if (sameItemIndex !== -1) {
        paramStandards.splice(sameItemIndex, 1, item)
      }
      else {
        paramStandards.push(item)
      }
    })

    return paramStandards
  }

  /**
   * 格式化打包参数返回的规程信息字段，转为与本地数据一致
   * @param packStandards 参数打包规程数据
   * @param standardType 规程类型
   */
  formatPackStandard(packStandards: ParamPackDetailStandardItem[], standardType: STANDARD_TYPE) {
    const result: ParamStandardItem[] = []

    for (let i = 0; i < packStandards.length; i++) {
      const packStandardItem = packStandards[i].baseStandard
      const data = new ParamStandardItem()

      data.id = packStandardItem.id
      data.baseStandardId = packStandardItem.standardId
      data.baseStandardName = packStandardItem.standardName
      data.baseStandardType = packStandardItem.sourceType
      data.baseStandardUseType = standardType
      data.clauseCode = packStandardItem.clauseCode
      data.executeDate = packStandardItem.executeDate
      data.expireDate = packStandardItem.expireDate
      data.publishCode = packStandardItem.publishCode
      data.sampleId = undefined
      data.selected = true
      data.testParamId = packStandardItem.testParamId
      data.uniqKey = packStandardItem.uniqueKey

      // 特殊逻辑处理：
      // 若打包参数中的规程类型，在【依据】中不为1或3，则该数据丢弃
      // TODO 该逻辑有争议，待确认
      // if (standardType === STANDARD_TYPE.BASIS && ![STANDARD_TYPE.BASIS, STANDARD_TYPE.ALL].includes(data.baseStandardType)) {
      //   continue
      // }
      //
      // // 若打包参数中的规程类型，在【标准】中不为2或3，则该数据丢弃
      // if (standardType === STANDARD_TYPE.STANDARD && ![STANDARD_TYPE.STANDARD, STANDARD_TYPE.ALL].includes(data.baseStandardType)) {
      //   continue
      // }

      result.push(data)
    }

    return result
  }
}
