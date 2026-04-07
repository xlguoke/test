interface FindDataNodeOpts {
  /** id的键名 */
  idField?: string
  /** children的键名 */
  childrenField?: string
}

/**
 * 查找数据节点/支持树查找
 * @param data 列表数据
 * @param value 要查找的key值
 * @param opts {@link FindDataNodeOpts}
 */
export function findDataNode<T>(data: any[], value: string, opts?: FindDataNodeOpts): T | null {
  const idField = opts?.idField || 'id'
  const childrenField = opts?.childrenField || 'children'

  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const childrenData = item[childrenField]

    if (item[idField] === value) {
      return item
    }

    if (childrenData && childrenData.length > 0) {
      const r = findDataNode<T>(childrenData, value, opts)
      if (r) {
        return r
      }
    }
  }

  return null
}
