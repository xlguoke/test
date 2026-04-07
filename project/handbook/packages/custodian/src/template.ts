/// <reference types="cordova-plugin-file"/>
import { getLogger } from '@ilis/cordova-plugin-log4c'
import { newBatchTransaction, queryForList, queryForObject, safeQueryForObject } from './database'
import type { basic } from './types'

const log = getLogger('custodian.template')

/**
 * 手簿模板
 */
export interface Template {
  id: string
  name: string
  udrItemId: string
  testItemId: string
  testItemName: string
  /**
   * 当前手簿仅使用录入
   * - 1 录入
   * - 2 记录
   * - 3 报告
   */
  templateType: '1' | '2' | '3'
  /**
   * lastUpdateTime
   */
  version: string
  /**
   * 主文件 main.json 位于应用本地的地址
   * @example
   * '/data/data/<app-id>/templates/<template-id>/main.json'
   */
  main: string
}

/**
 * 模板文件
 * @example
 * '/1706532767/main.json'
 * '/1706532767/1.json'
 * '/1706532767/2.json'
 */
export interface TemplateFile {
  /**
   * 数据中心模板ID
   */
  templateId: string
  /**
   * 模板文件名称
   * @example
   * main.json
   */
  name: string
  /**
   * Cordova Filesystem URL
   * @example
   * 'filesystem://localhost/path/to/awesome.pdf'
   */
  path: string
  /**
   * 模板文件URL
   * @example
   * 'https://api.ilis.cn/udr/2a7a2fae-b991-4906-acf8-2e5120bb6188.hrp'
   */
  url: string
  /**
   * lastUpdateTime
   */
  version: string
}

/**
 * 由数据中心配置维护的模板记录集
 */
export type TemplateRecordset = { templateId: string } & basic.Recordset

/**
 * 保存模板信息以及模板文件
 * - 以lastUpdateTime作为版本号，增量保存有变动的模板信息
 * - 以版本号(template-id)作为每一组模板文件的文件夹
 * @param templates
 * @param hitekCenter 数据中心地址
 */
export async function saveTemplates(templates: basic.Template[], hitekCenter: string) {
  return Promise.allSettled(templates.map(it => saveTemplate(it, hitekCenter)))
}

export async function saveTemplate(tmpl: basic.Template, hitekCenter: string) {
  const tx = newBatchTransaction()
  const templates: Template[] = []
  for (const at of tmpl.appTemplates) {
    if (at.type !== '2') {
      log.info(`skip unsupported template type ${at.type}`)
      continue
    }
    const files = await downloadTemplates(at.id, hitekCenter, at.appTemplateFiles)
    const main = files.find(it => it.name === 'main.json')
    if (!main)
      throw new Error(`${at.name} has no main.json`)
    for (const file of files) {
      tx.execute(
        `insert into template_file(templateId, name, path, url, version)
           VALUES (?, ?, ?, ?, ?)
           on conflict do update set path = ?,
                                     version = ?`,
        [file.templateId, file.name, file.path, file.url, file.version, file.path, file.version],
      )
    }
    if (tmpl.recordSets) {
      for (const rs of tmpl.recordSets) {
        tx.execute(
          'insert into template_recordset(templateId, name, xml) VALUES (?, ?, ?) on conflict do update set xml = ?',
          [at.id, rs.name, rs.xml, rs.xml],
        )
      }
    }
    const appTmpl: Template = {
      id: at.id,
      name: at.name,
      udrItemId: at.udrItemId,
      testItemId: tmpl.testItemId,
      testItemName: tmpl.testItemName,
      templateType: tmpl.templateType,
      version: at.lastUpdateTime,
      main: main.path,
    }
    tx.execute(
      `insert into template(id, name, udrItemId, testItemId, testItemName, templateType, version, main)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       on conflict do update set version = ?,
                                 main = ?`,
      [
        appTmpl.id,
        appTmpl.name,
        appTmpl.udrItemId,
        appTmpl.testItemId,
        appTmpl.testItemName,
        appTmpl.templateType,
        appTmpl.version,
        appTmpl.main,
        appTmpl.version,
        appTmpl.main,
      ],
    )
    templates.push(appTmpl)
  }
  await tx.commit()
  return templates
}

