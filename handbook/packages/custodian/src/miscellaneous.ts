import { z } from 'zod'
import { LoggerWrapper } from '@ilis/cordova-plugin-log4c'
import type { basic } from './types'
import { executeSql, queryForObject, safeQueryForObject } from './database'
import { useDir } from './template'

const log = new LoggerWrapper('custodian.miscellaneous')
/**
 * trim the `/UDR` suffix if present
 * @param url
 */
export function normalizeHitekCenterUrl(url: string) {
  return new URL('/', url).href
}

/**
 * 保存数据中心地址
 * @param url
 */
export async function saveHitekCenterUrl(url: string) {
  try {
    const existed = await getHitekCenterUrl()
    if (existed !== url)
      await executeSql('update conf set hitekCenter = ? where 1', [url])
  }
  catch (e) {
    await executeSql('insert into conf values (?)', [url])
  }
}

/**
 * 获取数据中心地址
 */
export async function getHitekCenterUrl() {
  const conf = await queryForObject<{ hitekCenter: string }>(
    'select hitekCenter from conf',
  )
  return conf.hitekCenter
}

/**
 * 保存数据版本信息
 * @param dataVersion
 */
export async function saveDataVersion(dataVersion: basic.DataVersion) {
  await executeSql(
    'insert into data_version values (?, ?, ?) on conflict do update set version = ?, paramVersionId = ?',
    [dataVersion.type, dataVersion.version, dataVersion.paramVersionId, dataVersion.version, dataVersion.paramVersionId],
  )
}

/**
 * 获取类型当前版本信息
 * @param type
 */
export async function getDataVersion(type: basic.DataVersion['type']) {
  return safeQueryForObject<basic.DataVersion>('select * from data_version where type = ?', [type])
}

const commonFileResponse = z.object({
  success: z.boolean(),
  msg: z.string().nullable(),
  data: z.array(z.object({
    fileName: z.string(),
    filePath: z.string(),
    lastWriteTime: z.string(),
    createTime: z.string(),
  })),
})

interface HitekCenter {
  api: string
  udr: string
}

export async function downloadExtraFilesForUdr(server: HitekCenter) {
  const url = new URL('/api/TestTemplate/GetAppTemplateCommonFiles', server.api)
  const res = await fetch(url)
  if (!res.ok)
    throw new Error(`failed to fetch app template common files from ${url.href}`)
  const result = commonFileResponse.parse(await res.json())
  const files: [string, string][] = []
  for (const datum of result.data) {
    const path = new URL(datum.filePath, server.udr)
    const fragments = decodeURI(path.pathname).split('/')
    const filename = fragments.pop()
    if (filename !== datum.fileName)
      throw new Error(`${filename}, ${datum.fileName} mismatch`)
    let dir: DirectoryEntry | undefined
    for (const fragment of fragments)
      dir = await useDir(fragment, dir)
    const fileEntry = await getFileEntry(dir!, filename)
    const file = await getFile(fileEntry)
    const lastModified = new Date(datum.lastWriteTime)
    if (!file.size || lastModified.getTime() < file.lastModified) {
      log.info(`download {} from {}`, filename, path)
      fetch(path)
        .then(res => res.blob())
        .then(res => fileEntry.createWriter(writer => writer.write(res)))
      files.push([filename, fileEntry.fullPath])
    }
  }
  return files
}

async function getFileEntry(dir: DirectoryEntry, file: string): Promise<FileEntry> {
  return new Promise((resolve, reject) => {
    dir.getFile(file, { create: true }, resolve, reject)
  })
}

async function getFile(entry: FileEntry): Promise<File> {
  return new Promise((resolve, reject) => {
    entry.file(resolve, reject)
  })
}

/**
 * Because the pre-defined variable {cordova.file.dataDirectory} cannot be used in the browser,
 * therefore, you'll get a rejection when running this code in the browser.
 */
export async function readLogEntries(): Promise<FileEntry[]> {
  return new Promise((resolve, reject) => {
    window.resolveLocalFileSystemURL(
      cordova.file.dataDirectory,
      (entry) => {
        if (entry.isFile)
          reject(new Error(`you'll never see me`))
        const dirReader = (entry as DirectoryEntry).createReader()
        dirReader.readEntries((entries) => {
          const logs = entries
            .filter(entry => entry.isFile && entry.name.endsWith('.log'))
            .map(entry => entry as FileEntry)
          resolve(logs)
        }, reject)
      },
      reject,
    )
  })
}

export function readLog(name: string): Promise<string> {
  return new Promise((resolve, reject) => {
    window.resolveLocalFileSystemURL(
      `${cordova.file.dataDirectory}/${name}`,
      (entry) => {
        if (entry.isDirectory)
          reject(new Error('wrong entry type, expect file'))
        const log = entry as FileEntry
        log.file((file) => {
          const fileReader = new FileReader()
          fileReader.onload = () => {
            resolve(fileReader.result as string)
          }
          fileReader.onerror = reject
          fileReader.readAsText(file)
        })
      },
      reject,
    )
  })
}
