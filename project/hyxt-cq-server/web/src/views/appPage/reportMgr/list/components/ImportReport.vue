<template>
  <a-modal
    v-model:visible="visible"
    :title="`${exportType == 'info' ? '导入报告信息' : '导入报告文件'}`"
    :mask-closable="false"
    :keyboard="false"
    width="900px"
    @ok="saveModal"
  >
    <a-spin :spinning="spinning" tip="正在导入，请稍等...">
      <div v-if="exportType == 'info'">
        <ul>
          <li>
            1、导入报告信息之前请先按照
            <span
              v-if="isSubcontract"
              class="blue"
              @click="downloadByNameOrUrl('外委报告信息模板.xlsx')"
            >
              导入模板
            </span>
            <span v-else class="blue" @click="downloadByNameOrUrl('报告信息模板.xlsx')">
              导入模板
            </span>
            填写好报告信息
          </li>
          <template v-if="!isSubcontract">
            <li>
              2、导入
              <span class="error">报告信息中的防伪码</span>
              需和
              <span class="error">下载的防伪码一一对应，不可重复</span>
              ，否则会导入失败
            </li>
            <!-- <li>
              3、导入
              <span class="error">报告信息中的验证码</span>
              需和
              <span class="error">下载的验证码一一对应，不可重复</span>
              ，否则会导入失败
            </li> -->
          </template>
          <li>
            3、所有标识出的必填字段必须
            <span class="error">按要求填写完成后</span>
            导入，否则会导入失败
          </li>
        </ul>
        <p class="detail-title">报告信息上传</p>
      </div>
      <div v-else>
        <ul>
          <li>
            1、导入的报告文件必须用
            <span class="error">报告编号命名</span>
          </li>
          <li>
            2、导入的报告文件格式必须为
            <span class="error">pdf格式</span>
            ，否则无法导入
          </li>
          <li>
            3、导入的报告文件只能匹配
            <span class="error">未上传报告</span>
            状态的报告信息
          </li>
          <li>
            4、导入报告文件之前，应先
            <span class="error">导入报告信息</span>
            ，否则无法导入
          </li>
        </ul>
        <p class="detail-title">报告文件上传</p>
      </div>
      <div style="width: 50%">
        <a-form ref="refForm" :model="form" :label-col="{ style: { width: '125px' } }">
          <a-form-item
            name="labId"
            label="试验室名称"
            :rules="[{ required: true, message: '请选择试验室' }]"
          >
            <common-select
              v-model:value="form.labId"
              :url="userAuthLab()"
              :config="{
                placeholder: '请选择试验室'
              }"
            />
          </a-form-item>
          <a-form-item
            v-if="isSubcontract"
            label="检测机构"
            name="testLab"
            :rules="[{ required: true, message: '请输入检测机构' }]"
          >
            <a-input v-model:value="form.testLab" placeholder="请输入检测机构" />
          </a-form-item>
          <a-form-item v-if="exportType == 'info'" label="上传数据">
            <UploadFile
              :before-upload="beforeUploadInfo"
              :config="{
                btnName: '上传',
                disabled: isSubcontract ? !(form.labId && form.testLab) : form.labId ? false : true,
                hideFileList: true,
                multiple: false,
                types: ['excel']
              }"
            />
          </a-form-item>
          <a-form-item v-else label="上传文件">
            <UploadFile
              v-model:value="uploadFileList"
              :before-upload="beforeUpload"
              :config="{
                btnName: '上传',
                disabled: isSubcontract ? !(form.labId && form.testLab) : form.labId ? false : true,
                hideFileList: true,
                isReport: true,
                types: ['pdf']
              }"
              @fail-file-list="getFailFileList"
              @success="uploadSuccess"
            />
          </a-form-item>
        </a-form>
      </div>
      <div style="min-height: 150px">
        <template v-if="failFileList.length > 0">
          <p v-if="exportType == 'info'">导入失败，错误信息如下，请调整后重新上传：</p>
          <p v-else>以下报告文件导入失败，请调整后重新上传：</p>
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
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue"
import { message } from "ant-design-vue"
import type { TableColumnType } from "ant-design-vue"
import { importReportExcel, importReportCheckFile, importReportFiles } from "@/api/reportMgr.api"
import { userAuthLab } from "@/api/commonSelect.api"
import UploadFile from "@/components/uploadFile/index.vue"
import CommonSelect from "@/components/commonSelect/index.vue"
import { downloadByNameOrUrl } from "@/config/minio.config"

