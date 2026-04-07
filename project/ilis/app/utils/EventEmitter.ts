/**
 * 发布订阅工具
 * 用于跨模块通信
 */
export class EventEmitter {
  private subscribers: Record<string, Array<(data?: any) => void>> = {}

  /**
   * @param allowEvents 通过allowEvents使该工具不易混乱
   */
  constructor(private allowEvents: string[]) {}

  /**
   * 订阅事件
   */
  subscribe(event: string, handler: (data?: any) => void) {
    if (!this.allowEvents.includes(event)) {
      throw new Error('未定义的的事件监听类型！')
    }

    if (!this.subscribers[event]) {
      this.subscribers[event] = []
    }

    this.subscribers[event].push(handler)
  }

  /**
   * 发布事件
   */
  publish(event: string, data?: any): void {
    if (!this.allowEvents.includes(event)) {
      throw new Error('未定义的的事件监听类型！')
    }

    const handlers = this.subscribers[event] || []

    handlers.forEach((handler) => {
      handler(data)
    })
  }

  unsubscribe(event: string, handler: (data?: any) => void): void {
    if (!this.allowEvents.includes(event)) {
      throw new Error('未定义的的事件监听类型！')
    }

    const handlers = this.subscribers[event] || []

    for (let i = 0; i < handlers.length; i++) {
      if (handlers[i] === handler) {
        handlers.splice(i, 1)
        break
      }
    }
  }

  clear(event?: string): void {
    if (event) {
      if (!this.allowEvents.includes(event)) {
        throw new Error('未定义的的事件监听类型！')
      }

      this.subscribers[event] = []
    }
    else {
      this.subscribers = {}
    }
  }
}
