<template>
  <div>
    <a-spin tip="加载中..." :spinning="spinning">
      <a-row class="action_row">
        <div class="lt">
          <a-space>
            <a-input-search
              v-model:value="queryFrom.q"
              placeholder="请输入用户名称(支持模糊查询)"
              enter-button
              @change="queryFrom.current = 1"
              @search="getUserList"
            />
          </a-space>
        </div>
        <div class="rt">
          <a-space>
            <!-- <a-button type="primary" @click="openAddSysUser" v-auth="'sys::user::add'">新增系统用户</a-button> -->
            <a-button v-if="userInfo.type == 'SYS'" type="primary" @click="openSysAddOrgUser">
              管理员新增机构用户
            </a-button>
            <a-button v-else v-auth="'sys::org:user::add'" type="primary" @click="openAddOrgUser">
              新增机构用户
            </a-button>
            <a-button v-auth="'sys::org:user::add'" @click="resetPassword">重置密码</a-button>
            <a-button v-auth="'sys::user::lab::auth'" @click="laboratoryAuth">
              试验室/现场检测授权
            </a-button>
            <a-button v-if="userInfo.type == 'SYS'" @click="psersonSync">同步人员</a-button>
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
                v-if="userInfo.type == 'SYS'"
                size="small"
                type="primary"
                @click="openSysEditUser(record)"
              >
                编辑
              </a-button>
              <a-button
                v-else
                v-auth="'sys::org:user::edit'"
                size="small"
                type="primary"
                @click="openEditUser(record)"
              >
                编辑
              </a-button>
              <a-button
                v-auth="'sys::user::menus'"
                size="small"
                type="primary"
                @click="hancleAuthConfig(record)"
              >
                权限配置
              </a-button>
              <a-button
                v-if="record.activated"
                v-auth="'sys::user::ban'"
                size="small"
                type="primary"
                danger
                @click="userDisabled(record)"
              >
                禁用
              </a-button>
              <a-button
                v-if="!record.activated"
                v-auth="'sys::user::active'"
                size="small"
                type="primary"
                @click="userEnable(record)"
              >
                启用
              </a-button>
            </a-space>
          </template>
          <template v-if="column.key === 'latestLoginAt'">
            <span>
              {{
                record.latestLoginAt && dayjs(record.latestLoginAt).format("YYYY-MM-DD HH:mm:ss")
              }}
            </span>
          </template>
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.avatarUrl" />
          </template>
          <template v-if="column.key === 'activated'">
            <a-tag v-if="record.activated" color="green">已启用</a-tag>
            <a-tag v-else color="#f50">已禁用</a-tag>
          </template>
        </template>
      </a-table>

      <!-- 系统管理员新增机构用户 -->
      <a-modal
        v-model:visible="visibleAdminEditUser"
        width="550px"
        :centered="true"
        :title="userFrom.id ? '编辑' : '新增'"
        :mask-closable="false"
        @ok="userFromSubmit"
      >
        <a-form
          ref="editProjectFormRef"
          :model="userFrom"
          name="basic"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }"
          autocomplete="off"
        >
          <a-form-item
            label="机构类型"
            name="type"
            :rules="[{ required: true, message: '请选择类型!' }]"
          >
            <a-select
              ref="select"
              v-model:value="userFrom.type"
              placeholder="请选择类型"
              @change="selOrgTypeChange"
            >
              <a-select-option value="ORG" :label-in-value="true">检测机构</a-select-option>
              <a-select-option value="ADM" :label-in-value="true">行业主管部门</a-select-option>
              <a-select-option value="PSA" :label-in-value="true">工程项目监督机构</a-select-option>
              <a-select-option value="PCM" :label-in-value="true">项目建设管理单位</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            label="机构选择"
            name="orgId"
            :rules="[{ required: true, message: '请选择机构名称!' }]"
            @click="tipCheck"
          >
            <!-- <a-select
              ref="select"
              v-model:value="userFrom.orgId"
              placeholder="请选择机构"
              @change="selOrgChanges"
            >
              <a-select-option
                v-for="item in orgList"
                :key="item.id"
                :value="item.id"
                :label-in-value="true"
              >
                {{ item.name }}
              </a-select-option>
            </a-select> -->

            <a-select
              v-model:value="userFrom.orgId"
              show-search
              placeholder="请选择机构！"
              :options="orgList"
              :filter-option="filterOption"
              @change="selOrgChanges"
            ></a-select>
          </a-form-item>
          <a-form-item
            label="名称"
            name="name"
            :rules="[{ required: true, message: '请输入名称!' }]"
          >
            <a-input v-model:value="userFrom.name" placeholder="请输入名称" />
          </a-form-item>
          <a-form-item
            label="用户名"
            name="username"
            :rules="[{ required: true, message: '请输入用户名!' }]"
          >
            <a-input v-model:value="userFrom.username" placeholder="请输入用户名" />
          </a-form-item>
          <a-form-item
            label="角色选择"
            name="roleId"
            :rules="[{ required: true, message: '请选择角色!' }]"
          >
            <a-select
              ref="select"
              v-model:value="userFrom.role"
              :disabled="!userFrom.orgId"
              placeholder="请选择角色"
              @change="selRole"
            >
              <a-select-option
                v-for="item in roleList"
                :key="item.id"
                :value="item.id"
                :label-in-value="true"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item
            label="是否启用"
            name="activated"
            :rules="[{ required: true, message: '是否启用!' }]"
          >
            <a-radio-group v-model:value="userFrom.activated">
              <a-radio :value="true">是</a-radio>
              <a-radio :value="false">否</a-radio>
            </a-radio-group>
          </a-form-item>

          <!-- <a-form-item label="角色选择" name="roleId" v-if="userInfo.role != 'SYS'"
            :rules="[{ required: true, message: '请选择角色!' }]">
            <a-select ref="select" v-model:value="userFrom.roleId" placeholder="请选择角色" @change="selRole">
              <a-select-option :value="item.id" :labelInValue="true" v-for="item in roleList" :key="item.id">{{
                  item.name
              }}</a-select-option>
            </a-select>
          </a-form-item> -->

          <a-form-item
            label="保管人"
            name="custodian"
            :rules="[{ required: true, message: '请输入保管人!' }]"
          >
            <a-input v-model:value="userFrom.custodian" placeholder="请输入保管人" />
          </a-form-item>
          <a-form-item
            label="手机号"
            name="custodianPhone"
            :rules="[{ required: true, message: '请输入手机号!' }]"
          >
            <a-input v-model:value="userFrom.custodianPhone" placeholder="请输入手机号码" />
          </a-form-item>
          <a-form-item label="联系地址" name="custodianAddr">
            <a-input v-model:value="userFrom.custodianAddr" placeholder="请输入联系地址" />
          </a-form-item>
          <a-form-item label="头像" name="avatar">
            <uploadFile
              v-model:value="uploadAvatar"
              :config="{ listType: 'picture-card', multiple: false }"
            />
          </a-form-item>
        </a-form>
      </a-modal>

      <!-- 系统管理员新增系统用户 -->
      <!-- <a-modal v-model:visible="visibleEditSysUser" width="550px" :centered="true" :title="userFrom.id ? '编辑' : '新增'"
        @ok="fromSubmitSysUser">
        <a-form ref="editProjectFormRef" :model="userFrom" name="basic" :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }" autocomplete="off">

          <a-form-item label="用户名" name="username" :rules="[{ required: true, message: '请输入用户名!' }]">
            <a-input v-model:value="userFrom.username" placeholder="请输入用户名" />
          </a-form-item>
          <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入名称!' }]">
            <a-input v-model:value="userFrom.name" placeholder="请输入名称" />
          </a-form-item>
          <a-form-item label="头像" name="builder" :rules="[{ required: true, message: '请输入建设单位!' }]">
                        <a-input v-model:value="userFrom.avatar" placeholder="请输入建设单位" />
          </a-form-item>
          <a-form-item label="是否启用" name="activated" :rules="[{ required: true, message: '是否启用!' }]">
            <a-radio-group v-model:value="userFrom.activated">
              <a-radio :value="true">是</a-radio>
              <a-radio :value="false">否</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="角色选择" name="roleId" :rules="[{ required: true, message: '请选择角色!' }]">
            <a-select ref="select" v-model:value="userFrom.roleId" placeholder="请选择角色" @change="selRole">
              <a-select-option :value="item.id" :labelInValue="true" v-for="item in roleList" :key="item.id">{{
                  item.name
              }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-modal> -->

      <!-- 机构新增机构用户 -->
      <a-modal
        v-model:visible="visibleEditUser"
        width="550px"
        :centered="true"
        :title="userFrom.id ? '编辑' : '新增'"
        :mask-closable="false"
        @ok="userFromSubmit"
      >
        <a-form
          ref="editProjectFormRef"
          :model="userFrom"
          name="basic"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }"
          autocomplete="off"
        >
          <a-form-item
            label="机构选择"
            name="orgId"
            :rules="[{ required: true, message: '请选择机构名称!' }]"
          >
            <a-input v-model:value="userFrom.orgName" placeholder="请输入用户名" :disabled="true" />
          </a-form-item>
          <a-form-item
            label="用户名"
            name="username"
            :rules="[{ required: true, message: '请输入用户名!' }]"
          >
            <a-input v-model:value="userFrom.username" placeholder="请输入用户名" />
          </a-form-item>
          <a-form-item
            label="名称"
            name="name"
            :rules="[{ required: true, message: '请输入名称!' }]"
          >
            <a-input v-model:value="userFrom.name" placeholder="请输入名称" />
          </a-form-item>
          <!-- <a-form-item label="头像" name="builder" :rules="[{ required: true, message: '请输入建设单位!' }]">
                        <a-input v-model:value="userFrom.avatar" placeholder="请输入建设单位" />
          </a-form-item>-->
          <a-form-item
            label="是否启用"
            name="activated"
            :rules="[{ required: true, message: '是否启用!' }]"
          >
            <a-radio-group v-model:value="userFrom.activated">
              <a-radio :value="true">是</a-radio>
              <a-radio :value="false">否</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item
            v-if="userInfo.role != 'SYS'"
            label="角色选择"
            name="roleId"
            :rules="[{ required: true, message: '请选择角色!' }]"
          >
            <a-select
              ref="select"
              v-model:value="userFrom.role"
              placeholder="请选择角色"
              @change="selRole"
            >
              <a-select-option
                v-for="item in roleList"
                :key="item.id"
                :value="item.id"
                :label-in-value="true"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item
            label="保管人"
            name="custodian"
            :rules="[{ required: true, message: '请输入保管人!' }]"
          >
            <a-input v-model:value="userFrom.custodian" placeholder="请输入保管人" />
          </a-form-item>
          <a-form-item
            label="手机号"
            name="custodianPhone"
            :rules="[{ required: true, message: '请输入手机号!' }]"
          >
            <a-input v-model:value="userFrom.custodianPhone" placeholder="请输入手机号码" />
          </a-form-item>
          <a-form-item label="联系地址" name="custodianAddr">
            <a-input v-model:value="userFrom.custodianAddr" placeholder="请输入联系地址" />
          </a-form-item>
          <a-form-item label="头像" name="avatar">
            <uploadFile
              v-model:value="uploadAvatar"
              :config="{ listType: 'picture-card', multiple: false }"
            />
          </a-form-item>
        </a-form>
      </a-modal>

      <selLabModel
        v-model:visible="visibleIaboratoryAuth"
        v-model:selected="selLaboratoryList"
        :org-id="selUserOrgId"
        title="请选择授权的试验室/现场检测项目"
        @confirm="selLaboratoryCB"
      />

      <!-- 权限配置 -->
      <AuthConfig ref="authConfigRef" />
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, toRaw, nextTick, h } from "vue"
import dayjs from "dayjs"
import {
  getUsersAPI,
  getUserRolesAPI,
  disableUsersAPI,
  enableUsersAPI,
  resetPasswordAPI,
  addOrgUserAPI,
  editOrgUserAPI,
  getUserLaboratoryAuth,
  setUserLaboratoryAuth,
  getOrgByTypeAPI
} from "@/api/system.api"

