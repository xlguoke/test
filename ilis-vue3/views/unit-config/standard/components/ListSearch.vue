<template>
  <a-form
    ref="formRef"
    :model="form"
    layout="inline"
    @submit="handleSearch"
  >
    <a-form-item name="quickQryParam">
      <a-input
        v-model:value="form.quickQryParam"
        style="width: 280px"
        allow-clear
        placeholder="输入规程名称/颁布号后回车即可查询"
        data-test="quickQuery"
      />
    </a-form-item>
    <a-form-item>
      <a-space>
        <a-button type="primary" html-type="submit">
          查询
        </a-button>
        <a-button data-test="resetBtn" @click="resetSearch">
          重置
        </a-button>
        <a-button data-test="advancedSearch" @click="advancedSearch">
          高级查询
        </a-button>
      </a-space>
    </a-form-item>
  </a-form>

  <a-modal
    v-model:open="visible"
    title="高级查询"
    :keyboard="false"
    :mask-closable="false"
    centered
    width="600px"
  >
    <a-form
      ref="advFormRef"
      :model="form2"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item label="规程名称" name="standardName">
        <a-input
          v-model:value="form2.standardName"
          allow-clear
          placeholder="请输入规程名称"
          data-test="standardName"
        />
      </a-form-item>
      <a-form-item label="颁布号" name="publishCode">
        <a-input
          v-model:value="form2.publishCode"
          allow-clear
          placeholder="请输入颁布号"
        />
      </a-form-item>
      <a-form-item label="是否系统规程" name="sourceType">
        <a-radio-group v-model:value="form2.sourceType">
          <a-radio v-for="(d, i) in SOURCE_TYPE_DICT" :key="i" :value="d.key">
            {{ d.label }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="是否为本单位规程" name="whetherThisUnit">
        <a-radio-group v-model:value="form2.whetherThisUnit">
          <a-radio v-for="(d, i) in BOOLEAN_DICT" :key="i" :value="d.key">
            {{ d.label }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="是否上传文件" name="isUploadFile">
        <a-radio-group v-model:value="form2.isUploadFile">
          <a-radio v-for="(d, i) in BOOLEAN_DICT" :key="i" :value="d.key">
            {{ d.label }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="cancel">
          关闭
        </a-button>
        <a-button data-test="resetBtn2" @click="resetSearch2">
          重置
        </a-button>
        <a-button type="primary" data-test="searchBtn2" @click="handleSearch2">
          查询
        </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import { reactive } from 'vue'
import type { Query } from '../api'
import { BOOLEAN_DICT, SOURCE_TYPE_DICT } from '..'

const emits = defineEmits<{
  (e: 'search', data: Query): void
  (e: 'reset', data: Query): void
}>()

const visible = ref(false)
const formRef = ref()
const form = reactive({
  standardTypeId: '',
  quickQryParam: '',
})
const form2 = reactive<Query>({
  standardTypeId: '',
  sourceType: '',
  whetherThisUnit: '',
  isUploadFile: '',
})

function handleSearch() {
  emits('search', form)
}
async function resetSearch() {
  await formRef.value.resetFields()
  emits('reset', form)
}

const advFormRef = ref()
function advancedSearch() {
  visible.value = true
}
function cancel() {
  visible.value = false
}
function handleSearch2() {
  emits('search', form2)
  cancel()
}
async function resetSearch2() {
  await advFormRef.value.resetFields()
  emits('reset', form2)
}
</script>
