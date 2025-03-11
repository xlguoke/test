import { STANDARD_TYPE } from '~/types/standard'
import type { ViewTestParamsItem } from '~/views/consign/component/selectSampleParam/modules/BaseTestParams.ts'
import type { SampleParamStandardItem } from '~/views/unit-config/standard/interface/SampleParamStandard.ts'
import type { DataSource } from '~/views/unit-config/standard/api.ts'

/** 规程类型 */
export type StandardType = STANDARD_TYPE.BASIS | STANDARD_TYPE.STANDARD | STANDARD_TYPE.ALL | STANDARD_TYPE.NONE

/**
 * 规程数据传输对象
 */
export class ParamStandardItem {
  /**
   * 基础规程ID
   */
  baseStandardId = ''
  /**
   * 基础规程名称
   */
  baseStandardName = ''
  /**
   * 规程类型
   */
  baseStandardType: StandardType = STANDARD_TYPE.BASIS
  /** 使用的规程 */
  baseStandardUseType: StandardType = STANDARD_TYPE.BASIS
  /**
   * 第编号
   */
  clauseCode? = ''
  /**
   * 执行日期
   */
  executeDate?: number
  /**
   * 过期日期
   */
  expireDate?: number
  /**
   * ID
   */
  id? = ''
  /**
   * 发布编号
   */
  publishCode? = ''
  /**
   * 样品ID
   */
  sampleId? = ''
  /**
   * 是否选中
   */
  selected = false
  /**
   * 检测参数ID
   */
  testParamId? = ''
  /**
   * UNIQ 密钥
   */
  uniqKey = ''
}

/**
 * 规程控制
 */
export class UseParamStandard {
  // 【系统参数】开启推荐规程逻辑
  USING_RECOMMENDED_PARAMETER_STANDARD = false

  isNeedConclusion = true

  /** 规程依据关系对应 */
  standardRelationMap: {
    /** 参数id */
    [key: string]: {
      /** 规程唯一标识 */
      [key: string]: {
        selected: boolean
        basis: Array<{
          /** 依据唯一标识 */
          uniqKey: string
          /** 依据配置选中状态 */
          selected: boolean
        }>
      }
    }
  } = {}

  /** 所有评定标准列表 */
  allStandardList: ParamStandardItem[] = []

  /** 所有检测依据列表 */
  allBasisList: ParamStandardItem[] = []

  constructor(isNeedConclusion: boolean) {
    this.isNeedConclusion = isNeedConclusion

    getBusinessParam('USING_RECOMMENDED_PARAMETER_STANDARD').then((val) => {
      this.USING_RECOMMENDED_PARAMETER_STANDARD = val
    })
  }

  /**
   * 用户新增规程
   * @param item 参数对象
   * @param type 规程类型
   * @param standardData 记录的规程数据
   */
  addStandardSelected(item: ViewTestParamsItem, type: StandardType, standardData: DataSource[]) {
    const arr = type === STANDARD_TYPE.BASIS ? item.basis : item.standards
    const selectedArr = type === STANDARD_TYPE.BASIS ? item.selectedBasis : item.selectedStandards
    const ids = arr.map(i => i.uniqKey)

    standardData.forEach((sItem) => {
      if (!ids.includes(sItem.uniqueKey)) {
        const dataObj = new ParamStandardItem()
        dataObj.id = sItem.id
        dataObj.baseStandardId = sItem.standardId
        dataObj.baseStandardName = sItem.standardName
        dataObj.publishCode = sItem.publishCode || ''
        dataObj.baseStandardType = sItem.sourceType as StandardType
        dataObj.baseStandardUseType = type
        dataObj.uniqKey = sItem.uniqueKey
        dataObj.expireDate = sItem.expireDate
        dataObj.executeDate = sItem.executeDate
        dataObj.selected = true

        arr.push(dataObj)

        if (selectedArr) {
          selectedArr.push(sItem.uniqueKey)
        }
      }
    })
  }

