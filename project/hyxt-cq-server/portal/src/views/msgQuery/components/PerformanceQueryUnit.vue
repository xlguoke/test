<template>
  <div class="query-form">
    <a-spin :spinning="spinning">
      <a-form :model="form" autocomplete="off" layout="inline" @finish="queryForm">
        <a-form-item label="机构名称" name="orgName" :rules="[{ required: true, message: '请输入机构名称' }]">
          <a-input v-model:value="form.orgName" placeholder="请输入机构名称"></a-input>
        </a-form-item>
        <a-form-item label="项目所在省市" name="cityArr">
          <a-cascader v-model:value="form.cityArr" :options="citys" placeholder="项目请选择省市" style="width: 180px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">查询</a-button>
        </a-form-item>
      </a-form>
      <p class="detail-title">检测业绩列表</p>
      <a-table :data-source="tableDatas1" :columns="columns1" bordered size="small" :pagination="false">
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
      <p v-if="showMore1" class="show-more">
        <a v-if="tableDatas1.length == size" class="blue" @click="triggerShowList(999, 1)">
          展开全部
          <down-outlined />
        </a>
        <a v-else class="blue" @click="triggerShowList(size, 1)">
          收起
          <up-outlined />
        </a>
      </p>

      <!-- <p class="detail-title" style="margin-top: 20px">工地（中心）试验室业绩列表</p>
      <a-table :data-source="tableDatas2" :columns="columns2" bordered size="small" :pagination="false" />
      <p v-if="showMore2" class="show-more">
        <a v-if="tableDatas2.length == size" class="blue" @click="triggerShowList(999, 2)">
          展开全部
          <down-outlined />
        </a>
        <a v-else class="blue" @click="triggerShowList(size, 2)">
          收起
          <up-outlined />
        </a>
      </p> -->
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"
import { DownOutlined, UpOutlined } from "@ant-design/icons-vue"
import { achievementOrg, orgQueryType, orgParType, testsType, laborType } from "@/api/home.api"
import cityData from "@/assets/js/citydata"
import { formatDate } from "@/assets/js/utils"

const form = reactive<orgQueryType>({
  orgName: "",
  cityArr: [],
  province: "",
  city: ""
})

const citys = ref<any>([])
onMounted(() => {
  let list = [...cityData]
  for (let i = 0; i < list.length; i++) {
    list[i].children = undefined
  }
  citys.value = list
})

// 查询数据列表
const datas = ref<orgParType>({
  tests: [],
  laboratories: []
})
const spinning = ref<boolean>(false)
const showMore1 = ref<boolean>(false)
const showMore2 = ref<boolean>(false)
const tableDatas1 = ref<testsType[]>([])
const tableDatas2 = ref<laborType[]>([])
let size = ref<number>(10)
const queryForm = (formdata) => {
  formdata.province = formdata.cityArr[0]
  formdata.city = formdata.cityArr[1]
  delete formdata.cityArr
  spinning.value = true
  achievementOrg(formdata)
    .then((res) => {
      spinning.value = false
      if (!res) return
      datas.value = res
      triggerShowList(size.value)
    })
    .catch(() => {
      spinning.value = false
    })
}

const triggerShowList = (size: number, ind?: number) => {
  let list1 = datas.value.tests
  let list2 = datas.value.laboratories
  if (list1.length > size && ind !== 2) {
    showMore1.value = true
    list1 = list1.slice(0, 10)
  }
  if (list2.length > size && ind !== 1) {
    showMore2.value = true
    list2 = list2.slice(0, 10)
  }
  tableDatas1.value = list1
  tableDatas2.value = list2
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
    title: "项目名称",
    dataIndex: "projectName",
    key: "projectName"
  },
  {
    title: "委托类型",
    dataIndex: "testCategory",
    key: "testCategory"
  },
  {
    title: "委托单位",
    dataIndex: "consignUnit",
    key: "consignUnit"
  },
  {
    title: "项目所在省(市)",
    dataIndex: "locatedProvince",
    key: "locatedProvince"
  },
  {
    title: "检测报告台账",
    dataIndex: "testStandingBook",
    key: "testStandingBook"
  },
  {
    title: "检测时间",
    dataIndex: "testTime",
    key: "testTime",
    customRender: ({ record }) => {
      return `${formatDate(record.startTime)} 至 ${formatDate(record.endTime)}`
    }
  },
  {
    title: "检测内容",
    dataIndex: "content",
    key: "content"
  },
  {
    title: "业绩状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text, record }) => {
      // UPDATE_APP-变更申请，DONT_AUDIT-无需审核,NORMAL-正常
      let statusName = "已审核"
      if (text == "DONT_AUDIT") {
        statusName = "无需审核"
      } else if (text == "UPDATE_APP" && !record.external) {
        statusName = "无需审核"
      }
      return statusName
    }
  },
  {
    title: "业绩来源",
    dataIndex: "external",
    key: "external",
    customRender: ({ text }) => {
      return text ? "承诺申报" : "业绩同步"
    }
  }
])
const columns2 = reactive<columnsType[]>([
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
    title: "项目名称",
    dataIndex: "projectName",
    key: "projectName"
  },
  {
    title: "项目级别",
    dataIndex: "projectLevel",
    key: "projectLevel"
  },
  {
    title: "试验室类型",
    dataIndex: "laboratoryCategory",
    key: "laboratoryCategory"
  },
  {
    title: "试验室名称",
    dataIndex: "laboratoryName",
    key: "laboratoryName"
  },
  {
    title: "项目所在省(市)",
    dataIndex: "locatedProvince",
    key: "locatedProvince"
  },
  {
    title: "起止时间",
    dataIndex: "startTime",
    key: "startTime",
    customRender: ({ record }) => {
      return `${formatDate(record.startTime)} 至 ${formatDate(record.endTime)}`
    }
  },
  {
    title: "业绩状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text, record }) => {
      // UPDATE_APP-变更申请，DONT_AUDIT-无需审核,NORMAL-正常
      let statusName = "已审核"
      if (text == "DONT_AUDIT") {
        statusName = "无需审核"
      } else if (text == "UPDATE_APP" && !record.external) {
        statusName = "无需审核"
      }
      return statusName
    }
  },
  {
    title: "业绩来源",
    dataIndex: "external",
    key: "external",
    customRender: ({ text }) => {
      return text ? "承诺申报" : "业绩同步"
    }
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
</style>
