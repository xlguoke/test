<template>
  <div class="flex flex-col" style="height: calc(100% + 16px)">
    <a-space>
      <a-select
        v-model:value="queryForm.id"
        allow-clear
        style="width: 240px;"
        placeholder="功能室"
        :options="laboratoryOptions"
      />
      <a-button type="primary" html-type="submit" @click="handleSearch()">
        查询
      </a-button>
    </a-space>

    <a-space class="mt-4">
      <a-button v-permission="'humiture_display_timer'" @click="setCreateFormVisible(true)">
        定时设置
      </a-button>
      <a-button v-permission="'humiture_display_timer_page'" @click="openIlisTab('定时设置记录', 'rest/humiture/index')">
        定时设置记录
      </a-button>
      <a-button v-permission="'humiture_display_log_page'" @click="openIlisTab('控制记录查询', 'rest/humiture/log/index')">
        控制记录查询
      </a-button>
    </a-space>

    <div ref="tableBoxRef" class="flex-1 overflow-auto mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ x: 1200, y: tableHeight }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.dataIndex === 'minTemperature'">
            {{ record.minTemperature }} ~ {{ record.maxTemperature }}
          </template>
          <template v-if="column.dataIndex === 'minHumidity'">
            {{ record.minHumidity }} ~ {{ record.maxHumidity }}
          </template>
          <template v-if="column.dataIndex === 'temStatus'">
            <span v-if="record.temStatus === MStatus.超标 || record.temStatus === MStatus.过低" class="text-red-500">超标</span>
            <span v-else-if="record.temStatus === MStatus.正常">正常</span>
            <span v-else>-</span>
          </template>
          <template v-if="column.dataIndex === 'humStatus'">
            <span v-if="record.humStatus === MStatus.超标 || record.humStatus === MStatus.过低" class="text-red-500">超标</span>
            <span v-else-if="record.humStatus === MStatus.正常">正常</span>
            <span v-else>-</span>
          </template>
          <template v-if="column.dataIndex === 'tem'">
            {{ record.tem || "-" }}
          </template>
          <template v-if="column.dataIndex === 'hum'">
            {{ record.hum || "-" }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button type="link" size="small" @click="onCheckDetail(record)">
              详情
            </a-button>
            <a-button
              v-permission="'humiture_display_open'"
              type="link"
              size="small"
              @click="onOneTouch(record)"
            >
              一键开启
            </a-button>
            <a-button
              v-permission="'humiture_display_close'"
              type="link"
              size="small"
              @click="onOneClose(record)"
            >
              一键关闭
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 一键开启 -->
    <OneTouch v-model:open="oneTouchVisible" :data-source="editDataSource" @on-save="getList" />

    <!-- 风险验证 -->
    <RiskVerification ref="RiskVerificationRef" content="出于风险考虑，请将滑块移动到最右侧控制设备关闭" />

    <!-- 新增定时设置 -->
    <CreateForm v-model:open="createFormVisible" />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { message } from 'ant-design-vue'
import OneTouch from './OneTouch.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useTableHeight } from '~/hooks/useTableHeight'
import RiskVerification from '~/components/RiskVerification.vue'
import { getLaboratoryData } from '~/api/laboratory.ts'
import type { IResponseOldRowsEntity } from '~/interface/IResponseEntity.ts'
import type { ViewLaboratoryDataEntity } from '~/views/common/humiture/display'
import { IotControllType, IotStatusType } from '~/views/common/humiture/display'
import { humitureControll } from '~/views/common/humiture/display/api.ts'
import CreateForm from '~/views/common/humiture/timer/components/CreateForm.vue'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import { openIlisTab } from '~/utils/openIlisTab.ts'
import type { TsSubCmdItem } from '~/views/common/humiture/display/iotDataRequest.ts'
import { IotDataRequest } from '~/views/common/humiture/display/iotDataRequest.ts'
import { MStatus } from '~/views/common/humiture/record'
import { useLaboratoryOptionsHook } from '~/hooks/options/useLaboratoryOptionsHook.ts'

const columns: ColumnType[] = [
  { title: '序号', dataIndex: 'index', width: 85, align: 'center' },
  { title: '功能室', dataIndex: 'name', width: '12%' },
  { title: '标准温度区间（℃）', dataIndex: 'minTemperature', width: '12%' },
  { title: '当前温度值（℃）', dataIndex: 'tem', width: '12%' },
  { title: '温度状态', dataIndex: 'temStatus', width: '10%' },
  { title: '标准湿度区间（%RH）', dataIndex: 'minHumidity', width: '12%' },
  { title: '当前湿度值（%RH）', dataIndex: 'hum', width: '12%' },
  { title: '湿度状态', dataIndex: 'humStatus', width: '10%' },
  { title: '操作', dataIndex: 'action', width: 200 },
]

const { laboratoryOptions } = useLaboratoryOptionsHook({ isIotLab: 1 })

const { tableHeight, tableBoxRef } = useTableHeight()

const [createFormVisible, setCreateFormVisible] = useStateHooks(false)

const oneTouchVisible = ref(false)

const editDataSource = ref({})

const RiskVerificationRef = ref()

const iotDataRequest = new IotDataRequest()

const queryForm = ref({
  isIotLab: 1,
})

const {
  loading,
  dataSource,
  getList,
  getPagination,
  handleSearch,
} = useTableHooks<ViewLaboratoryDataEntity>({
  api: getLaboratoryData,
  query: queryForm,
  responseDataTransform: (res: IResponseOldRowsEntity<ViewLaboratoryDataEntity>) => {
    listenIotData(res.obj.rows)

    return {
      rows: res.obj.rows,
      total: res.obj.count,
    }
  },
})

// 获取物联网设备数据
function listenIotData(listData) {
  const lData: TsSubCmdItem[] = []

  listData.forEach((item, index) => {
    if (item.iotEqId) {
      lData.push({
        entityType: 'DEVICE',
        entityId: item.iotEqId,
        cmdId: index,
      })
    }
  })

  if (lData.length === 0) {
    iotDataRequest.closeWebSocket()
    return
  }

  iotDataRequest.listenDataUpdate(lData, (res) => {
    const data = res.data
    const temperature = data.temperature
    const humidity = data.humidity

    dataSource.value.forEach((item, index) => {
      if (res.subscriptionId === index) {
        if (temperature && temperature.length > 0) {
          item.tem = Number.parseFloat(temperature[0][1])
        }
        else {
          item.tem = undefined
        }

        if (humidity && humidity.length > 0) {
          item.hum = Number.parseFloat(humidity[0][1])
        }
        else {
          item.hum = undefined
        }

        if (item.tem !== undefined && isDefined(item.minTemperature) && isDefined(item.maxTemperature)) {
          if (item.tem < item.minTemperature) {
            item.temStatus = MStatus.过低
          }
          else if (item.tem > item.maxTemperature) {
            item.temStatus = MStatus.超标
          }
          else {
            item.temStatus = MStatus.正常
          }
        }
        else {
          item.temStatus = undefined
        }

        if (item.hum !== undefined && isDefined(item.minHumidity) && isDefined(item.maxHumidity)) {
          if (item.hum < item.minHumidity) {
            item.humStatus = MStatus.过低
          }
          else if (item.hum > item.maxHumidity) {
            item.humStatus = MStatus.超标
          }
          else {
            item.humStatus = MStatus.正常
          }
        }
        else {
          item.humStatus = undefined
        }
      }
    })
  })
}

function onOneTouch(record: ViewLaboratoryDataEntity) {
  editDataSource.value = { ...record }
  oneTouchVisible.value = true
}

function onOneClose(record: ViewLaboratoryDataEntity) {
  RiskVerificationRef.value.open(async () => {
    await humitureControll(record.id, IotControllType.所有, IotStatusType.关)
    message.success('操作成功！')
    handleSearch()
  })
}

function onCheckDetail(record: ViewLaboratoryDataEntity) {
  openIlisTab('温湿度呈现详情', `rest/humiture/display/details?id=${record.id}`)
}
</script>
