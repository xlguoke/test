<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { z } from 'zod'
import { showDialog } from 'vant'
import DataTable from './components/DataTable.vue'
import { EquipmentUseRecordAdd } from '.'
import { useUdrStore } from '@/views/udr/provider/useUdrStore'
import NoData from '@/components/noData/index.vue'
import { request } from '@/axios'
import { equipmentUseRecordEq, equipmentUseRecordParam } from '@/type/equipment-use-register'
import type { EquipmentUseLog, EquipmentUseRecordList } from '@/type/equipment-use-register'

const testTaskId = useUdrStore().getTestTaskId()

const searchVal = ref('')
const displayType = ref('1')
const dataList = ref<EquipmentUseRecordList[]>([])
const filterDataList = ref<EquipmentUseRecordList[]>([])
const activeNames = ref<string[]>([])
const eqUseRecordAddRef = ref()
const showFloat = ref(true)

async function getDatas(hideLoading?: boolean) {
  if (!hideLoading)
    showLoadingToast({ duration: 0, forbidClick: true })

  try {
    if (displayType.value === '1') {
      // 设备维度
      dataList.value = await request({
        url: `/ilis2/api/testTaskUseEquipmentController/query/with/equipment/${testTaskId}`,
        schema: z.array(equipmentUseRecordEq),
      })
    }
    else {
      // 参数维度
      dataList.value = await request({
        url: `/ilis2/api/testTaskUseEquipmentController/query/with/param/${testTaskId}`,
        schema: z.array(equipmentUseRecordParam),
      })
    }

    // dataList.value[0].useLogs[0].endUseTime = ''
    // dataList.value[0].useLogs[0].dataGatherId = '12'

    if (searchVal.value === '')
      filterDataList.value = dataList.value
    else
      filterDataList.value = handleFilterDatas(dataList.value)

    activeNames.value = filterDataList.value.map(item => item.id)
  }
  catch (err: any) {
    showDialog({ title: '获取数据失败', message: err.message || '获取数据失败' })
  }
  closeToast()
}

// 搜索
function onQuickSearch() {
  dataList.value = []
  activeNames.value = []
  filterDataList.value = []
  getDatas()
}

// 过滤数据
function handleFilterDatas(datas: EquipmentUseRecordList[]) {
  const v = searchVal.value.toLocaleLowerCase()
  if (displayType.value === '1') {
    return datas.filter(d => d.name.toLocaleLowerCase().includes(v) || d.code?.toLocaleLowerCase().includes(v))
  }
  else {
    return datas.filter((p) => {
      const logs = p.useLogs.filter(d => d.equipmentName.toLocaleLowerCase().includes(v) || d.equipmentCode?.toLocaleLowerCase().includes(v))
      p.useLogs = logs
      return logs.length > 0
    })
  }
}

// 删除记录
function deleteEqRecord(item: EquipmentUseRecordList, log: EquipmentUseLog, ind: number) {
  showConfirmDialog({
    title: '删除',
    message: '确定删除该设备使用记录吗？',
  }).then(async () => {
    showLoadingToast({ duration: 0, forbidClick: true })
    try {
      await request({
        url: `/ilis2/api/testTaskUseEquipmentController/${log.id}`,
        method: 'DELETE',
      })
      item.useLogs.splice(ind, 1)
      getDatas()
    }
    catch (err: any) {
      showDialog({ title: '删除失败', message: err.message || '删除失败' })
    }
    closeToast()
  }).catch(() => {})
}

// 编辑记录
function editEqRecord(log: EquipmentUseLog) {
  showFloat.value = false
  eqUseRecordAddRef.value.showModal(log)
}

function goAddPage() {
  showFloat.value = false
  eqUseRecordAddRef.value.showModal()
}

onMounted(() => {
  showFloat.value = true
  getDatas()
})
</script>

<template>
  <div class="eq-use-record">
    <div class="search-wrap">
      <van-search
        v-model.trim="searchVal"
        style="flex: 1; min-width: 40%"
        placeholder="请输入设备名称或设备编号"
        @search="onQuickSearch"
      />
      <van-radio-group v-model="displayType" direction="horizontal" shape="dot" @change="getDatas">
        <van-radio name="1" icon-size="1.8rem">
          按设备维度展示
        </van-radio>
        <van-radio name="2" icon-size="1.8rem">
          按参数维度展示
        </van-radio>
      </van-radio-group>
    </div>

    <div class="content">
      <van-collapse v-model="activeNames">
        <van-collapse-item
          v-for="item in filterDataList"
          :key="item.id"
          :title="item.code ? `${item.name}（${item.code}）` : item.name"
          :name="item.id"
          class="custom-card"
        >
          <DataTable
            :datas="item.useLogs"
            :display-type="displayType"
            @delete="(d: EquipmentUseLog, i: number) => deleteEqRecord(item, d, i)"
            @edit="editEqRecord"
            @load="getDatas(true)"
          />
        </van-collapse-item>
      </van-collapse>
      <NoData v-if="filterDataList.length === 0" />
    </div>

    <van-floating-bubble
      icon="plus"
      axis="xy"
      magnetic="x"
      :style="{ zIndex: showFloat ? 3000 : 0 }"
      @click="goAddPage"
    />

    <EquipmentUseRecordAdd
      ref="eqUseRecordAddRef"
      @close="showFloat = true"
      @load="getDatas"
    />
  </div>
</template>

<style lang="less" scoped>
.eq-use-record {
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .search-wrap {
    padding: 0 0.4rem;
    display: flex;
    align-items: center;
    column-gap: 1.6rem;
    z-index: 100;
    box-shadow: 0px 4px 8px 0px #eaf5ff;
    background-color: #fff;

    :deep(.van-radio__label) {
      font-size: 1.6rem;
    }
  }

  .content {
    padding: 0 1.6rem 3rem;
    flex: 1;
    height: 0;
    overflow-y: auto;
    .custom-card{
      margin-top: 1.2rem;
    }
  }
}

:deep(.van-cell__title) {
  padding-left: 0.4rem;
  font-size: 2rem;
}

:deep(.van-search__content) {
  background-color: transparent;
  border: 1px solid #eee;
}

:deep(.van-collapse-item__title--expanded + .van-collapse-item__wrapper) {
  overflow: visible;
}
:deep(.van-collapse-item__title) {
  padding-top: 14px;
  padding-bottom: 14px;
}
:deep(.van-collapse-item__content) {
  padding: 0 1.1rem;
}
</style>
