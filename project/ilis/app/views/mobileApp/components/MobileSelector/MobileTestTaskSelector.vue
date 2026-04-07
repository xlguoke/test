<template>
  <van-popup
    duration="0.2"
    position="right"
    :style="{ width: '90%', height: '100%' }"
    :show="open"
  >
    <div class="flex flex-col h-full">
      <MobileTitleBar title="选择检测任务" left-arrow @click-left="onCancel">
        <template #right>
          <SwitchIndustry @on-ok="onSearch" />
        </template>
      </MobileTitleBar>

      <van-search
        v-model.trim="keyword"
        :placeholder="queryPlaceholder"
        @search="onSearch"
      >
        <template #left>
          <select
            v-model="queryType"
            class="h-[32px] border mr-[8px] w-[88px] text-center"
            @change="() => {
              keyword = ''
            }"
          >
            <option :value="QueryType.快捷查询">
              快捷查询
            </option>
            <option :value="QueryType.工程项目">
              工程项目
            </option>
            <option :value="QueryType.委托单位">
              委托单位
            </option>
          </select>
        </template>
      </van-search>

      <div v-if="open" class="flex-1 min-h-0 overflow-y-auto p-4 border-t bg-[#f5f5f5]">
        <van-list
          v-model:loading="listLoading"
          v-model:error="listError"
          :finished="listFinished"
          error-text="请求失败，点击重新加载"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="item in list"
            :key="item[idField]"
            class="li-box"
            @click="onSelect(item)"
          >
            <van-checkbox
              :shape="enableMultiple ? 'square' : 'round'"
              :checked="selectedRowKeys.includes(item[idField])"
            ></van-checkbox>
            <div class="li-box-content">
              <p>任务编号：<b>{{ item.testTaskCode }}</b></p>
              <p>样品名称：{{ item.testSampleDisplayName }}</p>
              <p>样品编号：{{ item.testObjectCode }}</p>
            </div>
          </div>
        </van-list>
      </div>

      <div class="flex">
        <van-button block square @click="onCancel">
          取消
        </van-button>
        <van-button block type="primary" square @click="onConfirm">
          确定
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang='ts'>
import qs from 'qs'
import { computed } from 'vue'
import { getBusinessParam } from '~/utils/getBusinessParam.ts'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import SwitchIndustry from '~/views/mobileApp/components/switchIndustry/index.vue'
import { useListHooks } from '~/views/mobileApp/hooks/useListHooks'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest.ts'

enum QueryType {
  快捷查询 = 'quickQryParam',
  工程项目 = 'projectName',
  委托单位 = 'consignUnitName',
}

const props = defineProps({
  title: String,
  open: Boolean,
  // 默认key
  idField: {
    type: String,
    default: 'id',
  },
  placeholder: {
    type: String,
    default: '请输入关键字',
  },
  // 默认勾选项
  selectedRows: Object as PropType<any[]>,
  // 开启多选
  enableMultiple: Boolean,
  // 额外的查询参数
  payload: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
})

const emits = defineEmits(['update:open', 'select'])

const { listLoading, listFinished, listError, listPage, listPageSize } = useListHooks()

const idField = computed(() => props.idField)

const keyword = ref('')

const list = ref<any[]>([])

const selectedRows = ref<any[]>([])

const selectedRowKeys = computed(() => selectedRows.value.map(i => i[idField.value]))

const open = computed(() => props.open)

const TASK_PERFORMANCE_MODE = ref<boolean>()

const queryType = ref<QueryType>(QueryType.快捷查询)

const queryPlaceholder = computed(() => {
  if (queryType.value === QueryType.工程项目) {
    return '请输入工程项目'
  }
  if (queryType.value === QueryType.委托单位) {
    return '请输入委托单位'
  }
  return '请输入任务编号/样品编号/样品名称'
})

watch(open, (val) => {
  if (val) {
    // 弹窗打开时，从props初始化选中状态
    if (props.selectedRows && props.selectedRows.length > 0) {
      selectedRows.value = [...props.selectedRows]
    }
  }
  else {
    onCancel()
  }
})

function onSearch() {
  listPage.value = 0
  list.value = []
  listFinished.value = false
  listLoading.value = false
  onLoad()
}

async function onLoad() {
  listError.value = false

  if (TASK_PERFORMANCE_MODE.value === undefined) {
    TASK_PERFORMANCE_MODE.value = await getBusinessParam('TASK_PERFORMANCE_MODE')
  }

  listPage.value += 1
  listLoading.value = true

  const data: any = await mRequest.post(
    'testTaskController.do?datagrid',
    qs.stringify({
      page: listPage.value,
      rows: listPageSize.value,
      taskPerformanceMode: TASK_PERFORMANCE_MODE.value ? 'Y' : 'N',
      selectTask: true,
      [queryType.value]: keyword.value,
      ...props.payload,
    }),
    {
      params: {
        type: 1,
        queryScope: 'user',
        dataType: 1,
      },
    },
  ).finally(() => {
    listLoading.value = false
  }).catch(() => {
    listLoading.value = false
    listError.value = true
    listPage.value -= 1
  })

  if (!data) {
    return
  }

  const rows = data.rows || []

  if (rows.length) {
    list.value.push(...rows)
  }

  if (!rows.length || list.value.length >= data.total) {
    listFinished.value = true
  }
}

function onSelect(item: any) {
  if (props.enableMultiple) {
    if (selectedRowKeys.value.includes(item[idField.value])) {
      selectedRows.value = selectedRows.value.filter(i => i[idField.value] !== item[idField.value])
    }
    else {
      selectedRows.value.push(item)
    }
    return
  }

  if (selectedRowKeys.value.includes(item[idField.value])) {
    selectedRows.value = []
  }
  else {
    selectedRows.value = [item]
  }
}

function onCancel() {
  emits('update:open', false)

  list.value = []
  listError.value = false
  listLoading.value = false
  listFinished.value = false
  listPage.value = 0
  keyword.value = ''
  queryType.value = QueryType.快捷查询
}

function onConfirm() {
  emits('select', selectedRows.value, selectedRowKeys.value)
  onCancel()
}
</script>

<style lang="less" scoped>
.li-box {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 12px;
  background: #ffffff;
  box-shadow: 0px 0px 10px 0px rgba(0, 102, 236, 0.06);
  border-radius: 4px;

  .li-box-content {
    flex: 1;
    font-size: 14px;
    word-break: break-all;
  }
}
</style>
