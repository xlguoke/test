<template>
  <div>
    <a-modal
      v-model:visible="visibleImportOuterReport"
      width="650px"
      :centered="true"
      title="导入外委报告信息"
    >
      <div>
        <p>
          1、导入外委报告信息之前请先按照
          <a @click="downloadByNameOrUrl('外委报告导入模板.xlsx')">导入模板</a>
          填写好报告信息
        </p>
        <p>
          2、所有标识出的必填字段
          <span style="color: red">必须按要求填写完成</span>
          后导入，否则会导入失败
        </p>
        <p style="padding: 0px 10px; border-left: 3px solid #4a8de5; margin: 13px 0">
          报告信息上传
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
            label="试验室名称"
            name="laboratoryId"
            :rules="[{ required: true, message: '选择试验室!' }]"
          >
            <common-select
              v-model:value="importFrom.laboratoryId"
              url="/labs?user-labs"
              :config="{
                placeholder: '请选择试验室'
              }"
            />
          </a-form-item>

          <a-form-item label="上传数据" name="sn">
            <a-upload
              v-if="visibleImportOuterReport"
              :disabled="!importFrom.laboratoryId"
              :custom-request="customRequest"
              name="file"
              :show-upload-list="false"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            >
              <a-button :disabled="!importFrom.laboratoryId" type="primary">上传报告信息</a-button>
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
            <!-- <p style="padding: 10px 0">导入失败，错误信息如下，请调整后重新上传：</p> -->
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
        <a-button type="primary" @click="visibleImportOuterReport = false">确定</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import CommonSelect from "@/components/commonSelect/index.vue"
import { ref, nextTick, reactive } from "vue"

import { downloadByNameOrUrl } from "@/config/minio.config"
import { message } from "ant-design-vue"
import { importOuterReport } from "@/api/reportMgr.api"
let visibleImportOuterReport = ref(false)

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
    title: "报告编号",
    dataIndex: "reportSn",
    key: "reportSn"
  },
  {
    title: "表单名称",
    dataIndex: "sheetName",
    key: "sheetName"
  },
  {
    title: "行号",
    dataIndex: "rowNum",
    key: "rowNum"
  },
  {
    title: "失败原因",
    dataIndex: "reason",
    key: "reason"
  }
])

let loading = ref(false)

let importFormRef = ref()
const emit = defineEmits(["successOk"])
const failFileList = ref([])
let importFrom = ref({
  laboratoryId: ""
})
const customRequest = async (op: any) => {
  loading.value = true
  let formData = new FormData()
  formData.append("file", op.file)
  formData.append("labId", importFrom.value.laboratoryId)
  let res: any = await importOuterReport(formData)
  loading.value = false
  if (res.succeed) {
    message.success("导入成功")
    visibleImportOuterReport.value = false
    emit("successOk")
  } else {
    failFileList.value = res.failRows
  }
}
const resetData = async () => {
  await nextTick()
  importFormRef.value.resetFields() //重置表单
  importFormRef.value = {
    laboratoryId: ""
  }
  failFileList.value = []
}
const openModel = () => {
  visibleImportOuterReport.value = true
  resetData()
}
defineExpose({
  openModel
})
</script>
