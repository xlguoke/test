<!-- 选择委托单位、工程项目、委托人 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="90%"
    fixed-height
    :title="title || '选择委托单位'"
    :confram-loading="loading"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <iframe id="consignProject" :src="iframeSrc" frameborder="0" class="w-full h-full"></iframe>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IConsignProcessor, IConsignUnitProject } from '../../../interface'
import type { IDialogPropsSelector } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { useIndustryStore } from '~/store/industryStore'

interface DialogProp {
  consignProcessor: IConsignProcessor
}

const props = defineProps<IDialogPropsSelector<any>>()

const internalOpen = ref(true)
const loading = ref(false)
const iframeSrc = ref('')

const { consignProcessor } = props.customParams as DialogProp
const pageStateService = consignProcessor.pageStateService

const { getField } = useIndustryStore()
const industryProjectField = getField('project')

async function init() {
  const { consignUnit, project, sampleSender } = consignProcessor.data
  iframeSrc.value = `/ilis2/consignUnitController.do?listQuotes&singleSelect=true&unitId=${consignUnit.consignUnitId}&projectId=${project?.projectId}&sampleSenderId=${sampleSender.sampleSenderId}`
}

onMounted(() => {
  init()
})

/**
 * # 确认
 */
async function getFormData() {
  const iframe = document.getElementById('consignProject') as HTMLIFrameElement
  if (!iframe) {
    message.error('未找到委托单位/工程项目内容信息')
    return
  }

  const iframeWin = iframe.contentWindow as Window
  const consignUnit = iframeWin.dataGrid.datagrid('getSelected')
  const project = iframeWin.dataGrid1.datagrid('getSelected')
  const sampleSender = iframeWin.dataGrid0.datagrid('getSelected')

  if (!project && !pageStateService.isTestProject && industryProjectField?.selected) {
    message.warning('请选关联工程项目')
    return
  }
  if (!sampleSender) {
    message.warning('请选关联送样人员')
    return
  }

  loading.value = true

  const uitlocalS: IConsignUnitProject = {
    consignUnit,
    project: industryProjectField?.selected ? project : {},
    sampleSender,
  }

  consignProcessor.consignStorageManager.setConsignUnitStorage(uitlocalS)

  // eslint-disable-next-line no-console
  console.log(`缓存委托单位工程项目`, uitlocalS)

  // 检查选定委托单位的剩余信用额度
  await consignProcessor.consignFeeProcessor.checkCredit(
    consignUnit.id,
    consignProcessor.data.id || '',
    consignProcessor.consignFeeProcessor.consignFeeData.feeVo.ratedFee || 0,
  )

  return uitlocalS
}

async function handleConfirm() {
  const formData = await getFormData()
  if (formData) {
    internalOpen.value = false
    props.onConfirm(formData as any)
  }
}
</script>
