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
declare const includeJs: (url: string) => void
declare const $this: UdrThis
declare const $util: UdrUtil
declare const $udr: Udr
declare const $global: UdrMainActivity

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

  /**
   * 模板中打开弹窗
   * @param title 网页名称
   * @param maskClosable 点击蒙层是否允许关闭
   * @param htmlUrl 嵌入的html页面地址
   * @param width 弹窗宽度
   * @param height 弹窗高度
   */
  showDialogModal(title, maskClosable: boolean, htmlUrl: string, width: number | null, height: number | null): void

  /**
   * 嵌入的HTML调用udr引擎中的方法
   * @param eventName 执行方法名
   * @description 调用示例：$udr.invokeUdrScript('$global.web_saveDataAcquisitionCallback()')
   */
  invokeUdrScript(eventName: string): void
  /** 获得所有页签 */
  getSheets(): UdrDoc
  /**
   * 1:文本
   * 2：笔迹
   * 3：文本+笔迹
   */
  setInkMode(inkMode: number)
  /**
   * 按照比例缩放
   * @param scale
   * @param animate
   */
  zoomScale(scale: number, animate: boolean)
  getSettings: () => any
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

/**
 * $this 对象
 */
interface UdrThis {
  /**
   * 关闭窗口
   */
  close: () => void
  /**
   * 关闭打开的新窗口并向父页面（调用openActivity的页面）传递参数
   */
  goback: (str?: string) => void
  setActiveSheet: (idOrName: string) => void
  /**
   * 打开新窗口
   * @param tag 网页标签
   * @param url 网页地址
   * @param callback 接收打开页面返回值的回调方法名
   */
  openActivity: (tag: string, url: string, callbackName: string) => void
  /**
   * 打开指定的试验数据
   * @param taskJson
   */
  openTask: (taskJson: string) => void
  /**
   * 关闭语音录入
   */
  stopAiInput: () => void
  /**
   * 开启语音录入
   */
  startAiInput: () => void
  /**
   * 清空
   */
  clearActiveSheet: () => void
  /**
   * 设置日志追溯UI显示
   * @param bit
   */
  setLogUIVisible: (bit: boolean) => void
  /**
   * 刷新UDR
   */
  refreshUDR()
  /**
   * 保存UDR方法
   */
  saveData()
  /**
   * 打开UDR设置
   */
  openUdrSettings()
  /**
   * 返回页面
   */
  backActivity()
  showPdf: (obj: {
    url: string
    title: string
    autoDel: boolean
  }) => void
  /**
   * # 控制显示/隐藏udr
   * PS：udr无法被前端元素遮挡，借助该方法隐藏udr（隐藏udr并生成一张图片显示），点击图片时自动显示udr，无需再手动调用显示udr
   */
  setUdrVisibility: (bit: boolean) => void
  newLoading: () => any
  /**
   * 启动扫码
   * @param f 固定值： udr-main
   * @param callbackName 回调函数名称
   * @description 扫码结果通过回调函数返回，回调示例：[callbackName](ercode: string){}， ercode为扫码结果
   */
  startScanErCode: (f: 'udr-main', callbackName: string) => void
  /**
   * 订阅指定的设备
   * @param deviceIds
   * @param tag
   * @param callback
   */
  subscribeDataChange(deviceIds: string, tag: string, callback: string)
  iotDataCollect(json: string)
  /**
   * 直连蓝牙设备，逗号分割
   * @param deviceIds "682d26a0-d401-11ef-b6c2-29cdb4905bcb,"682d26a0-d401-11ef-b6c2-29cdb4905bca""
   */
  connectIotDevice(deviceIds: string)
  /**
   * 断开连接设备
   * @param deviceId
   */
  disconnectIotDevice(deviceId: string)
}

/**
 * $util 对象
 */
interface UdrUtil {
  toArray<T>(list: Array<T>): ArrayProxy<T>
  /**
   * 获得UDR启动参数
   */
  getStartParams: (v: string) => string
  /** toast消息 */
  toastSuccess: (v: string) => string
  /** toast消息 */
  toastInfo: (v: string) => string
  /** toast消息 */
  toastWarn: (v: string) => string
  /** toast消息 */
  toastError: (v: string) => string
  /** 将对象转换为字符串 */
  toString: (v: string) => string
  /** 序列化字符串为json */
  toJson: (v: string) => string
  /** 打开试验 */
  openTask: (testTaskStr: string) => void
  /** 调整udr侧边栏宽度 */
  setWidth: (width: number) => void
}

interface UdrDoc {
  getSheets(): Array<UdrSheet>
  /**
   * 获得当前获得的表单
   */
  getActiveSheet(): UdrSheet
  getUdrLogDoc(): UdrLogDoc
}

interface UdrSheet {
  getName(): string
  isVisible(): boolean
  getIdOrName(): string
  getUndoManager(): UdrSheetUndoManager
  /**
   * 清空
   */
  clear()

  /**
   * 设置活动单元格
   * @param name  单元格名称
   */
  setActiveCell(name: string)
  /**
   * 获得活动单元格
   */
  getActiveCell(): UdrCell
}

interface UdrCell {
  /**
   * 获得单元格名称
   */
  getName(): string
  // 设置单元格的值
  setValue(value: string)
}

interface UdrSheetUndoManager {
  /**
   * 撤销
   */
  undo()
  /**
   * 恢复
   */
  redo()
}

interface UdrLogDoc {
  setLogUIVisible(logUIVisible: boolean)
}

interface UdrMainActivity {
  /**
   * 根据udrFragmentId获得UDR 操作层
   * @param udrFragmentId
   */
  getUdrMainFragment(udrFragmentId: string): UdrMainFragment
  /**
   * 隐藏UDR界面
   * @param bit
   */
  setUdrVisibility(bit: boolean)
  /**
   * 更新UDR布局位置
   * @param left
   * @param top
   * @param width
   * @param height
   */
  updateUdrPosition(left: number, top: number, width: number, height: number)
  /**
   * 根据标识ID获得Udr控制控件
   * @param udrFragmentId
   */
  getUdrCtrl(udrFragmentId: string): UdrCtrl
  // 打开UDR
  openUdr(udrFragmentId: string, udrPramJson: string)
  // 销毁UDR
  closeUdr(udrFragmentId: string)
  // 获取当前UDR的启动参数
  getStartParams(key: string): string
  /**
   * 关闭指定的UDR
   */
  closeUdrMainFragment(udrFragmentId: string)
  // 获取设备id
  getAndroidId(): string
}
