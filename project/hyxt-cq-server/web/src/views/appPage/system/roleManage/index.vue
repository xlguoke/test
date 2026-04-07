<!-- 角色管理 -->
<template>
  <div>
    <a-spin tip="加载中..." :spinning="spinning">
      <a-row class="action_row">
        <div class="lt">
          <a-space>
            <a-input-search
              v-model:value="queryFrom.q"
              placeholder="请输入角色名称查询"
              enter-button
              @change="pagination.current = 1"
              @search="getRoleList()"
            />
          </a-space>
        </div>
        <div class="rt">
          <a-space>
            <a-button
              v-if="userInfo.type == 'SYS'"
              v-auth="'sys::role::add'"
              type="primary"
              @click="openAddRole"
            >
              新增系统角色
            </a-button>
            <a-button v-auth="'sys::org:role::add'" type="primary" @click="openAddOrgRole">
              新增机构角色
            </a-button>
          </a-space>
        </div>
      </a-row>
      <a-table
        :data-source="dataSource"
        :columns="roleColumns"
        bordered
        size="small"
        :pagination="pagination"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'handle'">
            <a-space>
              <a-button
                v-auth="'sys::role::auths'"
                size="small"
                type="primary"
                @click="openAuthConfig(record)"
              >
                权限配置
              </a-button>

              <a-button
                v-auth="'sys::role::scope::view'"
                size="small"
                type="primary"
                @click="openDataRangeConfig(record)"
              >
                数据范围权限
              </a-button>

              <a-button
                v-if="record.internal"
                v-auth="'sys::role::edit'"
                size="small"
                type="primary"
                @click="openEditRole(record)"
              >
                编辑系统角色
              </a-button>

              <a-button
                v-else
                v-auth="'sys::org:role::edit'"
                size="small"
                type="primary"
                @click="openEditRole(record)"
              >
                编辑机构角色
              </a-button>

              <a-button
                v-if="record.internal"
                v-auth="'sys::role::del'"
                size="small"
                type="danger"
                @click="delSysRole(record)"
              >
                删除系统角色
              </a-button>

              <a-button
                v-else
                v-auth="'sys::org:role::del'"
                size="small"
                type="danger"
                @click="delOrgRole(record)"
              >
                删除机构角色
              </a-button>
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
        v-model:visible="visibleEditProject"
        width="550px"
        :centered="true"
        :mask-closable="false"
        :title="roleFrom.id ? '编辑' : '新增'"
        @ok="roleFromSubmit"
      >
        <a-form
          ref="editRoleFormRef"
          :model="roleFrom"
          name="basic"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }"
          autocomplete="off"
        >
          <a-form-item
            v-if="formType == 2"
            label="机构名称"
            name="orgId"
            :rules="[{ required: true, message: '请选择机构名称!' }]"
          >
            <CommonSelect
              v-model:value="roleFrom.orgId"
              url="org/by-type/sys"
              :config="{
                keyword: 'orgName',
                placeholder: '请输入机构名称',
                disabled: userInfo.type != 'SYS'
              }"
              @change="changeOrg"
            />
          </a-form-item>
          <a-form-item
            label="角色名称"
            name="name"
            :rules="[{ required: true, message: '请输入角色名称!' }]"
          >
            <a-input v-model:value="roleFrom.name" placeholder="请输入角色名称" />
          </a-form-item>
          <a-form-item
            label="角色描述"
            name="description"
            :rules="[{ required: true, message: '请输入角色描述!' }]"
          >
            <a-textarea
              v-model:value="roleFrom.description"
              placeholder="请输入角色描述"
              :rows="4"
            />
          </a-form-item>
        </a-form>
      </a-modal>

      <a-modal
        v-model:visible="visibleAuthConfig"
        width="1000px"
        :centered="true"
        title="配置菜单权限"
        :mask-closable="false"
        :after-close="afterClose"
        @ok="configAuthOk"
      >
        <a-spin :spinning="authSpinning">
          <a-row :gutter="20">
            <a-col :span="10">
              <p style="margin-bottom: 10px">菜单列表：</p>
              <a-table
                :data-source="menuTree"
                :columns="menuColumns"
                size="small"
                :custom-row="customRow"
                :scroll="{ y: 560 }"
                :row-selection="rowSelectionForMenu"
                bordered
                :pagination="false"
                row-key="id"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'handle'">
                    <a-space>
                      <a-button size="small" type="primary" @click.stop="getAuthList(record)">
                        权限
                      </a-button>
                    </a-space>
                  </template>
                </template>
              </a-table>
            </a-col>
            <a-col :span="14">
              <p v-show="handleMenu.id" style="margin-bottom: 10px">
                {{ handleMenu.name + "- 权限" }}：
              </p>
              <a-table
                v-show="handleMenu.id"
                :data-source="authData"
                :columns="authColumns"
                size="small"
                :scroll="{ y: 560 }"
                :default-expand-all-rows="true"
                :row-selection="rowSelectionForAuth"
                bordered
                :pagination="false"
                row-key="id"
              ></a-table>
            </a-col>
          </a-row>
        </a-spin>
      </a-modal>

      <a-modal
        v-model:visible="visibleDataRangeConfig"
        width="1000px"
        :centered="true"
        title="数据范围权限"
        :mask-closable="false"
        :confirm-loading="saveLoading"
        @cancel="closeModal"
        @ok="saveDataAuth"
      >
        <a-spin :spinning="authSpinning">
          <DataRange ref="dataRange" />
        </a-spin>
      </a-modal>
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, toRaw, nextTick } from "vue"
import type { RoleEditParms, RoleQueryParms } from "@/type/api/system.api"
import {
  addRoleAPI,
  getRolesAPI,
  editRoleAPI,
  deleteSysRoleAPI,
  deleteOrgRoleAPI,
  setRoleMenuAPI,
  setRoleAuthAPI,
  getRoleMenuAPI,
  getRoleMenuAuthAPI,
  addOrgRoleAPI,
  editOrgRoleAPI
} from "@/api/system.api"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import CommonSelect from "@/components/commonSelect/index.vue"
import DataRange from "../dataRange/index.vue"