  /**
   * 格式化接口返回的规程数据
   */
  async formatStandard(item: ViewTestParamsItem) {
    item.selectedBasis = []
    item.selectedStandards = []

    if (this.USING_RECOMMENDED_PARAMETER_STANDARD) {
      /**
       * 从关联关系中解析出标准评定和检测依据下拉
       */
      this.convertCriteria(item)
    }
    else {
      /**
       * 注：需要将后端返回的数据格式，转换下：
       * 一是因为后端返回的详细规程数据在第二层级，后续对数据操作比较频繁，且或多或少对性能有点影响；
       * 二是因为需要保证元数据中存的数据跟之前保持一致，目前接口返回的规程数据也与之前的元数据保存的数据不同；
       */
      const basis = item.basis as never[] as SampleParamStandardItem[]
      const standards = item.standards as never[] as SampleParamStandardItem[]

      item.basis = basis.map(i => (this.convertCriteriaStandard(i)))
      item.standards = standards.map(i => (this.convertCriteriaStandard(i)))
    }

    item.basis.forEach((i: ParamStandardItem) => {
      i.baseStandardUseType = STANDARD_TYPE.BASIS
    })

    item.standards.forEach((i: ParamStandardItem) => {
      i.baseStandardUseType = STANDARD_TYPE.STANDARD
    })
  }

  /**
   * 转换规程数据 / 缓存规程关联信息
   * 开启规程信息默认推荐时，将criteria中的规程信息转换为standards和basis数据，通过构建一个对象来控制选择规程时的关系
   */
  convertCriteria(item: ViewTestParamsItem) {
    const { allStandardList, allBasisList, standardRelationMap } = this
    const testParamId = item.id

    item.criteria = item.criteria || []
    item.standards = []
    item.basis = []
    item.selectedStandards = []
    item.selectedBasis = []

    // 初始化关系对象
    standardRelationMap[testParamId] = {}

    // 产品要求特殊逻辑，若配置的数据中，没有默认勾选项，则默认第一条
    if (item.criteria.length > 0 && !item.criteria.find(i => i.standard.selected)) {
      const firstStandard = item.criteria[0]
      firstStandard.standard.selected = true

      if (firstStandard.basis.length > 0 && !firstStandard.basis.find(i => i.selected)) {
        firstStandard.basis[0].selected = true
      }
    }

    // 循环配置规程构建关联对象
    item.criteria.forEach((i) => {
      const standardItem = i.standard.standard
      const basisList = i.basis

      // 将标准评定加入待选列
      item.standards.push(this.convertCriteriaStandard(i.standard))

      // 缓存所有评定标准
      if (!allStandardList.find(k => k.uniqKey === standardItem.uniqueKey)) {
        const cacheStandard = this.convertCriteriaStandard(i.standard)
        cacheStandard.selected = false
        allStandardList.push(cacheStandard)
      }

      if (!standardRelationMap[testParamId][standardItem.uniqueKey]) {
        standardRelationMap[testParamId][standardItem.uniqueKey] = {
          selected: i.standard.selected,
          basis: [],
        }
      }

      const basisRelationList = standardRelationMap[testParamId][standardItem.uniqueKey].basis
      basisList.forEach((j) => {
        const basisItem = j.standard

        // 缓存所有检测依据
        if (!allBasisList.find(k => k.uniqKey === basisItem.uniqueKey)) {
          const cacheStandard = this.convertCriteriaStandard(j)
          cacheStandard.selected = false
          allBasisList.push(cacheStandard)
        }

        // 构建关联关系
        if (!basisRelationList.find(k => k.uniqKey === basisItem.uniqueKey)) {
          basisRelationList.push({
            uniqKey: basisItem.uniqueKey,
            selected: j.selected,
          })
        }
      })
    })

    // 更新规程选中状态
    this.updateStandardSelectedByNeedConclusion(item)
  }

