<template>
  <div class="query-form">
    <a-spin :spinning="spinning">
      <a-form :model="form" autocomplete="off" layout="inline" @finish="queryForm">
        <a-form-item
          label="姓名"
          name="orgPersonName"
          :rules="[{ required: true, message: '请输入姓名' }]"
        >
          <a-input v-model:value="form.orgPersonName" placeholder="请输入姓名"></a-input>
        </a-form-item>
        <a-form-item
          label="证件号码"
          name="idNum"
          :rules="[{ required: true, message: '请输入证件号码' }]"
        >
          <a-input v-model:value="form.idNum" placeholder="请输入证件号码"></a-input>
        </a-form-item>
        <a-form-item label="年度" name="annual">
          <a-date-picker
            v-model:value="form.annual"
            picker="year"
            value-format="YYYY"
            placeholder="请选择年度"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">查询</a-button>
        </a-form-item>
      </a-form>
      <p class="detail-title">
        继续教育学时查询
        <a :href="partUrl" target="_blank" class="blue fr">点击前往部平台查询>></a>
      </p>
      <a-table
        :data-source="datas"
        :columns="columns1"
        bordered
        size="small"
        :pagination="pagination"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key == 'testStandingBook'">
            <a
              v-for="f in record.attachments"
              :key="f.id"
              class="blue"
              :href="f.url"
              target="_blank"
              :download="f.name"
            >
              {{ f.name }}
            </a>
          </template>
          <template v-if="column.key == 'content'">
            <span v-for="f in record.contents" :key="f.id">{{ f.content }}；</span>
          </template>
        </template>
      </a-table>
      <p class="total-hours">总计：{{ totalHours }}学时</p>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, inject } from "vue"
import { educationPage, educationTotalHours, EducationType } from "@/api/home.api"
import type { PaginationProps } from "ant-design-vue"
import { formatDate } from "@/assets/js/utils"

const partBaseUrl = import.meta.env.VITE_PART_API
const partUrl = ref(partBaseUrl + "/PCWeb/OrgQuery/AdultEducationQuery")

const form = reactive<EducationType>({
  orgPersonName: "",
  idNum: "",
  annual: ""
})

// 分页
const commonPagination = reactive(inject("commonPagination") as PaginationProps)
const pagination = reactive<PaginationProps>({
  ...commonPagination,
  onChange: (page: number, pageSize: number) => {
    pagination.current = page
    pagination.pageSize = pageSize
    getDataSource()
  }
})

// 查询数据列表
const datas = ref([])
const queryForm = async () => {
  getDataSource(true)
  getTotalHours()
}
const spinning = ref<boolean>(false)
const getDataSource = (flag = false) => {
  if (flag) {
    pagination.current = 1
  }
  let formdata = { ...form }
  formdata.current = pagination.current
  formdata.size = pagination.pageSize
  spinning.value = true
  educationPage(formdata)
    .then((res) => {
      spinning.value = false
      datas.value = res.records
      pagination.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}

// 获取总学时
const totalHours = ref(0)
const getTotalHours = () => {
  educationTotalHours(form).then((res) => {
    totalHours.value = res
  })
}

// 列属性
interface columnsType {
  title: string
  dataIndex: string
  key: string
  width?: number
  align?: string
  customRender?: Function
}

const columns1 = reactive<columnsType[]>([
  {
    title: "序号",
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
    customRender: ({ index }) => {
      return index + 1
    }
  },
  {
    title: "培训项目",
    dataIndex: "trainItem",
    key: "trainItem"
  },
  // {
  //   title: "培训地点",
  //   dataIndex: "trainLocation",
  //   key: "trainLocation"
  // },
  {
    title: "年度",
    dataIndex: "annual",
    key: "annual"
  },
  // {
  //   title: "培训时间",
  //   dataIndex: "trainTime",
  //   key: "trainTime",
  //   customRender: ({ value }) => {
  //     return formatDate(value)
  //   }
  // },
  {
    title: "学时",
    dataIndex: "hours",
    key: "hours"
  },
  {
    title: "备注",
    dataIndex: "remark",
    key: "remark"
  }
])
</script>

<style lang="less" scoped>
.show-more {
  padding: 10px;
  text-align: center;
  span {
    font-size: 12px;
  }
}
:deep(.ant-table-pagination-right) {
  justify-content: flex-start;
}
.total-hours {
  float: right;
  margin-top: -40px;
}
</style>
