<template>
  <div>
    <a-spin tip="加载中..." :spinning="spinning">
      <a-row class="action_row">
        <div class="lt">
          <a-space>
            <!-- <a-input-search
              v-model:value="queryFrom.q"
              placeholder="请输入试验类型/标准设备"
              enter-button
              @search="getEquipmentCtList"
            /> -->
            <a-input-search
              v-model:value="queryFrom.q"
              placeholder="请输入标准设备"
              enter-button
              @search="getEquipmentCtList"
            />
          </a-space>
        </div>
        <div class="rt">
          <a-space>
            <a-button v-auth="'alarms::eq:cap::add'" type="primary" @click="openAddEquipmentCt">
              新增
            </a-button>
          </a-space>
        </div>
      </a-row>
      <a-table
        :data-source="dataSource"
        :columns="columns"
        bordered
        size="small"
        :row-selection="rowSelection"
        :pagination="pagination"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'handle'">
            <a-space>
              <a-button
                v-auth="'alarms::eq:cap::edit'"
                size="small"
                type="primary"
                @click="openEditModel(record)"
              >
                编辑
              </a-button>
              <a-popconfirm
                title="确定删除"
                ok-text="确认"
                cancel-text="取消"
                @confirm="deleteEquipmentCt(record)"
              >
                <a-button v-auth="'alarms::eq:cap::del'" size="small" type="primary" danger>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
          <template v-if="column.key === 'createdAt'">
            <span>{{ formatDate(record.createdAt) }}</span>
          </template>
          <template v-if="column.key === 'closed'">
            <a-tag v-if="record.closed" color="#f50">已关闭</a-tag>
          </template>
        </template>
      </a-table>

      <a-modal
        v-model:visible="visibleAddEquipment"
        width="550px"
        :centered="true"
        title="新增设备量能示警"
        @ok="equipmentFromSubmit"
      >
        <a-form
          ref="addEquipmentFormRef"
          :model="equipmentFrom"
          name="basic"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }"
          autocomplete="off"
        >
          <!-- <a-form-item
            label="专业类型"
            name="speciality"
            :rules="[{ required: true, message: '选择专业类型!' }]"
          >
            <a-select
              ref="select"
              v-model:value="equipmentFrom.speciality"
              placeholder="选择专业类型"
              @change="specialityChange"
            >
              <template v-for="item in specialtyList" :key="item.id">
                <a-select-option :value="item.id">{{ item.name }}</a-select-option>
              </template>
            </a-select>
          </a-form-item>

          <a-form-item
            label="版本号"
            name="version"
            :rules="[{ required: true, message: '请选择版本号!' }]"
          >
            <a-select
              ref="select"
              v-model:value="equipmentFrom.version"
              placeholder="请选择版本号"
              @change="versionChange"
            >
              <template v-for="item in versionList" :key="item.id">
                <a-select-option :value="item.id">{{ item.version }}</a-select-option>
              </template>
            </a-select>
          </a-form-item>

          <a-form-item
            label="等级"
            name="grade"
            :rules="[{ required: true, message: '选择等级!' }]"
          >
            <a-select
              ref="select"
              v-model:value="equipmentFrom.grade"
              :disabled="!selSpeciality.id || !selVersion.id"
              placeholder="选择等级"
              @change="gradeChange"
            >
              <template v-for="item in gradeList" :key="item.id">
                <a-select-option :value="item.id">{{ item.name }}</a-select-option>
              </template>
            </a-select>
          </a-form-item>
          <a-form-item
            label="试验项目"
            name="item"
            :rules="[{ required: true, message: '选择试验项目!' }]"
          >
            <a-select
              ref="select"
              v-model:value="equipmentFrom.item"
              :disabled="!selSpeciality.id || !selVersion.id || !selGrade.id"
              placeholder="选择试验项目"
              @change="testProjectChange"
            >
              <template v-for="item in testProjectList" :key="item.id">
                <a-select-option :value="item.id">{{ item.name }}</a-select-option>
              </template>
            </a-select>
          </a-form-item> -->

          <!-- <a-form-item
            label="标准设备"
            name="name"
            :rules="[{ required: true, message: '选择设备!' }]"
          >
            <a-select
              ref="select"
              v-model:value="equipmentFrom.name"
              placeholder="选择设备"
              :disabled="!selTestProject.id || !selGrade.id"
              @change="equipmentsChange"
            >
              <template v-for="item in equipmentsList" :key="item.id">
                <a-select-option :value="item.id">{{ item.name }}</a-select-option>
              </template>
            </a-select>
          </a-form-item> -->
          <a-form-item
            label="标准设备"
            name="name"
            :rules="[{ required: true, message: '选择设备!' }]"
          >
            <a-input-group compact>
              <a-input
                v-model:value="equipmentFrom.name"
                placeholder="请选择标准设备"
                disabled
                style="width: calc(100% - 60px)"
              />
              <a-button type="primary" @click="openSelEquipment">选择</a-button>
            </a-input-group>
          </a-form-item>

          <a-form-item
            label="标准量能"
            name="standard"
            :rules="[{ required: true, message: '请输入!' }]"
          >
            <a-row :wrap="false">
              <a-space>
                <a-button type="primary" @click="equipmentFrom.standard--">-</a-button>
                <a-input-number v-model:value="equipmentFrom.standard" />
                <a-button type="primary" @click="equipmentFrom.standard++">+</a-button>
              </a-space>
            </a-row>
          </a-form-item>
          <a-form-item
            label="极限量能"
            name="threshold"
            :rules="[{ required: true, message: '请输入!' }]"
          >
            <a-row :wrap="false">
              <a-space>
                <a-button type="primary" @click="equipmentFrom.threshold--">-</a-button>
                <a-input-number v-model:value="equipmentFrom.threshold" placeholder="请输入数字" />
                <a-button type="primary" @click="equipmentFrom.threshold++">+</a-button>
              </a-space>
            </a-row>
          </a-form-item>
        </a-form>
      </a-modal>

      <a-modal
        v-model:visible="visibleEditEquipment"
        width="550px"
        :centered="true"
        title="编辑设备量能示警"
        @ok="equipmentEditFromSubmit"
      >
        <a-form
          ref="addEquipmentFormRef"
          :model="equipmentEditFrom"
          name="basic"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }"
          autocomplete="off"
        >
          <a-form-item
            label="标准设备"
            name="name"
            :rules="[{ required: true, message: '选择设备!' }]"
          >
            <a-input v-model:value="equipmentEditFrom.name" disabled />
          </a-form-item>

          <a-form-item
            label="标准量能"
            name="standard"
            :rules="[{ required: true, message: '请输入!' }]"
          >
            <a-row :wrap="false" gutter="10px">
              <a-space>
                <a-button type="primary" @click="equipmentEditFrom.standard++">+</a-button>
                <a-input-number v-model:value="equipmentEditFrom.standard" />
                <a-button type="primary" @click="equipmentEditFrom.standard--">-</a-button>
              </a-space>
            </a-row>
          </a-form-item>
          <a-form-item
            label="极限量能"
            name="threshold"
            :rules="[{ required: true, message: '请输入!' }]"
          >
            <a-row :wrap="false" gutter="10px">
              <a-space>
                <a-button type="primary" @click="equipmentEditFrom.threshold++">+</a-button>
                <a-input-number
                  v-model:value="equipmentEditFrom.threshold"
                  placeholder="请输入数字"
                />
                <a-button type="primary" @click="equipmentEditFrom.threshold--">-</a-button>
              </a-space>
            </a-row>
          </a-form-item>
        </a-form>
      </a-modal>
    </a-spin>

    <standard-equipment-modal
      ref="standardEquipmentModalRef"
      type="radio"
      @on-selected="handleSelected"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, toRaw, nextTick, computed } from "vue"
