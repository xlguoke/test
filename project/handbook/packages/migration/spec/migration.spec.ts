/// <reference types="jasmine" />
import { executeSql, mapResultSet } from 'custodian'
import type { Migrator } from '../src'
import { defineMigration, setupMigrator } from '../src'

window.addEventListener('unhandledrejection', (e) => {
  console.error(`catch unhandled rejection ${JSON.stringify(e.reason)}`)
})

beforeAll(() => localStorage.setItem('uhb.user', JSON.stringify({ database: 'uhb.db' })))

describe('define migrations', () => {
  let migrator: Migrator
  beforeEach(() => migrator = setupMigrator())
  afterEach(() => migrator.reset())

  it('validates each defined migration', () => {
    expect(() => {
      defineMigration(
        0,
        { up: () => {} },
      )
    },
    ).toThrowError('Migration version must be positive and starting from 1')
  })

  it('rejects duplicated migration', () => {
    defineMigration(
      1,
      { up: () => {} },
    )
    expect(() => {
      defineMigration(
        1,
        { up: () => {} },
      )
    }).toThrowError('Migration 1 already defined')
  })
})

describe('schema migration', () => {
  let migrator: Migrator

  beforeEach(() => {
    defineMigration(1, {
      up(migration) {
        migration.execute(`
          create table if not exists template
          (
            id integer primary key autoincrement,
            key,
            name,
            url,
            path
          );
        `)
      },
      down(migration) {
        migration.execute('drop table template')
      },
    })
    defineMigration(2, {
      up: (migration) => {
        migration.execute('create table foo(id)')
      },
      down(migration) {
        migration.execute('drop table foo')
      },
    })
    defineMigration(3, {
      up: (migration) => {
        migration.execute('create table bar(id)')
      },
      down(migration) {
        migration.execute('drop table bar')
      },
    })
    migrator = setupMigrator()
  })

  afterEach(async () => {
    await migrator.migrate(0)
    migrator.reset()
  })

  it('should setup the schema_version table', async () => {
    const rs
      = await executeSql('select name from sqlite_master where type = ? and name = ?', ['table', 'schema_version'])
    expect(rs.rows.length).toBe(1)
    expect(1).toBe(1)
  })

  it('should migrate up to the newest version', async () => {
    await migrator.migrate()
    const version = await migrator.version()
    expect(version).toBe(3)
  })

  it('should migrate down to the initial version', async () => {
    // migrating up first
    await migrator.migrate()
    await migrator.migrate(0)
    const version = await migrator.version()
    expect(version).toBe(0)
    const tables = await getTables()
    for (const table of tables)
      expect(tables).toContain(table)
  })

  it('should migrate to specific version', async () => {
    await migrator.migrate(2)
    let version = await migrator.version()
    expect(version).toBe(2)
    await migrator.migrate(1)
    version = await migrator.version()
    expect(version).toBe(1)
  })
})

describe('complex schema migration', () => {
  it('define action in Migration', async () => {
    defineMigration(1, {
      up: (migration) => {
        migration.action((tx) => {
          tx.executeSql('create table sample(id integer primary key autoincrement)', undefined)
          tx.executeSql('alter table sample add column name text', undefined)
          tx.executeSql('insert into sample(name) values(?), (?)', ['one', 'two'])
        })
      },
      down(migration) {
        migration.execute('drop table sample')
      },
    })
    const migrator = setupMigrator()
    await migrator.migrate()
    let rs = await executeSql('select count(*) as count from sample')
    expect(rs.rows.item(0).count).toBe(2)
    rs = await executeSql('select * from sample where id = 1')
    expect(rs.rows.length).toBe(1)
    expect(rs.rows.item(0).name).toBe('one')
    await migrator.migrate(0)
    migrator.reset()
  })
})

interface Table {
  name: string
}

async function getTables() {
  const tables: Table[] = mapResultSet(
    await executeSql('select name from sqlite_master where type = ? and name not in (?)', ['table', 'sqlite_sequence']),
  )
  return tables
}
