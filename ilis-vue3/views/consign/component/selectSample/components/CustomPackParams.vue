<template>
  <a-modal
    v-model:open="open"
    title="自定义参数打包"
    width="80%"
    :mask-closable="false"
    centered
    destroy-on-close
    @cancel="handleCancel"
  >
    <iframe
      ref="Iframe"
      width="100%"
      height="540px"
      :src="iframeUrl"
      frameborder="0"
    ></iframe>
    <template #footer>
      <a-button @click="handleCancel">
        关闭
      </a-button>
      <a-button :loading="submitLoading" type="primary" @click="handleOk">
        确定
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import type { TestParamsMetaDataItem, UseTestParams } from '~/views/consign/component/selectSample/modules/UseTestParams.ts'
import { getMapByUniqueKey } from '~/views/consign/component/selectSample/api.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['update:open'])
// 基础信息
const useBasicInfo = inject('useBasicInfo') as UseBasicInfo
// 参数
const useTestParams = inject('useTestParams') as UseTestParams

const open = computed(() => props.open)

const submitLoading = ref(false)

const Iframe = ref()

const iframeUrl = computed(() => {
  const url = new URL('/ilis2/param-pack.do?detail', window.location.origin)
  url.searchParams.append('pageInto', '1')
  url.searchParams.append('categoryId', useBasicInfo.data.bigCategoryId)
  return url.href
})

watch(open, (val) => {
  if (val) {
    buildPackParamData()
  }
})

/**
 * 设置规程的id
 * 由于元数据里的规程可能没有规程的id
 * 如：预委托保存的数据
 * 但自定义打包参数那边需要id保存，此处通过接口获取处理下
 */
async function checkSetStandardId(testParams: TestParamsMetaDataItem[]) {
  const uniqKeys = []

  // 获取所有uniqKey
  for (let i = 0; i < testParams.length; i++) {
    testParams[i].criterion.forEach((j) => {
      if (!uniqKeys.includes(j.uniqKey)) {
        uniqKeys.push(j.uniqKey)
      }
    })
  }

  const res = await getMapByUniqueKey(uniqKeys)
  const data = res.data

  // 设置规程的id
  for (let i = 0; i < testParams.length; i++) {
    testParams[i].criterion.forEach((j) => {
      const standardItem = data[j.uniqKey]
      if (standardItem) {
        j.id = standardItem.id
      }
    })
  }
}

async function buildPackParamData() {
  const basicInfoData = useBasicInfo.data
  const testParams = useTestParams.formatTestParams2MetaData(useTestParams.selectedRows)

  // 打包参数数据集合
  const buildParams: any = {
    bigCategoryId: basicInfoData.bigCategoryId,
    categoryConcatName: basicInfoData.bigCategoryNames,
    sampleId: basicInfoData.testUnitTestSampleId,
  }
  const selectedParams: TestParamsMetaDataItem[] = JSON.parse(JSON.stringify(testParams))

  // 设置规程的id字段
  await checkSetStandardId(selectedParams)

  // 存在勾选的参数时，组装参数及对应规程数据
  if (selectedParams.length > 0) {
    const paramsObj = {}

    selectedParams.forEach((item) => {
      item.id = item.testParamId
      paramsObj[item.testParamId] = item.criterion
    })

    for (let j = 0; j < selectedParams.length; j++) {
      selectedParams[j].useStandards = paramsObj[selectedParams[j].testParamId]
    }
  }

  // 参数及规程信息
  buildParams.params = selectedParams
  sessionStorage.setItem('buildParamsObj', JSON.stringify(buildParams))
}

// 取消
function handleCancel() {
  emits('update:open', false)
}

function handleOk() {
  const contentWindow = Iframe.value.contentWindow
  submitLoading.value = true

  setTimeout(() => {
    submitLoading.value = false
  }, 500)

  contentWindow.SaveParams(() => {
    setTimeout(() => {
      handleCancel()
    }, 500)

    useBasicInfo.initParamPackOptions()
    message.success('保存成功！')
    sessionStorage.removeItem('buildParamsObj')
  })
}
</script>
