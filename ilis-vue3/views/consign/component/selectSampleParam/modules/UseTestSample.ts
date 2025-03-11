/** 大类列表 - 树形结构 */
export class BigCategoryTreeNode {
  /** 大类id */
  id = ''
  /** 大类名称 */
  text = ''
  checked = false
  orderNum = 0
  state: 'open' | 'close' = 'open'
  pid?: string
  parentId?: string
  childrenIds?: string
  chkDisabled?: boolean
  expired?: boolean
  iconCls?: string
  attributes: {
    isDelete: '0' | '1'
  } = {
      isDelete: '0',
    }

  /** 子节点 */
  children: BigCategoryTreeNode[] = []
}

export class SampleTreeNodeAttr {
  isSample = '1'
  systemId?: string
  infoType: 1 | 2 | 3 = 2
  displayName = ''
  name = ''
  description?: string
  sampleNote: string = ''
  sampleLevelName = ''
}

/** 样品大类下，样品节点 */
export class SampleTreeNode {
  id = ''
  text = ''
  iconCls?: string
  checked?: boolean
  attributes = new SampleTreeNodeAttr()
  children: SampleTreeNode[] = []
  state: 'open' | 'close' = 'open'
  orderNum = 0
  parentId?: string
  childrenIds?: string
  chkDisabled?: boolean
  expired?: boolean
  pid?: string
}

/** 前端定义的样品节点 */
export class ViewSampleTreeNode extends SampleTreeNode {
  title = ''
  value = ''
  key = ''
  /** 大类名称 */
  categoryName = ''
  categoryId = ''
  /** 自定义属性：是否已加载样品节点 */
  isLoadSample = false
  /** 是否为叶子节点 */
  isLeaf = false
  children: ViewSampleTreeNode[] = []
}

/** 前端定义的样品节点 */
export class ViewBigCategoryTreeNode extends BigCategoryTreeNode {
  title = ''
  value = ''
  key = ''
  /** 自定义属性：是否已加载样品节点 */
  isLoadSample = false
  /** 是否为叶子节点 */
  isLeaf = false
  children: ViewBigCategoryTreeNode[] = []
}
