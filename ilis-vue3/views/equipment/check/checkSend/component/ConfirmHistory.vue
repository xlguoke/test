<template>
  <AppProvider>
    <a-card style="width: 100%">
      <a-space direction="vertical" style="width: 100%;">
        <!-- 搜索栏 -  -->
        <div class="search">
          <a-form
            ref="formRef"
            :model="formState"
            layout="inline"
            @submit="handleSearch"
          >
            <a-form-item name="quickQryParam">
              <a-input
                v-model:value="formState.quickQryParam"
                style="width: 330px;"
                placeholder="请输入检校项目/参数"
                allow-clear
              />
            </a-form-item>
            <a-form-item name="timeRange">
              <a-range-picker
                v-model:value="formState.timeRange"
                :placeholder="['检校日期开始', '检校日期结束']"
                value-format="YYYY-MM-DD"
              />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" html-type="submit">
                  查询
                </a-button>
                <a-button @click="handleReset">
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </div>
        <a-table
          row-key="id"
          :data-source="dataSource"
          :columns="columns"
          :loading="loading"
          :pagination="getPagination()"
          :scroll="{
            x: '1400px',
          }"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'checkCertificateSn'">
              <a :href="record.url" target="_blank">{{ text }}</a>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button
                type="link"
                size="small"
                @click="handleDetail(record as IConfirmHistoryEntity)"
              >
                查看过程记录
              </a-button>
            </template>
          </template>
        </a-table>
      </a-space>
    </a-card>
    <CustomRecord v-model:show="showCustomRecord" :data="customRecordData" />
  </AppProvider>
</template>

<script lang="ts" setup>
import { getConfirmHistoryPage } from '../api'
import { type IConfirmHistoryEntity, columns } from './confirmHistory'
import CustomRecord from './CustomRecord.vue'
import { useTableHooks } from '~/hooks/useTableHooks'

const formRef = ref()

const formState = ref({
  quickQryParam: '',
  timeRange: undefined,
  id: parent.currentDeviceId,
})

const {
  loading,
  dataSource,
  getPagination,
  handleSearch,
  handleReset,
} = useTableHooks<IConfirmHistoryEntity>({
  api: getConfirmHistoryPage,
  formRef,
  query: formState,
  sizeKey: 'rows',
})

const showCustomRecord = ref(false)

const customRecordData = ref<IConfirmHistoryEntity>({} as IConfirmHistoryEntity)

/**
 * 详情
 */
function handleDetail(row: IConfirmHistoryEntity) {
  customRecordData.value = row
  showCustomRecord.value = true
}
</script>

<style>

</style>