  /**
   * 将配置返回的规程数据，转为本地使用的规程格式
   * @param item 配置的规程数据
   */
  convertCriteriaStandard(item: SampleParamStandardItem) {
    const standardItem = item.standard
    const obj = new ParamStandardItem()

    obj.id = standardItem.id
    obj.baseStandardId = standardItem.standardId
    obj.baseStandardName = standardItem.standardName
    obj.publishCode = standardItem.publishCode || ''
    obj.clauseCode = standardItem.clauseCode || ''
    obj.baseStandardType = standardItem.type
    obj.uniqKey = standardItem.uniqueKey
    obj.expireDate = standardItem.expireDate
    obj.executeDate = standardItem.executeDate
    obj.selected = item.selected

    return obj
  }

  /**
   * 根据【需要评定结果】更新规程下拉及选中状态
   */
  updateStandardSelectedByNeedConclusion(item: ViewTestParamsItem) {
    // 不需要评定结果时，将配置评定标准下的所有检测依据平铺出来作为下拉项，并默认第一个选中
    if (!this.isNeedConclusion) {
      const { standardRelationMap, allBasisList } = this
      const standardMap = standardRelationMap[item.id]
      const basis: ParamStandardItem[] = []

      for (const key in standardMap) {
        const relationBasis = standardMap[key].basis

        relationBasis.forEach((rbItem) => {
          // 将关联的依据加入下拉项
          if (!basis.find(j => j.uniqKey === rbItem.uniqKey)) {
            const basisItem = allBasisList.find(j => j.uniqKey === rbItem.uniqKey)
            if (basisItem) {
              basis.push(basisItem)
            }
          }
        })
      }

      // 可以不用清空item.standards，界面上已经隐藏了，如果清空了切换IsNeedConclusion时，又要重新构建
      item.selectedStandards = []
      item.basis = basis
      item.selectedBasis = basis.length ? [basis[0].uniqKey] : []

      return
    }

    // 需要评定结果
    if (item.standards.length > 0 && !item.standards.find(i => i.selected)) {
      item.standards[0].selected = true
    }

    item.selectedStandards = item.standards.filter(j => j.selected).map(j => j.uniqKey)
    item.selectedBasis = []
    item.basis = []
    item.standards.forEach((i) => {
      if (i.selected) {
        this.onSelectStandard(item, i.uniqKey)
      }
    })
  }

  /**
   * 选择标准评定
   * 根据选择的评定标准，更新检测依据下拉
   */
  onSelectStandard(item: ViewTestParamsItem, key: string) {
    if (!this.USING_RECOMMENDED_PARAMETER_STANDARD) {
      return
    }

    const allBasisList = this.allBasisList
    const relationBasis = this.standardRelationMap[item.id][key].basis
    const basisKeys = item.basis.map(i => i.uniqKey)
    const selectedBasis = item.selectedBasis || []

    for (let i = 0; i < relationBasis.length; i++) {
      const rbItem = relationBasis[i]

      // 将关联的依据加入下拉项
      if (!basisKeys.find(j => j === rbItem.uniqKey)) {
        const basisItem = allBasisList.find(j => j.uniqKey === rbItem.uniqKey)
        if (basisItem) {
          item.basis.push(basisItem)
        }
      }

      // 检查关联的依据是否默认勾选，设置勾选状态
      if (rbItem.selected && !selectedBasis.includes(rbItem.uniqKey)) {
        if (item.selectedBasis) {
          item.selectedBasis.push(rbItem.uniqKey)
        }
        else {
          item.selectedBasis = [rbItem.uniqKey]
        }
      }
    }
  }

