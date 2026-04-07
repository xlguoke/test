import type { TransformMenuTree } from '~/layout/api'

/**
 * # 导航标签数据接口 📝
 * - 包含标签的基本信息和状态
 */
export interface INavTag extends TransformMenuTree {
  /** 是否固定 */
  fixed?: boolean
  /** 是否激活 */
  active?: boolean
}

/**
 * # 导航标签展示类型枚举 🔧
 * - 支持不同的视觉样式
 */
export enum ENavTagDisplayType {
  /** 当前样式 */
  CURRENT = 'current',
  /** Google样式 */
  GOOGLE = 'google',
}
