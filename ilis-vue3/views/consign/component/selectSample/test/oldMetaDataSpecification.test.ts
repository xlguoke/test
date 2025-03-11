import { describe, expect, it } from 'vitest'
import { compatibilityOldMetaData } from '../utils/oldMetaDataSpecification'
import { DEFAULT_VALUE, connectorValue } from '../../selectSpecification'

/**
 * mockMetaData：模拟的元数据，辅助信息只模拟了必要的数据，其他无关数据无需模拟
 * mockSpecificationConfig: 还原后的规格型号明细，并按拼接值排序
 */
const mockMetaData_1: any = {
  otherInfos: [
    {
      systemFieldName: '标号',
      isJoinSpecification: true,
      value: 'CS001',
    },
    {
      systemFieldName: '规格',
      isJoinSpecification: true,
      value: 'C30',
    },
  ],
  model: '', // 型号
  specification: 'C30', // 规格
  grade: '', // 等级
  label: 'CS001', // 标号
  standard: 'C30 CS001 666', // 拼接值
}
const mockSpecificationConfig_1 = [
  {
    systemFieldName: '规格',
    isJoinSpecification: true,
    value: 'C30',
  },
  {
    // 连接符
    ...connectorValue,
  },
  {
    systemFieldName: '标号',
    isJoinSpecification: true,
    value: 'CS001',
  },
  {
    ...connectorValue,
  },
  {
    // 自定义
    ...DEFAULT_VALUE,
    value: '666',
  },
]

const mockMetaData_2: any = {
  otherInfos: [
    {
      systemFieldName: '规格',
      isJoinSpecification: true,
      value: 'C30',
    },
    {
      systemFieldName: '标号',
      isJoinSpecification: true,
      value: 'CS001 666',
    },
  ],
  model: '', // 型号
  specification: 'C30', // 规格
  grade: '', // 等级
  label: 'CS001 666', // 标号
  standard: 'XXX C30 CS001 666', // 拼接值
}
const mockSpecificationConfig_2 = [
  {
    ...DEFAULT_VALUE,
    value: 'XXX',
  },
  {
    ...connectorValue,
  },
  {
    systemFieldName: '规格',
    isJoinSpecification: true,
    value: 'C30',
  },
  {
    ...connectorValue,
  },
  {
    systemFieldName: '标号',
    isJoinSpecification: true,
    value: 'CS001 666',
  },
]

const mockMetaData_3: any = {
  otherInfos: [
    {
      systemFieldName: '规格',
      isJoinSpecification: true,
      value: 'C30',
    },
    {
      systemFieldName: '标号',
      isJoinSpecification: true,
      value: '',
    },
  ],
  model: '', // 型号
  specification: 'C30', // 规格
  grade: '', // 等级
  label: 'CS001 666', // 标号
  standard: 'C30 CS001 666', // 拼接值
}
const mockSpecificationConfig_3 = [
  {
    systemFieldName: '规格',
    isJoinSpecification: true,
    value: 'C30',
  },
  {
    ...connectorValue,
  },
  {
    systemFieldName: '标号',
    isJoinSpecification: true,
    value: 'CS001 666',
  },
]

const mockMetaData_4: any = {
  otherInfos: [],
  model: '', // 型号
  specification: 'C30', // 规格
  grade: '', // 等级
  label: 'CS001 666', // 标号
  standard: 'C30 CS001 666', // 拼接值
}
const mockSpecificationConfig_4 = [
  {
    ...DEFAULT_VALUE,
    deleteAble: false,
    displayName: '规格型号',
    value: 'C30 CS001 666',
  },
]

const mockMetaData_5: any = {
  otherInfos: [
    {
      displayName: '规格型号',
      systemFieldName: '规格',
      isJoinSpecification: true,
      value: '',
    },
  ],
  model: '', // 型号
  specification: '', // 规格
  grade: '', // 等级
  label: '', // 标号
  standard: 'C30 CS001', // 拼接值
}
const mockSpecificationConfig_5 = [
  {
    displayName: '规格型号',
    systemFieldName: '规格',
    isJoinSpecification: true,
    value: 'C30 CS001',
  },
]

