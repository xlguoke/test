<template>
  <ht-modal
    v-model:open="internalOpen"
    width="50%"
    title="导入"
    :after-close="onClosed"
    :loading="uploadLoading"
  >
    <template #footer>
      <a-button type="primary" @click="internalOpen = false">
        关闭
      </a-button>
    </template>
    <a-space class="mb-3">
      <a-upload
        name="file"
        accept=".xlsx,.xls"
        :multiple="false"
        :show-upload-lis="false"
        :before-upload="() => false"
        :file-list="[]"
        @change="handleImport"
      >
        <a-button :loading="uploadLoading" type="primary">
          导入检校证书信息
        </a-button>
      </a-upload>
      <a-button v-if="!param.EQUIPMENT_10" :loading="uploadLoading" @click="handleDownloadTemplate">
        下载导入模板
      </a-button>
      <a-button v-else :loading="uploadLoading" @click="handleDownloadTemplateByPlan">
        按检校计划下载
      </a-button>
    </a-space>
    <!-- 提示文案 -->
    <div v-if="!param.EQUIPMENT_10" class="mb-3">
      <div class="mb-1">
        下载导入模板即为空白模板，需要自行补充设备信息；导入后默认引用已配置所有检校参数；
      </div>
      <div class="mb-1">
        支持导入格式为.xls .xlsx的文件(手动修改文件后缀无效)模版中的表头不可更改，不可删除；
      </div>
      <div class="mb-1">
        导入时验证设备名称、设备编号、档案编号与系统中设备一致性；
      </div>
    </div>
    <div v-else class="mb-3">
      <div class="mb-1">
        按检校计划下载即下载检校计划中的设备信息；导入后引用计划中指定检校参数；
      </div>
      <div class="mb-1">
        支持导入格式为.xls .xlsx的文件(手动修改文件后缀无效)模版中的表头不可更改，不可删除；
      </div>
      <div class="mb-1">
        导入时验证计划名称、设备名称、设备编号、档案编号与系统中设备一致性；
      </div>
    </div>
  </ht-modal>
</template>

<script lang="ts" setup>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { importEquipmentCheckConfirm } from '../api'
import DownloadByCheckPlan from './DownloadByCheckPlan.vue'

interface IProps {
  EQUIPMENT_10: boolean
}

const props = defineProps<IDialogPropsParam<null, IProps>>()

const internalOpen = ref(true)

const uploadLoading = ref(false)

function handleDownloadTemplate() {
  window.open('/ilis2/checkController.do?downloadCheckTemp')
}

async function handleImport(info: any) {
  uploadLoading.value = true
  const { data } = await importEquipmentCheckConfirm(info.file).finally(() => {
    uploadLoading.value = false
  })
  if (data?.obj?.length) {
    Modal.error({
      title: '导入失败',
      content: () => h('div', { style: { maxHeight: '60vh', overflow: 'auto' } }, data?.obj?.map((item: any) => {
        return h('p', `第${item.rowNum + 1}行【${item.name || ''}】：${item.errorMsg}`)
      })),
    })
  }
  else {
    message.success('导入成功')
    props.onConfirm(null)
  }
}

async function handleDownloadTemplateByPlan() {
  await AnyDialogHelper.showModel(DownloadByCheckPlan)
}
</script>
