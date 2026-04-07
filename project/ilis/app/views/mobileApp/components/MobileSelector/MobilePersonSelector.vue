<template>
  <van-popup
    v-model:show="open"
    position="right"
    close-on-popstate
    :style="{ width: '90%', height: '100%' }"
  >
    <div class="h-full flex flex-col">
      <MobileTitleBar
        title="选择人员"
        left-arrow
        @click-left="onCancel"
      />
      <van-search
        v-model="keyword"
        placeholder="请输入人员名字"
      />
      <div class="flex-1 min-h-0 overflow-y-auto">
        <van-tree-select
          v-model:active-id="activeIds"
          v-model:main-active-index="activeIndex"
          :items="personTreeDataFilter"
          height="100%"
          @click-item="onSelectItem"
        />
      </div>
      <div class="flex">
        <van-button block square class="flex-1" @click="onCancel">
          取消
        </van-button>
        <van-button block square class="flex-1" type="primary" @click="onConfirm">
          确定
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang='ts'>
import type { PersonDTO } from '~/views/mobileApp/components/MobileFormItem/MobileFormItemInterface.ts'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api.ts'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest.ts'

const props = defineProps({
  open: Boolean,
  // 默认勾选项
  activeIds: Object as PropType<string[]>,
  // 开启多选
  enableMultiple: Boolean,
  // 人员数据来源，支持静态数据或接口获取
  personDataSource: [Object, Function] as PropType<PersonDTO | (() => Promise<PersonDTO[]>)>,
})

const emits = defineEmits(['update:open', 'select'])

const open = computed(() => props.open)

const enableMultiple = computed(() => props.enableMultiple)

const activeIds = ref<string[]>([])

const activeIndex = ref(0)

const personTreeData = ref<PersonDTO[]>([])

const keyword = ref('')

watch(open, (val) => {
  if (val === true) {
    if (props.activeIds && props.activeIds.length) {
      activeIds.value = [...props.activeIds]
    }
    else {
      activeIds.value = []
    }
    activeIndex.value = 0

    if (!personTreeData.value.length) {
      getData()
    }
  }
})

const personTreeDataFilter = computed(() => {
  const k = keyword.value

  if (!k) {
    return personTreeData.value
  }

  const arr = personTreeData.value.map(i => ({
    ...i,
    children: (i.children || []).filter(j => j.name.includes(k)),
  }))

  return arr.filter(i => i.children.length > 0)
})

async function getData() {
  // 自定义人员数据
  if (props.personDataSource) {
    if (Array.isArray(props.personDataSource)) {
      personTreeData.value = formatTreeData(props.personDataSource)
    }

    if (typeof (props.personDataSource) === 'function') {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const data = await props.personDataSource().finally(toast.close)
      personTreeData.value = formatTreeData(data)
    }
    return
  }

  // 通用人员选择
  const toast = showLoadingToast({
    duration: 0,
    forbidClick: true,
  })

  const res = await mRequest({
    url: api.sampleManageApp.queryPerson,
    method: 'POST',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  }).finally(toast.close)

  const data = (res.data || []) as PersonDTO[]
  personTreeData.value = formatTreeData(data)
}

function formatTreeData(data: PersonDTO[]) {
  data.forEach((item: any) => {
    item.text = item.name

    ;(item.children || []).forEach((cItem: any) => {
      cItem.text = cItem.name
      cItem.pId = item.id
      cItem.pName = item.name
    })
  })

  return data
}

function getSelectedList() {
  const tree = personTreeData.value
  const result: PersonDTO[] = []

  tree.forEach((pItem) => {
    (pItem.children || []).forEach((cItem) => {
      if (activeIds.value.includes(cItem.id) && !result.find(i => i.id === cItem.id)) {
        result.push(cItem)
      }
    })
  })

  return result.map(i => ({
    id: i.id,
    name: i.name,
    account: i.account,
  }))
}

function onSelectItem(item: PersonDTO) {
  if (!enableMultiple.value) {
    activeIds.value = [item.id]
  }
}

function onCancel() {
  emits('update:open', false)
}

function onConfirm() {
  emits('select', getSelectedList())
  onCancel()
}
</script>
