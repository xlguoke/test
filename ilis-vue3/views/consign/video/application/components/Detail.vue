<template>
  <a-modal
    v-model:open="visible"
    :title="title"
    :keyboard="false"
    :mask-closable="false"
    centered
    width="600px"
  >
    <template #footer>
      <a-button @click="visible = false">
        关闭
      </a-button>
    </template>
    <a-spin :spinning="spinning">
      <BaseTitle v-if="showType === 'audit'" tilte="申请信息" class="mt-6" />
      <a-form v-bind="formItemLayout">
        <a-form-item label="委托单位">
          {{ form?.consignUnit }}
        </a-form-item>
        <a-form-item label="工程项目">
          {{ form?.project }}
        </a-form-item>
        <a-form-item label="报告编号">
          {{ form?.reportNumber }}
        </a-form-item>
        <a-form-item label="视频类型">
          {{ form?.videoType }}
        </a-form-item>
        <a-form-item label="申请人">
          {{ form?.applicant }}
        </a-form-item>
        <a-form-item label="申请日期">
          {{ form?.applicationDate ? useDateFormat(form.applicationDate, 'YYYY-MM-DD') : '' }}
        </a-form-item>
        <a-form-item label="申请说明">
          {{ form?.remark }}
        </a-form-item>
      </a-form>
      <template v-if="showType === 'audit'">
        <BaseTitle tilte="审核信息" class="mt-6" />
        <a-form v-bind="formItemLayout">
          <a-form-item label="审核人">
            {{ form?.reviewer }}
          </a-form-item>
          <a-form-item label="审核结果">
            {{ form?.status ? AUDIT_STATUS_DICT.getLabelByKey(form.status) : '' }}
          </a-form-item>
          <a-form-item label="审核日期">
            {{ form?.reviewerDate ? useDateFormat(form.reviewerDate, 'YYYY-MM-DD') : '' }}
          </a-form-item>
          <a-form-item label="审核说明">
            {{ form?.opinion }}
          </a-form-item>
        </a-form>
      </template>
    </a-spin>
  </a-modal>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import { ref } from 'vue'
import { useDateFormat } from '@vueuse/core'
import { type DataSource, detailApi } from '../api'
import { AUDIT_STATUS_DICT, VIDEO_TYPE_DICT } from '../'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '详情',
  },
  // 显示类型
  showType: {
    type: String as PropType<'apply' | 'audit'>,
    default: 'apply',
  },
  id: {
    type: String,
    required: true,
  },
})
const emits = defineEmits<{
  (e: 'update:show', val: boolean): void
}>()

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 19 },
}

const visible = ref(props.show)
const spinning = ref(false)
const form = ref<DataSource>()

function renderVideoType(type: string) {
  if (!type)
    return '--'
  const types = type.split(',')
  const typeNames = types.map(type => VIDEO_TYPE_DICT.getLabelByKey(type))
  return typeNames.join('、')
}

watch(() => props.show, (val) => {
  visible.value = val
})
watch(visible, (val) => {
  emits('update:show', val)
})

watch(() => props.id, async (id) => {
  spinning.value = true
  try {
    const { data } = await detailApi({ id })
    data.obj.videoType = renderVideoType(data.obj.videoType)
    form.value = data.obj
  }
  finally {
    spinning.value = false
  }
})
</script>

<style scoped>
.ant-form-item{
  margin-bottom: 4px;
}
:deep(.ant-form-item .ant-form-item-label >label){
  color: #999;
}
</style>
