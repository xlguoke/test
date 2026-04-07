export const ocrResultMockData = [
  {
    page: 1,
    cells: [
      {
        text: '中冶检测认证有限公司',
        lt: [
          322,
          84,
        ],
        rt: [
          576,
          87,
        ],
        lb: [
          321,
          112,
        ],
        rb: [
          575,
          115,
        ],
        confidence: 0.9986767768859863,
      },
    ],
  },
  {
    page: 2,
    cells: [
      {
        text: '中冶检测认证有限公司',
        lt: [
          363,
          84,
        ],
        rt: [
          536,
          84,
        ],
        lb: [
          363,
          107,
        ],
        rb: [
          536,
          107,
        ],
        confidence: 0.9992339015007019,
      },
    ],
  },
] as IOrcResult[]

/**
 * # ocr单元格数据接口
 */
export interface OcrCellItem {
  text: string
  lt: [
    number,
    number,
  ]
  rt: [
    number,
    number,
  ]
  lb: [
    number,
    number,
  ]
  rb: [
    number,
    number,
  ]
  confidence: number
}

/**
 * # ocr结果查询-返回结果接口
 */
export interface IOrcResult {
  page: number
  cells: OcrCellItem[]
}

/**
 * # ocr业务类型枚举
 */
export enum OcrBusinessType {
  /**
   * # 设备检校证书
   */
  EQUIPMENT_CERT = 'EQUIPMENT_CERT',
}

/**
 * # ocr结果查询-请求参数接口
 */
export interface IOcrQueryParams {
  /**
   * # 业务类型
   */
  businessType: OcrBusinessType
  /**
   * # 业务id
   */
  businessId: string | number
}
