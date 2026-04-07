<template>
  <div>
    <a-spin tip="加载中..." :spinning="spinning">
      <div class="equipment_wrap">
        <a-spin tip="加载中..." :spinning="spinning">
          <a-row class="action_row">
            <div class="lt">
              <a-space>
                <a-select
                  ref="select"
                  v-model:value="queryFrom.uploaded"
                  placeholder="请选择检定/校准证书状态"
                  style="width: 200px"
                >
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option :value="false">未上传</a-select-option>
                  <a-select-option :value="true">已上传</a-select-option>
                </a-select>

                <a-input-search
                  v-model:value="queryFrom.keyword"
                  placeholder="请输入设备名称,设备编号"
                  enter-button
                  @search="getLabEquipmentList"
                />
              </a-space>
            </div>
            <div class="rt">
              <a-space>
                <a-alert
                  v-if="!props.details"
                  banner
                  message="注：导入设备检定/校准证书时，请将文件名命名为设备编号"
                  type="info"
                />
                <a-button v-if="!props.details" type="primary" @click="openAddEquipment">
                  新增
                </a-button>

                <a-dropdown v-if="!props.details">
                  <template #overlay>
                    <a-menu>
                      <div>
                        <a-upload
                          :custom-request="customRequest"
                          :show-upload-list="false"
                          name="file"
                          :multiple="true"
                          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        >
                          <a-menu-item key="1">设备信息</a-menu-item>
                        </a-upload>
                      </div>
                      <div>
                        <uploadFile
                          :config="{
                            hideFileList: true,
                            multiple: true,
                            clearFileList: true
                            //   types: ['excel']
                          }"
                          @success="certificateCustomRequest"
                        >
                          <a-menu-item key="2">检定/校准证书</a-menu-item>
                        </uploadFile>
                      </div>
                    </a-menu>
                  </template>
                  <a-button>
                    导入
                    <DownOutlined />
                  </a-button>
                </a-dropdown>

                <!-- <a-button v-if="!props.details" @click="importFile">导入</a-button> -->

                <!-- <a-upload
                  :custom-request="customRequest"
                  :show-upload-list="false"
                  name="file"
                  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                >
                  <a-button v-if="!props.details">导入</a-button>
                </a-upload> -->

                <a-button
                  v-if="!props.details"
                  type="primary"
                  @click="downloadByNameOrUrl('工地试验室设备模板.xlsx')"
                >
                  下载模板
                </a-button>
                <a-button v-if="props.details" type="primary" @click="downloadAllEq">
                  下载所有检定/校准证书
                </a-button>
              </a-space>
            </div>
          </a-row>
          <a-table
            :data-source="equipmentSource"
            :columns="equipmentColumns"
            bordered
            size="small"
            row-key="id"
            :pagination="pagination"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'handle'">
                <a-space>
                  <a-button
                    v-if="!props.details"
                    size="small"
                    type="primary"
                    @click="editEquipment(record)"
                  >
                    编辑
                  </a-button>
                  <a-popconfirm
                    title="确定移除?"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="removeEquipment(record)"
                  >
                    <a-button v-if="!props.details" size="small" type="primary" danger>
                      移除
                    </a-button>
                  </a-popconfirm>
                  <a-button
                    size="small"
                    type="primary"
                    @click="openEquipmentCertificate(record.id)"
                  >
                    检校报告
                  </a-button>
                </a-space>
              </template>
              <template v-if="column.key === 'lastCalibrationDate'">
                <span>{{ formatDate(record.lastCalibrationDate) }}</span>
              </template>
              <template v-if="column.key === 'calibrationExpireDate'">
                <span>{{ formatDate(record.calibrationExpireDate) }}</span>
              </template>
            </template>
          </a-table>
        </a-spin>
      </div>

      <a-modal
        v-model:visible="editEquipmentVisble"
        width="650px"
        :title="equipmentFrom.id ? '编辑设备' : '新增设备'"
        @ok="handleEquipmentOk"
      >
        <a-form
          ref="editEquipmentFormRef"
          :model="equipmentFrom"
          name="basic"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 15 }"
          autocomplete="off"
          class="baseForm"
        >
          <a-form-item
            label="设备编号"
            name="sn"
            :rules="[{ required: true, message: '请输入设备编号!' }]"
          >
            <a-input v-model:value="equipmentFrom.sn" placeholder="请输入设备编号" />
          </a-form-item>
          <a-form-item
            label="设备名称"
            name="name"
            :rules="[{ required: true, message: '请输入设备名称!' }]"
          >
            <a-input v-model:value="equipmentFrom.name" placeholder="请输入设备名称" />
          </a-form-item>
          <a-form-item
            label="生产厂家"
            name="manufacturer"
            :rules="[{ required: true, message: '请输入生产厂家!' }]"
          >
            <a-input v-model:value="equipmentFrom.manufacturer" placeholder="请输入生产厂家" />
          </a-form-item>

          <a-form-item
            label="规格型号"
            name="specification"
            :rules="[{ required: true, message: '请输入规格型号!' }]"
          >
            <a-input v-model:value="equipmentFrom.specification" placeholder="请输入规格型号" />
          </a-form-item>

          <a-form-item
            label="标准设备"
            name="bzEquipments"
            :rules="[
              {
                required: true,
                message: '请选择标准设备!',
                type: 'array'
              }
            ]"
          >
            <a-input
              style="width: calc(100% - 66px); margin-right: 5px"
              :disabled="true"
              :value="
                equipmentFrom.bzEquipments.map((it) => {
                  return it.bzEquipment
                })
              "
              placeholder="请选择标准设备"
            />
            <a-button type="primary" @click="openStandardEQModal">选择</a-button>
          </a-form-item>

          <a-form-item
            label="检定/检校周期"
            name="calibrationCycle"
            :rules="[{ required: true, message: '请输入检定/检校周期!' }]"
          >
            <a-input-number
              v-model:value="equipmentFrom.calibrationCycle"
              style="width: 100%"
              placeholder="请输入检定/检校周期（/月）"
              :formatter="(value) => `${value} 月`"
            />
          </a-form-item>
          <a-form-item
            label="检定/检校单位"
            name="calibrationUnit"
            :rules="[{ required: true, message: '请输入检定/检校单位!' }]"
          >
            <a-input
              v-model:value="equipmentFrom.calibrationUnit"
              placeholder="请输入检定/检校单位"
            />
          </a-form-item>

          <a-form-item
            label="最近检定/检校日期"
            name="lastCalibrationDate"
            :rules="[{ required: true, message: '请选择最近检定/检校日期!' }]"
          >
            <a-date-picker
              v-model:value="equipmentFrom.lastCalibrationDate"
              placeholder="请选择最近检定/检校日期"
              style="width: 387px"
            />
          </a-form-item>

          <a-form-item label="购置日期" name="buyDate">
            <a-date-picker
              v-model:value="equipmentFrom.buyDate"
              placeholder="请选择购置日期"
              style="width: 387px"
            />
          </a-form-item>
          <a-form-item label="单价" name="price">
            <a-input-number
              v-model:value="equipmentFrom.price"
              style="width: 100%"
              placeholder="请输入单价"
              :formatter="(value) => `${value} 元`"
            />
          </a-form-item>

          <a-form-item label="量程或规格" name="measuringRange">
            <a-input v-model:value="equipmentFrom.measuringRange" placeholder="请输入量程或规格" />
          </a-form-item>

          <a-form-item label="精准度" name="accuracy">
            <a-input v-model:value="equipmentFrom.accuracy" placeholder="请输入精准度" />
          </a-form-item>

          <a-form-item label="保管人" name="custodian">
            <a-input v-model:value="equipmentFrom.custodian" placeholder="请输入保管人" />
          </a-form-item>
          <a-form-item
            label="检校证书"
            name="uploadCertificate"
            :rules="[
              {
                required: true,
                validator: validatePass,
                trigger: ['change', 'blur']
              }
            ]"
          >
            <uploadFile
              v-model:value="uploadCertificate"
              accept="image/* , .pdf"
              @success="uploadSuccess"
            />
          </a-form-item>
          <!-- <a-form-item label="附件" name="name">
            <uploadFile v-model:value="uploadAccessory" />
          </a-form-item> -->
        </a-form>
      </a-modal>
      <!-- 检校证书详情 -->
      <a-modal v-model:visible="certificateDetilesVisble" width="650px" title="检校证书">
        <a-list item-layout="horizontal" size="small" bordered :data-source="certificateDetiles">
          <template #renderItem="{ item }">
            <a-list-item>
              {{ item.name }}
              <template #actions>
                <a key="list-loadmore-edit" @click="downloadByNameOrUrl(item.url, true)">下载</a>
              </template>
            </a-list-item>
          </template>
        </a-list>

        <template #footer>
          <a-button type="primary" @click="certificateDetilesVisble = false">确定</a-button>
        </template>
      </a-modal>

      <!-- 标准设备选择 -->
      <a-modal
        v-if="standardEQCVisble"
        v-model:visible="standardEQCVisble"
        width="800px"
        title="标准设备选择"
      >
        <a-input-search
          placeholder="请输入标准设备名称"
          enter-button
          style="margin-bottom: 10px"
          @search="searchEqList"
        />

        <a-row justify="space-between">
          <a-col :span="13">
            <a-table
              :data-source="standardEQData"
              :columns="standardEQColumns"
              bordered
              size="small"
              row-key="bzEquipmentId"
              :custom-row="customRow"
              :row-selection="rowSelection"
              :pagination="StandardEqPagination"
            />
          </a-col>

          <a-col :span="10" style="border: 1px solid rgb(241 241 241); padding: 10px">
            <a-tag
              v-for="(item, index) in selectedRows"
              :key="item.bzEquipmentId"
              :closable="true"
              style="margin-bottom: 8px"
              @close="handleClose(item, index)"
            >
              {{ item.bzEquipment }}
            </a-tag>
          </a-col>
        </a-row>

        <template #footer>
          <a-button @click="standardEQCVisble = false">取消</a-button>
          <a-button type="primary" @click="selStEqOk">确定</a-button>
        </template>
      </a-modal>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, toRaw, nextTick, toRefs, inject } from "vue"
