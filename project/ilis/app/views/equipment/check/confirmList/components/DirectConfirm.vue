<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    title="提交确认"
    :after-close="onClosed"
    :loading="loading"
    @ok="handleConfirm"
  >
    <a-space direction="vertical" style="width: 100%;">
      <div class="t bg-[#c6e4fe] px-3 py-3">
        <div class="title ">
          温馨提示
        </div>
        <div class="line">
          当系统中生成的检校确认表无法满足您的要求时，您可直接上传签字完成的检校确认表。
        </div>
        <div class="line">
          点确定后，则无需走审批流程，状态直接变为审批通过。
        </div>
      </div>
      <BaseTitle>检校确认表</BaseTitle>
      <HtUploadFile
        v-if="certInitData.id"
        :business-id="certInitData.id"
        :business-type="BUSINES_TYPE.EQ_CHECK_CONFIRM_FILE"
        force-init
        :accept="['pdf', 'png', 'jpg', 'jpeg']"
        @get-data="updateConfirmFile"
        @init-complete="updateConfirmFile"
      >
        <template #footer="{ handleCancel, fileDatas }">
          <a-space>
            <a-button @click="handleCancel">
              取消
            </a-button>
            <a-button type="primary" @click="handleCheckFile(fileDatas, handleCancel)">
              确定
            </a-button>
          </a-space>
        </template>
      </HtUploadFile>
      <BaseTitle class="mt-4">
        证书信息
      </BaseTitle>
      <IlisForm
        ref="certFormRef"
        :cols="2"
        :entity="EquipmentCheckConfirmEntity"
        :init-data="certInitData"
        :field-list="fieldList"
      >
        <template #certFile>
          <HtUploadFile
            v-if="certInitData.id"
            :business-id="certInitData.id"
            :business-type="BUSINES_TYPE.EQ_CHECK_FILE"
            force-init
            :accept="['doc', 'xls', 'docx', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png']"
          />
        </template>
        <template #otherFile>
          <HtUploadFile
            v-if="certInitData.id"
            :business-id="certInitData.id"
            :business-type="BUSINES_TYPE.EQ_CHECK_OTHER_FILE"
            force-init
            :accept="['doc', 'xls', 'docx', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png']"
          />
        </template>
      </IlisForm>
      <BaseTitle>本次确认参数</BaseTitle>
      <IlisTable
        show-index
        row-key="id"
        :loading="tableLoading"
        :entity="EquipmentCheckParamEntity"
        :data-source="dataSource"
        :row-selection="getRowSelection()"
        :custom-row="getCustomRow()"
        :field-list="EquipmentCheckParamEntity.getTableFieldList()?.filter(i => !['operation'].includes(i))"
        :table-width="800"
      ></IlisTable>
      <a-form-item label="其他附件">
        <HtUploadFile
          v-if="certInitData.id"
          :business-id="certInitData.id"
          :business-type="BUSINES_TYPE.EQ_CHECK_VERDICT_OTHER_FILE"
          force-init
          :accept="['doc', 'xls', 'docx', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png']"
        />
      </a-form-item>
    </a-space>
  </ht-modal>
</template>

<script lang="ts" setup>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { message } from 'ant-design-vue'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import { BaseTitle } from '~/components/UI'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getParamPage } from '../../param/api'
import { EquipmentCheckParamEntity } from '../../param/EquipmentCheckParamEntity'
import { directConfirm, getEquipmentCheckConfirmDetail } from '../api'
import { EquipmentCheckConfirmEntity } from '../EquipmentCheckConfirmEntity'

const props = defineProps<IDialogPropsParam<null, EquipmentCheckConfirmEntity>>()

const internalOpen = ref(true)

const loading = ref(false)

/** # 证书信息表单ref */
const certFormRef = ref<IlisFormExpose<EquipmentCheckConfirmEntity>>()

/** # 证书信息表单初始化数据 */
const certInitData = ref(EquipmentCheckConfirmEntity.fromJSON(props.param))

const fieldList = computed(() => {
  // 类型为检定（0）时，展示检校结论（verdict）字段
  if (certInitData.value.checkType === '0') {
    return EquipmentCheckConfirmEntity.getFormFieldList()
  }
  return EquipmentCheckConfirmEntity.getFormFieldList().filter(i => i !== 'verdict')
})

async function handleCheckFile(files: any[], cancelFn: any) {
  if (!files.length) {
    message.warning('请上传确认文件！')
    return
  }

  if (files.length !== 1) {
    message.warning('确认文件只能上传1个！')
    return
  }

  cancelFn()
}

const confirmFileData = ref<any[]>([])

function updateConfirmFile(data: any) {
  confirmFileData.value = data.fileDatas
}

const {
  loading: tableLoading,
  dataSource,
  selectedRowKeys,
  getCustomRow,
  getRowSelection,
} = useTableHooks<EquipmentCheckParamEntity>({
  api: getParamPage,
  isPagination: false,
  sizeKey: 'rows',
  payload: {
    objId: props.param?.equipmentId,
    type: '1',
  },
})

async function getCertDetail(id: string) {
  const { data: { obj } } = await getEquipmentCheckConfirmDetail(id)
  certInitData.value = EquipmentCheckConfirmEntity.fromJSON(obj.check)
}

async function handleConfirm() {
  if (!confirmFileData.value.length) {
    message.warning('检校确认表附件必须上传！')
    return
  }

  if (confirmFileData.value.length > 1) {
    message.warning('检校确认表附件只能上传1个，请调整后提交！')
    return
  }

  await certFormRef.value?.getFormData()

  loading.value = true
  await directConfirm({
    checkVo: { ...certInitData.value },
    checkItemIds: selectedRowKeys.value as string[],
  }).finally(() => {
    loading.value = false
  })
  message.success('操作成功')
  internalOpen.value = false
  props.onConfirm(null)
}

getCertDetail(props.param.id)
</script>
