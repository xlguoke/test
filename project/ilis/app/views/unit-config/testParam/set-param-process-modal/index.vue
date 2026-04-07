<template>
  <div>
    <ht-modal
      v-model:open="internalOpen"
      title="设置参数过程信息"
      fixed-height
      width="90%"
      :loading="loading"
      :after-close="onClosed"
      @ok="handleOk"
    >
      <div class="h-full flex gap-3">
        <!-- 左侧参数列表 -->
        <div class="w-[40%] min-w-[300px]">
          <ParamSelector
            :rows="props.param.rows"
            :big-category-id="props.param.bigCategoryId"
            :param-version-id="props.param.paramVersionId"
            @change="handleParamChange"
          />
        </div>

        <!-- 右侧参数过程信息 -->
        <div class="flex-1 flex flex-col gap-3 min-w-[50%]">
          <!-- 搜索区域 -->
          <a-form layout="inline">
            <a-form-item>
              <a-input
                v-model:value="initQuery.paramName"
                placeholder="请输入参数名称"
                class="w-[300px]"
                @press-enter="handleSearch"
              />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleSearch">
                  查询
                </a-button>
                <a-button
                  @click="() => {
                    initQuery.paramName = ''
                    handleReset(initQuery)
                  }"
                >
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>

          <a-space>
            <a-button type="primary" @click="openAddModal">
              新增
            </a-button>
            <a-button @click="handleSync">
              同步
            </a-button>
          </a-space>

          <!-- 表格区域 -->
          <div ref="tableBoxRef" class="flex-1 h-0">
            <IlisTable
              row-key="id"

              :entity="ParamProcessEntity"
              :data-source="dataSource"
              :table-height="tableHeight"
              :pagination="getPagination()"
              :row-selection="getRowSelection()"
              resizable
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'dataType'">
                  <span>{{ DataTypeDict.getLabelByKey(record.dataType) }}</span>
                </template>
                <template v-else-if="column.dataIndex === 'action'">
                  <IlisTableAction :row="record" :options="actionItems"></IlisTableAction>
                </template>
              </template>
            </IlisTable>
          </div>
        </div>
      </div>
    </ht-modal>
  </div>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { ITestParamDTO } from '~/api/unit-config/test-param/types'
import type { ITableActionItem } from '~/interface/ITableActionItem'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { DataTypeDict, deleteParamProcessApi, getParamProcessListApi, syncParamProcessApi } from '~/api/unit-config/test-param'
import { useTableHooks } from '~/hooks/useTableHooks'
import ParamProcessModal from './components/ParamProcessModal.vue'
import ParamSelector from './components/ParamSelector.vue'
import { ParamProcessEntity } from './entity/ParamProcessEntity'

/**
 * # 弹窗参数接口
 */
interface IParam {
  bigCategoryId?: string
  paramVersionId?: string
  rows?: ITestParamDTO[]
}

/**
 * # 弹窗返回值类型
 */
type TResult = ITestParamDTO[] | null

const props = defineProps<IDialogPropsParam<TResult, IParam>>()

/** 弹窗显示状态 */
const internalOpen = ref(true)

/** 选中的参数ID列表 */
const selectedParamIds = ref<string[]>([])

/** 选中的参数数据 */
const selectedParams = ref<ITestParamDTO[]>([])

/** 查询参数 */
const initQuery = ref({
  paramName: '',
  testParamIds: '',
})

/**
 * # 使用 useTableHooks 管理表格状态
 */
const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  getPagination,
  getRowSelection,
  handleSearch,
  handleReset,
  handleReloadTable,
  handleDelete,
} = useTableHooks<ParamProcessEntity>({
  api: getParamProcessListApi,
  delApi: rows => deleteParamProcessApi(rows.map(item => item.id).join(',')),
  initialPage: 0,
  payload: initQuery.value,
  immediate: false,
  responseDataTransform: (res: any) => {
    return {
      rows: res.content,
      total: res.totalElements,
    }
  },
})

/**
 * # 处理参数选择变化
 */
function handleParamChange(data: { ids: string[], params: ITestParamDTO[] }) {
  selectedParamIds.value = data.ids
  selectedParams.value = data.params

  if (data.ids.length === 0) {
    initQuery.value.testParamIds = ''
    return
  }

  initQuery.value.testParamIds = data.ids.join(',')
  handleSearch()
}

/**
 * # 打开新增弹窗
 */
async function openAddModal() {
  if (selectedParams.value.length === 0) {
    message.warning('请先选择参数')
    return
  }

  const result = await AnyDialogHelper.showModel<boolean>(ParamProcessModal, {
    isEdit: false,
    rows: selectedParams.value,
  })
  if (result) {
    handleReloadTable()
  }
}

/**
 * # 打开编辑弹窗
 */
async function openEditModal(row: ParamProcessEntity) {
  const result = await AnyDialogHelper.showModel<boolean>(ParamProcessModal, {
    isEdit: true,
    id: row.id,
  })
  if (result) {
    handleReloadTable()
  }
}

/**
 * # 处理同步
 */
async function handleSync() {
  if (selectedParamIds.value.length === 0) {
    message.warning('请先选择参数')
    return
  }

  try {
    await syncParamProcessApi(selectedParamIds.value)
    message.success('同步成功')
    handleReloadTable()
  }
  catch (error) {
    message.error('同步失败')
    console.error(error)
  }
}

/**
 * # 操作列配置
 */
const actionItems: ITableActionItem<ParamProcessEntity>[] = [
  {
    label: '编辑',
    fn: row => openEditModal(row),
  },
  {
    label: '删除',
    danger: true,
    fn: row => handleDelete([row]),
  },
]

/**
 * # 处理确认
 */
function handleOk() {
  internalOpen.value = false
  props.onConfirm(props.param.rows || [])
}
</script>
