<!-- 变更规程分组 -->
<template>
  <a-modal
    v-model:open="visible"
    title="变更规程分组"
    :mask-closable="false"
    :keyboard="false"
    :confirm-loading="saveLoading"
    @ok="editType"
    @cancel="cancel"
  >
    <a-spin :spinning="spinning">
      <a-form
        ref="formRef"
        :model="form"
        class="pt-6 h-[150px]"
        :label-col="{ span: 12 }"
        :wrapper-col="{ span: 12 }"
      >
        <a-form-item
          label="将所选规程的规程分组统一设置为"
          name="standardTypeId"
          :rules="[{ required: true, message: '请选择规程分组' }]"
        >
          <a-tree-select
            v-model:value="form.standardTypeId"
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :tree-data="treeData"
            :field-names="{
              label: 'name',
              value: 'id',
              children: 'children',
            }"
            placeholder="请选择规程分组"
            tree-default-expand-all
            @change="onChangeType"
          />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { changeStandardTypeApi, treeListApi } from '../api'
import type { ChangeStandardTypeParams, StandardGroupType } from '../api'

const emits = defineEmits<{
  (e: 'success'): void
}>()

const visible = ref(false)
const saveLoading = ref(false)
const spinning = ref(false)
const treeData = ref<StandardGroupType[]>([])
const form = ref<ChangeStandardTypeParams>({
  standardTypeId: undefined,
  standardId: '',
})

function getTreeList() {
  spinning.value = true
  treeListApi().then((res) => {
    treeData.value = res.data.rows
    spinning.value = false
  }).catch(() => {
    spinning.value = false
  })
}

const formRef = ref()
function editType() {
  formRef.value.validateFields().then(() => {
    saveLoading.value = true
    changeStandardTypeApi(form.value).then(() => {
      message.success('修改成功')
      cancel()
      emits('success')
    }).catch(() => {
      saveLoading.value = false
    })
  })
}

function cancel() {
  visible.value = false
  formRef.value.resetFields()
}

function onChangeType() {}

function showModal(keys: string[]) {
  saveLoading.value = false
  visible.value = true
  form.value.standardId = keys.toString()
  getTreeList()
}

defineExpose({
  showModal,
})
</script>

<style>

</style>
