import { LoggerWrapper } from '@ilis/cordova-plugin-log4c'
import type { basic } from './types'
import { executeSql, newBatchTransaction, queryForList } from './database'

const log = new LoggerWrapper('custodian.sample&param')

export type Sample = Omit<basic.Sample, 'isDeleted'>
export type Param = Omit<basic.Param, 'isDeleted'>
export interface SampleLeaf extends Sample {
  leaves?: SampleLeaf[]
}

/**
 * 批量保存检测样品
 * - 若ilis检测样品已被标记为删除，则直接删除手簿已下载检测样品
 * - 正常检测样品，执行upsert
 * @param samples
 */
export async function saveSamples(samples: basic.Sample[]) {
  const tx = newBatchTransaction()
  for (const sample of samples) {
    if (sample.isDeleted) {
      tx.execute('delete from sample where id = ?', [sample.id])
    }
    else {
      tx.execute(
        `
          insert into sample(id, pid, name, displayName, systemId, bigCategoryId, sampleRequirement)
          values (?, ?, ?, ?, ?, ?, ?)
          on conflict do update set pid               = ?,
                                    name              = ?,
                                    displayName       = ?,
                                    systemId          = ?,
                                    bigCategoryId     = ?,
                                    sampleRequirement = ?
        `,
        [
          sample.id,
          sample.pid,
          sample.name,
          sample.displayName,
          sample.systemId,
          sample.bigCategoryId,
          sample.sampleRequirement,
          sample.pid,
          sample.name,
          sample.displayName,
          sample.systemId,
          sample.bigCategoryId,
          sample.sampleRequirement,
        ],
      )
    }
  }
  await tx.commit()
}

/**
 * 清空手簿已下载检测样品，用于ilis切换参数启用版本
 */
export async function truncateSamples() {
  await executeSql('delete from sample where 1')
}

/**
 * 保存检测样品、检测参数与检测项目的关系
 * @param sampleParamAndTestItems
 */
export async function saveSampleParamAndTestItems(sampleParamAndTestItems: basic.SampleParamAndTestItem[]) {
  const tx = newBatchTransaction()
  tx.execute('delete from sample_param_and_test_item where 1')
  for (const sampleParamAndTestItem of sampleParamAndTestItems) {
    tx.execute(
      `insert into sample_param_and_test_item(testSampleId, testParamId, testItemId)
       values (?, ?, ?) on conflict do nothing `,
      [sampleParamAndTestItem.testSampleId, sampleParamAndTestItem.testParamId, sampleParamAndTestItem.testItemId],
    )
  }
  await tx.commit()
}

/**
 * 根据检测项目ID获取树形样品数据
 * @version 1.10.2 增加属性leaves
 * @param testItemId 检测项目ID
 */
export async function findSamples(testItemId: string) {
  const samples = await queryForList<SampleLeaf>(
    `
      select distinct sample.*
      from sample
             left join sample_param_and_test_item ref on ref.testSampleId = sample.id
      where ref.testItemId = ?
    `,
    [testItemId],
  )
  return compose(samples)
}

function compose(samples: SampleLeaf[]) {
  const nodes: SampleLeaf[] = []
  const heap = new Map<string, SampleLeaf>()
  samples.forEach(it => heap.set(it.id, it))
  for (const sample of samples) {
    if (!sample.pid) {
      nodes.push(sample)
      continue
    }
    const parent = heap.get(sample.pid)
    if (parent) {
      parent.leaves = parent.leaves || []
      parent.leaves.push(sample)
    }
    else {
      log.warn(`sample: {} id: {} has pid: {} but didn't find it's parent.`, sample.displayName, sample.id, sample.pid)
      nodes.push(sample)
    }
  }
  return nodes
}

/**
 * 批量保存检测参数
 * - 若ilis检测参数已被标记为删除，则直接删除手簿已下载检测参数
 * - 正常检测参数，执行upsert
 * @param params
 */
export async function saveParams(params: basic.Param[]) {
  const tx = newBatchTransaction()
  for (const param of params) {
    if (param.isDeleted) {
      tx.execute('delete from param where id = ?', [param.id])
    }
    else {
      tx.execute(
        `
          insert into param(id, name, displayName, systemId, bigCategoryId, testItemId, testItemName, isTempParam,
                            isLocaleItem)
          values (?, ?, ?, ?, ?, ?, ?, ?, ?)
          on conflict do update set name          = ?,
                                    displayName   = ?,
                                    systemId      = ?,
                                    bigCategoryId = ?,
                                    testItemId    = ?,
                                    testItemName  = ?,
                                    isTempParam   = ?,
                                    isLocaleItem  = ?
        `,
        [
          param.id,
          param.name,
          param.displayName,
          param.systemId,
          param.bigCategoryId,
          param.testItemId,
          param.testItemName,
          param.isTempParam,
          param.isLocaleItem,
          param.name,
          param.displayName,
          param.systemId,
          param.bigCategoryId,
          param.testItemId,
          param.testItemName,
          param.isTempParam,
          param.isLocaleItem,
        ],
      )
    }
  }
  await tx.commit()
}

/**
 * 清空手簿已下载检测参数，用于ilis切换参数启用版本
 */
export async function truncateParams() {
  await executeSql('delete from param where 1')
}

/**
 * 根据检测项目ID（检测样品ID）获取检测参数
 * @param testItemId 检测项目ID
 * @param sampleId 检测样品ID
 */
export async function findParams(testItemId: string, sampleId: string) {
  return queryForList<Param>(
    `
      select distinct param.*
      from param
             left join sample_param_and_test_item ref on ref.testParamId = param.id
      where ref.testItemId = ?
        and ref.testSampleId = ?
    `,
    [testItemId, sampleId],
  )
}
