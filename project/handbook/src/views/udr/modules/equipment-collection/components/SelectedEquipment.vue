<script lang="ts" setup>
import { ref } from 'vue'
import useSelData from '../../../composables/useSelData'
import { EquipmentType, selectActions } from '../index'
import type { IotDeviceDto, MainDeviceDto, SelectType } from '../index'

import SelDataList from '@/components/selDataList/index.vue'
import BaseModal from '@/views/udr/components/BaseModal.vue'
import { request } from '@/axios'
import { useUdrStore } from '@/views/udr/provider/useUdrStore'

const emits = defineEmits(['select'])

const { getTestTaskId } = useUdrStore()

const showSelect = ref(false)

const selectedType = ref<SelectType>(selectActions[0])

const keyword = ref('')

const query = ref({
  type: selectedType.value.value,
})

const {
  visible,
  selType,
  dataList,
  selectedRows,
  showModal,
  onCancel,
  onSearch,
  getDatas,
} = useSelData({
  api: eqipmentListApi,
})

selType.value = 'checkbox'

async function getEqCollectionList() {
  const res: any = await request(`/ilis2/rest/dataGather/list/${getTestTaskId()}`).catch((err) => {
    showDialog({
      title: '提示',
      message: err.message,
    })
  })

  // 后端直接返回的所有采集历史，前端将其格式化为设备数据
  const eqipmentList: MainDeviceDto[] = []
  for (let i = 0; i < res.length; i++) {
    const cjItem: MainDeviceDto = res[i]
    const eq = eqipmentList.find(item => item.sbbianhao === cjItem.sbbianhao)

    // 没有设备编号或设备名称的直接过滤掉
    if (!cjItem.sbbianhao || !cjItem.sbmingcheng)
      continue

    if (eq) {
      eq.jsonDataList.push({
        ...cjItem,
        ...JSON.parse(cjItem.jsonData || '{}'),
      })
      continue
    }

    cjItem.id = cjItem.sbbianhao
    cjItem.name = cjItem.sbmingcheng
    cjItem.jsonDataList = [{
      ...cjItem,
      ...JSON.parse(cjItem.jsonData || '{}'),
    }]
    eqipmentList.push(cjItem)
  }

  return eqipmentList
}

async function eqipmentListApi(): Promise<any[]> {
  const res: any = await request('/ilis2/rest/eq/device/list', {
    params: query.value,
  }).catch((err) => {
    showDialog({
      title: '提示',
      message: err.message,
    })
  })

  return res || []
}

function selectStatus(row: SelectType) {
  selectedType.value = row
  query.value.type = row.value
  getDatas()
}

async function confirmSelected(rows: IotDeviceDto[]) {
  const hasMainDevice = rows.some(item => item.type === EquipmentType.主设备)

  if (hasMainDevice) {
    const loading = showLoadingToast({ duration: 0, forbidClick: true })
    const list = await getEqCollectionList().finally(() => {
      loading.close()
    })

    if (list.length) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const sameEq = list.find(item => item.sbbianhao === row.eqsn)
        row.jsonDataList = sameEq ? sameEq.jsonDataList : []
      }
    }
  }

  emits('select', rows)
  onCancel()
}

defineExpose({
  showModal,
})
</script>

<template>
  <BaseModal v-model:show="visible" hide-footer title="请选择设备" @close="onCancel">
    <SelDataList
      :type="selType"
      :selected-rows="selectedRows"
      :data-list="dataList"
      :cancel="onCancel"
      @confirm="confirmSelected"
    >
      <template #search>
        <div class="search-wrap">
          <van-popover v-model:show="showSelect" :actions="selectActions" @select="selectStatus">
            <template #reference>
              <div class="search-select">
                <template v-if="selectedType">
                  <span>{{ selectedType?.text }}</span>
                </template>
                <template v-else>
                  <span class="empty">请选择</span>
                </template>
                <van-icon name="arrow-down" color="#aaa" />
              </div>
            </template>
          </van-popover>
          <van-search
            v-model.trim="keyword"
            show-action
            placeholder="请输入设备名称、设备编号查询"
            left-icon="_"
            style="flex: 1;"
            @search="onSearch(keyword)"
          >
            <template #action>
              <van-button type="primary" style="height: 34px;vertical-align: middle;" @click="onSearch(keyword)">
                <i class="custom-search iconfont icon-sousuo" />
              </van-button>
            </template>
          </van-search>
        </div>
      </template>

      <template #dataItem="{ item }: any">
        {{ item.name }}
      </template>
    </SelDataList>
  </BaseModal>
</template>

<style lang="less" scoped>
.search-wrap{
  display: flex;
  align-items: center;

  .search-select{
    padding: 0 1rem;
    display: flex;
    align-items: center;
    height: 34px;
    border: 1px solid #ccc;
    border-radius: 4px;

    span{
      margin-right: 0.4rem;
      min-width: 8rem;
    }
    .empty{
      color: #ccc;
    }
  }
}
</style>
