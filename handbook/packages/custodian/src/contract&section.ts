import type { basic } from './types'
import { newBatchTransaction, queryForList } from './database'

export type Section = Omit<basic.Section, 'isDelete'>

/**
 * 保存合同段
 * - 删除被标记为删除的合同段
 * - 批量保存/更新合同段
 * @param contractParts
 */
export async function saveContractParts(contractParts: basic.ContractPart[]) {
  const tx = newBatchTransaction()
  for (const contractPart of contractParts) {
    if (contractPart.isDelete) {
      tx.execute('delete from contract_part where id = ?', [contractPart.id])
    }
    else {
      tx.execute(
        `insert into contract_part(id, contractPartName, projectId)
         VALUES (?, ?, ?)
         on conflict do update set contractPartName = ?,
                                   projectId = ?`,
        [
          contractPart.id,
          contractPart.contractPartName,
          contractPart.projectId,
          contractPart.contractPartName,
          contractPart.projectId,
        ],
      )
    }
  }
  await tx.commit()
}

/**
 * 保存工程划分
 * - 删除被标记为删除的工程划分
 * - 批量保存/更新工程划分
 * @param sections
 */
export async function saveSections(sections: basic.Section[]) {
  const tx = newBatchTransaction()
  for (const section of sections) {
    if (section.isDelete) {
      tx.execute('delete from section where id = ?', [section.id])
    }
    else {
      tx.execute(
        `insert into section(id, belongsId, unitProjectName, unitProjectType, levelCode, levelCodeLength)
         VALUES (?, ?, ?, ?, ?, ?)
         on conflict do update set belongsId = ?,
                                   unitProjectName = ?,
                                   unitProjectType = ?,
                                   levelCode = ?,
                                   levelCodeLength = ?`,
        [
          section.id,
          section.belongsId,
          section.unitProjectName,
          section.unitProjectType,
          section.levelCode,
          section.levelCodeLength,
          section.belongsId,
          section.unitProjectName,
          section.unitProjectType,
          section.levelCode,
          section.levelCodeLength,
        ],
      )
    }
  }
  await tx.commit()
}

/**
 * 根据工程项目获取工程划分，因ilis的工程划分既可以设置到工程项目亦可以设置到合同段
 * 目前手簿仅支持获取工程项目下的工程划分
 * @param projectId 工程项目ID
 */
export async function findSections(projectId: string) {
  return queryForList<Section>(
    `select section.* from section where belongsId = ?`,
    [projectId],
  )
}