import { Ref } from "vue"
import {
  addLabEquipmentAPI,
  getLabEquipmentAPI,
  getLabEquipmentInfoAPI,
  editLabEquipmentAPI,
  removeEquipmentAPI,
  importLabEquipmentAPI,
  getLabEquipmentCertificateAPI,
  importLabCalibrationCertAPI,
  checkCalibrationCertAPI,
  downloadFileZipAPI,
  getStandardEqAPI
} from "@/api/laboratory.api"
import { downloadFile } from "@/assets/js/common"
import { EditLabEquipmentParams, StandardEqT } from "@/type/api/fieldLaboratory.api"
import dayjs, { Dayjs } from "dayjs"
import { formatDate } from "@/assets/js/common"
import uploadFile from "@/components/uploadFile/index.vue"
import { Modal, message } from "ant-design-vue"
import { downloadByNameOrUrl } from "@/config/minio.config"
// let laboratoryId: any = inject('laboratoryId'); //  试验室编辑id

let validatePass = async (_rule, value: string) => {
  if (uploadCertificate.value.length) {
    return Promise.resolve()
  } else {
    return Promise.reject("请上传检校证书!")
  }
}
const uploadSuccess = () => {
  editEquipmentFormRef.value.validateFields("uploadCertificate")
}
const props = defineProps({
  editId: {
    type: String,
    required: true
  },
  details: {
    type: Boolean,
    default: false
  }
})
const laboratoryId: any = toRefs(props).editId //试验室编辑id
let isApply = (inject<unknown>("isApply", false) as Ref) || ref(false) //  是否申请变更或延期
console.log("当前试验室id：", laboratoryId?.value)