import { asyncAdmUserInfo } from "@/api/organization.api"
import uploadFile from "@/components/uploadFile/index.vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { createVNode } from "vue"
import { Modal, message } from "ant-design-vue"
import selLabModel from "./components/selLabModel.vue"
import AuthConfig from "./components/AuthConfig.vue"
import { getMinioFileUrl } from "@/config/minio.config"

import userInfoStore from "@/stores/userInfo"
import { storeToRefs } from "pinia"
const { userInfo } = storeToRefs(userInfoStore())

console.log("当前登录用户信息：", userInfo.value)
onMounted(() => {
  getUserList()
})

const selLaboratoryList = ref([])
const visibleAdminEditUser = ref<boolean>(false) //管理员新增机构用户
const visibleEditUser = ref<boolean>(false) // 新增机构用户

const visibleIaboratoryAuth = ref<boolean>(false)
let spinning = ref(false)
let editProjectFormRef = ref()
let roleList: any = ref([])
let orgList: any = ref([])

let dataSource = ref([])

let userFrom: any = ref({
  type: "ORG", //用户类型
  username: "", //用户名
  name: "", //名称
  avatar: "", //头像地址
  activated: true, //启用状态
  role: null, //选择的角色
  roleId: null, //选择的角色ID
  roleDesc: null, //	选择的角色描述
  orgId: null, //所属机构id
  orgName: null, //机构名称
  custodian: "", //保管人
  custodianPhone: "", //保管人手机
  custodianAddr: "", //保管人地址
  id: ""
})
let queryFrom = ref({
  current: 1,
  size: 10,
  sort: "",
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
    getUserList()
  }
})
let selectedRowKeys = ref<string[]>([])
let selectedRows = ref<any>([])

let rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys, rows) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
    console.log("selectedRowKeys: ", keys)
    console.log("selectedRows: ", rows)
  }
}

let uploadAvatar: any = ref([])

const tipCheck = () => {
  if (!orgList.value.length) {
    message.warning("请先选择机构类型")
  }
}
const getORGList = async () => {
  let res = await getOrgByTypeAPI(userFrom.value.type)
  orgList.value = res.map((it) => {
    return {
      value: it.id,
      label: it.name
    }
  })
}

const selRole = (v) => {
  roleList.value.forEach((item) => {
    if (v == item.id) {
      userFrom.value.role = item.name
      userFrom.value.roleDesc = item.description
      userFrom.value.roleId = item.id
    }
  })
}

const filterOption = (v: string, option: any) => {
  return option.label.includes(v)
}

const getRoleList = async () => {
  let res = await getUserRolesAPI({ orgId: userFrom.value.orgId }) //获取用户可以添加的角色
  roleList.value = res
}
const psersonSync = () => {
  spinning.value = true
  asyncAdmUserInfo()
    .then(() => {
      spinning.value = false
      message.success("同步成功")
    })
    .catch(() => {
      spinning.value = false
    })
}

const editUserReset = async () => {
  //重置表单
  await nextTick()
  userFrom.value = {
    type: "ORG", //用户类型
    username: "", //用户名
    name: "", //名称
    avatar: "", //头像地址
    activated: true, //启用状态
    role: null, //选择的角色
    roleId: null, //选择的角色ID
    roleDesc: null, //	选择的角色描述
    orgId: null, //所属机构id
    orgName: null, //机构名称
    custodian: "", //保管人
    custodianPhone: "", //保管人手机
    custodianAddr: "", //保管人地址
    id: ""
  }
  uploadAvatar.value = []
  editProjectFormRef.value.resetFields() //重置表单
}

