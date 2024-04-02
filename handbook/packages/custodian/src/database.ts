import { LoggerWrapper } from '@ilis/cordova-plugin-log4c'

export type BatchStatement = [string, any[]][]

/**
 * A batch execution transaction wrapper object
 */
export interface BatchTransaction {
  /**
   * sql statement and values
   * @param sql
   * @param params
   */
  execute(sql: string, params?: unknown[]): void

  /**
   * Promise-based commit method
   *
   * Must call this method after set statements
   */
  commit(): Promise<void>
}

/**
 * redundant open database cache
 *
 * The SQLite plugin already implements its own caching mechanism for opened databases.
 * This custom cache is primarily used to reduce debug messages.
 */
const openedDBs: Record<string, SQLitePlugin.Database> = {}
const log = new LoggerWrapper('custodian.db')

export function useDatabase(name?: string) {
  if (!name) {
    const userDbName = retrieveUserDatabase()
    if (!userDbName)
      throw new Error('you didn\'t provide the database name, and can\'t find user db name in the localstorage by contract')
    name = userDbName
  }
  if (name in openedDBs) {
    return openedDBs[name]
  }
  else {
    const db = sqlitePlugin.openDatabase(
      { name, location: 'default' },
      () => {},
      (err) => {
        log.error('failed to open db, {}', err)
        throw err
      },
    )
    openedDBs[name] = db
    return db
  }
}

/**
 * user store definition
 * @example
 * {
 *   username: 'foo'
 *   database: 'company.foo.db'
 * }
 */
function retrieveUserDatabase(): string | null {
  const users = localStorage.getItem('uhb.user')
  if (!users)
    return null
  const user = JSON.parse(users)
  if (!user)
    return null
  return user.database
}

/**
 * runtime type-safe should be considered
 * @param rs
 * @param mapper a mapper function to customize object transforming
 */
export function mapResultSet<T>(rs: SQLitePlugin.Results, mapper?: (t: any) => T) {
  const results: T[] = []
  for (let i = 0; i < rs.rows.length; i++)
    results.push(mapper ? mapper(rs.rows.item(i)) : rs.rows.item(i))
  return results
}

export async function executeSql(sql: string, params?: any[]): Promise<SQLitePlugin.Results> {
  const db = useDatabase()
  return new Promise((resolve, reject) => {
    db.executeSql(sql, params, rs => resolve(rs), reject)
  })
}

export async function queryForList<T>(sql: string, params?: any[], mapper?: (t: any) => T): Promise<T[]> {
  const rs = await executeSql(sql, params)
  return mapResultSet<T>(rs, mapper)
}

/**
 * find exactly one
 * @param sql
 * @param params
 * @throws Error if result size is not 1
 */
export async function queryForObject<T>(sql: string, params?: any[]) {
  const result = await queryForList<T>(sql, params)
  if (!result.length || result.length > 1)
    throw new Error(`Incorrect result size: expected 1, actual ${result.length}`)
  else
    return result[0]
}

export async function safeQueryForObject<T>(sql: string, params?: any[]) {
  try {
    return await queryForObject<T>(sql, params)
  }
  catch (e: any) {
    log.warn('Query for object encountered error: {}', 'message' in e ? e.message : e)
  }
}

export async function executeBatchSql(statements: BatchStatement, dbName?: string): Promise<void> {
  const db = useDatabase(dbName)
  return new Promise((resolve, reject) => {
    db.sqlBatch(statements, resolve, reject)
  })
}

export function newBatchTransaction(dbName?: string): BatchTransaction {
  const statements: BatchStatement = []
  return {
    execute(sql: string, params?: unknown[]): void {
      statements.push([sql, params || []])
    },
    commit(): Promise<void> {
      if (!statements.length)
        throw new Error('invalid state, got empty statements')
      return executeBatchSql(statements, dbName)
    },
  }
}
