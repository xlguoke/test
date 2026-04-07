import { describe, expect, it } from 'vitest'
import { mergeConfigSpecifications, mergeMetaSpecifications } from '../modules/mergeSpecifications'
import { testData_1, testData_2, testData_3, testData_4, testData_5, testData_6, testData_7, testData_8 } from '../testData/mergeSpecifications'

describe('test mergeSpecifications', () => {
  // 新增样品：存在新增和已删除的数据
  it('test add sample mergeConfigSpecifications 1', () => {
    const data = mergeConfigSpecifications(testData_1.otherInfos, testData_1.lastSaveData)
    expect(data).toEqual(testData_1.mergeData)
  })

  // 新增样品: 无规格型号数据
  it('test add sample mergeConfigSpecifications 2', () => {
    const data = mergeConfigSpecifications(testData_2.otherInfos, testData_2.lastSaveData)
    expect(data).toEqual(testData_2.mergeData)
  })

  // 新增样品：系统字段变更、显示名称重复（通过id未匹配上的，一律删除）
  it('test add sample mergeConfigSpecifications 3', () => {
    const data = mergeConfigSpecifications(testData_3.otherInfos, testData_3.lastSaveData)
    expect(data).toEqual(testData_3.mergeData)
  })

  // 编辑样品：存在新增、删除的数据
  it('test edit sample mergeMetaSpecifications 1', () => {
    const data = mergeMetaSpecifications(testData_4.otherInfos, testData_4.specificationConfig)
    expect(data).toEqual(testData_4.mergeData)
  })

  // 编辑样品：系统字段变更、显示名称重复（通过id未匹配上，避免出现名称重复的项，需要根据显示名称再过滤一次）
  it('test edit sample mergeMetaSpecifications 2', () => {
    const data = mergeMetaSpecifications(testData_5.otherInfos, testData_5.specificationConfig)
    expect(data).toEqual(testData_5.mergeData)
  })

  // 编辑样品：无规格型号
  it('test edit sample mergeMetaSpecifications 3', () => {
    const data = mergeMetaSpecifications(testData_6.otherInfos, testData_6.specificationConfig)
    expect(data).toEqual(testData_6.mergeData)
  })

  // 编辑样品：新增时不存在规格型号，编辑时辅助信息更新，有了不同名的规格型号
  it('test edit sample mergeMetaSpecifications 4', () => {
    const data = mergeMetaSpecifications(testData_7.otherInfos, testData_7.specificationConfig)
    expect(data).toEqual(testData_7.mergeData)
  })

  // 编辑样品：新增时不存在规格型号，编辑时辅助信息更新，有了同名的规格型号
  it('test edit sample mergeMetaSpecifications 5', () => {
    const data = mergeMetaSpecifications(testData_8.otherInfos, testData_8.specificationConfig)
    expect(data).toEqual(testData_8.mergeData)
  })
})