const props = defineProps({
  // 打开页面 1-报告列表 2-不合格报告 3-质量监督抽检报告 4-外委报告
  page: {
    type: [String, Number],
    default: "1"
  }
})

const emit = defineEmits(["updateList"])

const spinning = ref<boolean>(false)
const visible = ref<boolean>(false)
// 是否外委导入
const isSubcontract = ref<boolean>(props.page == "4")
// 导入类型
const exportType = ref<string>("info")
const openModal = (type: string) => {
  exportType.value = type
  visible.value = true
  initColumns(type)
}

defineExpose({
  openModal
})

const form = ref({
  labId: "",
  testLab: ""
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
// 校验失败文件列表
const failRows = ref<filesType[]>([])
// 导入失败所有数据列表
const failFileList = ref<filesType[]>([])
// 导入报告信息
const beforeUploadInfo = async (fileList) => {
  failFileList.value = []
  try {
    spinning.value = true
    const res: any = await importReportExcel({
      ...form.value,
      isSubcontract: isSubcontract.value,
      file: fileList
    })
    spinning.value = false
    if (res.succeed) {
      message.success("导入成功")
      return false
    }
    failFileList.value = res.failRows
  } catch (err) {
    console.error(err)
    spinning.value = false
  }
  return false
}

// 导入前文件检查
const beforeUpload = async (fileList) => {
  failFileList.value = []
  failRows.value = []
  const files = fileList.map((d) => {
    const ind = d.name.lastIndexOf(".") + 1
    const _type = ind != -1 ? d.name.substring(ind).toLowerCase() : ""
    return {
      name: d.name.substring(0, d.name.lastIndexOf(".")),
      suffix: _type,
      size: d.size
    }
  })
  try {
    spinning.value = true
    const res: any = await importReportCheckFile({
      ...form.value,
      isSubcontract: isSubcontract.value,
      files
    })
    if (!res) {
      spinning.value = false
      return false
    }
    const uploadFiles = reactive<any>([])
    for (let i = 0; i < res.files.length; i++) {
      const _file = res.files[i]
      if (_file.validated) {
        // 校验成功，通过名称查找到源文件上传
        const originFile = fileList.find((d) => d.name.indexOf(_file.name) !== -1)
        if (originFile) {
          console.log(`output->_file`, _file)
          originFile.bucketUri = `${_file.reportId}`
        }
        originFile && uploadFiles.push(originFile)
      } else {
        failRows.value.push(_file)
      }
    }
    if (uploadFiles.length === 0) {
      spinning.value = false
      failFileList.value = failRows.value
      return false
    }
    return Promise.resolve({ fileList: uploadFiles })
  } catch (err) {
    spinning.value = false
  }
}
// 获取上传失败的文件
const getFailFileList = (list) => {
  const uploadFiles = reactive<any>([])
  for (let i = 0; i < list.length; i++) {
    uploadFiles.push({
      name: list[i].name,
      size: list[i].size,
      suffix: list[i].suffix,
      url: "",
      validatedMsg: "上传失败",
      validated: false
    })
  }
  failFileList.value = [...failRows.value, ...uploadFiles]
}
// 上传成功，开始导入
const uploadFileList = ref([])
const uploadSuccess = (list) => {
  list = list.filter((f) => f.url)
  const files = list.map((d) => {
    const ind = d.name.lastIndexOf(".")
    return {
      name: d.name.substring(0, ind),
      suffix: d.name.substring(ind + 1),
      url: d.url,
      size: d.size
    }
  })
  importReportFiles({
    ...form.value,
    isSubcontract: isSubcontract.value,
    files
  })
    .then(() => {
      message.success("导入成功")
      spinning.value = false
      emit("updateList")
    })
    .catch(() => {
      uploadFileList.value = []
      spinning.value = false
    })
}

const columnsInfo = reactive<TableColumnType[]>([
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

const columnsFile = reactive<TableColumnType[]>([
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
    title: "报告编号",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "文件大小",
    dataIndex: "size",
    key: "size",
    customRender: ({ text }) => {
      return (text / 1024 / 1024).toFixed(2) + "M"
    }
  },
  {
    title: "匹配信息",
    dataIndex: "validateMsg",
    key: "validateMsg"
  }
])
const columns = ref<TableColumnType[]>([])
const initColumns = (type: string) => {
  if (type == "info") {
    columns.value = columnsInfo
  } else {
    columns.value = columnsFile
  }
}

const saveModal = () => {
  visible.value = false
}
</script>

<style lang="less" scoped></style>
