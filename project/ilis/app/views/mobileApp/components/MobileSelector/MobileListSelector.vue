<template>
  <van-popup
    duration="0.2"
    position="right"
    :style="{ width: '90%', height: '100%' }"
    :show="open"
  >
    <div class="flex flex-col h-full">
      <MobileTitleBar :title="title || '请选择'" />

      <van-search
        v-model.trim="keyword"
        :placeholder="placeholder"
        @search="onSearch"
      ></van-search>

      <div v-if="open" class="flex-1 min-h-0 overflow-y-auto p-4 border-t bg-[#f5f5f5]">
        <van-list
          v-model:loading="listLoading"
          v-model:error="listError"
          :finished="listFinished"
          error-text="请求失败，点击重新加载"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="item in list"
            :key="item[idField]"
            class="li-box"
            @click="onSelect(item)"
          >
            <van-checkbox
              :shape="enableMultiple ? 'square' : 'round'"
              :checked="selectedRowKeys.includes(item[idField])"
            ></van-checkbox>
            <div class="li-box-content">
              <slot name="row" :data-item="item"></slot>
            </div>
          </div>
        </van-list>
      </div>

      <div class="flex">
        <van-button block square @click="onCancel">
          取消
        </van-button>
        <van-button block type="primary" square @click="onConfirm">
          确定
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang='ts'>
import { computed } from 'vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { useListHooks } from '~/views/mobileApp/hooks/useListHooks'

const props = defineProps({
  title: String,
  open: Boolean,
  // 默认key
  idField: {
    type: String,
    default: 'id',
  },
  placeholder: {
    type: String,
    default: '请输入关键字',
  },
  // 默认勾选项
  selectedRows: Object as PropType<any[]>,
  // 开启多选
  enableMultiple: Boolean,
  // 数据来源，支持静态数据或接口获取
  dataSource: [Object, Function] as PropType<{ rows: any[], total: number } | (() => Promise<{ rows: any[], total: number }>)>,
})

const emits = defineEmits(['update:open', 'select'])

const { listLoading, listFinished, listError, listPage, listPageSize } = useListHooks()

const idField = computed(() => props.idField)

const keyword = ref('')

const list = ref<any[]>([])

const selectedRows = ref<any[]>([])

const selectedRowKeys = computed(() => selectedRows.value.map(i => i[idField.value]))

const open = computed(() => props.open)

watch(open, (val) => {
  if (!val) {
    onCancel()
  }
})

function onSearch() {
  listPage.value = 0
  list.value = []
  listFinished.vlaue = false
  listLoading.value = false
  onLoad()
}

async function onLoad() {
  listError.value = false

  if (Array.isArray(props.dataSource)) {
    list.value = props.dataSource
    listLoading.value = false
    listFinished.value = true
  }

  if (typeof (props.dataSource) === 'function') {
    listPage.value += 1
    listLoading.value = true

    const data = await props.dataSource(listPage.value, listPageSize.value, keyword.value).finally(() => {
      listLoading.value = false
    }).catch(() => {
      listLoading.value = false
      listError.value = true
      listPage.value -= 1
    })

    if (!data) {
      return
    }

    const rows = data.rows || []

    if (rows.length) {
      list.value.push(...rows)
    }

    if (!rows.length || list.value.length >= data.total) {
      listFinished.value = true
    }
  }
}

function onSelect(item: any) {
  if (props.enableMultiple) {
    if (selectedRowKeys.value.includes(item[idField.value])) {
      selectedRows.value = selectedRows.value.filter(i => i[idField.value] !== item[idField.value])
    }
    else {
      selectedRows.value.push(item)
    }
    return
  }

  if (selectedRowKeys.value.includes(item[idField.value])) {
    selectedRows.value = []
  }
  else {
    selectedRows.value = [item]
  }
}

function onCancel() {
  emits('update:open', false)

  list.value = []
  listError.value = false
  listLoading.value = false
  listFinished.value = false
  listPage.value = 0
}

function onConfirm() {
  emits('select', selectedRows.value, selectedRowKeys.value)
  onCancel()
}
</script>

<style lang="less" scoped>
.li-box {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 2px;
  background: #ffffff;
  box-shadow: 0px 0px 10px 0px rgba(0, 102, 236, 0.06);
  border-radius: 4px;

  .li-box-content {
    flex: 1;
    font-size: 14px;
  }
}
</style>
