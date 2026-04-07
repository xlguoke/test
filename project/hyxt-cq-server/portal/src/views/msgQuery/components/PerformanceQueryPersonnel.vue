<template>
  <div class="query-form">
    <a-spin :spinning="spinning">
      <a-form :model="form" autocomplete="off" layout="inline" @finish="queryForm">
        <a-form-item label="人员姓名" name="personName" :rules="[{ required: true, message: '请输入人员姓名' }]">
          <a-input v-model:value="form.personName" placeholder="请输入人员姓名"></a-input>
        </a-form-item>
        <a-form-item label="身份证号" name="personIdCard" :rules="[{ required: true, message: '请输入身份证号' }]">
          <a-input v-model:value="form.personIdCard" placeholder="请输入身份证号"></a-input>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">查询</a-button>
        </a-form-item>
      </a-form>
      <p class="detail-title">检测业绩列表</p>
      <a-table :data-source="tableDatas1" :columns="columns" bordered size="small" :pagination="false" />
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

      <p class="detail-title" style="margin-top: 20px">工地（中心）试验室业绩列表</p>
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
      </p>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue"
import { message } from "ant-design-vue"
import { DownOutlined, UpOutlined } from "@ant-design/icons-vue"
import { achievementPerson, personQueryType, personParType, laborPersonType, testsPersonType } from "@/api/home.api"
import { formatDate } from "@/assets/js/utils"

const form = reactive<personQueryType>({
  personName: "",
  personIdCard: ""
})

// 列属性
interface columnsType {
  title: string
  dataIndex: string
  key: string
  width?: number
  align?: string
  customRender?: Function
}
const columns = reactive<columnsType[]>([
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
    title: "姓名",
    dataIndex: "fullName",
    key: "fullName"
  },
  {
    title: "检测证书号",
    dataIndex: "certifyNumber",
    key: "certifyNumber"
  },
  {
    title: "项目名称",
    dataIndex: "projectName",
    key: "projectName"
  },
  {
    title: "项目担任职务",
    dataIndex: "position",
    key: "position"
  },
  {
    title: "任职时间",
    dataIndex: "entranceTime",
    key: "entranceTime",
    customRender: ({ record }) => {
      if (!record.entranceTime) return ""
      return `${formatDate(record.entranceTime)} 至 ${formatDate(record.leaveTime)}`
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
    title: "姓名",
    dataIndex: "fullName",
    key: "fullName"
  },
  {
    title: "检测证书号",
    dataIndex: "certifyNumber",
    key: "certifyNumber"
  },
  {
    title: "项目名称",
    dataIndex: "projectName",
    key: "projectName"
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
    title: "项目担任职务",
    dataIndex: "position",
    key: "position"
  },
  {
    title: "起止时间",
    dataIndex: "startTime",
    key: "startTime",
    customRender: ({ record }) => {
      if (!record.startTime) return ""
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

// 查询数据列表
const datas = reactive<personParType>({
  tests: [],
  laboratories: []
})
const spinning = ref<boolean>(false)
const showMore1 = ref<boolean>(false)
const showMore2 = ref<boolean>(false)
const tableDatas1 = ref<testsPersonType[]>([])
const tableDatas2 = ref<laborPersonType[]>([])
let size = ref<number>(10)
const queryForm = (formdata) => {
  spinning.value = true
  achievementPerson(formdata)
    .then((res) => {
      spinning.value = false
      if (!res) return
      datas.tests = res.tests || []
      datas.laboratories = res.laboratories || []
      triggerShowList(size.value)
    })
    .catch(() => {
      spinning.value = false
    })
}

const triggerShowList = (size: number, ind?: number) => {
  let list1 = datas.tests
  let list2 = datas.laboratories
  if (list1.length === 0 && list2.length === 0) {
    message.warning("未查到人员业绩数据")
  }
  if (list1.length > size && ind !== 2) {
    showMore1.value = true
    list1 = list1.slice(0, size)
  }
  if (list2.length > size && ind !== 1) {
    showMore2.value = true
    list2 = list2.slice(0, size)
  }
  tableDatas1.value = list1
  tableDatas2.value = list2
}
</script>

<style lang="less" scoped>
.show-more {
  padding: 20px;
  text-align: center;
}
</style>
