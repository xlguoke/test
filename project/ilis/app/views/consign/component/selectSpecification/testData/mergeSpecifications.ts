import type { Specifications } from '../api'
import { connectorValue, DEFAULT_VALUE } from '..'

interface TestData {
  /** 接口获取的最新辅助信息 */
  otherInfos: Specifications[]
  /** 元数据中已保存的规格型号明细 */
  specificationConfig: Specifications[]
  /** 上次保存的数据 */
  lastSaveData: Specifications[]
  /** 合并去重后的数据 */
  mergeData: Specifications[]
}

/** 最新数据：辅助信息中筛选出的规格型号 */
export const testSpecifications: Specifications[] = [
  {
    inputHistory: [],
    orderNo: 1,
    displayName: '等级',
    systemFieldName: '等级',
    isJoinSpecification: true,
    attributeId: '1',
    customized: false,
    value: '1',
  },
  {
    inputHistory: [],
    orderNo: 2,
    displayName: '标号',
    systemFieldName: '不定义',
    isJoinSpecification: true,
    attributeId: '2',
    customized: false,
    value: '',
  },
  {
    inputHistory: ['C20'],
    orderNo: 3,
    displayName: '型号',
    systemFieldName: '名称',
    isJoinSpecification: true,
    attributeId: '3',
    customized: false,
    value: '',
  },
]

/**
 * 新增样品：存在新增和已删除的数据
 */
export const testData_1: TestData = {
  otherInfos: testSpecifications,
  specificationConfig: [],
  lastSaveData: [
    {
      inputHistory: [],
      orderNo: 0,
      customized: true,
      displayName: '规格',
      attributeId: '000',
      systemFieldName: '规格',
      isJoinSpecification: true,
      value: '00',
    },
    connectorValue,
    {
      inputHistory: [],
      orderNo: 0,
      customized: false,
      displayName: '型号',
      systemFieldName: '型号',
      attributeId: '3',
      isJoinSpecification: true,
      value: '3',
    },
    {
      inputHistory: [],
      orderNo: 0,
      customized: false,
      displayName: '标号',
      systemFieldName: '标号',
      attributeId: '2',
      isJoinSpecification: true,
      value: '22',
    },
    {
      inputHistory: [],
      orderNo: 0,
      customized: false,
      displayName: '自定义',
      systemFieldName: '',
      attributeId: '',
      isJoinSpecification: false,
      deleteAble: true,
      value: 'test',
    },
  ],
  mergeData: [
    {
      inputHistory: [],
      orderNo: 1,
      displayName: '等级',
      systemFieldName: '等级',
      isJoinSpecification: true,
      attributeId: '1',
      customized: false,
      value: '1',
    },
    connectorValue,
    {
      inputHistory: ['C20'],
      orderNo: 3,
      displayName: '型号',
      systemFieldName: '名称',
      isJoinSpecification: true,
      attributeId: '3',
      customized: false,
      value: '3',
    },
    {
      inputHistory: [],
      orderNo: 2,
      displayName: '标号',
      systemFieldName: '不定义',
      isJoinSpecification: true,
      attributeId: '2',
      customized: false,
      value: '22',
    },
    {
      inputHistory: [],
      orderNo: 0,
      customized: false,
      displayName: '自定义',
      systemFieldName: '',
      attributeId: '',
      isJoinSpecification: false,
      deleteAble: true,
      value: 'test',
    },
  ],
}

/**
 * 新增样品：无规格型号数据
 */
export const testData_2: TestData = {
  otherInfos: [],
  specificationConfig: [],
  lastSaveData: [
    {
      inputHistory: [],
      orderNo: 0,
      customized: true,
      displayName: '规格',
      attributeId: '00',
      value: '00',
      systemFieldName: '规格',
      isJoinSpecification: true,
    },
    connectorValue,
    {
      inputHistory: [],
      orderNo: 0,
      customized: false,
      displayName: '型号',
      systemFieldName: '型号',
      attributeId: '3',
      isJoinSpecification: true,
      value: '3',
    },
  ],
  mergeData: [],
}

/**
 * 新增样品：系统字段变更、显示名称重复
 */
