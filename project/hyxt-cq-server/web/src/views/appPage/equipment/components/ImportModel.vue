<template>
  <div>
    <a-modal v-model:visible="visible" width="650px" :centered="true" title="导入设备信息">
      <div>
        <p>
          1、导入设备信息之前请先按照
          <a @click="downloadByNameOrUrl('设备信息导入模板.xlsx')">导入模板</a>
          填写好设备信息
        </p>
        <p>
          2、所有标识出的必填字段
          <span style="color: red">必须按要求填写完成</span>
          后导入，否则会导入失败
        </p>
        <p style="padding: 0px 10px; border-left: 3px solid #4a8de5; margin: 13px 0">
          设备信息上传
        </p>
        <a-form
          ref="importFormRef"
          :model="importFrom"
          name="basic"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }"
          autocomplete="off"
        >
          <a-form-item
            label="机构名称"
            name="orgId"
            :rules="[{ required: true, message: '选择机构!' }]"
          >
            <common-select
              v-model:value="importFrom.orgId"
              url="/org/by-type/org"
              :config="{
                disabled: !!userInfo.orgId,
                placeholder: '请选择机构'
              }"
            />
          </a-form-item>

          <a-form-item label="上传数据" name="sn">
            <a-upload
              :disabled="!importFrom.orgId"
              :custom-request="customRequest"
              name="file"
              :show-upload-list="false"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            >
              <a-button :disabled="!importFrom.orgId" type="primary">上传设备信息</a-button>
            </a-upload>
          </a-form-item>
        </a-form>

        <div style="min-height: 150px">
          <template v-if="failFileList.length > 0">
            <a-alert
              style="margin-bottom: 10px; padding: 5px 15px"
              message="导入失败，错误信息如下，请调整后重新上传"
              type="error"
              show-icon
            />
            <a-table
              :data-source="failFileList"
              :columns="columns"
              :pagination="false"
              bordered
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key == 'reason' || column.key == 'validateMsg'">
                  <span class="error">{{ record[column.key] }}</span>
                </template>
              </template>
            </a-table>
          </template>
        </div>
      </div>

      <template #footer>
        <a-button @click="visible = false">关闭</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, reactive } from "vue"

import { downloadByNameOrUrl } from "@/config/minio.config"
import { message } from "ant-design-vue"
import { importEquipment } from "@/api/equipment.api"
import userStore from "@/stores/userInfo"
import { storeToRefs } from "pinia"

const emit = defineEmits(["successOk"])

const { userInfo } = storeToRefs(userStore())

const visible = ref(false)

const importFrom = ref({
  orgId: userInfo.value.orgId
})
const loading = ref(false)
const importFormRef = ref()
const failFileList = ref([])

const columns = reactive([
  {
    title: "",
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
    customRender: function ({ index }: any) {
      return index + 1
    }
  },
  {
    title: "设备编号",
    dataIndex: "sn",
    key: "sn"
  },
  {
    title: "设备名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "行号",
    dataIndex: "realRowNum",
    key: "realRowNum"
  },
  {
    title: "失败原因",
    dataIndex: "errorMsg",
    key: "errorMsg"
  }
])

const customRequest = async (op: any) => {
  loading.value = true
  let formData = new FormData()
  formData.append("file", op.file)
  let res: any = await importEquipment(importFrom.value.orgId, formData)
  loading.value = false
  if (!res.errorData || res.errorData.length === 0) {
    message.success("导入成功")
    visible.value = false
    emit("successOk")
  } else {
    failFileList.value = res.errorData || []
  }
}
const resetData = async () => {
  await nextTick()
  importFormRef.value.resetFields() //重置表单
  failFileList.value = []
}
const openModel = () => {
  visible.value = true
  resetData()
}
defineExpose({
  openModel
})
</script>