import { createVNode } from "vue"
import { Modal, message } from "ant-design-vue"
import { formatDate } from "@/assets/js/common"

import userInfoStore from "@/stores/userInfo"
import { storeToRefs } from "pinia"
const { userInfo } = storeToRefs(userInfoStore())

let roleColumns = [
  {
    title: "角色名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "描述",
    dataIndex: "description",
    key: "description"
  },
  {
    title: "所属机构",
    dataIndex: "orgName",
    key: "orgName"
  },
  {
    title: "创建人",
    dataIndex: "creator",
    key: "creator"
  },
  {
    title: "创建时间",
    dataIndex: "createdAt",
    key: "createdAt"
  },
  {
    title: "账号数",
    dataIndex: "userCount",
    key: "userCount"
  },
  {
    title: "操作",
    key: "handle"
  }
]
const authColumns = [
  {
    title: "权限名称",
    dataIndex: "name",
    key: "key"
  },
  {
    title: "权限编码",
    dataIndex: "code",
    key: "key"
  },
  {
    title: "权限描述",
    dataIndex: "description",
    key: "key"
  }
]
const menuColumns = [
  {
    title: "菜单名称",
    dataIndex: "name",
    key: "key"
  },
  {
    title: "操作",
    key: "handle",
    width: 80
  }
]

onMounted(() => {
  getRoleList()
  console.log(2223, userInfo.value.type)
  if (userInfo.value.type != "SYS") {
    roleColumns.forEach((it, index) => {
      if (it.dataIndex == "orgName") {
        roleColumns.splice(index, 1)
      }
    })
  }
})
const formType = ref(2)
const visibleEditProject = ref<boolean>(false)
const visibleAuthConfig = ref<boolean>(false)
let spinning = ref(false)
let authSpinning = ref(false)
let editRoleFormRef = ref()

let selectedMenuKeys: any = ref([])
let selectedMenuRows: any = ref([]) //选中的菜单

let selectedAuthKeys: any = ref([]) //选择的权限
let selectedAuthRows: any = ref([])

let selectedRoleRows: any = ref([]) //选择的角色

let dataSource = ref([])
const authData: any = ref([])

let handleMenu: any = ref({})

const menuTree = ref([])

