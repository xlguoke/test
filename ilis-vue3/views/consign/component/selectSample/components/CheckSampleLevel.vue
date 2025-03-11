<template>
  <a-modal
    v-model:open="open"
    title="查看样品完整层级"
    width="460px"
    :mask-closable="false"
    destroy-on-close
    @cancel="handleCancel"
  >
    <a-space direction="vertical" class="mt-4">
      <div>
        <b>大类层级：</b>
        <p>{{ categoryPath }}</p>
      </div>
      <div class="mt-2">
        <b>样品层级：</b>
        <p>{{ samplePath }}</p>
      </div>
      <div class="mt-2">
        <b>完整层级：</b>
        <p>{{ fullPath }}</p>
      </div>
    </a-space>

    <template #footer>
      <a-button @click="handleCancel">
        取消
      </a-button>
      <a-button type="primary" @click="handleOk">
        复制
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import { getComboTreeSync } from '~/views/consign/component/selectSample/api.ts'
import { sampleApi } from '~/views/consign/component/selectSampleParam/api.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:open'])

// 基本信息
const useBasicInfo = inject('useBasicInfo') as UseBasicInfo

const open = computed(() => props.open)

const categoryPath = ref('')

const samplePath = ref('')

const fullPath = ref('')

watch(open, (val) => {
  if (val) {
    init()
  }
})

async function init() {
  const { bigCategoryId, testUnitTestSampleId } = useBasicInfo.data

  const res = await getComboTreeSync({
    page: 1,
    size: 9999,
    queryType: 'sample',
  })

  categoryPath.value = findDataTree(res.data, bigCategoryId)

  const res2 = await sampleApi({
    bigCategoryId,
    sampleId: testUnitTestSampleId,
  })

  samplePath.value = findDataTree(res2.data, testUnitTestSampleId)

  fullPath.value = categoryPath.value ? `${categoryPath.value}↘${samplePath.value}` : samplePath.value
}

function findDataTree(list: any[], keyId: string) {
  for (let i = 0; i < list.length; i++) {
    const d = list[i]
    if (d.id === keyId) {
      return d.text
    }
    if (d.children && d.children.length) {
      const cd = findDataTree(d.children, keyId)
      if (cd)
        return `${d.text}↘${cd}`
    }
  }
  return ''
}

// 取消
const handleCancel = function () {
  emits('update:open', false)
}

function copyText(text: string) {
  const textArea: any = top.document.createElement('textArea')
  textArea.value = text
  textArea.style.width = '0'
  textArea.style.position = 'fixed'
  textArea.style.left = '-999px'
  textArea.style.top = '10px'
  top.document.body.appendChild(textArea)
  textArea.select()
  top.document.execCommand('copy')
  top.document.body.removeChild(textArea)
}

// 提交
const handleOk = async function () {
  copyText(fullPath.value)
  message.success('复制成功！')
  handleCancel()
}
</script>
