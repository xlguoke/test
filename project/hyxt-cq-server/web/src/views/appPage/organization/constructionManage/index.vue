<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <div class="query-form-wrap">
      <a-space>
        <a-input-search
          v-model:value="queryFrom.q"
          placeholder="请输入单位名称"
          enter-button
          @search="getDataSource(true)"
        />
      </a-space>
      <!-- <HandleBtns :datas="btnsList" /> -->
      <a-row>
        <Space>
          <a-button v-auth="'org::constructor::sync'" @click="syncConstructor">
            同步建设单位信息
          </a-button>
          <a-button v-auth="'org::constructor::add'" type="primary" @click="editFrom">
            新增
          </a-button>
        </Space>
      </a-row>
    </div>

    <a-table
      :data-source="dataSource"
      :columns="columns"
      :pagination="pagination"
      size="small"
      bordered
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key == 'handle'">
          <a-space>
            <a-button
              v-auth="'org::constructor::edit'"
              type="primary"
              size="small"
              @click="editFrom(record)"
            >
              编辑
            </a-button>
            <a-button type="primary" size="small" @click="editFrom(record, true)">详情</a-button>
            <a-button
              v-auth="'org::constructor::del'"
              type="primary"
              danger
              size="small"
              @click="delRow(record.id)"
            >
              删除
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:visible="addModel"
      :title="titleText"
      :mask-closable="false"
      :keyboard="false"
      :confirm-loading="loading"
      width="500px"
    >
      <div style="height: 320px">
        <a-form
          ref="formRef"
          :model="form"
          v-bind="{ labelCol: { span: 8 }, wrapperCol: { span: 14 } }"
        >
          <a-form-item
            label="建设单位名称"
            name="name"
            :rules="[{ required: true, message: '请输入建设单位名称' }]"
          >
            <a-input
              v-model:value="form.name"
              :disabled="isDetails"
              placeholder="请输入建设单位名称"
            />
          </a-form-item>
          <a-form-item
            label="统一社会信用代码"
            name="unifiedSocialCreditCode"
            :rules="[{ required: true, message: '请输入统一社会信用代码' }]"
          >
            <a-input
              v-model:value="form.unifiedSocialCreditCode"
              placeholder="请输入统一社会信用代码"
              :disabled="isDetails"
            />
          </a-form-item>

          <a-form-item label="单位所在地" name="provinceCity">
            <a-cascader
              v-model:value="form.provinceCity"
              :options="cityTree"
              placeholder="请选择单位所在地"
              :disabled="isDetails"
            />
          </a-form-item>

          <a-form-item label="单位联系地址">
            <a-input
              v-model:value="form.address"
              :disabled="isDetails"
              placeholder="请输入单位联系地址"
            />
          </a-form-item>

          <a-form-item
            label="单位联系人"
            name="contact"
            :rules="[{ required: true, message: '请输入单位联系人' }]"
          >
            <a-input
              v-model:value="form.contact"
              :disabled="isDetails"
              placeholder="请输入单位联系人"
            />
          </a-form-item>
          <a-form-item
            label="联系人电话"
            name="phone"
            :rules="[{ required: true, message: '请输入联系人电话' }]"
          >
            <a-input
              v-model:value="form.phone"
              :disabled="isDetails"
              placeholder="请输入联系人电话"
            />
          </a-form-item>
        </a-form>
      </div>
      <template #footer>
        <a-button key="back" @click="addModel = false">取消</a-button>
        <a-button v-if="!isDetails" key="submit" type="primary" :loading="loading" @click="save">
          确定
        </a-button>
      </template>
    </a-modal>
  </a-spin>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, inject, nextTick, createVNode } from "vue"
import { message, Modal, Space } from "ant-design-vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import {
  getConstructorsList,
  addConstructors,
  syncConstructors,
  editConstructors,
  delConstructors
} from "@/api/organization.api"
import type { AdmInfoType } from "@/type/api/organization.api"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import cityData from "@/assets/js/citydata.js"
import { deepCopy } from "@/assets/js/common"
// import cityJson from "@/assets/js/cityChongqing.js"

interface ConstructT {
  id?: string
  name: string
  provinceCity?: Array<string>
  province: string
  city: string
  address: string
  contact: string
  phone: string
  unifiedSocialCreditCode: string
}

