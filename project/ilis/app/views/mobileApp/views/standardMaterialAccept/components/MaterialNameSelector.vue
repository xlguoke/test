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
        title="选择标准物质名称"
        left-arrow
        @click-left="onCancel"
      />

      <van-search
        v-model="keyword"
        placeholder="搜索标准物质名称"
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
            <van-radio-group v-model="selectedName">
              <div
                v-for="item in filteredList"
                :key="item"
                class="bg-white mb-2 p-3"
                @click="onSelect(item)"
              >
                <div class="flex items-center">
                  <van-radio :name="item" class="mr-3" @click.stop />
                  <div class="flex-1">
                    <div class="font-medium text-sm">
                      {{ item }}
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
import { getMaterialNameList } from '../api'

interface Props {
  show: boolean
  initialSelected?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialSelected: '',
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  'confirm': [name: string]
  'cancel': []
}>()

const visible = computed({
  get: () => props.show,
  set: val => emit('update:show', val),
})

const keyword = ref('')
const list = ref<string[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const selectedName = ref('')

const filteredList = computed(() => {
  if (!keyword.value) {
    return list.value
  }
  return list.value.filter(item =>
    item.toLowerCase().includes(keyword.value.toLowerCase()),
  )
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getMaterialNameList(keyword.value)
    if (res.data) {
      list.value = res.data || []
      finished.value = true
    }
  }
  catch (error) {
    console.error('获取标准物质名称列表失败', error)
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
    selectedName.value = props.initialSelected
  }
  if (list.value.length === 0) {
    fetchData()
  }
}

function onClosed() {
  keyword.value = ''
}

function onSelect(item: string) {
  selectedName.value = item
}

function onCancel() {
  visible.value = false
  emit('cancel')
}

function onConfirm() {
  if (!selectedName.value) {
    return
  }
  emit('confirm', selectedName.value)
  visible.value = false
}
</script>
