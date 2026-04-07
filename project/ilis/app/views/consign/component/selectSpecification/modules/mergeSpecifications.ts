import type { Specifications } from '../api'
import { cloneDeep } from '@unovis/ts'
import { connectorValue } from '..'

type K = 'attributeId' | 'displayName'

/**
 * 删除未匹配到的数据，未匹配到的项后面有默认连接符也一并删除
 */
function deleteSpec(configs: Specifications[], ind: number) {
  const item = configs[ind + 1]
  if (item && item.displayName === '连接符') {
    configs.splice(ind + 1, 1)
  }
  configs.splice(ind, 1)
}

/**
 * 对比元数据与最新辅助信息，匹配到数据时，将元数据的value值复制给新的辅助信息，返回匹配到的辅助信息
 * @param {object} metaSpecInfo 元数据中规格型号
 * @param {Array} specInfo 最新辅助信息
 * @param {string} key 对比字段
 * @return {object | boolean} 匹配到数据时，返回匹配到的数据
 */
function updateRepeatSpec(metaSpecInfo: Specifications, specInfo: Specifications[], key: K) {
  for (let j = 0; j < specInfo.length; j++) {
    const spec = specInfo[j]
    if (metaSpecInfo[key] === spec[key]) {
      spec.value = metaSpecInfo.value
      specInfo.splice(j, 1)
      return spec
    }
  }
  return false
}

/**
 * # 合并规格型号
 * @param {TestOtherInfoMetaDataItem[]} newSpecInfo 最新数据：新增样品时为接口返回的最新数据，编辑样品时为接口返回数据与元数据合并后的数据
 * @param {TestOtherInfoMetaDataItem[]} oldSpecInfo 旧数据：新增样品时为元数据，编辑样品时为上次保存的数据
 * @param {number} type 1：新增样品；2：编辑样品
 * @description 已旧数据的值和排序为准，将新旧数据进行合并
 * @returns {Specifications[]} 合并后的规格型号
 */
function mergeSpecifications(newSpecInfo: Specifications[], oldSpecInfo: Specifications[], type: 1 | 2) {
  if (!oldSpecInfo || oldSpecInfo.length === 0)
    return newSpecInfo

  newSpecInfo = cloneDeep(newSpecInfo)
  oldSpecInfo = cloneDeep(oldSpecInfo)

  for (let i = 0; i < oldSpecInfo.length; i++) {
    const c = oldSpecInfo[i]

    // 不处理显示名称为 连接符 和 自定义 的数据
    if (c.displayName === '连接符' || c.displayName === '自定义') {
      continue
    }

    // 根据显示名称匹配，匹配到后将元数据中的对象更新为最新数据
    const repeatSpec = updateRepeatSpec(c, newSpecInfo, 'displayName')
    if (repeatSpec) {
      oldSpecInfo.splice(i, 1, repeatSpec)
      continue
    }

    // 未匹配到数据
    if (type === 2) {
      // 编辑样品时，更新deleteAble属性
      c.deleteAble = true
    }
    else {
      // 新增样品时，删除未匹配到的数据
      deleteSpec(oldSpecInfo, i)
      i--
    }
  }

  // 编辑样品时，将新增的规格型号的 value 值置空
  const addResDatas: Specifications[] = []
  for (let j = 0; j < newSpecInfo.length; j++) {
    const d = newSpecInfo[j]
    if (type === 2) {
      d.value = ''
    }
    addResDatas.push(d)
    addResDatas.push({ ...connectorValue })
  }

  return addResDatas.concat(oldSpecInfo)
}

/**
 * # 合并辅助信息规格型号与上次保存的规格型号（新增样品）
 * @param {TestOtherInfoMetaDataItem[]} specInfo 辅助信息中获取的最新的规格型号 `otherInfos`
 * @param {TestOtherInfoMetaDataItem[]} configSpecInfo 上传保存的数据 `specification/config.do`
 * @description 已删除的数据不显示，新增的数据 value 值需要展示，匹配上的数据value使用config接口中的值，其他属性均替换成新的
 * @returns {Specifications[]} 合并后的规格型号
 */
export function mergeConfigSpecifications(specInfo: Specifications[], configSpecInfo: Specifications[]) {
  return mergeSpecifications(specInfo, configSpecInfo, 1)
}

/**
 * # 合并辅助信息规格型号与元数据规格型号（编辑样品）
 * @param {TestOtherInfoMetaDataItem[]} otherInfos 辅助信息 `otherInfos`，从接口获取的最新的数据
 * @param {TestOtherInfoMetaDataItem[]} metaSpecInfo 元数据中的规格型号 `specificationConfig`
 * @description 已删除的数据添加删除标识，数据仍需要展示，新增的数据 value 值需要置空，匹配上的数据value使用元数据中的值，其他属性均替换成新的
 * @returns {Specifications[]} 合并后的规格型号
 */
export function mergeMetaSpecifications(otherInfos: Specifications[], metaSpecInfo: Specifications[]) {
  const specInfo = otherInfos.filter(item => item.isJoinSpecification)
  return mergeSpecifications(specInfo, metaSpecInfo, 2)
}
