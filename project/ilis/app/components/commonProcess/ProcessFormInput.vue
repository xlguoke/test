<template>
  <a-select
    v-if="item.type.name === 'select'"
    v-model:value="value"
    :placeholder="`请选择${item.name}`"
    style="width:100%;"
  >
    <a-select-option v-for="(comItem, index) in item.data" :key="index" :value="comItem[item.dataField.value]">
      {{ comItem[item.dataField.name] }}
    </a-select-option>
  </a-select>
  <a-radio-group
    v-else-if="item.type.name === 'boolean'"
    v-model:value="value"
    :name="item.id"
  >
    <a-radio value="1">
      是
    </a-radio>
    <a-radio value="0">
      否
    </a-radio>
  </a-radio-group>
  <a-date-picker
    v-else-if="item.type.name === 'date'"
    v-model:value="value"
    :placeholder="`请选择${item.name}`"
    style="width:100%;"
    value-format="YYYY-MM-DD"
  />
  <a-input-number
    v-else-if="item.type.name === 'long'"
    v-model:value="value"
    :placeholder="`请输入${item.name}`"
    style="width:100%;"
  />
  <!-- 之所以不传业务id,是因为此处的表单是在工作流中动态配置的，传递了业务id会导致查回同一个二维码。可能存在配置多个附件类型的场景 -->
  <HtUploadFile
    v-else-if="item.type.name === 'file'"
    :business-type="BUSINES_TYPE.WORKFLOW_FORM_FILE"
    @get-data="value = $event.qrCodeUrl"
  />
  <a-input-group v-else-if="item.id === 'copyTo'" compact>
    <a-input
      v-model:value.trim="copyToVal"
      style="width: calc(100% - 60px)"
      placeholder="请选择抄送人"
      allow-clear
      readonly
    />
    <a-button @click="handleSelect">
      选择
    </a-button>
  </a-input-group>
  <a-input
    v-else
    v-model:value="value"
    :placeholder="`请输入${item.name}`"
    style="width:100%;"
  />
</template>

<script lang="ts" setup>
import type { CopyToPerson } from '.'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { BUSINES_TYPE, HtUploadFile } from '../htUploadFile'
import VMCallPersonSelector from '../selectorViaMethodCall/VMCallPersonSelector.vue'

export interface ChangeParam {
  item: any
  val: string
  data: any
}

const props = defineProps<{
  modelValue: any
  item: any
  /** 默认抄送人 */
  defaultCopyto?: CopyToPerson[]
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', val: any): void
  (e: 'change', data: ChangeParam): void
}>()

const value = ref(props.modelValue)
const copyToVal = ref('')
const personData = ref<CopyToPerson[]>([])

watch (
  () => props.modelValue,
  (val) => {
    value.value = val
  },
)

watch (
  () => value.value,
  (val) => {
    emits('update:modelValue', val)
    emits('change', { item: props.item, val, data: personData.value })
  },
)

watch (
  () => copyToVal.value,
  (val) => {
    if (!val)
      value.value = ''
  },
)

watch(() => props.defaultCopyto, (persons) => {
  if (!persons || !persons.length)
    return

  if (props.item.id !== 'copyTo') {
    return
  }

  copyToVal.value = persons.map(item => item.name).join(',')
  value.value = persons.map(item => item.account).join(',')
  personData.value = persons
})

async function handleSelect() {
  const res = await AnyDialogHelper.showSelector<CopyToPerson>(VMCallPersonSelector, {
    multiple: true,
    checkedRows: personData.value,
  })
  copyToVal.value = res.map(item => item.name).join(',')
  value.value = res.map(item => item.account).join(',')
  personData.value = res
}
</script>
