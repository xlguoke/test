<template>
  <div class="flex flex-col mr-[16px] border-r-[10px] border-gray-100">
    <a-space>
      <a-button type="primary" @click="showModal(false)">
        添加
      </a-button>
      <a-button :disabled="isDisabledEdit" @click="showModal(true)">
        编辑
      </a-button>
      <a-button
        :disabled="isDisabledDel"
        danger
        :loading="delLoading"
        @click="showDelete"
      >
        删除
      </a-button>
    </a-space>

    <div class="flex-1 mt-3 h-0 overflow-auto pr-4">
      <a-tree
        v-model:selected-keys="selectedKeys"
        show-line
        :tree-data="treeData"
        block-node
        @select="onSelect"
      />
    </div>

    <a-modal
      v-model:open="visible"
      :title="isEdit ? '编辑规程分组' : '添加规程分组'"
      :mask-closable="false"
      :confirm-loading="confirmLoading"
      @ok="typeOk"
      @cancel="typeCancel"
    >
      <div class="pt-6 h-[150px]">
        <a-form
          ref="formRef"
          :model="form"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-form-item
            label="规程分组名称"
            name="treeName"
            :rules="[
              { required: true, message: '请输入规程分组名称' },
              { validator: validateRepeat },
            ]"
          >
            <a-input v-model:value="form.treeName" allow-clear placeholder="请输入规程分组名称" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { Modal, message } from 'ant-design-vue'
import type { Key } from 'ant-design-vue/es/_util/type'
import type { Rule } from 'ant-design-vue/es/form'
import { deleteStandardTypeApi, saveStandardTypeApi, treeListApi } from '../api'
import type { SaveParam, StandardGroupType } from '../api'

export interface TreeData extends StandardGroupType {
  title: string
  key: string
  value: string
  children: TreeData[]
}

const emits = defineEmits<{
  (e: 'select', data?: TreeData): void
}>()
const treeData = ref<TreeData[]>([])
const isEdit = ref(false)
const visible = ref(false)
const isDisabledDel = ref(false)
const isDisabledEdit = ref(false)
const selectedRow = ref<TreeData>()
const selectedKeys = ref<Key[]>([])
const form = ref({
  treeName: '',
})

/** 名称重复校验 */
function validateRepeat(_rule: Rule, value: string) {
  if (checkRepeatName(value)) {
    return Promise.reject(new Error('规程分组名称已存在'))
  }
  return Promise.resolve()
}

onMounted(() => {
  getTreeList()
})

// 获取数据
async function getTreeList() {
  selectedRow.value = undefined
  selectedKeys.value = []
  const { data } = await treeListApi()
  treeData.value = renderTreeNodes(data.rows)
}

function checkRepeatName(name: string, datas?: TreeData[]) {
  const trees = datas || treeData.value
  for (let i = 0; i < trees.length; i++) {
    const d = trees[i]
    if (d.id !== selectedRow.value?.id && name === d.name) {
      return true
    }
    if (d.children && d.children.length) {
      return checkRepeatName(name, d.children)
    }
  }
  return false
}

/** 处理树形数据 */
function renderTreeNodes(data: StandardGroupType[]) {
  const list = []
  for (const keys in data) {
    const item = data[keys]
    if (item.children && item.children.length) {
      item.children = renderTreeNodes(item.children)
    }
    list.push({
      ...item,
      title: item.name,
      key: item.id,
      value: item.id,
    })
  }
  return list as TreeData[]
}

/** 新增/编辑 */
function showModal(bol: boolean) {
  if (bol && !selectedRow.value?.name) {
    return message.warning('请选择规程分组')
  }
  isEdit.value = bol
  form.value.treeName = (bol ? selectedRow.value?.name : '') as string
  visible.value = true
}

/** 删除 */
const delLoading = ref(false)
function showDelete() {
  if (!selectedRow.value) {
    return message.warning('请选择分组')
  }
  const id = selectedRow.value.id
  Modal.confirm({
    title: '提示',
    content: '确定要删除吗?',
    onOk() {
      delLoading.value = true
      deleteStandardTypeApi(id).then(() => {
        message.success('删除成功')
        delLoading.value = false
        getTreeList()
      }).catch(() => {
        delLoading.value = false
      })
    },
  })
}

/** 保存分组 */
const confirmLoading = ref(false)
const formRef = ref()
function typeOk() {
  formRef.value.validateFields().then(() => {
    confirmLoading.value = true
    const data: SaveParam = {
      'name': form.value.treeName,
      'parent.id': selectedRow.value?.id,
    }
    if (isEdit.value) {
      data['parent.id'] = selectedRow.value?.parentId
      data.id = selectedRow.value?.id as string
    }
    if (!data['parent.id']) {
      delete data['parent.id']
    }
    saveStandardTypeApi(data)
      .then(() => {
        message.success('保存成功')
        visible.value = false
        getTreeList()
      })
      .finally(() => {
        confirmLoading.value = false
      })
  })
}
function typeCancel() {
  visible.value = false
  formRef.value.resetFields()
}

/** 选择分组 */
function onSelect(_selectedKeys: Key[], info: any) {
  if (info.selected) {
    const treeRow = info.selectedNodes[0]
    isDisabledDel.value = false

    if (treeRow.children && treeRow.children.length > 0)
      isDisabledDel.value = true

    if (treeRow.sourceType === '1')
      isDisabledEdit.value = true
    else
      isDisabledEdit.value = false

    selectedRow.value = treeRow
    selectedKeys.value = [treeRow.id]
  }
  else {
    selectedRow.value = undefined
    selectedKeys.value = []
    isDisabledDel.value = true
  }
}

watch(() => selectedKeys.value, () => {
  emits('select', selectedRow.value)
})

defineExpose({
  refreshList: getTreeList,
})
</script>

<style>

</style>
