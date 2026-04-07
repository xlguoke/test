<template>
  <a-modal
    v-model:visible="visible"
    title="处理方案"
    :mask-closable="false"
    :keyboard="false"
    :confirm-loading="saveLoading"
    width="900px"
    @ok="saveModal"
  >
    <div style="min-height: 400px">
      <a-form
        ref="formRef"
        :model="form"
        :label-col="{ style: { width: '120px' } }"
        style="padding-right: 20px"
      >
        <a-form-item
          label="上报单位"
          name="admOrgId"
          :rules="[{ required: true, message: '请选择上报单位' }]"
        >
          <common-select
            v-model:value="form.admOrgId"
            :url="admList()"
            placeholder="请选择上报单位"
            style="width: 50%"
            :config="{
              keyword: 'orgName',
              disabled
            }"
            @change="
              ({ option }) => {
                form.admOrg = option.name || ''
              }
            "
          />
        </a-form-item>
        <a-form-item
          label="处理方式"
          name="disposeWay"
          :rules="[{ required: true, message: '请选择处理方式' }]"
        >
          <DictCode
            v-model:value="disposeWayArr"
            code="report::disposed_type"
            type="checkbox"
            :disabled="disabled"
            @change="
              ({ value }) => {
                form.disposeWay = value ? value.join(',') : ''
              }
            "
          />
        </a-form-item>
        <a-form-item
          label="方案描述"
          name="describe"
          :rules="[{ required: true, message: '请输入方案描述' }]"
        >
          <a-textarea
            v-model:value="form.describe"
            :rows="8"
            :disabled="disabled"
            placeholder="请输入方案描述"
          ></a-textarea>
        </a-form-item>
        <a-form-item label="附件信息">
          <FileList v-if="disabled" :datas="form.attachments" />
          <UploadFile v-else v-model:value="form.attachments" />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue"
import UploadFile from "@/components/uploadFile/index.vue"
import FileList from "@/components/fileList/index.vue"
import DictCode from "@/components/dictCode/index.vue"
import CommonSelect from "@/components/commonSelect/index.vue"
import { admList } from "@/api/commonSelect.api"
import { disposeInfoApi, disposeSaveApi } from "@/api/reportMgr.api"
import { disposeModeType } from "@/type/api/report.api"
import { message } from "ant-design-vue"

const emit = defineEmits(["updateList"])

const visible = ref<boolean>(false)
const spinning = ref<boolean>(false)
const disabled = ref<boolean>(false)
const dataId = ref<string>("")
const openModal = (id: string, isEdit: boolean) => {
  dataId.value = id
  disabled.value = !isEdit
  visible.value = true
  !isEdit && id && getDatas()
}

defineExpose({
  openModal
})

const getDatas = () => {
  spinning.value = true
  disposeInfoApi(dataId.value)
    .then((res: any) => {
      spinning.value = false
      disposeWayArr.value = res.disposeWay ? res.disposeWay.split(",") : []
      form.value = res
    })
    .catch(() => {
      spinning.value = false
    })
}

const form = ref<disposeModeType>({
  id: "",
  reportId: dataId.value,
  admOrg: "",
  admOrgId: "",
  disposeWay: "",
  describe: "",
  attachments: []
})
const disposeWayArr = ref<string[]>([])

// 保存
const formRef = ref()
const saveLoading = ref(false)
const saveModal = async () => {
  if (disabled.value) {
    visible.value = false
    return
  }
  await formRef.value.validateFields()
  const params = { ...form.value }
  if (!params.id) delete params.id
  params.reportId = dataId.value
  saveLoading.value = true
  disposeSaveApi(params)
    .then((res) => {
      message.success("保存成功")
      emit("updateList")
      visible.value = false
    })
    .catch(() => {
      saveLoading.value = false
    })
}
</script>

<style lang="less" scoped></style>