//选择机构类型change
const selOrgTypeChange = () => {
  getORGList()
  userFrom.value.orgId = null
  userFrom.value.orgName = null
  userFrom.value.roleId = null
  userFrom.value.role = null
  userFrom.value.roleDesc = null
}

// 机构change
const selOrgChanges = (v, row) => {
  userFrom.value.orgName = row.label
  userFrom.value.orgId = row.value

  userFrom.value.roleId = null
  userFrom.value.role = null
  userFrom.value.roleDesc = null
  getRoleList()
}

//数据提交
const userFromSubmit = async () => {
  try {
    await editProjectFormRef.value.validateFields() //验证
    uploadAvatar.value.length ? (userFrom.value.avatar = uploadAvatar.value[0].url) : ""
    userFrom.value.type = "" // 不需要把类型传给

    // let isSYS = Boolean(userInfo.value.type == "SYS") //是否管理员
    // console.log("是否管理员新增", isSYS)
    if (userFrom.value.id) {
      await editOrgUserAPI(userFrom.value)
      // isSYS ? await editUserAPI(userFrom.value) : await editOrgUserAPI(userFrom.value) //更新机构账户
      message.success("更新成功!")
    } else {
      let res = await addOrgUserAPI(userFrom.value)
      // let res = isSYS ? await addUserAPI(userFrom.value) : await addOrgUserAPI(userFrom.value) //新增机构账户
      Modal.success({
        title: "操作成功！",
        content: h("div", {}, [
          h("p", "账户添加成功，请您妥善保管，并及时修改密码"),
          h("h3", "密码:" + res.pwd)
        ])
      })
    }
    getUserList()
    editUserReset()
    visibleAdminEditUser.value = false
    // visibleEditSysUser.value = false;
    visibleEditUser.value = false
  } catch (error) {
    console.error("操作失败", error)
  }
}

//提交系统用户编辑数据
// const fromSubmitSysUser = () => {
//   visibleEditSysUser.value = true;
//   console.log(22222, userFrom.value);

// }

// const openAddSysUser = () => {
//   formType.value = 1
//   visibleEditSysUser.value = true;
//   editUserReset();
// };