const mockMetaData_6: any = {
  otherInfos: [
    {
      systemFieldName: '标号',
      isJoinSpecification: true,
      value: 'CS001',
    },
    {
      systemFieldName: '规格',
      isJoinSpecification: true,
      value: 'C30',
    },
  ],
  model: '', // 型号
  specification: 'C30', // 规格
  grade: '', // 等级
  label: 'CS001', // 标号
  standard: 'C30-CS001', // 拼接值
}
const mockSpecificationConfig_6 = [
  {
    systemFieldName: '规格',
    isJoinSpecification: true,
    value: 'C30',
  },
  {
    ...DEFAULT_VALUE,
    value: '-',
  },
  {
    systemFieldName: '标号',
    isJoinSpecification: true,
    value: 'CS001',
  },
]

const mockMetaData_7: any = {
  otherInfos: [
    {
      systemFieldName: '规格',
      isJoinSpecification: true,
      value: 'GBZJ350×450×54',
    },
    {
      systemFieldName: '等级',
      isJoinSpecification: true,
      value: '（CR） #$%&@',
    },
  ],
  model: '', // 型号
  specification: 'GBZJ350×450×54', // 规格
  grade: '（CR） #$%&@', // 等级
  label: '', // 标号
  standard: 'GBZJ350×450×54 （CR） #$%&@', // 拼接值
}
const mockSpecificationConfig_7 = [
  {
    systemFieldName: '规格',
    isJoinSpecification: true,
    value: 'GBZJ350×450×54',
  },
  {
    // 连接符
    ...connectorValue,
  },
  {
    systemFieldName: '等级',
    isJoinSpecification: true,
    value: '（CR） #$%&@',
  },
]

describe('specifications Model historical data compatible', () => {
  // 输入值中不带空格
  it('test compatibilityOldMetaData 1', () => {
    const data = compatibilityOldMetaData(mockMetaData_1)
    expect(data).toEqual(mockSpecificationConfig_1)
  })

  // 输入值中带空格
  it('test compatibilityOldMetaData 2', () => {
    const data = compatibilityOldMetaData(mockMetaData_2)
    expect(data).toEqual(mockSpecificationConfig_2)
  })

  // 元数据中规格型号保存了值，辅助信息（otherInfos）中对应的属性没有值
  it('test compatibilityOldMetaData 3', () => {
    const data = compatibilityOldMetaData(mockMetaData_3)
    expect(data).toEqual(mockSpecificationConfig_3)
    expect(mockMetaData_3.otherInfos[1].value).toEqual('CS001 666')
  })

  // 元数据中规格型号保存了值，辅助信息（otherInfos）中不存在规格型号属性
  it('test compatibilityOldMetaData 4', () => {
    const data = compatibilityOldMetaData(mockMetaData_4)
    expect(data).toEqual(mockSpecificationConfig_4)
  })

  // 存在拼接值，但规格型号全为空，辅助信息（otherInfos）存在显示名称为 “规格型号” 的属性
  it('test compatibilityOldMetaData 5', () => {
    const data = compatibilityOldMetaData(mockMetaData_5)
    expect(data).toEqual(mockSpecificationConfig_5)
  })

  // 自定义拼接符或无连接符，添加了自定义属性
  it('test compatibilityOldMetaData 6', () => {
    const data = compatibilityOldMetaData(mockMetaData_6)
    expect(data).toEqual(mockSpecificationConfig_6)
  })

  // 特殊字符
  it('test compatibilityOldMetaData 7', () => {
    const data = compatibilityOldMetaData(mockMetaData_7)
    expect(data).toEqual(mockSpecificationConfig_7)
  })
})
