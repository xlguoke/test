/**
 * @example
 * function openUdr() {
 *   cordova.plugins.udr.open({
 *     url: 'asset://www/test1/main.json',
 *     initScript: '',
 *     waitForResult: true,
 *     task: '',
 *   }, () => console.log('udr closed'))
 * }
 */

declare const udr: Udr
declare const loadJsonData: (url: string) => void
declare const initRecordsets: (config: RecordSetConfig[]) => void
declare const loadUdrOtherState: () => void
declare const saveUdrOtherState: () => void
declare const WriteBind: (id: string, name: string, value: string, type: number) => void
declare const defaultOnClickHandler: (control: any) => void

interface CordovaPlugins {
  udr: {
    open(openArgs: OpenArgs & Record<string, any>, success?: (info: string) => void, error?: (error: unknown) => void): void
    /**
     * udr模板中调用app函数、界面
     * @param fn
     * @param error
     */
    registerAppCall(fn: (fn: CallFn) => void, error: (error: unknown) => void)
    /**
     * app界面调用完成后转入的数据
     * @param done
     */
    finishCallApp(done: any)
  }
}

interface UdrFn {
  /**
   * 方法名称
   */
  name: string
  /**
   * 完成时作为finishCallApp的参数
   */
  callId: string
}

interface CallFn extends UdrFn {
  /**
   * 方法参数，app与模板自主约定
   */
  param: Record<string, any>
}

interface DoneFn extends UdrFn {
  data: Record<string, any>
}

interface OpenArgs {
  /**
   * main.json地址
   * 支持本地/在线资源
   * @example
   * // cordova file system resource must trim the `file://` prefix
   * '/data/user/0/cn.ilis.uhb/files/files/templates/abb0e455-c79f-4422-afdc-9ed00edda66f/main.json'
   * 'asset://www/test1/main.json'
   * 'http://api.qdm123/UDR/main.json'
   */
  url: string
  /**
   * 初始化JS脚本，该脚本以闭包执行在UDR插件中的JS引擎
   * @example
   * // app中的静态资源，一般放置在public目录下
   * 'asset://www/init.js'
   * // http资源
   * 'http://localhost:3000/init.js'
   */
  initScript: string | undefined
  /**
   * open中的success回调等待UDR关闭后才执行
   */
  waitForResult: boolean | undefined
  /**
   * 只读
   */
  readOnlyMode?: boolean
}

interface Udr {
  sheets: Sheets
  startParams: Record<string, any>
  supportJson: boolean
  /**
   * 模板数据保存到记录集
   */
  supportAdoRs: boolean

  debugMode: boolean

  startHttpServer(port: number): void

  openDatabase(dbName: string): Db

  toast(message: string): void

  saveData(url: string, callback: (data: string, error: unknown) => void): void

  addCustomSaveData(key: string, value: string): void

  /**
   * 同步GET请求
   * @param url
   * @param config
   * @example
   * const res = udr.httpGet('https://example.com', { headers: { 'X-Foo': 'bar' } })
   */
  httpGet(url: string, config: Record<string, any>): string

  /**
   * 异步GET请求
   * @param url
   * @param config
   * @param cb
   */
  httpGet(url: string, config: Record<string, any>, cb: (data: any, error: any) => void)

  /**
   * 同步POST请求
   * @param url
   * @param data
   * @param config
   * @example
   * const res = udr.httpPost('https://example.com', { foo: 'bar' }, { headers: { 'X-Foo': 'bar' } })
   */
  httpPost(url: string, data: Record<string, any>, config: Record<string, any>): string

  /**
   * 异步POST请求
   * @param url
   * @param data
   * @param config
   * @param cb
   */
  httpPost(url: string, data: Record<string, any>, config: Record<string, any>, cb: (data: any, error: any) => void)

  /**
   * 模板中调用app函数
   * @param name 注册的函数名称
   * @param param
   * @param config
   * @param cb
   */
  callApp(name: string, param: Record<string, any>, config: Record<string, any>, cb: (data: string, error: any) => void): void
}

interface Db {
  query(sql: string, args: any[] | undefined): Array<Record<string, any>>

  execSQL(sql: string, args: any[] | undefined): void
}

interface Sheets {
  recordsets: RecordSets
  supportJson: boolean
  supportAdoRs: boolean
}

interface RecordSets {
  item(name: string): RecordSet
}

interface RecordSet {
  opened: boolean

  saveToDb(): void
  toXml(): string | undefined
}

interface RecordSetConfig {
  /**
   * 数据集名称
   */
  name: string
  /**
   * _记录集的保存类型_
   *
   * - xml：保存到UdrXmlData
   * - sql：直接保存到sqlite
   * - http：保存到服务器
   *
   */
  saveType: 'xml' | 'sql' | 'http'
  preload?: boolean | undefined
  autoInitGroupCount?: boolean | undefined
  /**
   * 自动初始化组次：sheets.intGroupMax、sheets.intCountMax，必须指定initTaskId
   */
  initTaskId?: string | undefined
  /**
   * 记录集初始化，增加 initShiJianId ，初始化试件ID
   */
  initShiJianId?: string
  data?: any | undefined
  /**
   * 支持手动指定记录集schema定义，目前只用于sql查询
   */
  schemaXml?: any | undefined
  sql?: string | undefined
  /**
   * _直接操作sqlite：必须指定表tableName、主键keyColName_
   *
   * @type {RecordSet#saveToDb()}
   * 程总解释，如果直接保存sqlite则需要提供以下两个属性，分别对应表和被列名
   */
  tableName?: string | undefined
  keyColName?: string | undefined
}