import type {
  equipmentCapacityAddParms,
  equipmentCapacityEditParms
} from "@/type/api/earlyWarn.api"
import {
  getSpecialtyTypeAPI,
  getVersionAPI,
  getGradesAPI,
  getTestProjectAPI,
  getEquipmentsAPI,
  addEquipmentCapacityAPI,
  getEquipmentCtListAPI,
  deleteEquipmentCtAPI,
  editEquipmentCapacityAPI
} from "@/api/earlyWarn.api"
import { Modal, message } from "ant-design-vue"
import { formatDate } from "@/assets/js/common"
import dayjs, { Dayjs } from "dayjs"
import StandardEquipmentModal from "@/components/standardEquipmentModal/index.vue"

onMounted(() => {
  getEquipmentCtList()
  getSpecialtyType()
  getVersionList()
})
const visibleAddEquipment = ref<boolean>(false)
const visibleEditEquipment = ref<boolean>(false)
let spinning = ref(false)
let addEquipmentFormRef = ref()

// 选择标准设备
let standardEquipmentModalRef = ref()
const openSelEquipment = () => {
  standardEquipmentModalRef.value.openModal()
}
function handleSelected(equipments: { id: string; name: string }[]) {
  if (equipments.length === 0) {
    message.error("请选择设备")
    return
  }
  const equipment = equipments[0]
  equipmentFrom.value["id"] = equipment.id
  equipmentFrom.value["name"] = equipment.name
}

