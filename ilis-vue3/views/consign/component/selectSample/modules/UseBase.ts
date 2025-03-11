/**
 * 事件订阅
 * 用于不同模块之间监听通信
 */
export class UseModuleEmit<T> {
  /** 订阅字段变更队列 */
  private subscribeQueue: {
    [key: string]: Array<(value: any) => void>
  } = {}

  /**
   * 订阅数据变更
   * 用于各模块之间数据通信
   * @param field 订阅变量字段
   * @param handler 发布消息后触发方法
   */
  subscribeFieldChange(field: keyof T | string, handler: (val: any) => void) {
    const subscribeQueue = this.subscribeQueue

    if (!Object.prototype.hasOwnProperty.call(subscribeQueue, field)) {
      subscribeQueue[field as string] = []
    }

    subscribeQueue[field as string].push(handler)
  }

  /**
   * 发布数据变更
   * @param filed 发布事件字段
   * @param data 发布数据
   */
  publishFieldChange(filed: keyof T | string, data?: any) {
    const handlers = this.subscribeQueue[filed as string] || []

    handlers.forEach((handler) => {
      handler(data)
    })
  }
}

export class UseBase<T> extends UseModuleEmit<T> {
  data: T

  constructor(data: T) {
    super()

    this.data = data
  }

  /**
   * 获取数据
   * 深拷贝返回，避免通过引用修改了数据
   */
  getData(): T {
    return JSON.parse(JSON.stringify(this.data))
  }

  /**
   * 获取元数据
   * 注：部分类中该方法会重写
   */
  public getMetaData(): T {
    return this.getData()
  }

  /**
   * 设置数据
   */
  setData(data: T | any) {
    this.data = data
  }

  /**
   * 设置数据(单个字段)
   */
  setDataField(key: keyof T, val: T[keyof T]) {
    this.data[key] = val
  }

  /** 设置特殊字符 */
  setSpecialCharacter(key: keyof T) {
    const e = event as any
    let selectionStart: null | number = null

    return (str: string) => {
      if (selectionStart === null && e && e.target) {
        selectionStart = e.target.selectionStart
      }

      const val = (this.data[key] || '') as string
      const nowValArr = val.split('')

      if (selectionStart !== null && selectionStart !== undefined) {
        nowValArr.splice(selectionStart, 0, (str || ''))
        this.setDataField(key, nowValArr.join('') as any)
        selectionStart++
      }
      else {
        const newVal = val + (str || '') as any
        this.setDataField(key, newVal)
      }
    }
  }
}
