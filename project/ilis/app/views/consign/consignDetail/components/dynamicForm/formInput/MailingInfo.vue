<!-- 选择邮寄信息： 报告发放方式为邮寄时显示 -->
<template>
  <a-input-group compact>
    <a-select
      v-model:value="value"
      style="width: calc(100% - 52px)"
      :disabled="props.disabled"
      allow-clear
      show-search
      :placeholder="disabled ? '' : `请选择${props.layoutItem.fieldName}`"
      :filter-option="filterOption"
      :options="mailOptions"
      @change="handleChange"
    ></a-select>
    <a-button class="h-full W-[52px]" type="primary" :disabled="props.disabled" @click="handleSelect">
      选择
    </a-button>
  </a-input-group>
</template>

<script setup lang="ts">
import type { IndustryLayoutConfig } from '~/api/consign/consign-form-layout/types'
import type { IMailInfoDTO } from '~/api/consign/consign-management/types'
import type { ConfirmResult } from '~/components/IframeLayer.vue'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'

import { getMailInfoApi } from '~/api/consign/consign-management'
import IframeLayer from '~/components/IframeLayer.vue'

const props = defineProps<{
  /** # 双向数据绑定 */
  modelValue: any
  /** # 禁用状态 */
  disabled?: boolean
  /** # 字段布局配置 */
  layoutItem: IndustryLayoutConfig
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'change', data: any): void
}>()

const value = computed({
  get: () => props.modelValue || undefined,
  set: (val) => {
    emits('update:modelValue', val)
  },
})

const mailOptions = ref<IMailInfoDTO[]>([])

function filterOption(input: string, option: any) {
  return option.address.toLowerCase().includes(input.trim().toLowerCase())
}

function handleChange(_value: any, option: any) {
  emits('change', option)
}

function handleSelect() {
  AnyDialogHelper.showModel(IframeLayer, {
    title: '选择邮寄项目',
    url: '/ilis2/reportController.do?goPostInfo&selectPage=1&editIds=',
    onConfirm: (res: ConfirmResult) => {
      if (!res)
        return

      const selecteds = res.iframeWindow?.getSelectData()
      if (!selecteds || !selecteds.length)
        return message.error('请选择邮寄项目')

      const data = selecteds[0]
      const item = mailOptions.value.find(d => d.id === data.id)
      data.value = data.id
      data.label = data.address
      if (!item)
        mailOptions.value.unshift(data)
      res.close()
      emits('update:modelValue', data.id)
      emits('change', data)
    },
  })
}

async function getOptions(postId?: string) {
  const { data } = await getMailInfoApi(postId).finally(() => {})

  mailOptions.value = data.rows.map(d => ({
    ...d,
    value: d.id,
    label: d.address,
  }))
  return mailOptions.value.find(d => d.id === postId)
}

watch(() => value.value, (val) => {
  getOptions(val)
}, {
  immediate: true,
})
</script>
