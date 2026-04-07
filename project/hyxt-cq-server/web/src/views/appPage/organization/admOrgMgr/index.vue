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
      <HandleBtns :datas="btnsList" />
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
              v-auth="'org::bureau::edit'"
              type="primary"
              size="small"
              @click="openAdmInfoModal(record.id)"
            >
              编辑
            </a-button>
            <a-button
              v-auth="'org::bureau::view'"
              type="primary"
              size="small"
              @click="openRelateOrg(record)"
            >
              管理检测机构
            </a-button>
            <a-button
              v-auth="'org::bureau::del'"
              type="primary"
              danger
              size="small"
              @click="delAdmInfo(record.id)"
            >
              删除
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:visible="addModel"
      title="新增管理单位"
      :mask-closable="false"
      :keyboard="false"
      :confirm-loading="loading"
      width="500px"
      @ok="save"
    >
      <div style="height: 400px">
        <a-form
          ref="formRef"
          :model="form"
          v-bind="{ labelCol: { span: 6 }, wrapperCol: { span: 16 } }"
        >
          <a-form-item
            label="单位名称"
            name="name"
            :rules="[{ required: true, message: '请输入单位名称' }]"
          >
            <a-input v-model:value="form.name" placeholder="请输入单位名称" />
          </a-form-item>
          <a-form-item
            label="单位等级"
            name="grade"
            :rules="[{ required: true, message: '请选择单位等级' }]"
          >
            <a-select v-model:value="form.grade" placeholder="请选择单位等级">
              <a-select-option value="市级">市级</a-select-option>
              <a-select-option value="区县级">区县级</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item
            label="机构类型"
            name="type"
            :rules="[{ required: true, message: '请选择机构类型' }]"
          >
            <a-select v-model:value="form.type" placeholder="请选择机构类型">
              <a-select-option value="行业管理部门">行业管理部门</a-select-option>
              <a-select-option value="工程项目监督机构">工程项目监督机构</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="所在地区" name="provinceCity">
            <a-cascader
              v-model:value="form.provinceCity"
              :options="cityJson"
              placeholder="请选择所在地区"
            />
          </a-form-item>
          <a-form-item label="联系人" name="contact">
            <a-input v-model:value="form.contact" placeholder="请输入联系人" />
          </a-form-item>
          <a-form-item label="联系电话" name="phone">
            <a-input v-model:value="form.phone" placeholder="请输入联系电话" />
          </a-form-item>
          <a-form-item label="联系地址" name="address">
            <a-input v-model:value="form.address" placeholder="请输入联系地址" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <RelatedOrg ref="relatedOrg" :key="orgKey" @update-list="getDataSource" />
  </a-spin>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, inject, nextTick, createVNode } from "vue"
import { message, Modal } from "ant-design-vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { getBureausListAPI, getAdmDetail, addAdm, editAdm, delAdm } from "@/api/organization.api"
import type { AdmInfoType } from "@/type/api/organization.api"
import type { btnsType } from "@/type/common/common"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
// import cityData from "@/assets/js/citydata.js"
// import { deepCopy } from "@/assets/js/common"
import RelatedOrg from "./componnets/RelatedOrg.vue"
import cityJson from "@/assets/js/cityChongqing.js"

const spinning = ref(false)
const loading = ref(false)

// 数据加载
onMounted(() => {
  getDataSource()
  // initCityData()
})

interface cityType {
  label: string
  value: string
  children?: cityType[]
}
// const cityTree = ref<cityType[]>([])
// const initCityData = () => {
//   cityTree.value = deepCopy(cityData)
//   for (let i = 0; i < cityTree.value.length; i++) {
//     const item = cityTree.value[i]
//     if (item.children && item.children.length > 0) {
//       for (let j = 0; j < item.children.length; j++) {
//         const child = item.children[j]
//         if (child.children) child.children = undefined
//       }
//     }
//   }
// }

const queryFrom = ref({
  q: ""
})
const form = ref<AdmInfoType>({
  name: "",
  provinceCity: [],
  province: "",
  city: "",
  address: "",
  contact: "",
  phone: "",
  grade: null,
  type: null
})

const formRef = ref()
const addModel = ref(false)
// 批量操作按钮
const btnsList = reactive<btnsType[]>([
  {
    btnName: "新增",
    authCode: "org::bureau::add",
    click: () => {
      openAdmInfoModal()
    }
  }
  // {
  //   btnName: "同步人员",
  //   authCode: "*",
  //   loading: false,
  //   click: function () {
  //     this.loading = true
  //     asyncAdmUserInfo()
  //       .then(() => {
  //         this.loading = false
  //         message.success("同步成功")
  //       })
  //       .catch(() => {
  //         this.loading = false
  //       })
  //   }
  // }
])

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
    title: "机构类型",
    dataIndex: "type",
    key: "type"
  },
  {
    title: "所在省（市）",
    dataIndex: "province",
    key: "province"
  },
  {
    title: "所在市（区）",
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
  getBureausListAPI({
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

// 设置关联机构
const orgKey = ref("")
const relatedOrg = ref()
const openRelateOrg = (row: any) => {
  // orgKey.value = new Date().getTime() + ""
  // nextTick(() => {
  //   relatedOrg.value.openModal()
  // })
  relatedOrg.value.openModal(row)
}

// 新增、编辑
const openAdmInfoModal = (id?: string) => {
  form.value.id = ""
  addModel.value = true
  nextTick(() => {
    formRef.value.resetFields()
    id && getAdmDetailData(id)
  })
}

// 获取详情
const getAdmDetailData = (id: string) => {
  getAdmDetail(id).then((res: any) => {
    let provinceCity: any = []
    if (res.province) {
      provinceCity.push(res.province)
    }
    if (res.city) {
      provinceCity.push(res.city)
    }
    form.value = {
      id: res.id,
      name: res.name,
      provinceCity,
      province: res.province,
      city: res.city,
      address: res.address,
      contact: res.contact,
      phone: res.phone,
      grade: res.grade,
      type: res.type
    }
  })
}

const save = async () => {
  try {
    await formRef.value.validateFields()
    loading.value = true
    let params = form.value
    if (params.provinceCity && params.provinceCity.length > 0) {
      params.province = params.provinceCity[0]
      params.city = params.provinceCity.length > 1 ? params.provinceCity[1] : ""
      delete params.provinceCity
    }
    if (params.id) {
      await editAdm(params)
      message.success("编辑成功")
    } else {
      await addAdm(params)
      message.success("新增成功")
    }
    getDataSource()
    loading.value = false
    addModel.value = false
  } catch (err) {
    loading.value = false
  }
}

const delAdmInfo = (id: string) => {
  Modal.confirm({
    title: "删除提示",
    content: "确认删除该条数据？",
    icon: createVNode(ExclamationCircleOutlined),
    onOk() {
      delAdm(id).then(() => {
        message.success("删除成功")
        getDataSource()
      })
    }
  })
}
</script>

<style></style>
