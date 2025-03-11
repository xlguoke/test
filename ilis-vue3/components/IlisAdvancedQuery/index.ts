/**
 * 高级查询组件
 */

import type { IOption } from '~/interface/IOption.ts'
import { findDataNode } from '~/utils/findDataNode.ts'

type TagHandlerType = (item: any) => QueryTagItem | false

/** 高级查询配置 */
interface IlisAdvancedQueryOpts<T> {
  /** 配置项列表 */
  configs: IlisAdvancedQueryConfigItem<T>[]
  /** 绑定值 / 初始值 */
  queryParams: T
  /** 高级查询label宽度 */
  labelWidth?: string
  /** 查询回调 */
  onQuery: (params: T) => void
  /** tag处理 */
  tagHandler?: TagHandlerType
}

/** 高级查询标签 */
export interface QueryTagItem {
  /** 显示名称 */
  label?: string
  /** 显示值 */
  value?: string
  /** 绑定字段 */
  key?: any
  /** 绑定值 */
  keyValue?: any
}

/** 高级查询，可选项 */
export enum QueryConfigType {
  输入框 = 1,
  选择框 = 2,
  单选框 = 3,
  复选框 = 4,
  日期选择框 = 5,
  // 特殊处理，传递的name为数组
  日期范围框 = 6,
  树选择框 = 7,
  // 通过插槽自定义组件
  自定义 = 100,
}

/** 高级查询配置项 */
export interface IlisAdvancedQueryConfigItem<T> {
  /** 类型 */
  type?: QueryConfigType
  /** 显示名称 */
  label?: string
  /** 字段名 */
  name: keyof T | [keyof T, keyof T]
  /** 绑定值 */
  value?: any
  /** 通过接口获取的下拉或选项 */
  apiOptions?: () => Promise<any>
  /** 组件属性 */
  props?: any | {
    // 选项配置
    options?: IOption[]
  }
}

/**
 * 高级查询
 */
export class IlisAdvancedQuery<T> {
  /** 高级查询配置项 */
  configs: IlisAdvancedQueryConfigItem<T>[] = []

  /** 高级查询弹窗显示/隐藏 */
  visible = false

  /** 高级查询参数 */
  queryParams: T

  /** 高级查询显示tag */
  queryTags: QueryTagItem[] = []

  /** 查询回调 */
  onQuery: (params: T) => void

  /** tag处理 */
  tagHandler?: TagHandlerType

  /** 高级查询label宽度 */
  labelWidth: string

  constructor(opts: IlisAdvancedQueryOpts<T>) {
    this.queryParams = opts.queryParams
    this.configs = this.initConfigs(opts.configs)
    this.onQuery = opts.onQuery
    this.tagHandler = opts.tagHandler

    this.labelWidth = opts.labelWidth || '85px'
  }

  /** 初始化配置列中的默认信息 */
  initConfigs(configs: IlisAdvancedQueryConfigItem<T>[]) {
    for (let i = 0; i < configs.length; i++) {
      const item = configs[i]

      if (!item.props) {
        item.props = {}
      }

      item.type = item.type || QueryConfigType.输入框

      if (!Object.prototype.hasOwnProperty.call(item.props, 'placeholder')) {
        if ([QueryConfigType.输入框].includes(item.type)) {
          item.props.placeholder = '请输入'
        }

        if ([QueryConfigType.选择框, QueryConfigType.日期选择框, QueryConfigType.树选择框].includes(item.type)) {
          item.props.placeholder = '请选择'
          item.props.allowClear = true
        }
      }

      if (item.apiOptions) {
        item.apiOptions().then((options) => {
          if (item.type === QueryConfigType.树选择框) {
            item.props.treeData = options
          }
          else {
            item.props.options = options
          }
        })
      }
    }

    return configs
  }

  /**
   * 设置配置
   * 追加下拉项等操作
   */
  setConfigProps(key: keyof T, props: any) {
    const item = this.configs.find(i => i.name === key)

    if (item) {
      item.props = {
        ...item.props,
        ...props,
      }
    }
  }

  /** 打开弹窗 */
  open() {
    const { queryParams, configs } = this

    configs.forEach((item) => {
      const name = item.name
      if (Array.isArray(name)) {
        item.value = [queryParams[name[0]], queryParams[name[1]]]
      }
      else {
        item.value = queryParams[name]
      }
    })

    this.visible = true
  }

  /** 关闭弹窗 */
  close() {
    this.visible = false
  }

  /** 高级查询结果tag */
  updateQueryTags() {
    const { tagHandler, queryParams, configs } = this
    const queryTags: QueryTagItem[] = []

    for (let i = 0; i < configs.length; i++) {
      const item = configs[i]
      const { name, label } = item

      const handlerItem = tagHandler && tagHandler(item)
      if (handlerItem) {
        queryTags.push(handlerItem)
        continue
      }

      if (handlerItem === false) {
        continue
      }

      if (Array.isArray(name)) {
        const value1 = queryParams[name[0]]
        const value2 = queryParams[name[1]]

        if (value1 || value2) {
          queryTags.push({
            label,
            value: [value1, value2].join(' ~ '),
            key: name,
            keyValue: [value1, value2],
          })
        }
      }
      else {
        const value = queryParams[name]

        if (value !== undefined && value !== null && value !== '') {
          let tagValue = String(value)

          if (item.type === QueryConfigType.树选择框) {
            tagValue = this.getTreeSelectTagValue(item, value as string)
          }

          if (item.type === QueryConfigType.选择框) {
            tagValue = this.getSelectTagValue(item, value as string)
          }

          const tagItem = {
            label,
            value: tagValue,
            key: name,
            keyValue: value,
          }

          queryTags.push(tagItem)
        }
      }
    }

    this.queryTags = queryTags
  }

  getSelectTagValue(item: IlisAdvancedQueryConfigItem<T>, value: string) {
    const { props } = item

    if (props) {
      const options = props.options || []
      const fieldNames = props.fieldNames || {}

      if (options) {
        const node = options.find((i: any) => i[fieldNames.value || 'value'] === value)
        if (node) {
          return node[fieldNames.label || 'label']
        }
      }
    }

    return value
  }

  getTreeSelectTagValue(item: IlisAdvancedQueryConfigItem<T>, value: string) {
    const { props } = item

    if (props) {
      const treeData = props.treeData || []
      const fieldNames = props.fieldNames || {}

      if (treeData) {
        const node = findDataNode<any>(treeData, value, {
          idField: fieldNames.value || 'value',
        })
        if (node) {
          return node[fieldNames.label || 'label']
        }
      }
    }

    return value
  }
}