  /**
   * 取消选择标准评定
   * 根据选择的评定标准，更新检测依据下拉
   */
  onDeselectStandard(item: ViewTestParamsItem, key: string) {
    if (!this.USING_RECOMMENDED_PARAMETER_STANDARD) {
      return
    }

    const relationObj = this.standardRelationMap[item.id]
    const relationBasis = relationObj[key].basis
    const selectedStandards = item.selectedStandards || []

    for (let i = 0; i < relationBasis.length; i++) {
      const rbItem = relationBasis[i]
      let hasSameBasis = false

      for (const j in relationObj) {
        if (j === key || !selectedStandards.includes(j)) {
          continue
        }

        if (relationObj[j].basis.find(k => k.uniqKey === rbItem.uniqKey)) {
          hasSameBasis = true
          break
        }
      }

      if (hasSameBasis === false) {
        item.basis = item.basis.filter(j => j.uniqKey !== rbItem.uniqKey)
        item.selectedBasis = (item.selectedBasis || []).filter(j => j !== rbItem.uniqKey)
      }
    }
  }

  /**
   * 使用推荐检测依据
   */
  useRecommendBasis(item: ViewTestParamsItem, keyStr: string) {
    const { standardRelationMap } = this
    const basis = item.basis
    const standards = item.standards.filter(i => item.selectedStandards && item.selectedStandards.includes(i.uniqKey))

    // 优先推荐，即满足条件并且配置里默认勾选的
    let firstRecommendBasis = null
    // 其次推荐，没有优先推荐就用这个
    let recommendBasis = null

    // 首先，不管匹不匹配的上，先清空已选依据再说
    item.selectedBasis = []

    for (let i = 0; i < standards.length; i++) {
      const standardItem = standards[i]

      if (firstRecommendBasis) {
        break
      }

      if (standardRelationMap[item.id] && standardRelationMap[item.id][standardItem.uniqKey]) {
        const relationBasis = standardRelationMap[item.id][standardItem.uniqKey].basis

        for (let j = 0; j < relationBasis.length; j++) {
          const relationBasisItem = relationBasis[j]
          const basisItem = basis.find(k => k.uniqKey === relationBasisItem.uniqKey)

          if (basisItem) {
            const publishCode = basisItem.publishCode || ''
            const arr = publishCode.trim().split(' ')
            if (arr[0] === keyStr) {
              if (relationBasisItem.selected) {
                firstRecommendBasis = basisItem.uniqKey
                break
              }
              else {
                recommendBasis = basisItem.uniqKey
              }
            }
          }
        }
      }
    }

    if (firstRecommendBasis) {
      item.selectedBasis = [firstRecommendBasis]
    }
    else if (recommendBasis) {
      item.selectedBasis = [recommendBasis]
    }
  }

  /**
   * 使用推荐检测依据
   */
  useRecommendStandards(item: ViewTestParamsItem, keyStr: string) {
    const { standardRelationMap } = this
    const standards = item.standards
    const standardObj = standardRelationMap[item.id]

    // 优先推荐，即满足条件并且配置里默认勾选的
    let firstRecommendStandard = null
    // 其次推荐，没有优先推荐就用这个
    let recommendStandard = null

    // 首先，不管匹不匹配的上，先清空已选标准再说
    item.selectedStandards = []

    for (let i = 0; i < standards.length; i++) {
      const standardItem = standards[i]

      if (firstRecommendStandard || recommendStandard) {
        standardItem.selected = false
        continue
      }

      const publishCode = standardItem.publishCode || ''
      const arr = publishCode.trim().split(' ')
      if (arr[0] === keyStr) {
        if (standardObj && standardObj[standardItem.uniqKey] && standardObj[standardItem.uniqKey].selected) {
          firstRecommendStandard = standardItem.uniqKey
        }
        else {
          recommendStandard = standardItem.uniqKey
        }

        standardItem.selected = true
        this.onSelectStandard(item, standardItem.uniqKey)
      }
    }

    if (firstRecommendStandard) {
      item.selectedStandards = [firstRecommendStandard]
    }
    else if (recommendStandard) {
      item.selectedStandards = [recommendStandard]
    }
  }
}