export const testData_3: TestData = {
  otherInfos: [
    ...testSpecifications,
    {
      inputHistory: [],
      orderNo: 0,
      customized: false,
      displayName: '规格型号',
      systemFieldName: '规格',
      attributeId: '10',
      isJoinSpecification: true,
      value: '1',
    },
  ],
  specificationConfig: [],
  lastSaveData: [
    {
      inputHistory: [],
      orderNo: 0,
      customized: false,
      displayName: '型号',
      systemFieldName: '型号',
      attributeId: '3',
      isJoinSpecification: true,
      value: '3',
    },
    {
      ...DEFAULT_VALUE,
      displayName: '规格型号',
      value: '111',
    },
    {
      inputHistory: [],
      orderNo: 2,
      displayName: '标号',
      systemFieldName: '标号',
      isJoinSpecification: true,
      attributeId: '2',
      customized: false,
      value: '222',
    },
  ],
  mergeData: [
    {
      inputHistory: [],
      orderNo: 1,
      displayName: '等级',
      systemFieldName: '等级',
      isJoinSpecification: true,
      attributeId: '1',
      customized: false,
      value: '1',
    },
    connectorValue,
    {
      inputHistory: ['C20'],
      orderNo: 3,
      displayName: '型号',
      systemFieldName: '名称',
      isJoinSpecification: true,
      attributeId: '3',
      customized: false,
      value: '3',
    },
    {
      inputHistory: [],
      orderNo: 0,
      customized: false,
      displayName: '规格型号',
      systemFieldName: '规格',
      attributeId: '10',
      isJoinSpecification: true,
      value: '111',
    },
    {
      inputHistory: [],
      orderNo: 2,
      displayName: '标号',
      systemFieldName: '不定义',
      isJoinSpecification: true,
      attributeId: '2',
      customized: false,
      value: '222',
    },
  ],
}

// 编辑样品：存在新增、删除的数据
export const testData_4: TestData = {
  otherInfos: testSpecifications,
  specificationConfig: [
    {
      inputHistory: [],
      orderNo: 0,
      customized: true,
      displayName: '规格',
      attributeId: '00',
      value: '00',
      systemFieldName: '规格',
      isJoinSpecification: true,
    },
    connectorValue,
    {
      inputHistory: [],
      orderNo: 2,
      displayName: '标号',
      systemFieldName: '标号',
      isJoinSpecification: true,
      attributeId: '2',
      customized: false,
      value: '222',
    },
    connectorValue,
    {
      inputHistory: [],
      orderNo: 0,
      customized: false,
      displayName: '自定义',
      systemFieldName: '',
      attributeId: '',
      isJoinSpecification: false,
      deleteAble: true,
      value: 'test',
    },
    {
      inputHistory: [],
      orderNo: 3,
      displayName: '型号',
      systemFieldName: '型号',
      isJoinSpecification: true,
      attributeId: '3',
      customized: false,
      value: '333',
    },
  ],
  lastSaveData: [],
  mergeData: [
    {
      inputHistory: [],
      orderNo: 1,
      displayName: '等级',
      systemFieldName: '等级',
      isJoinSpecification: true,
      attributeId: '1',
      customized: false,
      value: '',
    },
    connectorValue,
    {
      inputHistory: [],
      orderNo: 0,
      customized: true,
      displayName: '规格',
      attributeId: '00',
      systemFieldName: '规格',
      isJoinSpecification: true,
      deleteAble: true,
      value: '00',
    },
    connectorValue,
    {
      inputHistory: [],
      orderNo: 2,
      displayName: '标号',
      systemFieldName: '不定义',
      isJoinSpecification: true,
      attributeId: '2',
      customized: false,
      value: '222',
    },
    connectorValue,
    {
      inputHistory: [],
      orderNo: 0,
      customized: false,
      displayName: '自定义',
      systemFieldName: '',
      attributeId: '',
      isJoinSpecification: false,
      deleteAble: true,
      value: 'test',
    },
    {
      inputHistory: ['C20'],
      orderNo: 3,
      displayName: '型号',
      systemFieldName: '名称',
      isJoinSpecification: true,
      attributeId: '3',
      customized: false,
      value: '333',
    },
  ],
}

