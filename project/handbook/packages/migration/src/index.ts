/**
 * Schema migration module
 * @module migration
 * @see setupMigrator
 * @see defineMigration
 */
import { useDatabase } from 'custodian'
import { LoggerWrapper } from '@ilis/cordova-plugin-log4c'

const migrations: Migration[] = []
const log = new LoggerWrapper('migration')

export interface MigrateDefinition {
  up: (migration: Migration) => void
  down?: (migration: Migration) => void
}

export class Migration {
  readonly version: number
  private readonly definition: MigrateDefinition
  private readonly actions: ((tx: SQLitePlugin.Transaction) => void)[]

  constructor(ver: number, def: MigrateDefinition) {
    this.version = ver
    this.definition = def
    this.actions = []
  }

  execute(statement: string) {
    this.actions.unshift(this.executable(statement))
  }

  action(action: (tx: SQLitePlugin.Transaction) => void) {
    this.actions.unshift(action)
  }

  up() {
    this.definition.up(this)
    return this.actions
  }

  down() {
    this.definition.down?.(this)
    return this.actions
  }

  private executable(sql: string) {
    return (tx: SQLitePlugin.Transaction): Promise<void> => {
      return new Promise((resolve, reject) => {
        tx.executeSql(
          sql,
          undefined,
          () => {
            log.info('executed {}', sql)
            resolve()
          },
          (_tx, err) => {
            log.error('execute failed {}', err.message)
            reject(err)
          },
        )
      })
    }
  }
}

export class Migrator {
  constructor(db: SQLitePlugin.Database) {
    this.db = db
  }

  private readonly db: SQLitePlugin.Database

  /**
   * migrate after Migrator got reset has no effect
   */
  reset() {
    while (migrations.length)
      migrations.pop()
  }

  async migrate(targetVersion?: number) {
    targetVersion = targetVersion ?? migrations.length
    const curVersion = await this.version()
    if (targetVersion > curVersion)
      await this.migrateUpTo(curVersion, targetVersion)
    else
      await this.migrateDownTo(curVersion, targetVersion)
    return this
  }

  private async migrateUpTo(start: number, end: number) {
    const migrationsToRun: Migration[] = migrations.slice(start + 1, end + 1)
    for (const migration of migrationsToRun) {
      log.info(`migrating up to version: ${migration.version}`)
      await this.executeActions(migration.up(), migration.version)
    }
  }

  /**
   * ### Downgrades the database
   * if the current schema version is 3, and the target version is 1,
   * the migration array length should be 4 because the index of 0 is always occupied,
   * so the slice of migrations is [2, 3] execute in reverse order.
   *
   * @param start current schema version
   * @param end target schema version
   * @private
   */
  private async migrateDownTo(start: number, end: number) {
    const migrationsToRun = migrations.slice(end + 1, start + 1)
    for (let i = migrationsToRun.length - 1; i >= 0; i--) {
      log.info(`migrating down to version: ${migrationsToRun[i].version}`)
      await this.executeActions(migrationsToRun[i].down(), migrationsToRun[i].version - 1)
    }
  }

  /**
   * execute all actions
   * @param actionsToRun
   * @param v the schema version to be set
   */
  private async executeActions(actionsToRun: ((tx: SQLitePlugin.Transaction) => void)[], v: number) {
    const db = this.db

    async function setVersion(v: number): Promise<void> {
      return new Promise((resolve, reject) => {
        db.executeSql(
          `update schema_version set version = ? where id = 'current'`,
          [v],
          () => {
            log.info(`set schema version to ${v}`)
            resolve()
          },
          err => reject(err),
        )
      })
    }

    async function execute(action: ((tx: SQLitePlugin.Transaction) => void)): Promise<void> {
      return new Promise((resolve, reject) => {
        db.transaction(action, reject, () => resolve())
      })
    }

    async function next() {
      if (actionsToRun.length === 0) {
        try {
          await setVersion(v)
        }
        catch (e) {
          log.error(`failed to set schema version ${JSON.stringify(e)}`)
        }
      }
      else {
        const action = actionsToRun.pop()
        if (action) {
          try {
            await execute(action)
          }
          catch (err) {
            log.error(`action execution failed ${JSON.stringify(err)}`)
          }
        }
        await next()
      }
    }

    await next()
  }

  async version(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.executeSql(
        'select version from schema_version where id = ?',
        ['current'],
        (rs) => {
          if (rs.rows.length) {
            const version = rs.rows.item(0).version
            resolve(version)
          }
          else {
            reject(new Error('failed query current schema version'))
          }
        },
      )
    })
  }
}

/**
 * Migration definition
 * @param version the schema version number starting from 1
 * @param def the migration definition
 * @example
 * import { defineMigration } from 'migration'
 *
 * defineMigration(1, {
 *   up: (migration) => {
 *     migration.execute(`
 *       create table template
 *       (
 *         id integer primary key autoincrement,
 *         key,
 *         name,
 *         url,
 *         path
 *       );
 *     `)
 *   },
 * })
 */
export function defineMigration(version: number, def: MigrateDefinition) {
  if (version < 1)
    throw new Error('Migration version must be positive and starting from 1')
  if (migrations[version])
    throw new Error(`Migration ${version} already defined`)
  migrations[version] = new Migration(version, def)
}

/**
 * Setup migrator and create the schema_version table if not exists
 * and also insert an initial value into it
 */
export function setupMigrator(dbName?: string) {
  const db = useDatabase(dbName)
  db.sqlBatch([
    'create table if not exists schema_version(id text primary key, version integer)',
    `insert into schema_version(id, version) values ('current', 0) on conflict do nothing`,
  ])
  return new Migrator(db)
}
