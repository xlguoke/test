<template>
  <div class="flex flex-col" style="height: calc(100% + 16px)">
    <a-space>
      <a-button>一键开启</a-button>
      <a-button>一键关闭</a-button>
      <a-button>定时设置</a-button>
      <a-button>预约温湿度</a-button>
      <a-button>刷新读数</a-button>
    </a-space>

    <div ref="tableBoxRef" class="flex-1 overflow-auto mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :row-selection="getRowSelection()"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ x: 1200, y: tableHeight }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button type="link" size="small" @click="onClose(record)">
              关闭
            </a-button>
            <a-button type="link" size="small" @click="onSettingTempHum(record)">
              设置温湿度
            </a-button>
            <a-button type="link" size="small" @click="onReservation(record)">
              预约温湿度
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 设置温湿度 -->
    <SettingTempHum v-model:open="settingTempHumVisible" :data-source="editDataSource" @on-save="getList" />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import SettingTempHum from './SettingTempHum.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useTableHeight } from '~/hooks/useTableHeight'
import type { DataSource } from '~/views/unit-config/standard/api.ts'
import { pageListApi } from '~/views/unit-config/standard/api.ts'

const columns: ColumnType[] = [
  { title: '序号', dataIndex: 'index', width: 85, align: 'center' },
  { title: '设备名称', dataIndex: 'standardName', width: '12%' },
  { title: '温度数值（℃）', dataIndex: 'publishCode', width: '12%' },
  { title: '湿度数值（℃）', dataIndex: 'type', width: '12%' },
  { title: '标准温度区间（%RH）', dataIndex: 'BZWDQJ', width: '12%' },
  { title: '标准湿度区间（%RH）', dataIndex: 'BZSDQJ', width: '12%' },
  { title: '温度状态', dataIndex: 'WDZT', width: '10%' },
  { title: '湿度状态', dataIndex: 'SDZT', width: '10%' },
  { title: '设备状态', dataIndex: 'SBZT', width: '10%' },
  { title: '操作', dataIndex: 'action', width: 260 },
]

const { tableHeight, tableBoxRef } = useTableHeight()

const settingTempHumVisible = ref(false)

const editDataSource = ref({})

const queryForm = ref({
  quickQryParam: undefined,
  systemId: undefined,
  isChaobiao: false,
})

const {
  loading,
  dataSource,
  getList,
  getRowSelection,
  getPagination,
} = useTableHooks<DataSource>({
  api: pageListApi,
  query: queryForm,
})

function onClose(record) {
  // eslint-disable-next-line no-console
  console.log(record)
}

function onReservation(record) {
  // eslint-disable-next-line no-console
  console.log(record)
}

function onSettingTempHum(record) {
  editDataSource.value = { ...record }
  settingTempHumVisible.value = true
}
</script>
