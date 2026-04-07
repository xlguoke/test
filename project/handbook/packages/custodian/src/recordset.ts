import type { basic } from './types'
import { newBatchTransaction, queryForList, queryForObject } from './database'

export type Recordset = basic.Recordset

/**
 * 保存空记录集
 * @param recordset
 */
export async function saveRecordset(recordset: basic.Recordset[]) {
  const tx = newBatchTransaction()
  for (const rs of recordset) {
    tx.execute(
      'insert into recordset(name, xml) values (?, ?) on conflict do update set xml = ?',
      [rs.name, rs.xml, rs.xml],
    )
  }
  await tx.commit()
}

/**
 * 根据记录集名称获取空记录集
 * @param name
 */
export async function getRecordset<P>(name?: P): Promise<P extends string ? Recordset : Recordset[]> {
  let result: any
  if (name)
    result = await queryForObject<Recordset>('select * from recordset where name = ?', [name])
  else
    result = await queryForList<Recordset>('select * from recordset')
  return result
}
