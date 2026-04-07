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
        title="选择计量单位"
        left-arrow
        @click-left="onCancel"
      />

      <van-search
        v-model="searchValue"
        placeholder="搜索计量单位"
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
            <van-radio-group v-model="selectedUnit">
              <div
                v-for="item in filteredList"
                :key="item.value"
                class="bg-white mb-2 p-3"
                @click="onSelect(item)"
              >
                <div class="flex items-center">
                  <van-radio :name="item.value" class="mr-3" @click.stop />
                  <div class="flex-1">
                    <div class="font-medium text-sm">
                      {{ item.name }}
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
import { computed, ref } from 'vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { getUnitDict } from '../api'

interface UnitItem {
  value: string
  name: string
}

interface Props {
  show: boolean
  initialSelected?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialSelected: '',
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  'confirm': [unit: string]
  'cancel': []
}>()

const visible = computed({
  get: () => props.show,
  set: val => emit('update:show', val),
})

const searchValue = ref('')
const list = ref<UnitItem[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const selectedUnit = ref('')

const filteredList = computed(() => {
  if (!searchValue.value) {
    return list.value
  }
  return list.value.filter(item =>
    item.name.toLowerCase().includes(searchValue.value.toLowerCase()),
  )
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getUnitDict()
    if (res.data) {
      list.value = (res.data || []).map((item: any) => ({
        value: item.typeCode,
        name: item.typeName,
      }))
      finished.value = true
    }
  }
  catch (error) {
    console.error('获取计量单位列表失败', error)
    finished.value = true
  }
  finally {
    loading.value = false
    refreshing.value = false
  }
}

function onLoad() {
  if (list.value.length === 0) {
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
  if (props.initialSelected) {
    selectedUnit.value = props.initialSelected
  }
  fetchData()
}

function onClosed() {
  searchValue.value = ''
}

function onSelect(item: UnitItem) {
  selectedUnit.value = item.value
}

function onCancel() {
  visible.value = false
  emit('cancel')
}

function onConfirm() {
  if (!selectedUnit.value) {
    return
  }
  emit('confirm', selectedUnit.value)
  visible.value = false
}
</script>