//获取专业类型数据
let specialtyList: any = ref([])
let selSpeciality: any = ref({})
const getSpecialtyType = async () => {
  try {
    specialtyList.value = await getSpecialtyTypeAPI()
  } catch (error) {
    console.error(error)
  }
}
// const specialityChange = (v) => {
//   selSpeciality.value = specialtyList.value.filter((item) => {
//     return item.id === v
//   })[0]
//   equipmentFrom.value["speciality"] = selSpeciality.value.name
//   getGradeList()
// }

//获取版本号数据
let versionList: any = ref([])
let selVersion: any = ref({})
const getVersionList = async () => {
  try {
    versionList.value = await getVersionAPI()
  } catch (error) {
    console.error(error)
  }
}
// const versionChange = (v) => {
//   selVersion.value = versionList.value.filter((item) => {
//     return item.id === v
//   })[0]
//   equipmentFrom.value["version"] = selVersion.value.version
//   getGradeList()
// }

//获取等级数据
// let gradeList: any = ref([])
// let selGrade: any = ref({})
// const getGradeList = async () => {
//   if (!selSpeciality.value.id || !selVersion.value.id) {
//     return
//   }
//   try {
//     gradeList.value = await getGradesAPI({
//       specId: selSpeciality.value.id,
//       versionId: selVersion.value.id
//     })
//     console.log(gradeList.value)
//   } catch (error) {
//     console.error(error)
//   }
// }
// const gradeChange = (v) => {
//   selGrade.value = gradeList.value.filter((item) => {
//     return item.id === v
//   })[0]
//   equipmentFrom.value["grade"] = selGrade.value.name
//   getTestProjectList()
//   getEquipments()
// }

//获取试验项目数据
// let testProjectList: any = ref([])
// let selTestProject: any = ref({})
// const getTestProjectList = async () => {
//   if (!selSpeciality.value.id || !selVersion.value.id || !selGrade.value.id) {
//     return
//   }
//   try {
//     testProjectList.value = await getTestProjectAPI({
//       specId: selSpeciality.value.id,
//       versionId: selVersion.value.id,
//       gradeId: selGrade.value.id
//     })
//     console.log(gradeList.value)
//   } catch (error) {
//     console.error(error)
//   }
// }
// const testProjectChange = (v) => {
//   selTestProject.value = testProjectList.value.filter((item) => {
//     return item.id === v
//   })[0]
//   equipmentFrom.value["item"] = selTestProject.value.name
//   getEquipments()
// }

//获取标准设备数据
// let equipmentsList: any = ref([])
// let selEquipments: any = ref({})
// const getEquipments = async () => {
//   if (!selTestProject.value.id || !selGrade.value.id) {
//     return
//   }
//   try {
//     equipmentsList.value = await getEquipmentsAPI({
//       itemId: selTestProject.value.id || "",
//       gradeId: selGrade.value.id || ""
//     })
//     console.log(gradeList.value)
//   } catch (error) {
//     console.error(error)
//   }
// }
// const equipmentsChange = (v) => {
//   selEquipments.value = equipmentsList.value.filter((item) => {
//     return item.id === v
//   })[0]
//   equipmentFrom.value["id"] = selEquipments.value.id
//   equipmentFrom.value["name"] = selEquipments.value.name
// }

