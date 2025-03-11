<template>
  <div class="flex flex-col" style="height: calc(100% + 16px)">
    <a-space>
      <a-input v-model:value.trim="queryForm.q" class="w-[220px]" placeholder="请输入姓名/身份证号/证书编号" />

      <a-button type="primary" @click="handleSearch()">
        查询
      </a-button>
      <a-button @click="onReset">
        重置
      </a-button>
    </a-space>

    <a-space class="my-4">
      <IlisCustomColumns type="special_equipment_people" @confirm="handleReloadTable()">
        列筛选
      </IlisCustomColumns>
      <a-button :loading="exportLoading" @click="onExport">
        导出
      </a-button>
    </a-space>

    <div ref="tableBoxRef" class="flex-1 overflow-hidden">
      <IlisTable
        row-key="id"
        :loading="loading"
        :custom-columns="customColumns"
        :table-height="tableHeight"
        :data-source="dataSource"
        :entity="SpecialTypePersonEntity"
        :pagination="getPagination()"
      />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { Modal, message } from 'ant-design-vue'
import type { GetPeopleListParams } from '../api'
import { exportPeople, getPeopleList } from '../api'
import { SpecialTypePersonEntity } from '../SpecialTypePersonEntity.ts'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useTableHeight } from '~/hooks/useTableHeight'

import { IlisTable } from '~/components/ilisComponent'

const { tableHeight, tableBoxRef } = useTableHeight()

const exportLoading = ref(false)

const queryForm = ref<GetPeopleListParams>({})

const {
  loading,
  customColumns,
  dataSource,
  getPagination,
  handleSearch,
  handleReloadTable,
  page,
  size,
} = useTableHooks<SpecialTypePersonEntity>({
  api: getPeopleList,
  totalKey: 'count',
  customType: 'special_equipment_people',
  query: queryForm,
})
function onReset() {
  queryForm.value.q = ''
  handleSearch()
}

async function onExport() {
  exportLoading.value = true
  const res = await exportPeople({
    ...queryForm.value,
    page: page.value,
    size: size.value,
  }).finally(() => {
    exportLoading.value = false
  })

  if (res.code !== 20010) {
    await downloader.excute(res.data, '特种设备人员.xlsx')
    message.success('导出成功！')
  }
  else {
    Modal.warning({
      title: '提示',
      content: res.message,
    })
  }
}
</script>
