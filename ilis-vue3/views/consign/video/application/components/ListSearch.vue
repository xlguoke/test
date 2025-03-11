<template>
  <a-form
    ref="formRef"
    :model="form"
    layout="inline"
    @submit="handleSearch"
  >
    <a-form-item name="videoType">
      <a-select
        v-model:value="form.videoType"
        allow-clear
        style="width: 180px"
        placeholder="视频类型"
        data-test="videoType"
        @change="handleSearch"
      >
        <a-select-option v-for="(d, i) in VIDEO_TYPE_DICT" :key="i" :value="d.key">
          {{ d.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-if="status === 'done'" name="status">
      <a-select
        v-model:value="form.status"
        allow-clear
        style="width: 180px"
        placeholder="审核结果"
        data-test="status"
        @change="handleSearch"
      >
        <a-select-option v-for="(d, i) in AUDIT_STATUS_OPTIONS" :key="i" :value="d.key">
          {{ d.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item name="applicationDate">
      <a-range-picker
        v-model:value="form.applicationDate"
        value-format="YYYY-MM-DD"
        :placeholder="['申请日期', '申请日期']"
        @change="handleSearch"
      />
    </a-form-item>
    <a-form-item v-if="status === 'done'" name="reviewerDate">
      <a-range-picker
        v-model:value="form.reviewerDate"
        value-format="YYYY-MM-DD"
        :placeholder="['审核日期', '审核日期']"
        @change="handleSearch"
      />
    </a-form-item>
    <a-form-item name="quickQryParam">
      <a-input
        v-model:value="form.quickQryParam"
        allow-clear
        placeholder="委托单位/申请人"
        data-test="quickQryParam"
      />
    </a-form-item>
    <a-form-item v-if="status === 'done'" name="auditPerson">
      <a-input
        v-model:value="form.reviewer"
        allow-clear
        placeholder="审核人"
        data-test="reviewer"
      />
    </a-form-item>
    <a-form-item name="reportNumber">
      <a-input
        v-model:value="form.reportNumber"
        allow-clear
        placeholder="报告编号"
        data-test="reportNumber"
      />
    </a-form-item>
    <a-form-item>
      <a-space>
        <a-button type="primary" html-type="submit">
          搜索
        </a-button>
        <a-button data-test="resetBtn" @click="resetSearch">
          重置
        </a-button>
      </a-space>
    </a-form-item>
  </a-form>
</template>

<script setup lang='ts'>
import { reactive } from 'vue'
import type { PropType } from 'vue'
import type { Query } from '../api'
import { AUDIT_STATUS, AUDIT_STATUS_DICT, VIDEO_TYPE_DICT } from '..'

const props = defineProps({
  status: {
    type: String as PropType<'pending' | 'done'>,
    default: '',
  },
})
const emits = defineEmits<{
  (e: 'search', data: Query): void
  (e: 'reset', data: Query): void
}>()

const AUDIT_STATUS_OPTIONS = AUDIT_STATUS_DICT.exclude([AUDIT_STATUS.CREATE])
const formRef = ref()
const form = reactive<Query>({
  queryType: props.status === 'pending',
})

function handleSearch() {
  emits('search', form)
}
async function resetSearch() {
  await formRef.value.resetFields()
  emits('reset', form)
}
</script>

<style scoped>
.ant-form-item{
  margin-bottom: 4px;
}
</style>