const getAuthList = (row) => {
  handleMenu.value = row
  //清空上次数据
  selectedAuthKeys.value = []
  selectedAuthKeys.value = []
  authData.value = []

  getRoleMenuAuthAPI(selectedRoleRows.value[0].id, row.id).then((res) => {
    authData.value = res
    authData.value.forEach((item) => {
      if (item.checked) {
        selectedAuthKeys.value.push(item.id)
        selectedAuthRows.value.push(item)
      }
    })
  })
}

//关闭弹窗重置
const afterClose = () => {
  handleMenu.value = {}
}

let roleFrom = ref<RoleEditParms>({
  name: "",
  description: "",
  id: "",
  orgId: "",
  orgName: ""
})
let queryFrom = ref<RoleQueryParms>({
  q: ""
})
let pagination = ref({
  current: 1,
  size: 10,
  // size: "small",
  showTotal: (total) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
  pageSizeOptions: ["10", "20", "50", "100"],
  onChange: (page, pageSize) => {
    pagination.value.current = page
    pagination.value.size = pageSize
    getRoleList()
  }
})
let customRow = (row, key) => {
  return {
    onClick: () => {
      if (selectedMenuKeys.value.indexOf(row.id) === -1) {
        selectedMenuKeys.value.push(row.id)
        selectedMenuRows.value.push(row)
      }
    }
  }
}

let rowSelectionForMenu = {
  checkStrictly: true,
  selectedRowKeys: selectedMenuKeys,
  onChange: (keys, rows) => {
    selectedMenuKeys.value = keys
    selectedMenuRows.value = rows
    console.log("selectedMenuKeys: ", keys)
    console.log("selectedMenuRows: ", rows)
  }
}
let rowSelectionForAuth = {
  selectedRowKeys: selectedAuthKeys,
  onChange: (keys, rows) => {
    selectedAuthKeys.value = keys
    selectedAuthRows.value = rows
    console.log("selectedAuthKeys: ", keys)
    console.log("selectedAuthRows: ", rows)
  }
}

//打开角色权限配置
const openAuthConfig = async (row) => {
  clearSelAll()
  authData.value = []
  selectedRoleRows.value = [row]
  try {
    menuTree.value = await getRoleMenuAPI(row.id) //获取角色菜单数据
    recursionMenu(menuTree.value)
  } catch (error) {
    message.warn("菜单数据获取错误")
  }
  visibleAuthConfig.value = true
}

// 打开数据范围配置界面
const dataRange = ref()
const visibleDataRangeConfig = ref<boolean>(false)
const editRow = ref()
const openDataRangeConfig = async (row: any) => {
  visibleDataRangeConfig.value = true
  authSpinning.value = true
  editRow.value = row
  // 质量监督报告数据范围权限
  const res1 = await getRoleMenuAuthAPI(row.id, "1587674648240058369")
  // 工程项目监督机构数据范围权限
  const res2 = await getRoleMenuAuthAPI(row.id, "1656857590702645250")
  let qualityAuths: any = []
  let projectAuths: any = []
  res1.forEach((d: any) => {
    if (d.code === "report::inspection::extend" && d.checked) {
      qualityAuths.push(d)
    }
  })
  projectAuths = res2.filter((d: any) => d.checked)
  dataRange.value.initSelected(qualityAuths, projectAuths)
  authSpinning.value = false
}
const saveLoading = ref(false)
const saveDataAuth = async () => {
  const data = dataRange.value.saveData()
  try {
    saveLoading.value = true
    await setRoleAuthAPI({
      roleId: editRow.value.id,
      menuId: "1587674648240058369",
      authIds: data.quality || []
    })
    await setRoleAuthAPI({
      roleId: editRow.value.id,
      menuId: "1656857590702645250",
      authIds: data.project || []
    })
    message.success("设置成功")
    closeModal()
    // await setRoleMenuAPI({
    //   roleId: editRow.value.id,
    //   menuIds: []
    // })
  } catch (err) {
    console.error(err)
  }
  saveLoading.value = false
}
const closeModal = () => {
  editRow.value = null
  visibleDataRangeConfig.value = false
}

//递归菜单树  回显选中的菜单
const recursionMenu = (arr) => {
  arr.forEach((item) => {
    if (item.checked) {
      selectedMenuKeys.value.push(item.id)
    }
    if (item.children) {
      recursionMenu(item.children)
    }
  })
}

