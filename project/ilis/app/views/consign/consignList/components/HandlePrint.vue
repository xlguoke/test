<template>
  <div>
    <a-dropdown>
      <template #overlay>
        <a-menu class="max-h-[60vh] overflow-auto" @click="handlePrint">
          <a-menu-item v-for="d in printconfig" :key="d.type">
            {{ d.name }}
          </a-menu-item>
          <a-menu-item v-if="printconfig.length === 0" disabled>
            <span>暂无数据</span>
          </a-menu-item>
        </a-menu>
      </template>
      <a-button>
        打印
        <DownOutlined />
      </a-button>
    </a-dropdown>
  </div>
</template>

<script setup lang='ts'>
import type { ConsignListEntity } from '../ConsignListEntity'
import { DownOutlined } from '@ant-design/icons-vue'
import { usePermissionStore } from '~/store/permissionStore'
import { printConfigApi } from '../api'
import { PRINT_TYPE, usePrint } from '../modules/usePrint'

interface PrintConfig {
  name: string
  type: PRINT_TYPE | string
}

const props = defineProps<{
  selectedRows: ConsignListEntity[]
  jsonParams: Record<string, any>
}>()

const { hasPermission } = usePermissionStore()

const { selectedRows, jsonParams } = toRefs(props)

const printconfig = ref<PrintConfig[]>([])

const { handlePrint } = usePrint(selectedRows, jsonParams)

async function getPrintConfig() {
  const { data } = await printConfigApi()
  // 打印委托单
  const consignbill = hasPermission('printConsignBills')
  // 打印样品标签
  const samplelabel = hasPermission('printObjectLable')
  // 打印委托台账
  const consignledger = hasPermission('printConsignStandingBook')

  for (let i = data.length - 1; i >= 0; i--) {
    const d = data[i]
    if (d.type === PRINT_TYPE.CONSIGNORDER && !consignbill) {
      data.splice(i, 1)
    }
    else if (d.type === PRINT_TYPE.SAMPLELABEL && !samplelabel) {
      data.splice(i, 1)
    }
    else if (d.type === PRINT_TYPE.CONSIGNLEDGER && !consignledger) {
      data.splice(i, 1)
    }
  }

  printconfig.value = data
}

getPrintConfig()
</script>

<style>

</style>