onMounted(() => {
  getLabEquipmentList()
  getStandardEqList()
})
const editEquipmentFormRef = ref()
const uploadAccessory = ref([])
const uploadCertificate = ref([])

let dateRangeValue = ref<[Dayjs | null, Dayjs | null]>()
let editEquipmentVisble = ref(false)

let certificateDetilesVisble = ref(false)

let standardEQCVisble = ref(false)

let spinning = ref(false)
//设备编辑数据
let equipmentFrom = ref<EditLabEquipmentParams>({
  sn: "", //设备编号
  name: "", //设备名称
  lastCalibrationDate: "", //上次检校日期
  calibrationExpireDate: "", //检校到期日期
  manufacturer: "", //	生产厂家
  specification: "", //规格型号
  location: "", //安装位置
  remark: "", //备注
  laboratoryId: laboratoryId?.value, //试验室ID
  attachments: [], //附件集合
  id: "",
  measuringRange: "", //量程或规格
  calibrationUnit: "", //检定校准单位
  calibrationCycle: 0, //检定周期
  buyDate: "", //购置日期
  price: 0, //单价
  accuracy: "", //精度
  custodian: "", //保管人
  bzEquipments: [] //标准设备
})
let equipmentSource = ref([])

const downloadAllEq = async () => {
  spinning.value = true
  let res = await downloadFileZipAPI("EQUIPMENT_CERT", laboratoryId.value)
  if (!res) return
  downloadFile(res as any, "设备检校.zip")
  spinning.value = false
}

