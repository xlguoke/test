import { EFormItemType } from '../../enum/EFormItemType'
import InputArea from './InputArea.vue'
import InputCheckBox from './InputCheckBox.vue'
import InputDate from './InputDate.vue'
import InputDateRange from './InputDateRange.vue'
import InputDateTime from './InputDateTime.vue'
import InputDateTimeRange from './InputDateTimeRange.vue'
import InputNumber from './InputNumber.vue'
import InputRadio from './InputRadio.vue'
import InputSelect from './InputSelect.vue'
import InputString from './InputString.vue'
import InputSwitch from './InputSwitch.vue'
import InputSelector from './InputSelector.vue'

type FormItemTypeMapping = {
  [K in EFormItemType]: any;
}

// const InputString = defineAsyncComponent(() => import('./InputString.vue'))
// const InputNumber = defineAsyncComponent(() => import('./InputNumber.vue'))
// const InputSelect = defineAsyncComponent(() => import('./InputSelect.vue'))
// const InputArea = defineAsyncComponent(() => import('./InputArea.vue'))
// const InputCheckBox = defineAsyncComponent(() => import('./InputCheckBox.vue'))
// const InputRadio = defineAsyncComponent(() => import('./InputRadio.vue'))
// const InputSwitch = defineAsyncComponent(() => import('./InputSwitch.vue'))
// const InputDate = defineAsyncComponent(() => import('./InputDate.vue'))
// const InputDateRange = defineAsyncComponent(() => import('./InputDateRange.vue'))
// const InputDateTime = defineAsyncComponent(() => import('./InputDateTime.vue'))
// const InputDateTimeRange = defineAsyncComponent(() => import('./InputDateTimeRange.vue'))

export const componentsMap: FormItemTypeMapping = {
  [EFormItemType.INPUT]: InputString,
  [EFormItemType.INPUT_NUMBER]: InputNumber,
  [EFormItemType.INPUT_SELECTOR]: InputSelector,
  [EFormItemType.SELECT]: InputSelect,
  [EFormItemType.TEXTAREA]: InputArea,
  [EFormItemType.CHECKBOX]: InputCheckBox,
  [EFormItemType.RADIO]: InputRadio,
  [EFormItemType.SWITCH]: InputSwitch,
  [EFormItemType.DATE]: InputDate,
  [EFormItemType.DATETIME]: InputDateTime,
  [EFormItemType.DATE_RANGE]: InputDateRange,
  [EFormItemType.DATETIME_RANGE]: InputDateTimeRange,
}
