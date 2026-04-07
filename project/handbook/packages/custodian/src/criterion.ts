import type { basic } from './types'
import { newBatchTransaction, queryForList, queryForObject } from './database'
import { Pageable } from './types'

export type Criterion = basic.Standard

/**
 * 先删除已下载的规程数据再执行批量插入
 * @param standards
 */
export async function saveCriteria(standards: basic.Standard[]) {
  const tx = newBatchTransaction()
  tx.execute('delete from standard where 1')
  for (const standard of standards) {
    tx.execute(
      'insert into standard(standardId, standardName, uniqueKey, publishCode, publishDate, expireDate, clauseCode) values (?, ?, ?, ?, ?, ?, ?) on conflict do nothing',
      [standard.standardId, standard.standardName, standard.uniqueKey, standard.publishCode, standard.publishDate, standard.expireDate, standard.clauseCode],
    )
  }
  await tx.commit()
}

export class CriterionQuery extends Pageable<Criterion> {
  constructor(public fuzzy: string | undefined = undefined) {
    super()
  }
}

/**
 * 分页查询本地规程库
 * @param query 模糊查询，支持规程名称、颁布号模糊查询
 */
export async function findCriteria(query?: CriterionQuery) {
  query = query || new CriterionQuery()
  if (query.fuzzy) {
    const fuzzy = `%${query.fuzzy.trim()}%`
    return queryForList<Criterion>(
      'select * from standard where standardName like ? or publishCode like ? limit ? offset ?',
      [fuzzy, fuzzy, query.limit, query.offset],
    )
  }
  return queryForList<Criterion>('select * from standard limit ? offset ?', [query.limit, query.offset])
}

export async function countCriteria(query?: CriterionQuery) {
  query = query || new CriterionQuery()
  let sql = 'select count(*) as count from standard'
  const params = []
  if (query.fuzzy) {
    const fuzzy = `%${query.fuzzy.trim()}%`
    sql += ' where standardName like ? or publishCode like ?'
    params.push(fuzzy, fuzzy)
  }
  return (await queryForObject<{ count: number }>(sql, params)).count
}
