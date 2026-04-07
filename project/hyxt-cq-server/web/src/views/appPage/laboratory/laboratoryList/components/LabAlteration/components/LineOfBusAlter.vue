<template>
  <div>
    <a-spin tip="加载中..." :spinning="spinning">
      <div class="Business_wrap">
        <a-spin tip="加载中..." :spinning="spinning">
          <a-row class="action_row">
            <div class="lt">
              <a-space>
                <a-input-search
                  v-model:value="queryFrom.q"
                  placeholder="请输入试验项目及参数"
                  enter-button
                  @search="getLineOfBusinessList"
                />
              </a-space>
            </div>
            <div class="rt">
              <a-space>
                <a-button v-if="!props.details" type="primary" @click="openAddBusiness">
                  新增
                </a-button>

                <a-upload
                  :custom-request="customRequest"
                  :show-upload-list="false"
                  name="file"
                  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                >
                  <a-button v-if="!props.details">导入</a-button>
                </a-upload>

                <a-button
                  v-if="!props.details"
                  type="primary"
                  @click="downloadByNameOrUrl('试验室检测业务范围数据导入模板.xlsx')"
                >
                  下载模板
                </a-button>
              </a-space>
            </div>
          </a-row>
          <a-table
            :data-source="tableSource"
            :columns="tableColumns"
            bordered
            size="small"
            row-key="id"
            :pagination="pagination"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key == 'itemName'">
                <span>
                  {{ record.itemName }}/
                  {{ record.textParams }}
                </span>
              </template>
              <template v-if="column.key === 'handle'">
                <a-space>
                  <a-button
                    v-if="!props.details"
                    size="small"
                    type="primary"
                    @click="editBusiness(record)"
                  >
                    编辑
                  </a-button>
                  <a-popconfirm
                    title="确定移除?"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="removeBusiness(record)"
                  >
                    <a-button v-if="!props.details" size="small" type="primary" danger>
                      移除
                    </a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-spin>
      </div>

      <a-modal
        v-model:visible="editBusinessVisble"
        width="650px"
        :title="submitForm.id ? '编辑试验项目及参数' : '新增试验项目及参数'"
        @ok="handleBusinessOk"
      >
        <a-form
          ref="editBusinessFormRef"
          :model="submitForm"
          name="basic"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 15 }"
          autocomplete="off"
          class="baseForm"
        >
          <a-form-item
            label="试验项目"
            name="itemName"
            :rules="[{ required: true, message: '请输入试验项目!' }]"
          >
            <a-input v-model:value="submitForm.itemName" placeholder="请输入试验项目" />
          </a-form-item>
          <a-form-item
            label="检测参数"
            name="textParams"
            :rules="[{ required: true, message: '请输入检测参数!' }]"
          >
            <a-input v-model:value="submitForm.textParams" placeholder="请输入检测参数" />
          </a-form-item>
          <a-form-item
            label="检测方法和标准"
            name="standard"
            :rules="[{ required: true, message: '请输入检测方法和标准!' }]"
          >
            <a-input v-model:value="submitForm.standard" placeholder="请输入检测方法和标准" />
          </a-form-item>

          <a-form-item
            label="主要仪器设备名称"
            name="equipmentName"
            :rules="[{ required: true, message: '请输入主要仪器设备名称!' }]"
          >
            <a-input
              v-model:value="submitForm.equipmentName"
              placeholder="请输入主要仪器设备名称"
            />
          </a-form-item>

          <a-form-item
            label="设备编号"
            name="equipmentNo"
            :rules="[{ required: true, message: '请输入设备编号!' }]"
          >
            <a-input v-model:value="submitForm.equipmentNo" placeholder="请输入设备编号" />
          </a-form-item>
          <a-form-item
            label="主要操作人员"
            name="optMan"
            :rules="[{ required: true, message: '请输入主要操作人员!' }]"
          >
            <a-input v-model:value="submitForm.optMan" placeholder="请输入主要操作人员" />
          </a-form-item>
          <a-form-item label="备注" name="remark">
            <a-input v-model:value="submitForm.remark" placeholder="请输入备注" />
          </a-form-item>
        </a-form>
      </a-modal>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, toRaw, nextTick, toRefs, inject } from "vue"
import { Ref } from "vue"
import {
  addBusAlterAPI,
  updateBusAlterAPI,
  getAlterCheckBusAPI,
  deleteBusAlterAPI,
  getBusDetAlterAPI,
  importBusAlterAPI
} from "@/api/laboratory.api"
import { Modal, message } from "ant-design-vue"
import { downloadByNameOrUrl } from "@/config/minio.config"

const props = defineProps({
  labId: {
    type: String,
    required: true
  },
  alterId: {
    type: String,
    required: true
  },
  details: {
    type: Boolean,
    default: false
  }
})