// 编辑样品：系统字段变更、显示名称重复且id变更
export const testData_5: TestData = {
  otherInfos: [
    ...testSpecifications,
    {
      inputHistory: [],
      orderNo: 0,
      customized: false,
      displayName: '规格型号',
      systemFieldName: '规格',
      attributeId: '15',
      isJoinSpecification: true,
      value: '1',
    },
  ],
  specificationConfig: [
    {
      inputHistory: [],
      orderNo: 2,
      displayName: '型号',
      systemFieldName: '型号',
      isJoinSpecification: true,
      attributeId: '4',
      customized: false,
      value: '444',
    },
    connectorValue,
    {
      inputHistory: [],
      orderNo: 2,
      displayName: '标号',
      systemFieldName: '不定义',
      isJoinSpecification: true,
      attributeId: '2',
      customized: false,
      value: '222',
    },
    {
      ...DEFAULT_VALUE,
      displayName: '规格型号',
      value: '666',
    },
  ],
  lastSaveData: [],
  mergeData: [
    {
      inputHistory: [],
      orderNo: 1,
      displayName: '等级',
      systemFieldName: '等级',
      isJoinSpecification: true,
      attributeId: '1',
      customized: false,
      value: '',
    },
    connectorValue,
    {
      inputHistory: ['C20'],
      orderNo: 3,
      displayName: '型号',
      systemFieldName: '名称',
      isJoinSpecification: true,
      attributeId: '3',
      customized: false,
      value: '444',
    },
    connectorValue,
    {
      inputHistory: [],
      orderNo: 2,
      displayName: '标号',
      systemFieldName: '不定义',
      isJoinSpecification: true,
      attributeId: '2',
      customized: false,
      value: '222',
    },
    {
      inputHistory: [],
      orderNo: 0,
      customized: false,
      displayName: '规格型号',
      systemFieldName: '规格',
      attributeId: '15',
      isJoinSpecification: true,
      value: '666',
    },
  ],
}

// 编辑样品：不存在规格型号
export const testData_6: TestData = {
  otherInfos: [],
  specificationConfig: [
    {
      ...DEFAULT_VALUE,
      deleteAble: false,
      displayName: '规格型号',
      value: 'AAA',
    },
  ],
  lastSaveData: [],
  mergeData: [
    {
      ...DEFAULT_VALUE,
      deleteAble: true,
      displayName: '规格型号',
      value: 'AAA',
    },
  ],
}

// 编辑样品：新增时不存在规格型号，编辑时辅助信息更新，有了不同名的规格型号
export const testData_7: TestData = {
  otherInfos: [
    {
      inputHistory: [],
      orderNo: 1,
      displayName: '等级',
      systemFieldName: '等级',
      isJoinSpecification: true,
      attributeId: '1',
      customized: false,
      value: '1',
    },
  ],
  specificationConfig: [
    {
      ...DEFAULT_VALUE,
      deleteAble: false,
      displayName: '规格型号',
      value: 'AAA',
    },
  ],
  lastSaveData: [],
  mergeData: [
    {
      inputHistory: [],
      orderNo: 1,
      displayName: '等级',
      systemFieldName: '等级',
      isJoinSpecification: true,
      attributeId: '1',
      customized: false,
      value: '',
    },
    connectorValue,
    {
      ...DEFAULT_VALUE,
      deleteAble: true,
      displayName: '规格型号',
      value: 'AAA',
    },
  ],
}

// 编辑样品：新增时不存在规格型号，编辑时辅助信息更新，有了同名的规格型号
export const testData_8: TestData = {
  otherInfos: [
    {
      inputHistory: [],
      orderNo: 1,
      displayName: '规格型号',
      systemFieldName: '不定义',
      isJoinSpecification: true,
      attributeId: '1',
      customized: false,
      value: '2',
    },
  ],
  specificationConfig: [
    {
      ...DEFAULT_VALUE,
      deleteAble: false,
      displayName: '规格型号',
      value: 'AAA',
    },
  ],
  lastSaveData: [],
  mergeData: [
    {
      inputHistory: [],
      orderNo: 1,
      displayName: '规格型号',
      systemFieldName: '不定义',
      isJoinSpecification: true,
      attributeId: '1',
      customized: false,
      value: 'AAA',
    },
  ],
}
