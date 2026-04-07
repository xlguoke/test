<template>
  <ilis-container app-id="project_manage">
    <div>
      <div class=" p-2 flex flex-col gap-3">
        <div class="flex items-center">
          <div class="w-[45%]">
            <base-title>项目列表</base-title>
            <a-flex :gap="4">
              <a-input v-model:value="query" placeholder="输入工程项目名称查询" style="line-height: 20px;" @press-enter="search"></a-input>
              <a-button type="primary" @click="search">
                查询
              </a-button>
            </a-flex>
          </div>
          <!-- 添加间距 -->
          <div class="w-[10%]"></div>
          <div class="w-[45%]">
            <base-title>即将合并</base-title>
            <a-alert type="info" show-icon message="请选择需要保留的工程项目" />
          </div>
        </div>
        <div>
          <a-transfer
            v-model:target-keys="targetKeys"
            v-model:selected-keys="selectedKeys"
            :data-source="dataSource"
            :render="item => item.title"
            :show-select-all="false"
            :list-style="{
              width: '45%',
              height: '200px',
            }"
            :operation-style="{
              padding: '20px',
              width: '9%',
              alignItems: 'center',
            }"
            @change="handleChange"
          >
            <template
              #children="{
                direction,
                filteredItems,
                disabled: listDisabled,
                onItemSelect,
              }"
            >
              <a-table
                :row-selection="
                  getRowSelection({
                    disabled: listDisabled,
                    onItemSelect,
                    direction,
                  })
                "
                :pagination="false"
                :scroll="{
                  y: 150,
                }"
                :columns="direction === 'left' ? leftColumns : rightColumns"
                :data-source="filteredItems"
                :size="customSize"
              />
            </template>
          </a-transfer>
        </div>
      </div>
      <div class="mb-2">
        <base-title>合并选项</base-title>
        <div class="flex gap-3">
          <a-checkbox v-model:checked="checkForm.witnessUnit">
            监理单位
          </a-checkbox>
          <a-checkbox v-model:checked="checkForm.projectWitness">
            见证人信息
          </a-checkbox>
          <a-checkbox v-model:checked="checkForm.constructionUnit">
            施工单位
          </a-checkbox>
          <a-checkbox v-model:checked="checkForm.consignUnit">
            委托单位
          </a-checkbox>
          <a-checkbox v-model:checked="checkForm.contract">
            工程项目合同段
          </a-checkbox>
        </div>
      </div>
    </div>
  </ilis-container>
</template>

<script lang="ts" setup>
import type { RowSelectionType } from 'ant-design-vue/es/table/interface'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
import { createVNode } from 'vue'
import { getProjectList, mergeProject } from './api.ts'

const query = ref('')
const dataSource = ref<any[]>([])
const allData = ref<any[]>([]) // 所有数据
const targetKeys = ref<string[]>([])
const confirmLoading = ref(false)

const customSize = ref<'small' | 'middle' | 'large'>('middle')
const leftTableColumns = [
  {
    dataIndex: 'title',
    title: 'name',
  },
]

const rightTableColumns = [
  {
    dataIndex: 'title',
    title: 'name',
  },
]

const leftColumns = ref<any[]>(leftTableColumns)
const rightColumns = ref<any[]>(rightTableColumns)

// 左侧选中项（多选）
const leftSelectedKeys = ref<string[]>([])
// 右侧选中项（单选）
const rightSelectedKey = ref<string | null>(null)
// 给 transfer 组件的 selected-keys（合并左右选中项）
const selectedKeysAuto = computed<string[]>(() => [
  ...leftSelectedKeys.value,
  ...(rightSelectedKey.value ? [rightSelectedKey.value] : []),
])
const selectedKeys = ref<string[]>([])

watch(() => selectedKeysAuto.value, (newValue) => {
  selectedKeys.value = newValue
})

const checkForm = ref({
  consignUnit: false,
  witnessUnit: false,
  constructionUnit: false,
  projectWitness: false,
  contract: false,
})

function handleChange(nextTargetKeys: string[], direction: string, moveKeys: string[]) {
  // 更新targetKeys的值
  targetKeys.value = nextTargetKeys
  // 当项目从右侧移回左侧时，如果该项目在右侧选中状态中，则清除右侧选中状态
  if (direction === 'left') {
    // 清除右侧行的选中状态
    if (rightSelectedKey.value && moveKeys.includes(rightSelectedKey.value)) {
      rightSelectedKey.value = null
    }
    // 清除左侧移动项的选中状态
    leftSelectedKeys.value = leftSelectedKeys.value.filter(key => !moveKeys.includes(key))
  }
  // 当项目移到右侧时，清除这些项目的左侧选中状态
  if (direction === 'right') {
    leftSelectedKeys.value = leftSelectedKeys.value.filter(key => !moveKeys.includes(key))
  }
}
// 获取父窗口并调用刷新方法
function refreshParentPage() {
  try {
    if (window.top && typeof window.top.reloadProjectDataGrid === 'function') {
      window.top.reloadProjectDataGrid()
    }
  }
  catch (error) {
    console.error('刷新父页面失败：', error)
  }
}