const laboratoryId: any = toRefs(props).labId //试验室编辑id
const alterId: any = toRefs(props).alterId //变更id

console.log("当前试验室id：", laboratoryId?.value)

let isApply = inject<unknown>("isApply", false) as Ref //  是否申请变更或延期

onMounted(() => {
  getLineOfBusinessList()
})

const editBusinessFormRef = ref()

let editBusinessVisble = ref(false)

let certificateDetilesVisble = ref(false)

let spinning = ref(false)

let submitForm = ref({
  itemName: "", //试验项目
  textParams: "", //试验参数
  standard: "", //检测方法和标准（名称/编号）
  equipmentName: "", //主要仪器设备名称
  equipmentNo: "", //	设备编号
  optMan: "", //主要操作人员
  remark: "", //备注
  labId: laboratoryId?.value, //试验室ID
  id: ""
})
let tableSource = ref([])

let queryFrom = ref({
  current: 1,
  size: 10,
  labId: laboratoryId.value,
  q: ""
})

let pagination = ref({
  size: "small",
  showTotal: (total) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
  pageSizeOptions: ["10", "20", "50", "100"],
  onChange: (page, pageSize) => {
    queryFrom.value.current = page
    queryFrom.value.size = pageSize
    getLineOfBusinessList()
  }
})

const editBusiness = async (row) => {
  spinning.value = true
  editBusinessVisble.value = true
  await clearFrom()
  let res: any = await getBusDetAlterAPI(alterId.value, row.id)
  submitForm.value = res
  spinning.value = false
}

const customRequest = async (op) => {
  spinning.value = true
  let formData = new FormData()
  formData.append("file", op.file)
  formData.append("labId", laboratoryId.value)
  try {
    let res = await importBusAlterAPI(alterId.value, formData)
    spinning.value = false
    if (res.length) {
      res.forEach((it: any) => {
        message.warning(it)
      })
    } else {
      message.success("导入成功")
    }
    getLineOfBusinessList()
  } catch (error) {
    spinning.value = false
  }
  // if (res.succeed) {
  //   message.success("导入成功")
  //   getLineOfBusinessList()
  // } else {
  //   let errorText = ""
  //   res.failRows.forEach((item) => {
  //     errorText += item.name + ":" + item.failReason + "!"
  //   })
  //   Modal.error({
  //     title: "导入失败",
  //     content: errorText
  //   })
  // }
}

const handleBusinessOk = async () => {
  await editBusinessFormRef.value.validateFields()
  console.log(submitForm.value)
  spinning.value = true
  try {
    submitForm.value.id
      ? await updateBusAlterAPI(alterId.value, submitForm.value)
      : await addBusAlterAPI(alterId.value, submitForm.value)
    message.success("操作成功")
  } catch (error) {
    spinning.value = false
    console.error(error)
  }
  editBusinessVisble.value = false
  spinning.value = false
  getLineOfBusinessList()
}

const getLineOfBusinessList = async () => {
  spinning.value = true
  let res: any = await getAlterCheckBusAPI(alterId.value, queryFrom.value)
  tableSource.value = res.records
  pagination.value.total = res.total
  spinning.value = false
}

const clearFrom = async () => {
  //表单清空 重置
  submitForm.value = {
    itemName: "", //试验项目
    textParams: "", //试验参数
    standard: "", //检测方法和标准（名称/编号）
    equipmentName: "", //主要仪器设备名称
    equipmentNo: "", //	设备编号
    optMan: "", //主要操作人员
    remark: "", //备注
    labId: laboratoryId?.value, //试验室ID
    id: ""
  }
  await nextTick()
  editBusinessFormRef.value.resetFields()
}
const removeBusiness = async (row: any) => {
  await deleteBusAlterAPI(alterId.value, row.id)
  getLineOfBusinessList()
}

const openAddBusiness = () => {
  editBusinessVisble.value = true
  clearFrom()
}

let tableColumns = [
  {
    title: "试验项目及参数",
    dataIndex: "itemName",
    key: "itemName"
  },
  {
    title: "检测方法和标准（名称/编号）",
    dataIndex: "standard",
    key: "standard"
  },
  {
    title: "主要仪器设备名称",
    dataIndex: "equipmentName",
    key: "equipmentName"
  },
  {
    title: "设备编号",
    dataIndex: "equipmentNo",
    key: "equipmentNo"
  },
  {
    title: "主要操作人员",
    dataIndex: "optMan",
    key: "optMan"
  },
  {
    title: "操作",
    key: "handle"
  }
]
</script>
<style lang="less" scoped>
.action_row {
  row-gap: 0px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}
</style>
