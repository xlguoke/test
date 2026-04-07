<template>
  <div class="">
    <a-spin tip="加载中..." :spinning="spinning">
      <a-row class="action_row">
        <div class="lt">
          <a-space>
            <a-input-search
              v-model:value="queryFrom.shortcut"
              placeholder="请输入试验项目或参数"
              enter-button
              @search="getLabAuthBusinessList"
            />
          </a-space>
        </div>
        <div class="rt">
          <a-space>
            <a-button v-if="!props.details" type="primary" @click="openAddEquipment">新增</a-button>
          </a-space>
        </div>
      </a-row>
      <a-table
        :data-source="equipmentSource"
        :columns="equipmentColumns"
        bordered
        size="small"
        row-key="id"
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'handle'">
            <a-space>
              <a-button
                v-if="!props.details"
                v-show="!record.isEdit"
                size="small"
                type="primary"
                @click="editAuthBusiness(record)"
              >
                编辑
              </a-button>
              <a-button
                v-if="!props.details"
                v-show="record.isEdit"
                size="small"
                type="primary"
                @click="updateBusiness(record)"
              >
                保存
              </a-button>
              <a-popconfirm
                title="确定移除?"
                ok-text="确定"
                cancel-text="取消"
                @confirm="removePojectParms(record.id)"
              >
                <a-button v-if="!props.details" size="small" type="primary" danger>移除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
          <template v-if="column.key === 'detectionMethod'">
            <a-input
              v-if="record.isEdit"
              v-model:value="record.detectionMethod"
              placeholder="请输入检测方法"
            />
            <span v-else>{{ record.detectionMethod }}</span>
          </template>
        </template>
      </a-table>

      <a-modal
        v-model:visible="editEquipmentVisble"
        width="650px"
        title="添加检测项目及参数"
        @ok="addAuthBusiness"
      >
        <a-row justify="space-between">
          <a-col :span="8">
            <a-select v-model:value="selQualify" style="width: 100%" @change="qualifyChange">
              <a-select-option v-for="item in qualifyList" :key="item.id" :value="item.id">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-col>
          <a-col :span="16" style="text-align: right">
            <a-input-search
              v-model:value="quickParamName"
              style="width: calc(100% - 15px)"
              placeholder="请输入参数名称"
              enter-button
              @search="getParamnsList"
            />
          </a-col>
        </a-row>
        <a-row style="margin-top: 15px">
          <a-col :span="8" class="testpj_rt">
            <a-tree
              :check-strictly="true"
              :checkable="true"
              :checked-keys="selProjectKeys"
              :selected-keys="selProjectNodeKey"
              :tree-data="projectParmsTree"
              :field-names="{ children: 'children', title: 'itemName', key: 'itemId' }"
              :auto-expand-parent="true"
              @check="selTreeNode"
              @select="selTreeNode"
            >
              <!-- <template #title="{ itemName, key }">
                <span v-if="key === '0-0-1'" style="color: #1890ff">{{ name }}</span>
                <template v-else>{{ itemName }}</template>
              </template> -->
            </a-tree>
          </a-col>

          <a-col :span="16">
            <div
              style="
                width: calc(100% - 15px);
                float: right;
                height: 500px;
                padding: 5px;
                border: 1px solid #ededed;
              "
            >
              <a-table
                :data-source="paramsArray"
                :columns="paramColumns"
                bordered
                :loading="loading"
                :scroll="{ y: 450 }"
                :row-selection="rowSelection"
                size="small"
                row-key="paramId"
                :pagination="false"
                :custom-row="customRow"
              ></a-table>
            </div>
          </a-col>
        </a-row>
      </a-modal>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, toRefs, inject } from "vue"
import { Ref } from "vue"
import {
  getLabBusinessScopeAPI,
  getLaboratoryQualifyAPI,
  getPojectTreeAPI,
  getPojectParmsAPI,
  addAuthBusinessAPI,
  removePojectParmsAPI,
  updateAuthBusinessAPI
} from "@/api/laboratory.api"
import { message } from "ant-design-vue"

let isApply = inject<unknown>("isApply", false) as Ref //  是否申请变更或延期

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

console.log("当前试验室id：", laboratoryId?.value)

let loading = ref(false)

onMounted(() => {
  getLabAuthBusinessList()
})

let editEquipmentVisble = ref(false)

let spinning = ref(false)

let equipmentSource = ref([])

