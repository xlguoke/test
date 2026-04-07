/** 领域配置分类 */
export enum BUSINESS_SCOPE {
  /** 通用 */
  COMMON = 'COMMON',
  /** 业务模块 */
  MODULE = 'MODULE',
  /** 领域术语 */
  TERMINOLOGY = 'TERMINOLOGY',
  /** 委托布局属性配置 */
  CONSIGN = 'CONSIGN',
}

/** 字段来源：记录字段来自哪个模块，便于配置后追溯，查看配置是否生效 */
export enum FIELD_SOURCE {
  /** 委托 */
  CONSIGN = 'CONSIGN',
  /** 样品 */
  SAMPLE = 'SAMPLE',
  /** 任务 */
  TASK = 'TASK',
  /** 报告 */
  REPORT = 'REPORT',
}

/** 自定义布局属于哪个模块 */
export enum LAYOUT_FROM {
  /** 委托 */
  CONSIGN = 'CONSIGN',
}

/** 数据源枚举 */
export enum OPTIONS_DATA_SOURCE {
  /** API 获取 */
  API = 'URL',
  /** 数据字典 */
  DICT = 'DICT',
  /** 静态数据 */
  STATIC = 'STATIC',
  /** 组件 */
  COMPONENT = 'COMPONENT',
  /** 后端设置的默认值 */
  NONE = 'NONE',
}

/** 委托流程 */
export enum PROCESS_CONFIG {
  /** 委托收样 */
  CONSIGN = 'CONSIGN',
  /** 收费管理 */
  CHARGE = 'CHARGE',
  /** 任务分配 */
  ASSIGNER = 'ASSIGNER',
  /** 试验检测 */
  TEST = 'TEST',
  /** 复核确认 */
  TEST_REVIEW = 'TEST_REVIEW',
  /** 报告审核 */
  REPORT_REVIEW = 'REPORT_REVIEW',
  /** 报告批准 */
  REPORT_APPROVAL = 'REPORT_APPROVAL',
  /** 报告打印 */
  REPORT_PRINT = 'REPORT_PRINT',
  /** 报告发放 */
  REPORT_ISSUE = 'REPORT_ISSUE',
}