let dataSource = ref([])

let equipmentFrom = ref<equipmentCapacityAddParms>({
  threshold: 0, //极限量能
  standard: 0, //  标准量能
  item: undefined, //试验项目
  grade: undefined, //等级
  version: undefined, //版本号
  id: undefined, //设备id
  name: undefined, //设备名称SHU
  speciality: undefined //专业类型
})

let equipmentEditFrom = ref<equipmentCapacityEditParms>({
  threshold: 0, //极限量能
  standard: 0, //  标准量能
  id: "", //设备id
  name: "" //设备
})

let queryFrom = ref({
  current: 1,
  size: 10,
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
    getEquipmentCtList()
  }
})
let selectedRowKeys = ref([])
let selectedRows = ref([])

let rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys, rows) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
    console.log("selectedRowKeys: ", keys)
    console.log("selectedRows: ", rows)
  }
}

const editProjectReset = async () => {
  //重置表单
  await nextTick()
  equipmentFrom.value = {
    threshold: 0, //极限量能
    standard: 0, //  标准量能
    item: undefined, //试验项目
    grade: undefined, //等级
    version: undefined, //版本号
    id: undefined, //设备id
    name: undefined, //设备名称SHU
    speciality: undefined //专业类型
  }
  // gradeList.value = []
  // selGrade.value = {}
  // equipmentsList.value = []
  // selEquipments.value = {}
  // testProjectList.value = []
  // selTestProject.value = {}

  selSpeciality.value = {}
  selVersion.value = {}

  addEquipmentFormRef.value && addEquipmentFormRef.value.resetFields() //重置表单
}

//数据新增提交
const equipmentFromSubmit = async () => {
  spinning.value = true
  try {
    await addEquipmentFormRef.value.validateFields() //验证
    await addEquipmentCapacityAPI(equipmentFrom.value)
    visibleAddEquipment.value = false
    getEquipmentCtList()
    message.success("添加成功")
  } catch (error) {
    console.error("表单验证失败")
  }
  spinning.value = false
}
// 编辑提交
const equipmentEditFromSubmit = async () => {
  spinning.value = true
  try {
    await editEquipmentCapacityAPI(equipmentEditFrom.value)
    visibleEditEquipment.value = false
    message.success("修改成功")
    getEquipmentCtList()
  } catch (error) {
    console.error(error)
  }
  spinning.value = false
}

const openAddEquipmentCt = () => {
  visibleAddEquipment.value = true
  editProjectReset()
}
const openEditModel = async (row) => {
  visibleEditEquipment.value = true
  equipmentEditFrom.value = {
    id: row.id,
    name: row.name,
    standard: row.standard,
    threshold: row.threshold
  }
}
const deleteEquipmentCt = async (row) => {
  spinning.value = true
  try {
    await deleteEquipmentCtAPI(row.id)
    getEquipmentCtList()
    spinning.value = false
  } catch (error) {
    console.error(error)
  }
}

const getEquipmentCtList = () => {
  spinning.value = true
  getEquipmentCtListAPI(queryFrom.value)
    .then((res) => {
      dataSource.value = res.records
      spinning.value = false
      pagination.value.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}

let columns = [
  // {
  //   title: "专业类型",
  //   dataIndex: "speciality",
  //   key: "speciality"
  // },
  // {
  //   title: "版本号",
  //   dataIndex: "version",
  //   key: "version"
  // },
  // {
  //   title: "等级",
  //   dataIndex: "grade",
  //   key: "grade"
  // },
  // {
  //   title: "试验类型",
  //   dataIndex: "item",
  //   key: "item"
  // },
  {
    title: "标准设备",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "标准量能",
    dataIndex: "standard",
    key: "standard"
  },
  {
    title: "极限量能",
    dataIndex: "threshold",
    key: "threshold"
  },
  {
    title: "创建人",
    dataIndex: "creator",
    key: "creator"
  },
  {
    title: "创建时间",
    key: "createdAt"
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
<style lang="less" scoped>
.ant-input-group-addon {
  border: none !important;
}
</style>