let equipmentColumns = [
  {
    title: "试验项目",
    colSpan: 2,
    dataIndex: "parentItemName",
    key: "parentItemName",
    customCell: (record) => {
      return { rowSpan: record.parentItemRowSpan }
    }
  },
  {
    title: "",
    dataIndex: "itemName",
    colSpan: 0,
    key: "itemName",
    customCell: (record) => {
      return { rowSpan: record.itemRowSpan }
    }
  },
  {
    title: "检测参数",
    dataIndex: "paramName",
    key: "paramName"
  },
  {
    title: "检测方法",
    dataIndex: "detectionMethod",
    key: "detectionMethod",
    width: 300
  },
  {
    title: "操作",
    key: "handle"
  }
]
let paramColumns = ref([
  {
    title: "参数名称",
    dataIndex: "paramName",
    key: "paramName"
  }
])
let selectedRowKeys = ref([])
let selectedRows = ref([])
let rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys, rows) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows

    //选中参数时设置项目选中，并记录当前项目下选中的参数用于回显
    if (keys.length) {
      let arr = selProjectRows.value.filter((it: any) => {
        return it.itemId == selProjectNode.value.itemId
      })
      if (arr.length) {
        arr[0]["params"] = rows
      } else {
        selProjectNode.value.params = rows
        selProjectRows.value.push(selProjectNode.value)
        selProjectKeys.value.push(selProjectNode.value.itemId)
      }
    } else {
      selProjectKeys.value.forEach((key, index) => {
        if (key == selProjectNode.value.itemId) {
          selProjectRows.value.splice(index, 1)
          selProjectKeys.value.splice(index, 1)
        }
      })
    }

    // console.log("selectedRowKeys: ", keys)
    // console.log("selectedRows: ", rows)

    console.log("selProjectRows: ", selProjectRows.value)
  }
}

// const onSearch = () => {}
// 点击行
const customRow = (record) => {
  return {
    onClick: () => {
      // if (selectedRowKeys.value.indexOf(record.id) === -1) {
      //   selectedRowKeys.value.push(record.paramId)
      //   selectedRows.value.push(record)
      // }else{
      // }
    }
  }
}

let qualifyList = ref<any>([])
let selQualify = ref("")
let projectParmsTree = ref([])
const getLaboratoryQualify = async () => {
  let res = await getLaboratoryQualifyAPI(laboratoryId.value)
  qualifyList.value = []
  if (res) {
    Object.keys(res).forEach((key) => {
      qualifyList.value.push({
        id: key,
        name: res[key]
      })
    })
    selQualify.value = qualifyList.value[0].id //默认选中第一个 资质
    getprojectParmsTree(selQualify.value)
  }
}

const dataProcess = (arr) => {
  arr.forEach((it) => {
    if (it.children) {
      // it.disabled = true
      dataProcess(it.children)
    }
  })
}

const qualifyChange = (v) => {
  getprojectParmsTree(selQualify.value)
  initFrom()
}

const initFrom = () => {
  selProjectNode.value = {}
  selectedRowKeys.value = []
  selectedRows.value = []
  paramsArray.value = []
  selProjectNode.value = {}
  selProjectNodeKey.value = []
  selProjectRows.value = []
  selProjectKeys.value = []
}

const getprojectParmsTree = async (id) => {
  let r = await getPojectTreeAPI(id)
  dataProcess(r.scopeList)
  projectParmsTree.value = r.scopeList
}

let quickParamName = ref("") //参数查询

let selProjectRows = ref<any>([]) // 选择的项目集合
let selProjectKeys = ref<string[]>([]) //选择的项目集合keys

let paramsArray = ref([])
let selProjectNodeKey = ref<string[]>([])
let selProjectNode: any = ref({}) //选中的检测项目节点

const selTreeNode = async (v, e) => {
  let key: string = e.node.dataRef.itemId //当前选中key
  selProjectNodeKey.value = [key]

  selProjectNode.value = e.node.dataRef
  quickParamName.value = ""
  getParamnsList()
}

const getParamnsList = async () => {
  let key = selProjectNode.value.itemId
  if (!key) {
    return
  }
  loading.value = true
  let r = await getPojectParmsAPI(key, selQualify.value, quickParamName.value)
  if (r) {
    paramsArray.value = r.itemParams
  }
  loading.value = false

  //回显上次选中参数节点
  let lastNode: any = selProjectRows.value.filter((it: any) => {
    return it.itemId == key
  })

  if (lastNode && lastNode.length && lastNode[0].params.length) {
    let lastParams = lastNode[0].params

    console.log(333, lastParams)
    selectedRowKeys.value = lastParams.map((it) => {
      console.log(4444, it)
      return it.paramId
    })
    selectedRows.value = lastNode[0].params
  }
}

// const checkTreeCheck=async (v,e)=>{
//   console.log(e)
// }

let queryFrom = ref({
  // current: 1,
  // size: 99999,
  labId: laboratoryId.value,
  shortcut: ""
})
// let pagination = ref({
//   size: "small",
//   showTotal: (total) => `共 ${total} 条数据`,
//   showQuickJumper: true,
//   showSizeChanger: true,
//   total: 0,
//   pageSizeOptions: ["10", "20", "50", "100"],
//   onChange: (page, pageSize) => {
//     queryFrom.value.current = page
//     queryFrom.value.size = pageSize
//     getLabAuthBusinessList()
//   }
// })

