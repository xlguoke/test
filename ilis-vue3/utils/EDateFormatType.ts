/**
 * # 日期格式化类型枚举
 */
export enum EDateFormatType {
  /**
   * YYYY-MM-DD HH:mm:ss
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY_MM_DD_HH_MM_SS)
   * ```
   * @description
   * ```ts
   * // 2021-08-31 10:00:00
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  YYYY_MM_DD_HH_MM_SS = 'YYYY-MM-DD HH:mm:ss',
  /**
   * YYYY-MM-DD HH:mm
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY_MM_DD_HH_MM)
   * ```
   * @description
   * ```ts
   * // 2021-08-31 10:00
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  YYYY_MM_DD_HH_MM = 'YYYY-MM-DD HH:mm',
  /**
   * YYYY-MM-DD
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY_MM_DD)
   * ```
   * @description
   * ```ts
   * // 2021-08-31
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  YYYY_MM_DD = 'YYYY-MM-DD',
  /**
   * YYYY-MM
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY_MM)
   * ```
   * @description
   * ```ts
   * // 2021-08
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  YYYY_MM = 'YYYY-MM',
  /**
   * YYYY
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY)
   * ```
   * @description
   * ```ts
   * // 2021
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  YYYY = 'YYYY',
  /**
   * YYYY年MM月DD日 HH时mm分ss秒
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY_MM_DD_HH_MM_SS_CN)
   * ```
   * @description
   * ```ts
   * // 2021年08月31日 10时00分00秒
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  YYYY_MM_DD_HH_MM_SS_CN = 'YYYY年MM月DD日 HH时mm分ss秒',
  /**
   * YYYY年MM月DD日 HH时mm分
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY_MM_DD_HH_MM_CN)
   * ```
   * @description
   * ```ts
   * // 2021年08月31日 10时00分
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  YYYY_MM_DD_HH_MM_CN = 'YYYY年MM月DD日 HH时mm分',
  /**
   * YYYY年MM月DD日
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY_MM_DD_CN)
   * ```
   * @description
   * ```ts
   * // 2021年08月31日
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  YYYY_MM_DD_CN = 'YYYY年MM月DD日',
  /**
   * YYYY年MM月
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY_MM_CN)
   * ```
   * @description
   * ```ts
   * // 2021年08月
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  YYYY_MM_CN = 'YYYY年MM月',
  /**
   * YYYY年
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY_CN)
   * ```
   * @description
   * ```ts
   * // 2021年
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  YYYY_CN = 'YYYY年',
  /**
   * MM月DD日
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.MM_DD_CN)
   * ```
   * @description
   * ```ts
   * // 08月31日
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  MM_DD_CN = 'MM月DD日',
  /**
   * HH时mm分ss秒
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.HH_MM_SS_CN)
   * ```
   * @description
   * ```ts
   * // 10时00分00秒
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  HH_MM_SS_CN = 'HH时mm分ss秒',
  /**
   * HH时mm分
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.HH_MM_CN)
   * ```
   * @description
   * ```ts
   * // 10时00分
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  HH_MM_CN = 'HH时mm分',
  /**
   * YYYY/MM/DD HH:mm:ss
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY_MM_DD_HH_MM_SS_SLASH)
   * ```
   * @description
   * ```ts
   * // 2021/08/31 10:00:00
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  YYYY_MM_DD_HH_MM_SS_SLASH = 'YYYY/MM/DD HH:mm:ss',
  /**
   * YYYY/MM/DD HH:mm
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY_MM_DD_HH_MM_SLASH)
   * ```
   * @description
   * ```ts
   * // 2021/08/31 10:00
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  YYYY_MM_DD_HH_MM_SLASH = 'YYYY/MM/DD HH:mm',
  /**
   * YYYY/MM/DD
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY_MM_DD_SLASH)
   * ```
   * @description
   * ```ts
   * // 2021/08/31
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  YYYY_MM_DD_SLASH = 'YYYY/MM/DD',
  /**
   * YYYY/MM
   * @example
   * ```ts
   * AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY_MM_SLASH)
   * ```
   * @description
   * ```ts
   * // 2021/08
   * ```
   * @see {@link AnyDateTimeHelper.format}
   */
  YYYY_MM_SLASH = 'YYYY/MM',
}
