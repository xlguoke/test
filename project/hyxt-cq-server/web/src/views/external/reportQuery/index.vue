<template>
  <div id="reportQuery">
    <a-spin :spinning="spinning">
      <div class="query_form_wrap">
        <a-space :size="10">
          <div class="form_item">
            <span class="lable">签发日期：</span>
            <a-range-picker v-model:value="formData.signDate" class="input_v" />
          </div>
          <div class="form_item">
            <span class="lable">工程项目：</span>
            <a-input v-model:value="formData.project" class="input_v" placeholder="请输入" />
          </div>
          <template v-if="queryMore">
            <div class="form_item">
              <span class="lable">标段名称：</span>
              <a-input
                v-model:value="formData.projectSection"
                class="input_v"
                placeholder="请输入"
              />
            </div>
            <div class="form_item">
              <span class="lable">工程部位/用途：</span>
              <a-input
                v-model:value="formData.projectPartOrUse"
                class="input_v"
                placeholder="请输入"
              />
            </div>
            <div class="form_item">
              <span class="lable">报告编号：</span>
              <a-input v-model:value="formData.reportSn" class="input_v" placeholder="请输入" />
            </div>
            <div class="form_item">
              <span class="lable">委托单位：</span>
              <a-input v-model:value="formData.consignUnit" class="input_v" placeholder="请输入" />
            </div>
            <div class="form_item">
              <span class="lable">委托日期：</span>
              <a-range-picker v-model:value="formData.consignDate" class="input_v" />
            </div>
            <div class="form_item">
              <span class="lable">检测机构：</span>
              <a-input v-model:value="formData.testOrg" class="input_v" placeholder="请输入" />
            </div>
            <div class="form_item">
              <span class="lable">试验室名称：</span>
              <a-input v-model:value="formData.laboratory" class="input_v" placeholder="请输入" />
            </div>
            <div class="form_item">
              <span class="lable">样品名称：</span>
              <a-input v-model:value="formData.sampleNames" class="input_v" placeholder="请输入" />
            </div>
            <div class="form_item">
              <span class="lable">检测参数：</span>
              <a-input v-model:value="formData.testItems" class="input_v" placeholder="请输入" />
            </div>
            <div class="form_item">
              <span class="lable">资质类型：</span>
              <a-input
                v-model:value="formData.qualification"
                class="input_v"
                placeholder="请输入"
              />
            </div>
            <div class="form_item">
              <span class="lable">委托类型：</span>
              <a-select ref="select" v-model:value="formData.checkType" class="input_v">
                <a-select-option v-for="item in entrustList" :key="item.code" :value="item.code">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </div>
          </template>
          <a-button type="primary" @click="getData">查询</a-button>
          <a-button type="primary" @click="queryMore ? (queryMore = false) : (queryMore = true)">
            {{ queryMore ? "收起" : "展开" }}更多查询
          </a-button>
        </a-space>
      </div>

      <a-table
        :bordered="true"
        :scroll="{ x: 1300, y: 600 }"
        :data-source="dataSource"
        :pagination="pagination"
        :columns="columns"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key == 'handle'">
            <a-space :size="10">
              <a-button size="small" type="primary" @click="goDetail('报告详情', record.id)">
                查看
              </a-button>
            </a-space>
          </template>

          <template v-if="column.key == 'checkType'">
            <template v-for="item in entrustList" :key="item.code">
              <span v-if="item.code == record.checkType">
                {{ item.name }}
              </span>
            </template>
          </template>
        </template>
      </a-table>

      <Detail ref="detail" :key="detailKey" />
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, nextTick, reactive } from "vue"
import { getListAPI, getEntrustTypeAPI } from "@/api/external/reportQuery.api"
import dayjs from "dayjs"
import { getUrlParam } from "@/assets/js/common.js"
import Detail from "./components/Detail.vue"

