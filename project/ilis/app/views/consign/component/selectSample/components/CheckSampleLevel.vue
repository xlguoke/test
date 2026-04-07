<template>
  <ht-modal
    v-model:open="open"
    :title="`查看${term('样品')}完整层级`"
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
        <b>{{ term('样品') }}层级：</b>
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
  </ht-modal>
</template>

<script setup lang='ts'>
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import { message } from 'ant-design-vue'
import { useIndustryStore } from '~/store/industryStore'
import { getComboTreeSync } from '~/views/consign/component/selectSample/api.ts'
import { sampleApi } from '~/views/consign/component/selectSampleParam/api.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:open'])

const { term } = useIndustryStore()

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

function findDataTree(list: any[], keyId: string): any {
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
function handleCancel() {
  emits('update:open', false)
}

async function copyText(text: string): Promise<boolean> {
  try {
    // 优先使用现代浏览器的Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }

    // 降级方案：使用传统的document.execCommand('copy')
    const top = window.top || window
    const textArea = top.document.createElement('textarea')

    // 设置textarea的样式，使其不可见但不影响复制功能
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'

    // 添加到文档并选中内容
    top.document.body.appendChild(textArea)
    textArea.select()

    // 执行复制命令并检查结果
    const successful = top.document.execCommand('copy')

    // 清理DOM
    top.document.body.removeChild(textArea)

    if (!successful) {
      throw new Error('复制失败')
    }

    return true
  }
  catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

// 提交
async function handleOk() {
  const success = await copyText(fullPath.value)
  if (success) {
    message.success('复制成功！')
    handleCancel()
  }
  else {
    message.error('复制失败，请手动复制内容')
  }
}
</script>
