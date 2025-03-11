/**
 * 查看或编辑样品信息时，历史数据缺少 specificationConfig 属性，导致规格型号无法正常显示，添加兼容方法，从元数据中保存的值组装 specificationConfig
 */

import { DEFAULT_VALUE, connectorValue } from '../../selectSpecification'
import type { MetaDataEntity } from '../modules/MainController'
import type { TestOtherInfoMetaDataItem } from '../modules/UseTestOtherInfo'
import { UseTestOtherInfo } from '../modules/UseTestOtherInfo'

const useTestOtherInfo = new UseTestOtherInfo()

/**
 * 还原规格型号明细后，按拼接值排序
 */
function sortSpecificationByStandard(specInfo: TestOtherInfoMetaDataItem[], metaData: MetaDataEntity): TestOtherInfoMetaDataItem[] {
  const specInfoObj: any = {}
  specInfo.forEach((item) => {
    specInfoObj[item.systemFieldName] = item
  })
  const result = []
  const join = '@_@'
  let standard = metaData.standard
  useTestOtherInfo.standardFields.forEach((item) => {
    const field = useTestOtherInfo.systemField2NameEnum[item]
    const val = metaData[field]
    if (!val || val === ' ')
      return
    standard = standard.replace(val, join + item + join)
  })
  // 将空格做为值用标识符包裹
  standard = standard.replace(/\s/g, `${join} ${join}`)
  const standardArr = standard.split(join).filter((d) => {
    return !!d
  })
  standardArr.forEach((item) => {
    if (item !== ' ') {
      const obj = specInfoObj[item]
      if (obj) {
        result.push(obj)
        delete specInfoObj[item]
      }
      else {
        result.push({
          ...DEFAULT_VALUE,
          value: item,
        })
      }
    }
    else {
      result.push({ ...connectorValue })
    }
  })
  for (const k in specInfoObj) {
    const item = specInfoObj[k]
    result.unshift(item, { ...connectorValue })
  }
  return result
}

/**
 * 历史数据兼容新版本的规格型号，仅编辑样品或查看详情时执行
 * 新版规格型号，将弹窗内的明细保存到元数据 specificationConfig ，非预委托的历史数据没有保存该数据，需要根据已保存的规格型号信息，构建出明细数据
 */
export function compatibilityOldMetaData(metaData: MetaDataEntity): TestOtherInfoMetaDataItem[] {
  let specInfo = metaData.otherInfos.filter((item) => {
    const bol = useTestOtherInfo.standardFields.includes(item.systemFieldName)
    // 存在元数据保存的规格型号有值，辅助信息中对应的规格型号属性值为空的情况，回显时重新赋值
    if (bol && !item.value) {
      const field = useTestOtherInfo.systemField2NameEnum[item.systemFieldName]
      item.value = metaData[field] || ''
    }
    item.isJoinSpecification = bol
    return bol
  })
  if (specInfo.length > 0) {
    // 若筛选出的规格型号value全部为空，但拼接的规格型号有值，则将拼接值加到规格型号明细
    const isVal = specInfo.some((d) => {
      return !!d.value
    })
    if (!isVal && metaData.standard) {
      // 检查是否存在同名属性，存在时直接辅助给同名的规格型号
      const repeatIndex = specInfo.findIndex((d) => {
        return d.displayName === '规格型号'
      })
      if (repeatIndex !== -1) {
        specInfo[repeatIndex].value = metaData.standard
      }
      else {
        specInfo.push({ ...DEFAULT_VALUE })
      }
    }
    else {
      // 排序：值全为空时无需排序
      specInfo = sortSpecificationByStandard(specInfo, metaData)
    }
  }
  else {
    const df = { ...DEFAULT_VALUE }
    df.displayName = '规格型号'
    df.deleteAble = false
    df.value = metaData.standard || ''
    specInfo.push(df)
  }

  return specInfo
}
