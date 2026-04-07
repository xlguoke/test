<template>
  <div>
    <a-spin tip="加载中..." :spinning="spinning">
      <a-row class="action_row">
        <div class="lt">
          <!-- <a-space>
                        <a-input-search v-model:value="queryFrom.q" placeholder="请输入试验类型/标准设备" enter-button
                            @search="getStaffEarlyWarnConfigList" />
                    </a-space> -->
        </div>
        <div class="rt">
          <a-space>
            <a-button v-auth="'alarms::staff:cap::add'" type="primary" @click="openAddModel">
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
                v-auth="'alarms::staff:cap::edit'"
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
                @confirm="deleteRows(record)"
              >
                <a-button v-auth="'alarms::staff:cap::del'" size="small" danger>删除</a-button>
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
        v-model:visible="visibleEditStaffEarly"
        width="550px"
        :centered="true"
        title="新增人员量能示警"
        @ok="staffEarlyWarnConfigFromSubmit"
      >
        <a-form
          ref="editFormRef"
          :model="staffEarlyWarnConfigFrom"
          name="basic"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }"
          autocomplete="off"
        >
          <a-form-item
            label="角色类型"
            name="character"
            :rules="[{ required: true, message: '选择角色类型!' }]"
          >
            <a-select
              ref="select"
              v-model:value="staffEarlyWarnConfigFrom.character"
              placeholder="选择角色类型"
            >
              <template v-for="item in specialtyList" :key="item.id">
                <a-select-option :value="item">{{ item }}</a-select-option>
              </template>
            </a-select>
          </a-form-item>

          <a-form-item
            label="标准量能"
            name="standard"
            :rules="[{ required: true, message: '请输入!' }]"
          >
            <a-row :wrap="false">
              <a-space>
                <a-button type="primary" @click="staffEarlyWarnConfigFrom.standard--">-</a-button>
                <a-input-number v-model:value="staffEarlyWarnConfigFrom.standard" />
                <a-button type="primary" @click="staffEarlyWarnConfigFrom.standard++">+</a-button>
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
                <a-button type="primary" @click="staffEarlyWarnConfigFrom.threshold--">-</a-button>
                <a-input-number
                  v-model:value="staffEarlyWarnConfigFrom.threshold"
                  placeholder="请输入数字"
                />
                <a-button type="primary" @click="staffEarlyWarnConfigFrom.threshold++">+</a-button>
              </a-space>
            </a-row>
          </a-form-item>
        </a-form>
      </a-modal>
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, toRaw, nextTick, computed } from "vue"
import type {
  EditStaffCharactersConfig,
  equipmentCapacityEditParms
} from "@/type/api/earlyWarn.api"
import {
  addStaffEarlyWarnConfigAPI,
  getStaffCharactersAPI,
  editStaffEarlyWarnConfigAPI,
  deleteStaffEarlyWarnAPI,
  getEquipmentsAPI,
  addEquipmentCapacityAPI,
  getStaffEarlyWarnListAPI,
  deleteEquipmentCtAPI,
  editEquipmentCapacityAPI
} from "@/api/earlyWarn.api"
import { Modal, message } from "ant-design-vue"
import { formatDate } from "@/assets/js/common"
import dayjs, { Dayjs } from "dayjs"

onMounted(() => {
  getStaffEarlyWarnConfigList()
  getStaffCharacters()
})
const visibleEditStaffEarly = ref<boolean>(false)
const visibleEditEquipment = ref<boolean>(false)
let spinning = ref(false)
let editFormRef = ref()

//获取角色类型
let specialtyList: any = ref([])
let selSpeciality: any = ref({})
const getStaffCharacters = async () => {
  try {
    specialtyList.value = await getStaffCharactersAPI()
  } catch (error) {
    console.error(error)
  }
}
// const specialityChange = (v) => {
//     selSpeciality.value = specialtyList.value.filter(item => {
//         return (item.id === v)
//     })[0]
//     staffEarlyWarnConfigFrom.value['speciality'] = selSpeciality.value.name
//     getGradeList();
// }

let dataSource = ref([])

let staffEarlyWarnConfigFrom = ref<EditStaffCharactersConfig>({
  threshold: 0, //极限量能
  standard: 0, //  标准量能
  character: undefined, //人员角色类型
  id: ""
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
    getStaffEarlyWarnConfigList()
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

const editFromReset = async () => {
  //重置表单
  await nextTick()
  staffEarlyWarnConfigFrom.value = {
    threshold: 0, //极限量能
    standard: 0, //  标准量能
    character: undefined //角色类型
  }
  editFormRef.value && editFormRef.value.resetFields() //重置表单
}

//数据提交
const staffEarlyWarnConfigFromSubmit = async () => {
  spinning.value = true
  try {
    await editFormRef.value.validateFields() //验证
    staffEarlyWarnConfigFrom.value.id
      ? await editStaffEarlyWarnConfigAPI(staffEarlyWarnConfigFrom.value)
      : await addStaffEarlyWarnConfigAPI(staffEarlyWarnConfigFrom.value)
    visibleEditStaffEarly.value = false
    getStaffEarlyWarnConfigList()
    message.success("操作成功")
  } catch (error) {
    console.error("表单验证失败")
  }
  spinning.value = false
}

const openAddModel = () => {
  visibleEditStaffEarly.value = true
  editFromReset()
}
const openEditModel = async (row) => {
  console.log(row)
  visibleEditStaffEarly.value = true
  staffEarlyWarnConfigFrom.value = {
    threshold: row.threshold, //极限量能
    standard: row.standard, //  标准量能
    character: row.character, //角色类型
    id: row.id
  }
}
const deleteRows = async (row) => {
  spinning.value = true
  try {
    await deleteStaffEarlyWarnAPI(row.id)
    getStaffEarlyWarnConfigList()
    spinning.value = false
  } catch (error) {
    console.error(error)
  }
}

const getStaffEarlyWarnConfigList = () => {
  spinning.value = true
  getStaffEarlyWarnListAPI(queryFrom.value)
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
  {
    title: "角色类型",
    dataIndex: "character",
    key: "character"
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