const updateBusiness = async (row) => {
  spinning.value = true
  let r = await updateAuthBusinessAPI(row)
  message.success("操作成功")
  getLabAuthBusinessList()
  spinning.value = false
}
const editAuthBusiness = (row: any) => {
  let decide = equipmentSource.value.some((it: any) => {
    return it.isEdit
  })
  if (decide) {
    message.warning("当前存在正在编辑中的数据")
    return
  } else {
    row.isEdit = true
  }
}

//获取参数列表
const getLabAuthBusinessList = async () => {
  spinning.value = true
  let res = await getLabBusinessScopeAPI(laboratoryId.value, queryFrom.value)
  res.forEach((it) => {
    it.isEdit = false //编辑模式

    it.itemRowSpan = 1 //设置初始跨行数量

    //如果数据没有顶级节点，则把第二级当成顶级节点,解决没有顶级的试验项目，顶级显示问题
    if (!it.parentItemId) {
      it.parentItemId = it.itemId
      it.parentItemName = it.itemName
      // it.itemId = null
      it.itemName = ""
    }
  })
  equipmentSource.value = processData(res)
  // pagination.value.total = res.total
  spinning.value = false
}

//数据处理，设置跨行跨列及让数据变成树形结构的表格
const processData = (arr) => {
  let map = {}
  let myArr: any = []
  for (let i = 0; i < arr.length; i++) {
    if (!map[arr[i].parentItemId]) {
      myArr.push({
        parentItemId: arr[i].parentItemId,
        data: [arr[i]]
      })
      map[arr[i].parentItemId] = arr[i]
    } else {
      for (let j = 0; j < myArr.length; j++) {
        if (arr[i].parentItemId === myArr[j].parentItemId) {
          myArr[j].data.push(arr[i])
          break
        }
      }
    }
  }
  let newArr: any = []
  console.log(444455, myArr)
  myArr.forEach((it) => {
    it.data.forEach((cit) => {
      cit.parentItemRowSpan = 0
    })
    it.data[0].parentItemRowSpan = it.data.length
    newArr = [...newArr, ...it.data]
  })
  return processDataChild(newArr)
}

const processDataChild = (arr) => {
  let map = {}
  let myArr: any = []
  for (let i = 0; i < arr.length; i++) {
    if (!map[arr[i].itemId]) {
      myArr.push({
        itemId: arr[i].itemId,
        data: [arr[i]]
      })
      map[arr[i].itemId] = arr[i]
    } else {
      for (let j = 0; j < myArr.length; j++) {
        if (arr[i].itemId === myArr[j].itemId) {
          myArr[j].data.push(arr[i])
          break
        }
      }
    }
  }

  let newArr: any = []
  myArr.forEach((it) => {
    it.data.forEach((cit) => {
      cit.itemRowSpan = 0
    })
    it.data[0].itemRowSpan = it.data.length
    newArr = [...newArr, ...it.data]
  })
  return newArr
}
const removePojectParms = async (id) => {
  spinning.value = true
  let r = await removePojectParmsAPI(id, laboratoryId.value)
  spinning.value = false
  getLabAuthBusinessList()
}

//对需要保存的参数进行排序
const sortParams = (d) => {
  console.log("排序前", JSON.parse(JSON.stringify(d)))
  d.sort(function (a, b) {
    return a.itemSort - b.itemSort
  })
  d.forEach((it) => {
    it.params.sort((a, b) => {
      return a.paramSort - b.paramSort
    })
  })

  console.log("排序后", d)
  return d
}

//添加授权业务范围
const addAuthBusiness = async () => {
  if (!selProjectRows.value.length) {
    message.warning("未选择参数！")
    return
  }
  let qualify = qualifyList.value.filter((it) => {
    return it.id == selQualify.value
  })

  spinning.value = true
  let d = {
    labId: laboratoryId.value,
    qualificationId: qualify[0].id,
    qualificationLevel: qualify[0].name,
    items: sortParams(selProjectRows.value)
    //  [
    //   {
    //     itemId: selProjectNode.value.itemId,
    //     itemName: selProjectNode.value.itemName,
    //     parentItemId: selProjectNode.value.parentItemId,
    //     parentItemName: selProjectNode.value.parentItemName || "",
    //     params: selectedRows.value
    //   }
    // ]
  }
  try {
    await addAuthBusinessAPI(d)
  } catch (error) {
    spinning.value = false
  }

  message.success("操作成功")
  getLabAuthBusinessList()
  spinning.value = false
  editEquipmentVisble.value = false
}

const openAddEquipment = () => {
  editEquipmentVisble.value = true
  initFrom()
  getLaboratoryQualify()
}
</script>
<style lang="less" scoped>
.action_row {
  row-gap: 0px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}
.testpj_rt {
  display: flex;
  flex-direction: column;
  border: 1px solid #ededed;
  height: 500px;
  border-radius: 2px;
  padding: 10px;
  overflow: auto;
}
</style>
