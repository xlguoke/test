export type Override<T, K> = Omit<T, keyof K> & K

export interface Order<T> {
  property: keyof T
  direction: 'asc' | 'desc'
}

export class Sort<T> {
  orders: Order<T>[] = []
  get sorted(): boolean {
    return !!this.orders.length
  }
}

export class Pageable<T> {
  page: number = 1
  size: number = 10
  sort: Sort<T> = new Sort()

  get offset(): number {
    return (this.page - 1) * this.size
  }

  get limit(): number {
    return this.size
  }

  get orders(): string | undefined {
    if (!this.sort.sorted)
      return undefined
    const orders = []
    for (const order of this.sort.orders)
      orders.push(`${String(order.property)} ${order.direction}`)
    return orders.join(',')
  }

  addOrder(order: Order<T>) {
    if (order.direction === 'asc')
      this.sort.orders.unshift(order)
    else
      this.sort.orders.push(order)
  }
}

export * as basic from './basic'
export * as task from './task'
