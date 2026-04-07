import { EFeeDiscountMode } from '~/api/consign/consign-management'

/** ## 费用折扣模式字典 */
export const FEE_DISCOUNT_MODE_DICT = [
  {
    label: '附加费用不参与折扣计算',
    value: EFeeDiscountMode.NO,
  },
  {
    label: '附加费用参与折扣计算',
    value: EFeeDiscountMode.YES,
  },
]