//清空所有选择
const clearSelAll = () => {
  selectedRoleRows.value = []
  selectedAuthKeys.value = []
  selectedAuthRows.value = []
  selectedMenuKeys.value = []
  selectedMenuRows.value = []
}

// 配置角色权限
const configAuthOk = async () => {
  authSpinning.value = true
  await setRoleMenuAPI({
    roleId: selectedRoleRows.value[0].id,
    menuIds: selectedMenuKeys.value
  })
  if (handleMenu.value.id) {
    //如果选择有权限 才进行权限保存
    await setRoleAuthAPI({
      roleId: selectedRoleRows.value[0].id,
      menuId: handleMenu.value.id,
      authIds: selectedAuthKeys.value
    })
  }
  authSpinning.value = false
  // visibleAuthConfig.value = false
  message.success("操作成功")
}

const editRoleReset = async () => {
  //重置表单
  await nextTick()
  roleFrom.value = {
    name: "",
    description: "",
    id: "",
    orgId: "",
    orgName: ""
  }
  editRoleFormRef.value.resetFields() //重置表单
}

//数据提交
const roleFromSubmit = async () => {
  try {
    await editRoleFormRef.value.validateFields() //验证
  } catch (error) {
    console.error("表单验证失败")
    return
  }
  try {
    if (roleFrom.value.id) {
      //编辑角色
      if (roleFrom.value.orgId) {
        await editOrgRoleAPI(roleFrom.value)
        console.log("编辑机构角色")
      } else {
        await editRoleAPI(roleFrom.value)
        console.log("编辑系统角色")
      }
      message.success("更新成功!")
    } else {
      //新增角色
      if (formType.value == 2) {
        await addOrgRoleAPI(roleFrom.value)
        console.log("新增机构角色")
      } else {
        await addRoleAPI(roleFrom.value)
        console.log("新增系统角色")
      }
      message.success("添加成功!")
    }
    getRoleList()
    editRoleReset()
    visibleEditProject.value = false
  } catch (error) {
    console.error("操作失败")
  }
}

const openAddRole = () => {
  formType.value = 1
  visibleEditProject.value = true
  editRoleReset()
}
const openAddOrgRole = async () => {
  formType.value = 2
  visibleEditProject.value = true
  await editRoleReset()
  if (userInfo.value.type !== "SYS") {
    roleFrom.value.orgName = userInfo.value.orgName
    roleFrom.value.orgId = userInfo.value.orgId
  }
}
// 机构change
const changeOrg = ({ value, option }) => {
  roleFrom.value.orgId = value || ""
  roleFrom.value.orgName = value ? option.name : ""
}

const openEditRole = (row) => {
  // if (userInfo.value.role === 'SYS') {
  //     message.warning("暂不提供系统管理员编辑机构角色信息！")
  //     return
  // }
  row.internal ? (formType.value = 1) : (formType.value = 2)

  visibleEditProject.value = true
  roleFrom.value = JSON.parse(JSON.stringify(toRaw(row)))
}
const getRoleList = () => {
  spinning.value = true
  let { current, size } = pagination.value
  let p = {
    ...queryFrom.value,
    current,
    size
  }
  getRolesAPI(p)
    .then((res) => {
      dataSource.value = res.records
      spinning.value = false
      pagination.value.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}
const delSysRole = (row) => {
  Modal.confirm({
    title: "确定要删除此角色吗?",
    icon: createVNode(ExclamationCircleOutlined),
    content: "注意！已被使用的角色不允许删除",
    okText: "确定",
    okType: "danger",
    cancelText: "取消",
    onOk() {
      deleteSysRoleAPI(row.id).then((res) => {
        message.success("删除成功")
        getRoleList()
      })
    },
    onCancel() {
      console.log("Cancel")
    }
  })
}

const delOrgRole = (row) => {
  Modal.confirm({
    title: "确定要删除此角色吗?",
    icon: createVNode(ExclamationCircleOutlined),
    content: "注意！已被使用的角色不允许删除",
    okText: "确定",
    okType: "danger",
    cancelText: "取消",
    onOk() {
      deleteOrgRoleAPI(row.id).then((res) => {
        message.success("删除成功")
        getRoleList()
      })
    },
    onCancel() {
      console.log("Cancel")
    }
  })
}
</script>
<style lang="less" scoped>
.action_row {
  row-gap: 0px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}
</style>
