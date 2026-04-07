<template>
  <ht-modal
    v-model:open="internalOpen"
    width="50%"
    title="导入"
    :after-close="onClosed"
    :loading="loading"
    @ok="handleConfirm"
  >
    <a-space class="mb-3">
      <HtUploadFile
        force-init
        hide-file-list
        :business-type="BUSINES_TYPE.GENERAL"
      >
        <template #footer="{ handleCancel, fileDatas }">
          <a-space>
            <a-button @click="handleCancel">
              取消
            </a-button>
            <a-button type="primary" @click="handleMatchData(fileDatas).then(() => handleCancel())">
              确定
            </a-button>
          </a-space>
        </template>
      </HtUploadFile>
    </a-space>
    <!-- 提示文案 -->
    <div class="mb-3">
      <div class="mb-1">
        文件上传说明
      </div>
      <div class="mb-1">
        1、上传文件名称必须包含设备编号、检校证书编号或检校证书名称其中之一
      </div>
      <div class="mb-1">
        2、单个设备的检校证书附件建议只创建一个独立文件
      </div>
    </div>
    <!-- 上传结果 -->
    <BaseTitle>上传结果</BaseTitle>
    <div class=" bg-[#fff1d5] px-2 py-1 mb-3">
      {{
        `
        本次合计上传文件 ${checkResults?.length} 个，
        匹配成功 ${checkResults?.filter(i => i?.verifyResult?.length === 1)?.length} 条，
        匹配失败 ${checkResults?.filter(i => !i?.verifyResult?.length)?.length} 条，
        匹配多条记录 ${checkResults?.filter(i => i?.verifyResult?.length > 1)?.length} 条；
        `
      }}
    </div>
    <IlisTable
      row-key="id"
      table-height="55vh"
      :entity="CheckConfirmBatchUploadCertEntity"
      :data-source="checkResults"
    >
      <template #bodyCell="{ record, column, index }">
        <template v-if="column.dataIndex === 'name'">
          <a :href="record?.file?.url">{{ record?.file?.name }}</a>
        </template>
        <template v-if="column.dataIndex === 'eqCheckList'">
          <div v-if="record?.verifyResult?.length === 1">
            {{ record?.verifyResult[0]?.name }}
          </div>
          <div v-if="record?.verifyResult?.length > 1">
            <IlisInput
              v-model="record!.eqCheckList"
              field="eqCheckList"
              :entity="CheckConfirmBatchUploadCertEntity"
              :options="record?.verifyResult?.map((i:any) => ({
                label: i.name,
                value: JSON.stringify({
                  id: i.id,
                  equipmentId: i.equipmentId,
                }),
              }))"
            ></IlisInput>
          </div>
        </template>
        <template v-if="column.dataIndex === 'result'">
          <div v-if="!record?.verifyResult?.length" class="text-[red]">
            匹配失败
          </div>
          <div v-if="record?.verifyResult?.length === 1" class="text-[orange]">
            匹配成功
          </div>
          <div v-if="record?.verifyResult?.length > 1" class="text-[orange]">
            匹配多条记录
          </div>
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <a-button type="link" danger @click="handleDelete(index)">
            删除
          </a-button>
        </template>
      </template>
    </IlisTable>
  </ht-modal>
</template>

<script lang="ts" setup>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message, Modal } from 'ant-design-vue'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import { BaseTitle } from '~/components/UI'
import { importCertificateVerify, saveCertificateVerify } from '../api'
import { CheckConfirmBatchUploadCertEntity } from '../CheckConfirmBatchUploadCertEntity'

interface IProps {

}

const props = defineProps<IDialogPropsParam<null, IProps>>()

const internalOpen = ref(true)

const loading = ref(false)

const checkResults = ref<any[]>([])

async function handleMatchData(files: any[]) {
  const { data } = await importCertificateVerify(files)
  checkResults.value = checkResults.value?.concat(data.data?.map((i: any) => {
    i.eqCheckList = []
    return i
  }))
}

async function handleDelete(index: number) {
  Modal.confirm({
    title: '提示',
    content: '确定要删除这条数据吗？',
    centered: true,
    onOk: async () => {
      checkResults.value.splice(index, 1)
    },
  })
}

async function handleConfirm() {
  if (checkResults.value?.some((i) => {
    return !i.verifyResult?.length
  })) {
    Modal.confirm({
      title: '提示',
      content: '系统仅导入匹配成功文件，是否继续？',
      centered: true,
      onOk: async () => {
        loading.value = true
        await handleSubmit().finally(() => {
          loading.value = false
        })
      },
    })
  }
  await handleSubmit()
}

async function handleSubmit() {
  const params = checkResults.value?.map((i) => {
    return {
      file: i.file,
      eqCheckList: i.eqCheckList.map((j: any) => JSON.parse(j)),
    }
  })
  await saveCertificateVerify(params)
  message.success('上传成功')
  props.onConfirm(null)
  internalOpen.value = false
}
</script>
