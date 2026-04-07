<template>
  <a-spin :spinning="spinning" tip="Loading...">
    <div style="margin-bottom: 6px; text-align: right">
      <a-button @click="addAuth">新增</a-button>
    </div>

    <a-table
      :data-source="dataSource"
      :columns="columns"
      :pagination="false"
      size="small"
      bordered
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key == 'handle'">
          <a-space>
            <a-button type="primary" size="small" @click="handleEdit(record)">重新授权</a-button>
            <a-button v-if="!record.active" type="primary" size="small" @click="useRow(record)">
              启用
            </a-button>
            <a-button v-else type="primary" danger size="small" @click="useRow(record)">
              禁用
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:visible="visible"
      :title="isEdit ? '重新授权' : '新增第三方授权'"
      :mask-closable="false"
      :keyboard="false"
      cancel-text="关闭"
      :confirm-loading="saveLoading"
      width="600px"
      @ok="handleOk"
    >
      <a-form
        ref="formRef"
        :model="form"
        :label-col="{ style: { width: '120px' } }"
        style="padding-right: 30px"
      >
        <a-form-item
          label="对象类型"
          name="kind"
          :rules="[{ required: true, message: '请输入对象类型' }]"
        >
          <a-space>
            <a-form-item-rest>
              <a-select
                v-model:value="objType"
                :disabled="isEdit"
                style="width: 120px"
                @change="objTypeChange"
              >
                <a-select-option value="试验室">试验室</a-select-option>
                <a-select-option value="现场检测项目">现场检测项目</a-select-option>
                <a-select-option value="机构">机构</a-select-option>
                <a-select-option value="自定义">自定义</a-select-option>
              </a-select>
            </a-form-item-rest>
            <a-input
              v-model:value="form.kind"
              :disabled="isEdit || objType !== '自定义'"
              placeholder="请输入对象类型"
            />
          </a-space>
        </a-form-item>
        <template v-if="objType == '试验室' || objType == '现场检测项目'">
          <a-form-item
            label="对象名称"
            name="key"
            :rules="[{ required: true, message: '请输入对象名称' }]"
          >
            <CommonSelect
              :key="form.kind"
              v-model:value="form.key"
              :url="'/labs?user-labs&classification=' + (objType == '试验室' ? 'LAB' : 'ITEM')"
              :config="{
                placeholder: '请输入对象名称',
                disabled: isEdit
              }"
              @change="
                ({ option }) => {
                  form.name = option ? option.name : ''
                  getOrgInfo(option?.orgId)
                }
              "
            />
          </a-form-item>
          <a-form-item
            label="对象ID"
            name="key"
            :rules="[{ required: true, message: '请输入对象ID' }]"
          >
            <a-input v-model:value="form.key" disabled placeholder="请输入对象ID" />
          </a-form-item>
          <a-form-item label="所属机构名称" name="orgName">
            <a-input
              v-model:value="form.orgName"
              :disabled="isEdit"
              placeholder="请输入所属机构名称"
            />
          </a-form-item>
          <a-form-item label="所属机构ID" name="orgKey">
            <a-input
              v-model:value="form.orgKey"
              :disabled="isEdit"
              placeholder="请输入所属机构ID"
            />
          </a-form-item>
        </template>
        <template v-else-if="objType == '机构'">
          <a-form-item
            label="对象名称"
            name="key"
            :rules="[{ required: true, message: '请输入对象名称' }]"
          >
            <CommonSelect
              v-model:value="form.key"
              :url="orgDatas()"
              :config="{
                placeholder: '请输入对象名称',
                disabled: isEdit
              }"
              @change="
                ({ option }) => {
                  form.name = option ? option.name : ''
                  form.orgKey = option ? option.id : ''
                  form.orgName = option ? option.name : ''
                }
              "
            />
          </a-form-item>
          <a-form-item
            label="对象ID"
            name="key"
            :rules="[{ required: true, message: '请输入对象ID' }]"
          >
            <a-input v-model:value="form.key" disabled placeholder="请输入对象ID" />
          </a-form-item>
        </template>
        <template v-else>
          <a-form-item
            label="对象名称"
            name="name"
            :rules="[{ required: true, message: '请输入对象名称' }]"
          >
            <a-input v-model:value="form.name" :disabled="isEdit" placeholder="请输入对象名称" />
          </a-form-item>
          <a-form-item
            label="对象ID"
            name="key"
            :rules="[{ required: true, message: '请输入对象ID' }]"
          >
            <a-input v-model:value="form.key" :disabled="isEdit" placeholder="请输入对象ID" />
          </a-form-item>
          <a-form-item
            label="所属机构名称"
            name="orgName"
            :rules="[{ required: true, message: '请输入所属机构名称' }]"
          >
            <a-input
              v-model:value="form.orgName"
              :disabled="isEdit"
              placeholder="请输入所属机构名称"
            />
          </a-form-item>
          <a-form-item
            label="所属机构ID"
            name="orgKey"
            :rules="[{ required: true, message: '请输入所属机构ID' }]"
          >
            <a-input
              v-model:value="form.orgKey"
              :disabled="isEdit"
              placeholder="请输入所属机构ID"
            />
          </a-form-item>
        </template>
        <a-form-item label="平台编码" name="platform">
          <a-select
            v-model:value="form.platform"
            :options="
              platformList.map((item) => ({
                label: item.name,
                value: item.code
              }))
            "
            placeholder="请选择平台编码"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-spin>