const openStandardEQModal = () => {
  standardEQCVisble.value = true
  selectedRows.value = equipmentFrom.value.bzEquipments
  selectedRowKeys.value = equipmentFrom.value.bzEquipments.map((it) => {
    return it.bzEquipmentId
  })
}
//选择时间回调
const setDateRange = (v) => {
  equipmentFrom.value.lastCalibrationDate = v[0].valueOf()
  equipmentFrom.value.calibrationExpireDate = v[1].valueOf()
}
let queryFrom = ref({
  current: 1,
  size: 10,
  labId: laboratoryId.value,
  keyword: "",
  uploaded: ""
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
    getLabEquipmentList()
  }
})

const editEquipment = async (row) => {
  spinning.value = true
  editEquipmentVisble.value = true
  await clearFrom()
  let res = await getLabEquipmentInfoAPI(row.id, {
    amend: isApply.value,
    labId: row.laboratoryId
  })
  res.lastCalibrationDate ? (res.lastCalibrationDate = dayjs(res.lastCalibrationDate)) : null
  res.buyDate ? (res.buyDate = dayjs(res.buyDate)) : null
  res.bzEquipments ? "" : (res.bzEquipments = [])
  equipmentFrom.value = res

  if (res.attachments.length) {
    //回显附件和证书
    console.log(res.attachments)
    let c: any = [],
      a: any = []
    res.attachments.forEach((item) => {
      let m = {
        url: item.url,
        name: item.name
      }
      if (item.customType == "eq_calibration_cert") {
        a.push(m)
      } else {
        c.push(m)
      }
    })
    uploadCertificate.value = a
    uploadAccessory.value = c
  }
  spinning.value = false
}

const customRequest = async (op) => {
  spinning.value = true
  let formData = new FormData()
  formData.append("file", op.file)
  formData.append("labId", laboratoryId.value)
  try {
    let res = await importLabEquipmentAPI(formData)
    spinning.value = false
    if (res.succeed) {
      message.success("导入成功")
      getLabEquipmentList()
    } else {
      let errorText = ""
      res.failRows.forEach((item) => {
        errorText += item.name + ":" + item.failReason + "!"
      })
      Modal.error({
        title: "导入失败",
        content: errorText
      })
    }
  } catch (error) {
    spinning.value = false
  }
}