//sys新增机构用户
const openSysAddOrgUser = () => {
  getORGList()
  visibleAdminEditUser.value = true
  editUserReset()
  orgList.value = []
}
//新增机构用户
const openAddOrgUser = async () => {
  visibleEditUser.value = true
  await editUserReset()
  userFrom.value.orgName = userInfo.value.orgName
  userFrom.value.orgId = userInfo.value.orgId
  getRoleList()
}
//sys编辑机构
const openSysEditUser = async (row) => {
  visibleAdminEditUser.value = true
  await editUserReset()
  row.avatar ? (uploadAvatar.value = [{ url: row.avatar, name: row.avatar }]) : ""
  userFrom.value = JSON.parse(JSON.stringify(toRaw(row)))
  getRoleList()
  getORGList()
}
//编辑机构
const openEditUser = async (row) => {
  visibleEditUser.value = true
  await editUserReset()
  row.avatar ? (uploadAvatar.value = [{ url: row.avatar, name: row.avatar }]) : ""
  userFrom.value = JSON.parse(JSON.stringify(toRaw(row)))
  console.log(11122, userFrom.value)
  getRoleList()
}
//密码重置
const resetPassword = () => {
  if (selectedRows.value.length !== 1) {
    message.warning("请选择一条数据进行密码重置")
    return
  }
  Modal.confirm({
    title: "确定要重置该用户密码?",
    icon: createVNode(ExclamationCircleOutlined),
    content: "重置后，原密码将作废！新密码将以  “短信” 方式发送到该账号保管人手机号",
    okText: "确定",
    cancelText: "取消",
    onOk() {
      resetPasswordAPI(selectedRows.value[0].id).then((res) => {
        getUserList()
        Modal.success({
          title: "操作成功！",
          content: h("div", {}, [
            // h("p", "密码重置成功，重置后密码已发送至保管人手机号，请您妥善保管，并及时修改密码"),
            h("h3", res.msg)
          ])
        })
      })
    },
    onCancel() {
      console.log("Cancel")
    }
  })
}
//获取用户列表
const getUserList = () => {
  spinning.value = true
  getUsersAPI(queryFrom.value)
    .then(async (res) => {
      let datas = res.records
      for (let i = 0; i < datas.length; i++) {
        const d = datas[i]
        try {
          d.avatarUrl = await getMinioFileUrl(d.avatar)
        } catch (err) {
          d.avatarUrl = ""
        }
      }
      dataSource.value = datas
      spinning.value = false
      pagination.value.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}
//账户禁用
const userDisabled = (item) => {
  Modal.confirm({
    title: "确定要禁用此账户吗?",
    icon: createVNode(ExclamationCircleOutlined),
    content: "禁用后,该账户将无法登录！",
    okText: "确定",
    okType: "danger",
    cancelText: "取消",
    onOk() {
      disableUsersAPI(item.id).then((res) => {
        message.success("禁用成功")
        getUserList()
      })
    },
    onCancel() {
      console.log("Cancel")
    }
  })
}
const userEnable = (item) => {
  enableUsersAPI(item.id).then((res) => {
    message.success("启用成功")
    getUserList()
  })
}

/**
 * 权限配置
 */
const authConfigRef = ref()
function hancleAuthConfig(row) {
  authConfigRef.value.openModal(row)
}

let selUserOrgId = ref("")
//试验室授权
const laboratoryAuth = async () => {
  if (selectedRowKeys.value.length != 1) {
    message.warning("请选择一条用户进行试验室授权")
    return
  }
  let res = await getUserLaboratoryAuth(selectedRowKeys.value[0])
  selLaboratoryList.value = res.map((item) => {
    return {
      id: item
    }
  })
  selUserOrgId.value = selectedRows.value[0].orgId
  visibleIaboratoryAuth.value = true
}
const selLaboratoryCB = async (v) => {
  console.log(v)
  let labIds = v.map((item) => {
    return item.id
  })
  await setUserLaboratoryAuth({
    userId: selectedRowKeys.value[0],
    labIds: labIds
  })
  message.success("授权成功")
  visibleIaboratoryAuth.value = false
  selLaboratoryList.value = []
  selectedRowKeys.value = []
  selectedRows.value = []
}

let columns = [
  {
    title: "头像",
    dataIndex: "avatar",
    key: "avatar"
  },
  {
    title: "机构名称",
    dataIndex: "orgName",
    key: "orgName"
  },
  {
    title: "名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "用户名",
    dataIndex: "username",
    key: "username"
  },
  {
    title: "保管人",
    dataIndex: "custodian",
    key: "custodian"
  },
  {
    title: "电话",
    dataIndex: "custodianPhone",
    key: "custodianPhone"
  },
  {
    title: "所属角色",
    dataIndex: "role",
    key: "role"
  },
  {
    title: "最后登录时间",
    dataIndex: "latestLoginAt",
    key: "latestLoginAt"
  },
  {
    title: "状态",
    dataIndex: "activated",
    key: "activated"
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
