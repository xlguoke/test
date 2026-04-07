import { EFormItemDynamicType } from '../../enum/EFormItemType'
import InputArea from './InputArea.vue'
import InputCheckBox from './InputCheckBox.vue'
import InputDate from './InputDate.vue'
import InputDateRange from './InputDateRange.vue'
import InputDateTime from './InputDateTime.vue'
import InputDateTimeRange from './InputDateTimeRange.vue'
import InputNumber from './InputNumber.vue'
import InputRadio from './InputRadio.vue'
import InputRange from './InputRange.vue'
import InputSelect from './InputSelect.vue'
import InputString from './InputString.vue'
import InputSwitch from './InputSwitch.vue'
import InputTreeSelect from './InputTreeSelect.vue'

type FormItemDynamicTypeMapping = {
  [K in EFormItemDynamicType]: any;
}

const InputSelector = () => import('./InputSelector.vue')

export const dynamicComponentsMap: FormItemDynamicTypeMapping = {
  [EFormItemDynamicType.INPUT]: InputString,
  [EFormItemDynamicType.INPUT_RANGE]: InputRange,
  [EFormItemDynamicType.INPUT_NUMBER]: InputNumber,
  [EFormItemDynamicType.INPUT_SELECTOR]: InputSelector,
  [EFormItemDynamicType.SELECT]: InputSelect,
  [EFormItemDynamicType.SELECT_MULTIPLE]: InputSelect,
  [EFormItemDynamicType.SELECT_INPUT]: InputSelect,
  [EFormItemDynamicType.TREE_SELECT]: InputTreeSelect,
  [EFormItemDynamicType.TEXTAREA]: h(InputArea, { rows: 1 } as any),
  [EFormItemDynamicType.CHECKBOX]: InputCheckBox,
  [EFormItemDynamicType.RADIO]: InputRadio,
  [EFormItemDynamicType.SWITCH]: InputSwitch,
  [EFormItemDynamicType.DATE]: InputDate,
  [EFormItemDynamicType.DATETIME]: InputDate,
  [EFormItemDynamicType.DATE_RANGE]: InputDateRange,
  [EFormItemDynamicType.DATETIME_RANGE]: InputDateRange,
  [EFormItemDynamicType.TIME]: InputDateTime,
  [EFormItemDynamicType.TIME_RANGE]: InputDateTimeRange,
  [EFormItemDynamicType.UPLOAD]: null,
}

/** ## 动态表单类型 */
export const dynamicFormTypeDict = [
  { label: '文本输入框', value: EFormItemDynamicType.INPUT },
  { label: '数字输入框', value: EFormItemDynamicType.INPUT_NUMBER },
  { label: '文本域', value: EFormItemDynamicType.TEXTAREA },
  { label: '下拉选择', value: EFormItemDynamicType.SELECT },
  { label: '下拉选择(多选)', value: EFormItemDynamicType.SELECT_MULTIPLE },
  { label: '下拉选择（可输可选）', value: EFormItemDynamicType.SELECT_INPUT },
  { label: '选择器', value: EFormItemDynamicType.INPUT_SELECTOR },
  { label: '日期选择', value: EFormItemDynamicType.DATE },
  { label: '日期范围选择', value: EFormItemDynamicType.DATE_RANGE },
  { label: '时间选择', value: EFormItemDynamicType.TIME },
  { label: '时间范围选择', value: EFormItemDynamicType.TIME_RANGE },
  { label: '日期时间选择', value: EFormItemDynamicType.DATETIME },
  { label: '日期时间范围选择', value: EFormItemDynamicType.DATETIME_RANGE },
  { label: '树选择', value: EFormItemDynamicType.TREE_SELECT },
  { label: '上传文件', value: EFormItemDynamicType.UPLOAD },
  { label: '单选框', value: EFormItemDynamicType.RADIO },
  { label: '复选框', value: EFormItemDynamicType.CHECKBOX },
  { label: '开关', value: EFormItemDynamicType.SWITCH },
]
