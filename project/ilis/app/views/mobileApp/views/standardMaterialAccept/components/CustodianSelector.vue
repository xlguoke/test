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
        title="选择保管人"
        left-arrow
        @click-left="onCancel"
      />

      <van-search
        v-model="searchValue"
        placeholder="搜索保管人"
        @search="onSearch"
        @clear="onClear"
      />

      <div class="flex-1 overflow-y-auto">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <van-radio-group v-model="selectedCustodian">
              <div
                v-for="item in list"
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

        <van-empty v-if="list.length === 0 && !loading" description="暂无数据" />
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
import { getCustodians } from '../api'

interface Props {
  show: boolean
  initialSelected?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialSelected: '',
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  'confirm': [custodian: string]
  'cancel': []
}>()

const visible = computed({
  get: () => props.show,
  set: val => emit('update:show', val),
})

const searchValue = ref('')
const list = ref<string[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const selectedCustodian = ref('')

watch(searchValue, () => {
  fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getCustodians(searchValue.value)
    if (res.data) {
      list.value = res.data || []
      finished.value = true
    }
  }
  catch (error) {
    console.error('获取保管人列表失败', error)
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
  fetchData()
}

function onClear() {
  searchValue.value = ''
  fetchData()
}

function onOpen() {
  if (props.initialSelected) {
    selectedCustodian.value = props.initialSelected
  }
  if (list.value.length === 0) {
    fetchData()
  }
}

function onClosed() {
  searchValue.value = ''
}

function onSelect(item: string) {
  selectedCustodian.value = item
}

function onCancel() {
  visible.value = false
  emit('cancel')
}

function onConfirm() {
  if (!selectedCustodian.value) {
    return
  }
  emit('confirm', selectedCustodian.value)
  visible.value = false
}
</script>
