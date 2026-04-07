/**
 * OnFileOpenAfter udr加载完成
 * OnSaveComplete udr保存成功回调（注：该回调是前端自己拓展的）
 * OnTestTaskChanged udr切换任务回调（注：该回调是前端自己拓展的）
 */
export type UdrLifecycleType = 'OnFileOpenAfter' | 'OnSaveComplete' | 'onSheetStateChanged' | 'OnTestTaskChanged'

// 监听方法支持参数
export type UdrLifecycleHandler = (...args: any[]) => void

/**
 * UDR生命周期事件监听
 * PS：若还需要其他生命周期方法，需要联系浩哥公开，目前好像只能监听OnFileOpenAfter，但对于前端来说应该够了
 */
export class UdrLifecycle {
  /** 订阅队列 */
  private static subscribeQueue: {
    [key: string]: Array<UdrLifecycleHandler>
  } = {
      OnFileOpenAfter: [],
      OnSaveComplete: [],
      OnTestTaskChanged: [],
      onSheetStateChanged: [],
    }

  /**
   * 订阅事件
   * @param eventName 事件名
   * @param handler 监听方法，可带参数
   */
  static subscribe(eventName: UdrLifecycleType, handler: UdrLifecycleHandler) {
    UdrLifecycle.subscribeQueue[eventName].push(handler)
  }

  /**
   * 发布事件
   * @param eventName 发布事件字段
   * @param args 事件参数
   */
  private publish(eventName: UdrLifecycleType, ...args: any[]) {
    const handlers = UdrLifecycle.subscribeQueue[eventName] || []
    handlers.forEach((handler) => {
      handler(...args)
    })
  }

  // 初始化监听
  init() {
    for (const key in UdrLifecycle.subscribeQueue)
      UdrLifecycle.subscribeQueue[key] = []

    const eventNameList: UdrLifecycleType[] = ['OnFileOpenAfter', 'OnSaveComplete', 'onSheetStateChanged', 'OnTestTaskChanged']
    eventNameList.forEach((eventName) => {
      (window as any)[eventName] = (...args: any[]) => {
        this.publish(eventName, ...args)
      }
    })
  }
}