let titleText = ref("")

const spinning = ref(false)
const loading = ref(false)

// 数据加载
onMounted(() => {
  getDataSource()
  initCityData()
})

interface cityType {
  label: string
  value: string
  children?: cityType[]
}
const cityTree = ref<cityType[]>([])
const initCityData = () => {
  cityTree.value = deepCopy(cityData)
  for (let i = 0; i < cityTree.value.length; i++) {
    const item = cityTree.value[i]
    if (item.children && item.children.length > 0) {
      for (let j = 0; j < item.children.length; j++) {
        const child = item.children[j]
        if (child.children) child.children = undefined
      }
    }
  }
}

const queryFrom = ref({
  q: ""
})
const form = ref<ConstructT>({
  name: "",
  provinceCity: [],
  province: "",
  city: "",
  address: "",
  contact: "",
  phone: "",
  unifiedSocialCreditCode: ""
})

const formRef = ref()
const addModel = ref(false)
let isDetails = ref(false)
const editFrom = (row?: ConstructT, isDet = false) => {
  addModel.value = true
  nextTick(() => {
    resetFrom()
    if (row && row.id) {
      titleText.value = isDet ? "详情" : "编辑"
      form.value = {
        id: row.id,
        name: row.name,
        province: row.province,
        city: row.city,
        address: row.address,
        contact: row.contact,
        phone: row.phone,
        unifiedSocialCreditCode: row.unifiedSocialCreditCode,
        provinceCity: [row.province, row.city]
      }
    } else {
      titleText.value = "新增"
    }
    isDetails.value = isDet
  })
}

const resetFrom = async () => {
  form.value = {
    name: "",
    provinceCity: [],
    province: "",
    city: "",
    address: "",
    contact: "",
    phone: "",
    unifiedSocialCreditCode: ""
  }
  formRef.value.resetFields()
}

const syncConstructor = async () => {
  await syncConstructors()
  message.success("同步成功")
  getDataSource()
}

// 表格列
const columns = reactive<TableColumnType[]>([
  {
    title: "",
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
    customRender: ({ index }) => {
      return index + 1
    }
  },
  {
    title: "单位名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "统一社会信用代码",
    dataIndex: "unifiedSocialCreditCode",
    key: "unifiedSocialCreditCode"
  },
  {
    title: "省份",
    dataIndex: "province",
    key: "province"
  },
  {
    title: "城市",
    dataIndex: "city",
    key: "city"
  },
  {
    title: "区（县）",
    dataIndex: "city",
    key: "city"
  },
  {
    title: "联系人",
    dataIndex: "contact",
    key: "contact"
  },
  {
    title: "联系电话",
    dataIndex: "phone",
    key: "phone"
  },
  {
    title: "联系地址",
    dataIndex: "address",
    key: "address"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    width: 150
  }
])

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

const dataSource = ref<AdmInfoType[]>([])
const getDataSource = (flag?: boolean) => {
  if (flag) {
    pagination.current = 1
  }
  spinning.value = true
  getConstructorsList({
    ...queryFrom.value,
    current: pagination.current,
    size: pagination.pageSize
  })
    .then((res: any) => {
      spinning.value = false
      dataSource.value = res.records
      pagination.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}

const save = async () => {
  try {
    await formRef.value.validateFields()
    loading.value = true
    let params = { ...form.value }
    if (params.provinceCity && params.provinceCity.length > 0) {
      params.province = params.provinceCity[0]
      params.city = params.provinceCity.length > 1 ? params.provinceCity[1] : ""
      delete params.provinceCity
    }
    if (params.id) {
      await editConstructors(params)
      message.success("编辑成功")
    } else {
      delete params.id
      await addConstructors(params)
      message.success("新增成功")
    }
    getDataSource()
    loading.value = false
    addModel.value = false
  } catch (err) {
    loading.value = false
  }
}

const delRow = (id: string) => {
  Modal.confirm({
    title: "删除提示",
    content: "确认删除该条数据？",
    icon: createVNode(ExclamationCircleOutlined),
    onOk() {
      delConstructors(id).then(() => {
        message.success("删除成功")
        getDataSource()
      })
    }
  })
}
</script>

<style></style>