const certificateCustomRequest = async (op) => {
  console.log(op)
  let nameArr: any = []
  let calibrationCerts: any = []

  op.forEach((it) => {
    nameArr.push(it.name)
    calibrationCerts.push({
      name: it.name,
      url: it.url,
      customType: "eq_calibration_cert"
    })
  })
  spinning.value = true
  try {
    //检查导入设备检校证书文件名是否为设备编号
    let r = await checkCalibrationCertAPI({
      labId: laboratoryId.value,
      fileNames: nameArr
    })

    //导入检验证书
    let r2 = await importLabCalibrationCertAPI({
      labId: laboratoryId.value,
      calibrationCerts: calibrationCerts
    })
    message.success("导入成功")
    getLabEquipmentList()
    spinning.value = false
  } catch (error) {
    spinning.value = false
  }

  // spinning.value = true
  // let formData = new FormData()
  // formData.append("file", op.file)
  // formData.append("labId", laboratoryId.value)
  // let res = await importLabEquipmentAPI(formData)
  // spinning.value = false
  // if (res.succeed) {
  //   message.success("导入成功")
  //   getLabEquipmentList()
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

const handleEquipmentOk = async () => {
  try {
    await editEquipmentFormRef.value.validateFields()
  } catch (error: any) {
    error.errorFields.forEach((it) => {
      message.warning(it.errors[0])
    })
    return
  }

  spinning.value = true
  let params = JSON.parse(JSON.stringify(toRaw(equipmentFrom.value)))
  params.attachments = []
  uploadCertificate.value.forEach((item: any) => {
    params.attachments.push({
      customType: "eq_calibration_cert",
      url: item.url,
      name: item.name
    })
  })
  uploadAccessory.value.forEach((item: any) => {
    params.attachments.push({
      customType: "eq_attachment",
      url: item.url,
      name: item.name
    })
  })

  let lastCalibrationDate = params.lastCalibrationDate
  lastCalibrationDate ? (params.lastCalibrationDate = dayjs(lastCalibrationDate).valueOf()) : ""
  let buyDate = params.buyDate
  buyDate ? (params.buyDate = dayjs(buyDate).valueOf()) : ""

  try {
    params.id ? await editLabEquipmentAPI(params) : await addLabEquipmentAPI(params)
    message.success("操作成功")
    editEquipmentVisble.value = false
  } catch (error) {
    console.error(error)
  }
  spinning.value = false
  getLabEquipmentList()
}

const getLabEquipmentList = async () => {
  spinning.value = true
  let res = await getLabEquipmentAPI(queryFrom.value)
  equipmentSource.value = res.records
  pagination.value.total = res.total
  spinning.value = false
}
let certificateDetiles = ref([])
const openEquipmentCertificate = async (id) => {
  let res = await getLabEquipmentCertificateAPI(id, laboratoryId.value)
  if (!res.length) {
    message.warning("此设备检校证书未上传")
    return
  }
  certificateDetiles.value = res
  certificateDetilesVisble.value = true
}

const clearFrom = async () => {
  //表单清空 重置
  equipmentFrom.value = {
    sn: "", //设备编号
    name: "", //设备名称
    lastCalibrationDate: "", //上次检校日期
    calibrationExpireDate: "", //检校到期日期
    manufacturer: "", //	生产厂家
    specification: "", //规格型号
    location: "", //安装位置
    remark: "", //备注
    laboratoryId: laboratoryId.value, //试验室ID
    attachments: [], //附件集合
    id: "",
    measuringRange: "", //量程或规格
    calibrationUnit: "", //检定校准单位
    calibrationCycle: 0, //检定周期
    buyDate: "", //购置日期
    price: 0, //单价
    accuracy: "", //精度
    custodian: "", //保管人
    bzEquipments: []
  }

  uploadAccessory.value = []
  uploadCertificate.value = []
  dateRangeValue.value = [null, null]
  await nextTick()
  editEquipmentFormRef.value.resetFields()
}
const removeEquipment = async (row: any) => {
  await removeEquipmentAPI(row.id, row.laboratoryId)
  getLabEquipmentList()
}

const openAddEquipment = () => {
  editEquipmentVisble.value = true
  clearFrom()
}

let equipmentColumns = [
  {
    title: "设备编号",
    dataIndex: "sn",
    key: "sn",
    width: 120
  },
  {
    title: "设备名称",
    dataIndex: "name",
    key: "name",
    width: 120
  },
  {
    title: "规格型号",
    dataIndex: "specification",
    key: "specification",
    width: 120
  },
  {
    title: "标准设备",
    dataIndex: "bzEquipments",
    key: "bzEquipments",
    width: 400,
    customRender: ({ text, record, index, column }) => {
      let arr: Array<StandardEqT> = text
      if (!arr) {
        return
      }
      let eqName: Array<string> = arr.map((it) => {
        return it.bzEquipment
      })
      return eqName.join(" , ")
    }
  },
  {
    title: "校验周期(月)",
    dataIndex: "calibrationCycle",
    key: "calibrationCycle",
    width: 120
  },
  {
    title: "检校单位",
    dataIndex: "calibrationUnit",
    key: "calibrationUnit",
    width: 120
  },
  {
    title: "最近检定/校准日期",
    // dataIndex: "calibrationExpireDate",
    // key: "calibrationExpireDate",
    dataIndex: "lastCalibrationDate",
    key: "lastCalibrationDate",
    width: 120
  },
  {
    title: "检定/校准证书",
    dataIndex: "uploadAttachment",
    key: "uploadAttachment",
    width: 120,
    customRender: ({ text }) => {
      return text ? "已上传" : "未上传"
    }
  },
  {
    title: "操作",
    key: "handle"
  }
]

let selectedRowKeys: Ref<string[]> = ref([])
let selectedRows: Ref<StandardEqT[]> = ref([])

let rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys, rows) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
    console.log("selectedRowKeys: ", keys)
    console.log("selectedRows: ", rows)
  }
}

