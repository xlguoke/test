<template>
  <a-modal
    v-model:visible="visible"
    title="导入继续教育学时"
    :mask-closable="false"
    :keyboard="false"
    width="900px"
  >
    <template #footer>
      <a-button type="primary" @click="saveModal">关闭</a-button>
    </template>
    <a-spin :spinning="spinning" tip="正在导入，请稍等...">
      <div>
        <ul>
          <li>
            1、导入继续教育学时之前先按照
            <span class="blue" @click="downloadByNameOrUrl('继续教育学时模板.xlsx')">导入模板</span>
            填写好学时信息
          </li>
          <!-- <li>
            2、模板中
            <span class="error">填写的人员信息</span>
            必须和
            <span class="error">系统中</span>
            已有的人员信息
            <span class="error">一致（姓名、证件号码）</span>
          </li> -->
          <li>
            2、模板中
            <span class="error">除</span>
            “备注”信息
            <span class="error">外</span>
            ，其他都为
            <span class="error">必填项</span>
          </li>
          <li>
            3、所有字段按照
            <span class="error">格式</span>
            要求（参照示例）填写
          </li>
        </ul>
        <p class="detail-title">继续教育学时上传</p>
      </div>
      <div style="width: 50%">
        <a-form ref="refForm" :label-col="{ style: { width: '125px' } }">
          <a-form-item label="上传数据">
            <UploadFile
              :before-upload="beforeUploadInfo"
              :config="{
                btnName: '上传',
                hideFileList: true,
                multiple: false,
                types: ['excel']
              }"
            />
          </a-form-item>
        </a-form>
      </div>
      <div style="min-height: 150px">
        <template v-if="failFileList.length > 0">
          <p>上传失败，错误信息如下，请调整后重新上传：</p>
          <a-table
            :data-source="failFileList"
            :columns="columns"
            :pagination="false"
            bordered
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key == 'message'">
                <span class="error">{{ record[column.key] }}</span>
              </template>
            </template>
          </a-table>
        </template>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue"
import { message } from "ant-design-vue"
import type { TableColumnType } from "ant-design-vue"
import { Modal } from "ant-design-vue"
import { importApi, secondaryConfirmationApi } from "@/api/continuingEducationHours.api"
import UploadFile from "@/components/uploadFile/index.vue"
import { downloadByNameOrUrl } from "@/config/minio.config"

const emit = defineEmits(["updateList"])

const spinning = ref<boolean>(false)
const visible = ref<boolean>(false)

const openModal = () => {
  visible.value = true
}

defineExpose({
  openModal
})

const refForm = ref()
interface filesType {
  name: string
  size: string | number
  suffix: string
  url: string | null
  validatedMsg: string
  validated: boolean | null
}
// 导入失败所有数据列表
const failFileList: any = ref([])
// 导入
const beforeUploadInfo = async (fileList: FileList) => {
  failFileList.value = []
  try {
    spinning.value = true
    const res: any = await importApi(fileList[0])
    spinning.value = false
    if (res && res.otherError.length > 0) {
      failFileList.value = res.otherError
      return false
    } else if (res && res.idNumNoExistError.length > 0) {
      let numbers = res.idNumNoExistError.map((it) => {
        return it.idNum
      })
      Modal.confirm({
        title: "提示?",
        content: numbers.join("、") + ",系统中无以上证件信息，请确认是否继续导入",
        async onOk() {
          await secondaryConfirmationApi({ tempFile: res.tempFile })
          message.success("导入成功")
          emit("updateList")
          visible.value = false
        }
      })

      return false
    }
    visible.value = false
    message.success("导入成功")
    emit("updateList")
  } catch (err) {
    console.error(err)
    spinning.value = false
  }
  return false
}

const columns = reactive<TableColumnType[]>([
  {
    title: "",
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
    customRender: function ({ index }) {
      return index + 1
    }
  },
  {
    title: "证件号码",
    dataIndex: "idNum",
    key: "idNum"
  },
  {
    title: "行号",
    dataIndex: "rowNum",
    key: "rowNum"
  },
  {
    title: "失败原因",
    dataIndex: "message",
    key: "message"
  }
])

const saveModal = () => {
  visible.value = false
}
</script>

<style lang="less" scoped></style>
