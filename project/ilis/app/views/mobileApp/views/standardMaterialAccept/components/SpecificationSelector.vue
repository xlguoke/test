<template>
  <van-popup
    v-model:show="visible"
    position="right"
    :style="{ height: '100%', width: '90%' }"
    @open="onOpen"
    @closed="onClosed"
  >
    <div class="h-screen flex flex-col bg-[#f5f5f5]">
      <MobileTitleBar
        title="选择规格型号"
        left-arrow
        @click-left="onCancel"
      />

      <van-search
        v-model="searchValue"
        placeholder="搜索规格型号"
        @search="onSearch"
      />

      <div class="flex-1 overflow-y-auto">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <van-radio-group v-model="selectedSpec">
              <div
                v-for="item in filteredList"
                :key="item.id || item.specification"
                class="bg-white mb-2 p-3"
                @click="onSelect(item)"
              >
                <div class="flex items-center">
                  <van-radio :name="item.specification" class="mr-3" @click.stop />
                  <div class="flex-1">
                    <div class="font-medium text-sm">
                      {{ item.specification || '-' }}
                    </div>
                  </div>
                </div>
              </div>
            </van-radio-group>
          </van-list>
        </van-pull-refresh>

        <van-empty v-if="filteredList.length === 0 && !loading" description="暂无数据" />
      </div>

      <div class="flex-shrink-0 bg-white p-3 border-t border-[#f0f0f0]">
        <div class="flex items-center justify-end">
          <div class="flex gap-2">
            <van-button size="small" class="px-8" @click="onCancel">
              取消
            </van-button>
            <van-button type="primary" class="px-8" size="small" @click="onConfirm">
              确认
            </van-button>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { getMaterialListByName } from '../api'

interface SpecificationItem {
  id: string
  specification: string
  manufacturer?: string
  productionDate?: string
  unitPrice?: number
  unit?: string
  custodian?: string
}

interface Props {
  show: boolean
  materialName: string
  initialSelected?: string
}

const props = withDefaults(defineProps<Props>(), {
  materialName: '',
  initialSelected: '',
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  'confirm': [item: SpecificationItem]
  'cancel': []
}>()

const visible = computed({
  get: () => props.show,
  set: val => emit('update:show', val),
})

const searchValue = ref('')
const list = ref<SpecificationItem[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const selectedSpec = ref('')
const selectedItem = ref<SpecificationItem | null>(null)

const filteredList = computed(() => {
  if (!searchValue.value) {
    return list.value
  }
  return list.value.filter(item =>
    item.specification?.toLowerCase().includes(searchValue.value.toLowerCase()),
  )
})

watch(() => props.show, (val) => {
  if (val && props.materialName) {
    fetchData()
  }
})

async function fetchData() {
  if (!props.materialName) {
    list.value = []
    finished.value = true
    return
  }

  loading.value = true
  try {
    const res = await getMaterialListByName(props.materialName)
    if (res.data) {
      const items = res.data || []
      list.value = items.map((item: any) => ({
        id: item.id,
        specification: item.specification || '',
        manufacturer: item.manufacturer || '',
        productionDate: item.productionDate || '',
        unitPrice: item.unitPrice || 0,
        unit: item.unit || '',
        custodian: item.custodian || '',
      }))
      finished.value = true
    }
    else {
      list.value = []
      finished.value = true
    }
  }
  catch (error) {
    console.error('获取规格型号列表失败', error)
    list.value = []
    finished.value = true
  }
  finally {
    loading.value = false
    refreshing.value = false
  }
}

function onLoad() {
  if (list.value.length === 0 && props.materialName) {
    fetchData()
  }
}

function onRefresh() {
  fetchData()
}

function onSearch() {
  finished.value = false
}

function onOpen() {
  // 每次打开时重置状态并重新加载数据
  list.value = []
  loading.value = false
  finished.value = false
  selectedSpec.value = props.initialSelected || ''
  selectedItem.value = null
  fetchData()
}

function onClosed() {
  searchValue.value = ''
}

function onSelect(item: SpecificationItem) {
  selectedSpec.value = item.specification
  selectedItem.value = item
}

function onCancel() {
  visible.value = false
  emit('cancel')
}

function onConfirm() {
  if (!selectedItem.value) {
    return
  }
  emit('confirm', selectedItem.value)
  visible.value = false
}
</script>