const standardEQColumns = ref([
  {
    title: "序号",
    dataIndex: "index",
    key: "",
    width: 50,
    customRender: function ({ index }) {
      return index + 1
    }
  },
  {
    title: "标准设备名称",
    dataIndex: "bzEquipment",
    key: "bzEquipment"
  }
])
let standardEQDataAll: Ref<StandardEqT[]> = ref([])
let standardEQData: Ref<StandardEqT[]> = ref([])

const searchEqList = (v) => {
  v = v.trim()
  if (v == "") {
    standardEQData.value = standardEQDataAll.value
  }
  standardEQData.value = standardEQDataAll.value.filter((item) => {
    return item.bzEquipment.includes(v)
  })
  console.log(111222, v)
}

let StandardEqPagination = ref({
  size: "small",
  showTotal: (total) => `共 ${total} 条数据  `,
  showQuickJumper: false,
  showSizeChanger: false,
  total: 0,
  pageSizeOptions: ["10", "20", "50", "100"]
})

const handleClose = (d, i) => {
  selectedRowKeys.value.splice(i, 1)
  selectedRows.value.splice(i, 1)
}

let customRow = (row: StandardEqT, key) => {
  return {
    onClick: () => {
      if (selectedRowKeys.value.indexOf(row.bzEquipmentId) === -1) {
        selectedRowKeys.value.push(row.bzEquipmentId)
        selectedRows.value.push(row)
      } else {
        selectedRowKeys.value.forEach((item, index) => {
          if (item == row.bzEquipmentId) {
            selectedRowKeys.value.splice(index, 1)
            selectedRows.value.splice(index, 1)
          }
        })
      }
    }
  }
}

const selStEqOk = () => {
  equipmentFrom.value.bzEquipments = [...selectedRows.value]
  standardEQCVisble.value = false
  editEquipmentFormRef.value.validateFields(["bzEquipments"])
}

const getStandardEqList = async () => {
  spinning.value = true
  try {
    let r = await getStandardEqAPI()
    let arr = r.map((item) => {
      //直接格式化一下数据
      return {
        bzEquipment: item.name,
        bzEquipmentId: item.id
      }
    })
    standardEQData.value = arr
    standardEQDataAll.value = arr
  } catch (error) {
    message.error("请求错误")
  }
  spinning.value = false
}
</script>
<style lang="less" scoped>
.action_row {
  row-gap: 0px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}
</style>