</template>

<script setup lang="ts">
import { h, onMounted, reactive, ref } from "vue"
import { message, Modal } from "ant-design-vue"
import {
  getList,
  addApi,
  triggleUseApi,
  addParType,
  editApi,
  getPlatformList
} from "@/api/authenticator.api"
import { getDetail } from "@/api/organization.api"
import type { TableColumnType } from "ant-design-vue"
import CommonSelect from "@/components/commonSelect/index.vue"
import { orgDatas } from "@/api/commonSelect.api"

const spinning = ref<boolean>(false)
const visible = ref(false)

onMounted(() => {
  getDataSource()
})

// 表格列
const columns = reactive<TableColumnType[]>([
  {
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
    customRender: ({ index }) => {
      return index + 1
    }
  },
  {
    title: "私钥",
    dataIndex: "secret",
    key: "secret"
  },
  {
    title: "公钥",
    dataIndex: "id",
    key: "id"
  },
  {
    title: "对象名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "对象类型",
    dataIndex: "kind",
    key: "kind"
  },
  {
    title: "所属单位名称",
    dataIndex: "orgName",
    key: "orgName"
  },
  {
    title: "平台名称",
    dataIndex: "platformName",
    key: "platformName"
  },
  {
    title: "平台编码",
    dataIndex: "platform",
    key: "platform"
  },
  {
    title: "启用状态",
    dataIndex: "active",
    key: "active",
    customRender: ({ text }) => {
      return text ? "启用" : "禁用"
    }
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    width: 80
  }
])
const dataSource = ref([])
const getDataSource = () => {
  spinning.value = true
  getList()
    .then((res: any) => {
      spinning.value = false
      if (!res) return
      dataSource.value = res || []
    })
    .catch(() => {
      spinning.value = false
    })
}

// 获取机构信息
const getOrgInfo = (orgId: string) => {
  if (!orgId) {
    form.value.orgKey = ""
    form.value.orgName = ""
    return
  }
  getDetail(orgId).then((res: any) => {
    form.value.orgKey = res.id
    form.value.orgName = res.name
  })
}
const platformList = ref<
  {
    code: string
    name: string
  }[]
>([])
async function getPlatform() {
  const res = await getPlatformList()
  if (!res) return
  platformList.value = res || []
}
getPlatform()

const objType = ref("试验室")
const objTypeChange = () => {
  form.value.key = ""
  form.value.name = ""
  form.value.orgKey = ""
  form.value.orgName = ""
  if (objType.value !== "自定义") {
    form.value.kind = objType.value
  } else {
    form.value.kind = ""
  }
}
const form = ref<addParType>({
  key: "",
  name: "",
  kind: "试验室",
  orgKey: "",
  orgName: "",
  platform: "",
  platformName: ""
})
// 新增
const addAuth = () => {
  isEdit.value = false
  formRef.value?.resetFields()
  objType.value = "试验室"
  form.value.key = ""
  form.value.name = ""
  form.value.orgKey = ""
  form.value.orgName = ""
  visible.value = true
}

// 启用禁用
const useRow = (row: any) => {
  triggleUseApi(row.id).then(() => {
    message.success(row.active ? "已禁用" : "已启用")
    getDataSource()
  })
}

const formRef = ref()
const saveLoading = ref(false)
const handleOk = async () => {
  await formRef.value.validateFields()
  saveLoading.value = true
  // 平台名称也要传递
  if (form.value.platform) {
    form.value.platformName =
      platformList.value.find((item) => item.code === form.value.platform)?.name || ""
  }

  const api = isEdit.value ? editApi : addApi
  const res = await api(form.value).finally(() => {
    saveLoading.value = false
  })
  message.success("保存成功")
  visible.value = false
  getDataSource()
  if (isEdit.value) {
    Modal.success({
      title: "重新授权成功",
      // eslint-disable-next-line prettier/prettier
      content: h("div", {}, [
        h("p", {}, `公钥：${res?.id || ""}`),
        h("p", {}, `私钥：${res?.secret || ""}`)
      ])
    })
  }
}

const isEdit = ref(false)
// 重新授权
const handleEdit = (row: any) => {
  isEdit.value = true
  form.value = {
    ...row
  }
  visible.value = true
}
</script>

<style scoped lang="less"></style>
