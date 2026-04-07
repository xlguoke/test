<template>
  <div class="set-user-org">
    <div class="content">
      <div class="admin-info">
        请联系管理员进行账户授权
        <p>联系电话：{{ adminInfo.phone || "023-110" }}</p>
      </div>
      <!-- <a-form
        ref="formRef"
        :model="userForm"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
        autocomplete="off"
      >
        <a-form-item
          label="机构选择"
          name="orgId"
          :rules="[{ required: true, message: '请选择机构!' }]"
        >
          <a-select
            ref="select"
            v-model:value="userForm.orgId"
            placeholder="请选择机构"
            :disabled="Boolean(userInfo.orgId)"
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
          </a-select>
        </a-form-item>
        <a-form-item
          label="用户名"
          name="username"
          :rules="[{ required: true, message: '请输入用户名!' }]"
        >
          <a-input v-model:value="userForm.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入名称!' }]">
          <a-input v-model:value="userForm.name" placeholder="请输入名称" />
        </a-form-item>
        <a-form-item
          label="是否启用"
          name="activated"
          :rules="[{ required: true, message: '是否启用!' }]"
        >
          <a-radio-group v-model:value="userForm.activated">
            <a-radio :value="true">是</a-radio>
            <a-radio :value="false">否</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          v-if="userForm.role != 'SYS'"
          label="角色选择"
          name="roleId"
          :rules="[{ required: true, message: '请选择角色!' }]"
        >
          <a-select
            ref="select"
            v-model:value="userForm.roleId"
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
          <a-input v-model:value="userForm.custodian" placeholder="请输入保管人" />
        </a-form-item>
        <a-form-item
          label="手机号"
          name="custodianPhone"
          :rules="[{ required: true, message: '请输入手机号!' }]"
        >
          <a-input v-model:value="userForm.custodianPhone" placeholder="请输入手机号码" />
        </a-form-item>
        <a-form-item label="联系地址" name="custodianAddr">
          <a-input v-model:value="userForm.custodianAddr" placeholder="请输入联系地址" />
        </a-form-item>
        <a-form-item label="头像" name="avatar">
          <uploadFile
            v-model:value="uploadAvatar"
            :config="{ listType: 'picture-card', multiple: false }"
          />
        </a-form-item>
      </a-form>
      <div style="text-align: center; margin-top: 30px">
        <a-button type="primary" @click="submitUserInfo">提 交</a-button>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { storeToRefs } from "pinia"
import uploadFile from "@/components/uploadFile/index.vue"
import { getRoleByOrgIdAPI, getOrgByTypeAPI, editOrgUserAPI, getAdminInfo } from "@/api/system.api"
import userInfoStore from "@/stores/userInfo"
import { useRouter } from "vue-router"
const router = useRouter()
const { userInfo } = storeToRefs(userInfoStore())

const userForm = ref({ ...userInfo.value })

const uploadAvatar = ref<
  {
    url: string
    name?: string
  }[]
>([])

const adminInfo = ref<{
  name: string
  phone: string
}>({
  name: "",
  phone: ""
})
onMounted(() => {
  getAdminInfo().then((res: any) => {
    adminInfo.value = res
  })
  // getORGList()
})

// 获取机构数据
let orgList: any = ref([])
const getORGList = async () => {
  let res = await getOrgByTypeAPI("adm")
  orgList.value = res
  selOrgChanges(userForm.value.orgId)
}
// 机构change
const selOrgChanges = (v) => {
  let selOrg = orgList.value.filter((item) => {
    if (item.id === v) return item
  })
  if (!selOrg || selOrg.length === 0) return
  userForm.value.orgName = selOrg[0].name
  userForm.value.orgId = selOrg[0].id
  getRoleList()
}

// 获取角色数据
let roleList: any = ref([])
const getRoleList = async () => {
  if (!userForm.value.orgId) return
  let res = await getRoleByOrgIdAPI(userForm.value.orgId) //获取用户可以添加的角色
  roleList.value = res
}
const selRole = (v) => {
  roleList.value.forEach((item) => {
    if (v == item.id) {
      userForm.value.role = item.name
      userForm.value.roleDesc = item.description
      userForm.value.roleId = item.id
    }
  })
}

// 保存用户信息
const formRef = ref()
const submitUserInfo = async () => {
  try {
    await formRef.value.validateFields()
    uploadAvatar.value.length ? (userForm.value.avatar = uploadAvatar.value[0].url) : ""
    await editOrgUserAPI(userForm.value)
    userInfo.value = {
      ...userInfo.value,
      ...userForm.value
    }
    router.push({ path: "/homePage" })
  } catch (err) {}
}
</script>

<style lang="less" scoped>
.set-user-org {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  background-color: #f9f9f9;
  overflow: hidden;

  .content {
    padding: 20px;
    width: 500px;
    max-height: 85%;
    background: #fff;
    border: 1px solid #f5f5f5;
    border-radius: 4px;
    overflow: auto;
  }
  .admin-info {
    font-size: 16px;
    line-height: 24px;
    text-align: center;
  }
}
</style>
