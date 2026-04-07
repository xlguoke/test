import type { basic } from './types'
import { Pageable } from './types'
import { newBatchTransaction, queryForList, queryForObject } from './database'

export type Project = Omit<basic.Project, 'isDeleted'>

/**
 * 保存工程项目
 * - 删除被标记为删除的工程项目
 * - 保存/更新工程项目
 * @param projects
 */
export async function saveProjects(projects: basic.Project[]) {
  const tx = newBatchTransaction()
  for (const project of projects) {
    if (project.isDeleted) {
      tx.execute('delete from project where id = ?', [project.id])
    }
    else {
      tx.execute(
        `insert into project(id, name, createDate, projectCode, constructionUnitName, buildUnitName, buildProjectName,
                             witnessUnitName, description, isCompleted, departNames)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         on conflict do update set name                 = ?,
                                   projectCode          = ?,
                                   constructionUnitName = ?,
                                   buildUnitName        = ?,
                                   buildProjectName     = ?,
                                   witnessUnitName      = ?,
                                   description          = ?,
                                   isCompleted          = ?,
                                   departNames          = ?`,
        [
          project.id,
          project.name,
          project.createDate,
          project.projectCode,
          project.constructionUnitName,
          project.buildUnitName,
          project.buildProjectName,
          project.witnessUnitName,
          project.description,
          project.isCompleted,
          project.departNames,
          project.name,
          project.projectCode,
          project.constructionUnitName,
          project.buildUnitName,
          project.buildProjectName,
          project.witnessUnitName,
          project.description,
          project.isCompleted,
          project.departNames,
        ],
      )
    }
  }
  await tx.commit()
}

export class ProjectQuery extends Pageable<Project> {
  fuzzy: string | undefined
  constructor(fuzzy: string | undefined = undefined) {
    super()
    this.fuzzy = fuzzy
  }
}

/**
 * 分页查询工程项目
 * @param query 模糊查询，支持工程项目名称/项目编号
 */
export async function findProjects(query?: ProjectQuery) {
  query = query || new ProjectQuery()
  if (query.fuzzy) {
    const fuzzy = `%${query.fuzzy.trim()}%`
    return queryForList<Project>(
      `select * from project where name like ? or projectCode like ? limit ? offset ?`,
      [fuzzy, fuzzy, query.limit, query.offset],
    )
  }
  return queryForList<Project>(`select * from project limit ? offset ?`, [query.limit, query.offset])
}

export async function countProjects(query?: ProjectQuery) {
  query = query || new ProjectQuery()
  let sql = 'select count(*) as count from project'
  const params = []
  if (query.fuzzy) {
    const fuzzy = `%${query.fuzzy.trim()}%`
    sql += ' where name like ? or projectCode like ?'
    params.push(fuzzy, fuzzy)
  }
  return (await queryForObject<{ count: number }>(sql, params)).count
}