function getRowSelection({
  disabled,
  onItemSelect,
  direction,
}: Record<string, any>) {
  return {
    getCheckboxProps: () => ({ disabled }),
    onSelect: ({ key }: { key: string }, selected: boolean) => {
      if (direction === 'right') {
        // 右侧单选：直接更新右侧选中状态
        if (selected) {
          rightSelectedKey.value = key
        }
        else {
          rightSelectedKey.value = null
        }
        onItemSelect(key, selected)
      }
      else {
        // 左侧多选：更新左侧选中状态
        if (selected) {
          if (!leftSelectedKeys.value.includes(key)) {
            leftSelectedKeys.value.push(key)
          }
        }
        else {
          leftSelectedKeys.value = leftSelectedKeys.value.filter(k => k !== key)
        }
        onItemSelect(key, selected)
      }
    },
    selectedRowKeys: direction === 'left' ? leftSelectedKeys.value : (rightSelectedKey.value ? [rightSelectedKey.value] : []),
    type: direction === 'left' ? 'checkbox' : 'radio' as RowSelectionType,
  }
}

onMounted(async () => {
  initProjectList()
  window.projectMerage = handleProjectMerage
})

onUnmounted(() => {
  delete window.projectMerage
})
async function handleProjectMerage(layerIndex: any) {
  if (rightSelectedKey.value === null) {
    Modal.warning({
      title: '合并失败',
      content: '请选择要合并的项目！',
      okText: '确定',
    })
    return
  }
  if (targetKeys?.value.length < 2) {
    Modal.warning({
      title: '合并失败',
      content: '请至少选择两个工程项目进行合并！',
      okText: '确定',
    })
    return
  }
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '工程项目合并后将无法撤回，您确定要合并工程项目吗？',
    onOk: async () => {
      confirmLoading.value = true
      const fromProjectIds = targetKeys.value.filter(key => key !== rightSelectedKey.value)
      try {
        await mergeProject({
          projectId: rightSelectedKey.value || '', // 合并后保留的项目
          fromProjectIds: fromProjectIds.join(',') || '', // 待合并项目，合并成功后将删除
          mergeConsignUnit: checkForm.value.consignUnit,
          mergeWitnessUnit: checkForm.value.witnessUnit,
          mergeConstructionUnit: checkForm.value.constructionUnit,
          mergeProjectWitness: checkForm.value.projectWitness,
          mergeContract: checkForm.value.contract,
        })
        if (typeof window?.top?.layerSuccess === 'function') {
          window.top.layerSuccess('操作成功')
        }
        // 刷刷新工程项目列表
        refreshParentPage()
        // 同步委托单位
        asyncEditConsignRange(fromProjectIds, rightSelectedKey.value as string, () => {
          if (window && window.top) { // 等待接口响应后再关闭弹窗
            window.top.layer.close(layerIndex)
          }
        })
      }
      catch (error) {
        console.error(error)
      }
      finally {
        confirmLoading.value = false
      }
    },
    onCancel: () => {},
  })
}
function asyncEditConsignRange(fromProjectIds: string[], targetId: string, cb: any) {
  const projectIds = fromProjectIds?.join(',') ?? ''
  try {
    if (window.top && typeof window.top.editConsignRange === 'function') {
      window.top.editConsignRange(projectIds, targetId, cb)
    }
  }
  catch (error) {
    console.error('刷新父页面失败：', error)
  }
}
function initTargetProject() {
  const url = new URLSearchParams(window.location.search)
  const targetId = url?.get('targetId')
  if (targetId) {
    const targetProjectIndex = dataSource.value?.findIndex(item => item.key === targetId)
    if (targetProjectIndex !== -1) {
      // 设置右侧选中的项目
      targetKeys.value = [targetId]
      // 设置右侧列表选中项
      rightSelectedKey.value = targetId
    }
  }
}
async function initProjectList() {
  const res = await getProjectList({ quickQryParam: query.value, rows: 9999 })
  dataSource.value = res?.data?.rows?.map((item: any) => {
    return {
      key: item.id,
      title: item.name,
      description: item.description,
    }
  }) || []
  allData.value = dataSource.value
  initTargetProject()
}
function search() {
  const rightKeys = targetKeys.value
  leftSelectedKeys.value = []
  dataSource.value = allData.value.filter((item: any) => {
    // 总是显示右侧已选中的项目，无论是否匹配搜索条件
    return rightKeys.includes(item.key) || item.title.includes(query.value)
  })
}
</script>

<style scoped lang="less">
.footer {
  position: relative;
  top: 24px;
  right: 12px;
  display: flex;
  justify-content: flex-end;
}
:deep(.ant-btn.ant-btn-sm.ant-btn-icon-only) {
  width: 50px;
  height: 30px;
}
:deep(.ant-table-thead) {
  display: none;
}
</style>