async function downloadTemplates(templateId: string, hitekCenter: string, files: basic.TemplateFile[]): Promise<TemplateFile[]> {
  function rejected(result: PromiseSettledResult<TemplateFile>): result is PromiseRejectedResult {
    return result.status === 'rejected'
  }

  function fulfilled(result: PromiseSettledResult<TemplateFile>): result is PromiseFulfilledResult<TemplateFile> {
    return result.status === 'fulfilled'
  }

  const dir = await useDir(templateId, await useTemplateDir())
  const normalized: TemplateFile[] = files.map((it) => {
    return {
      templateId,
      name: it.fileName,
      url: new URL(it.filePath, hitekCenter).href,
      path: '',
      version: it.lastUpdateTime,
    }
  })
  return new Promise((resolve, reject) => {
    Promise.allSettled(normalized.map(arg => download(arg, dir)))
      .then((results) => {
        const errors = results
          .filter(rejected)
          .map(result => result.reason.message)
          .join()
        if (errors) {
          reject(new Error(errors))
        }
        else {
          const templates = results
            .filter(fulfilled)
            .map(r => r.value)
          resolve(templates)
        }
      })
  })
}

/**
 * Download a template file into specified directory
 * - if there is no persistent file,
 * or the persistent file's version didn't match with the new file's version, download it
 * - another circumstance is the file doesn't exist, download it
 * @param file
 * @param dir
 */
async function download(file: TemplateFile, dir: DirectoryEntry): Promise<TemplateFile> {
  if (file.name.match(/[\/#&]/))
    throw new Error('the filename should not contain "/ or # or &"')

  const persistent = await findTemplateFile(file)
  if (!persistent || persistent.version !== file.version) {
    return downloadFile(persistent || file, dir)
  }
  else {
    const existed = await exists(dir, file.name)
    return existed ? persistent : downloadFile(persistent, dir)
  }
}

async function downloadFile(file: TemplateFile, dir: DirectoryEntry): Promise<TemplateFile> {
  return new Promise((resolve, reject) => {
    log.info('download file from {}', file.url)
    dir.getFile(
      file.name,
      { create: true },
      (fs) => {
        fetch(file.url)
          .then(res => res.blob())
          .then((blob) => {
            fs.createWriter((writer) => {
              writer.write(blob)
              resolve({ ...file, path: toCanonicalPath(fs) })
            }, reject)
          })
          .catch(err => reject(new Error(`${file.url} download failed, cause ${err}`)))
      },
      reject,
    )
  })
}

export async function exists(dir: DirectoryEntry, name: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    dir.getFile(
      name,
      {},
      entry => resolve(toCanonicalPath(entry)),
      () => resolve(undefined),
    )
  })
}

function toCanonicalPath(fs: Entry) {
  return fs.nativeURL ? fs.nativeURL : fs.toURL()
}

export async function pathExists(path: string): Promise<boolean> {
  return new Promise((resolve) => {
    window.resolveLocalFileSystemURL(
      path,
      entry => entry.isFile ? resolve(true) : resolve(false),
      () => resolve(false),
    )
  })
}

export async function useTemplateDir(): Promise<DirectoryEntry> {
  return useDir('templates')
}

export async function useDir(dir: string, parent?: DirectoryEntry): Promise<DirectoryEntry> {
  return new Promise((resolve, reject) => {
    if (parent) {
      parent.getDirectory(dir, { create: true }, dir => resolve(dir), reject)
    }
    else {
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, (fs) => {
        fs.root.getDirectory(
          dir,
          { create: true },
          dir => resolve(dir),
          err => reject(err),
        )
      }, err => reject(err))
    }
  })
}

export async function findTemplateFile(file: TemplateFile) {
  return safeQueryForObject<TemplateFile>(
    'select * from template_file where templateId = ? and name = ? and version = ?',
    [file.templateId, file.name, file.version],
  )
}

export async function findTemplateFiles(id: string) {
  return queryForList<TemplateFile>('select * from template_file where templateId = ?', [id])
}

export async function getTemplate(id: string) {
  return queryForObject<Template>('select * from template where id = ?', [id])
}

export async function findTemplateRecordSets(id: string) {
  return queryForList<TemplateRecordset>('select * from template_recordset where templateId = ?', [id])
}

export async function findTemplates(testItemId?: string) {
  if (testItemId)
    return queryForList<Template>('select * from template where testItemId = ?', [testItemId])
  return queryForList<Template>('select * from template')
}

export async function groupTemplateTestItem() {
  return queryForList<{ testItemId: string, testItemName: string }>(
    `select testItemId, testItemName from template group by testItemId`,
  )
}