let dataSource = ref([
  {
    key: "1",
    name: "胡彦斌",
    age: 32,
    address: "西湖区湖底公园1号"
  },
  {
    key: "2",
    name: "胡彦祖",
    age: 42,
    address: "西湖区湖底公园1号"
  }
])

let queryMore = ref(false)

let columns = ref([
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
    title: "机构名称",
    dataIndex: "testOrg",
    key: "testOrg"
  },
  {
    title: "试验室名称",
    dataIndex: "laboratory",
    key: "laboratory"
  },
  {
    title: "报告编号",
    dataIndex: "sn",
    key: "sn"
  },
  {
    title: "工程项目",
    dataIndex: "project",
    key: "project"
  },
  {
    title: "委托类型",
    dataIndex: "checkType",
    key: "checkType"
  },
  {
    title: "标段名称",
    dataIndex: "projectSection",
    key: "projectSection"
  },
  {
    title: "样品名称",
    dataIndex: "sampleNames",
    key: "sampleNames"
  },
  {
    title: "工程部位/用途",
    dataIndex: "projectPartOrUse",
    key: "projectPartOrUse"
  },
  {
    title: "检测参数",
    dataIndex: "testItems",
    key: "testItems"
  },
  {
    title: "资质类型",
    dataIndex: "qualification",
    key: "qualification"
  },
  {
    title: "委托单位",
    dataIndex: "consignUnit",
    key: "consignUnit"
  },
  {
    title: "操作",
    fixed: "right",
    dataIndex: "handle",
    key: "handle",
    align: "center",
    width: 100
  }
])
let spinning = ref(false)

let formData = reactive({
  current: 1,
  size: 10,
  signDate: "",
  project: "",
  projectSection: "",
  projectPartOrUse: "",
  reportSn: "",
  consignUnit: "",
  consignDate: "",
  testOrg: "",
  laboratory: "",
  sampleNames: "",
  testItems: "",
  qualification: "",
  checkType: ""
})

let pagination = ref({
  size: "small",
  showTotal: (total) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
  pageSizeOptions: ["10", "20", "50", "100"],
  onChange: (page, pageSize) => {
    formData.current = page
    formData.size = pageSize
    getData()
  }
})
let entrustList = ref<any>([])

// 新增、编辑、详情
const detailKey = ref<number>()
const detail = ref()
const goDetail = (title: string, rowId: string) => {
  detailKey.value = new Date().getTime()
  nextTick(() => {
    detail.value.openModal(title, rowId)
  })
}

// 数据加载
onMounted(async () => {
  formData.project = getUrlParam("projectName") ? decodeURI(getUrlParam("projectName")) : ""
  getData()
  getEntrustType()
})

let getEntrustType = () => {
  getEntrustTypeAPI().then((res: any) => {
    res.dict.unshift({ code: "", name: "全部" })
    entrustList.value = res.dict
  })
}

let getData = () => {
  let parmas: any = {
    ...formData
  }
  if (parmas["signDate"]) {
    parmas.signDateBegin = dayjs(parmas["signDate"][0]).valueOf() + ""
    parmas.signDateEnd = dayjs(parmas["signDate"][1]).valueOf() + ""
    delete parmas["signDate"]
  }
  if (parmas["consignDate"]) {
    parmas.consignDateBegin = dayjs(parmas["consignDate"][0]).valueOf() + ""
    parmas.consignDateEnd = dayjs(parmas["consignDate"][1]).valueOf() + ""
    delete parmas["consignDate"]
  }
  getListAPI(parmas)
    .then((res: any) => {
      spinning.value = false
      if (!res) return
      dataSource.value = res.records || []
      pagination.value.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}
</script>
<style lang="less" scoped>
#reportQuery {
  padding: 10px;

  .query_form_wrap {
    width: 100%;
    margin-bottom: 10px;

    .form_item {
      width: 365px;

      .lable {
        padding: 10px 0;
        display: inline-block;
        width: 105px;
        text-align: right;
      }

      .input_v {
        width: 250px;
      }
    }
  }
}

.ant-space {
  flex-flow: wrap;
}
</style>
