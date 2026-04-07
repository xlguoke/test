<template>
  <AppProvider>
    <ht-modal
      v-model:open="open"
      :title="modalTitle"
      width="600px"
      :mask-closable="false"
      destroy-on-close
      :confirm-loading="submitLoading"
      centered
      @cancel="cancel"
    >
      <a-form
        ref="formRef"
        :rules="rules"
        :model="formState"
        class="pt-4"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 17 }"
      >
        <a-form-item label="用户账号" name="userName">
          <a-input v-model:value="formState.userName" :disabled="isEdit" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="账户类型" name="type">
          <a-select
            v-model:value="formState.type"
            :options="UserAccountTypeDict"
            placeholder="请选择"
          />
        </a-form-item>
        <a-form-item label="单点登录账号" name="ssoName">
          <a-flex>
            <a-input v-model:value="formState.ssoName" placeholder="请输入" />
            <a-tooltip placement="top" title="用于hitek平台多产品互通,不能与其他人相同">
              <QuestionCircleOutlined class="ml-2 text-[16px] text-orange-500" />
            </a-tooltip>
          </a-flex>
        </a-form-item>
        <a-form-item label="用户名称" name="realName">
          <a-input v-model:value="formState.realName" placeholder="请输入" />
        </a-form-item>
        <a-form-item v-if="!isEdit" label="密码" name="password">
          <a-input-password v-model:value="formState.password" autocomplete="new-password" placeholder="请输入" />
        </a-form-item>
        <a-form-item v-if="!isEdit" label="重复密码" name="repassword">
          <a-input-password v-model:value="formState.repassword" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="部门" name="orgIds">
          <!--          <a-flex justify="space-between" align="center"> -->
          <!--            <div>{{ formState.departname }}</div> -->
          <!--            <a-button @click="departmentSelectorVisible = true"> -->
          <!--              选择 -->
          <!--            </a-button> -->
          <!--          </a-flex> -->

          <a-tree-select
            v-model:value="formState.orgIds"
            :tree-data="orgList"
            tree-checkable
            allow-clear
            placeholder="请选择"
            tree-node-filter-prop="label"
            tree-check-strictly
            show-checked-strategy="SHOW_ALL"
            :field-names="{
              label: 'departname',
              value: 'orgId',
            }"
          />
        </a-form-item>
        <a-form-item label="角色" name="roleid">
          <a-flex justify="space-between" align="center">
            <a-select
              v-model:value="formState.roleid"
              :options="roleList"
              :disabled="disabledRole"
              option-filter-prop="label"
              mode="multiple"
              placeholder="请选择"
            />
          </a-flex>
        </a-form-item>
        <a-form-item label="职务" name="jobTitle">
          <a-input v-model:value="formState.jobTitle" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="身份证号" name="idCard">
          <a-input v-model:value="formState.idCard" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="手机号码" name="mobilePhone">
          <a-input v-model:value="formState.mobilePhone" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="办公电话" name="officePhone">
          <a-input v-model:value="formState.officePhone" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="常用邮箱" name="email">
          <a-input v-model:value="formState.email" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="生日" name="birthDay">
          <a-date-picker v-model:value="formState.birthDay" value-format="YYYY-MM-DD" class="w-full" />
        </a-form-item>
        <a-form-item label="签字图片" name="signPhoto">
          <template v-if="signPhoto">
            <img :src="signPhoto" class="mb-4 max-w-[120px] max-h-[64px]" />
            <a-button class="mr-2" @click="signPhoto = ''">
              删除
            </a-button>
          </template>

          <HtUploadFile
            :business-type="BUSINES_TYPE.GENERAL"
            hide-file-list
            force-init
            :accept="['png', 'jpg', 'jpeg']"
          >
            <template #footer="{ handleCancel, fileDatas }">
              <a-space>
                <a-button @click="handleCancel">
                  取消
                </a-button>
                <a-button type="primary" @click="handleUploadSuccess({ closeFn: handleCancel, fileDatas })">
                  确定
                </a-button>
              </a-space>
            </template>
          </HtUploadFile>
        </a-form-item>
        <a-form-item label="证书编号" name="certificateNo">
          <a-input v-model:value="formState.certificateNo" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="RFID智能卡编号" name="rfid">
          <a-input v-model:value="formState.rfid" placeholder="请输入" />
        </a-form-item>
      </a-form>

      <template #footer>
        <a-button @click="cancel">
          取消
        </a-button>
        <a-button
          type="primary"
          :loading="submitLoading"
          @click="onSubmit"
        >
          确定
        </a-button>
      </template>
    </ht-modal>
  </AppProvider>
</template>

<script setup lang='ts'>
import type { Rule } from 'ant-design-vue/es/form'
import type { IOrgEntity } from '~/interface/IOrgEntity.ts'
import type { RoleList } from '~/views/unit-config/userMgt/api.ts'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getOrgList } from '~/api/common.ts'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import { useValidPassword } from '~/hooks/useValidPassword'
import { getRoles, getUser, saveUser, UserEntity } from '~/views/unit-config/userMgt/api.ts'
import { idCardValidator } from '~/views/unit-config/userMgt/idCardValidator.ts'
import { UserAccountTypeDict } from '~/views/unit-config/userMgt/index.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: '',
  },
  personData: {
    type: Object,
    default: null,
  },
})

const emits = defineEmits(['update:open', 'onSave'])

// 用于嵌入到html页面调用
const pageProps = ref({
  open: false,
  id: '',
})

const open = computed(() => props.open || pageProps.value.open)

const personData = computed(() => props.personData)

const isEdit = computed(() => !!props.id || !!pageProps.value.id)

const modalTitle = computed(() => {
  if (personData.value) {
    return '创建账号'
  }

  return isEdit.value ? '用户编辑' : '用户录入'
})

const disabledRole = ref(false)

const formRef = ref()

const submitLoading = ref(false)

const formState = ref(new UserEntity())

const roleList = ref<RoleList[]>([])

const adminRoleId = ref<string>()

const orgList = ref<IOrgEntity[]>([])

const signPhoto = ref('')

// 角色管理处新增
const sourceRoleId = ref<string>()

const { validPassword, validRePassword } = useValidPassword()

const rules: Record<string, Rule[]> = {
  userName: [
    { required: true, message: '请输入用户账号！' },
    { min: 2, max: 11, message: '请填写2到11位字符！', trigger: 'blur' },
  ],
  realName: [{ required: true, message: '请输入用户名称！' }],
  password: [
    { required: true, message: '请输入密码！' },
    { validator: (_rule, v) => validPassword(v), trigger: 'blur' },
  ],
  repassword: [
    { required: true, message: '请重复密码！' },
    { validator: (_rule: Rule, value: string) => validRePassword(value, formState.value.password || ''), trigger: 'blur' },
  ],
  orgIds: [{ required: true, message: '请选择部门！' }],
  roleid: [{ required: true, message: '请选择角色！' }],
  email: [{ type: 'email', message: '请输入有效的邮箱！', trigger: 'blur' }],
  mobilePhone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码！', trigger: 'blur' }],
  idCard: [{ validator: async (_rule: Rule, value: string) => {
    if (value && !idCardValidator(value)) {
      return Promise.reject(new Error('请输入有效的身份证号码！'))
    }
    return Promise.resolve()
  }, trigger: 'blur' }],
}

function handleUploadSuccess({ closeFn, fileDatas }: any) {
  if (fileDatas.length > 1) {
    Modal.confirm({
      title: '提示',
      content: '检测到上传了多张图片，默认取第一张上传的文件作为签字图片，是否继续？',
      onOk: () => {
        signPhoto.value = fileDatas[0].url
        closeFn()
      },
    })
    return
  }

  if (fileDatas.length === 1) {
    signPhoto.value = fileDatas[0].url
  }
  else {
    signPhoto.value = ''
  }
  closeFn()
}

watch(open, (val) => {
  if (!val) {
    cancel()
  }
  else {
    onOpen()
  }
})

async function onOpen() {
  formState.value = new UserEntity()
  disabledRole.value = false
  if (!isEdit.value && sourceRoleId.value) {
    formState.value.roleid = [sourceRoleId.value]
  }

  if (isEdit.value) {
    const res = await getUser(props.id || pageProps.value.id)
    const data = res.data

    formState.value = {
      id: data.id,
      userName: data.userName,
      type: data.type,
      ssoName: data.ssoName,
      realName: data.realName,
      orgIds: data.departmentIds || [],
      roleid: data.roleIds || [],
      jobTitle: data.jobTitle,
      idCard: data.idCard,
      mobilePhone: data.mobilePhone,
      officePhone: data.officePhone,
      email: data.email,
      birthDay: data.birthDay ? dayjs(data.birthDay).format('YYYY-MM-DD') : '',
      certificateNo: data.certificateNo,
      rfid: data.rfid,
    }

    signPhoto.value = data.signPhoto || ''
  }

  if (personData.value) {
    formState.value.userName = personData.value.personName
    formState.value.realName = personData.value.personName
    formState.value.jobTitle = personData.value.jobTitle
  }

  if (!roleList.value.length) {
    const res = await getRoles()
    const rows = res.data.rows || []

    const adminRole = rows.find(i => i.roleCode === 'admin')
    if (adminRole) {
      adminRoleId.value = adminRole.id
    }

    roleList.value = rows.filter(i => i.roleCode !== 'admin').map(i => ({
      ...i,
      label: i.roleName,
      value: i.id,
    }))
  }

  if (formState.value.roleid.length) {
    formState.value.roleid = formState.value.roleid.filter((i: string) => i !== adminRoleId.value)

    const userAdmin = roleList.value.find(d => d.roleCode === 'U_MANAGER')
    disabledRole.value = userAdmin ? formState.value.roleid.includes(userAdmin.id) : false
  }

  if (!orgList.value.length) {
    getOrgList().then((res) => {
      orgList.value = res.data
    })
  }
}

/**
 * 选择了管理员角色时，进行二次确认
 */
async function knowSelectedAdminRole() {
  return new Promise((resolve) => {
    const roles = roleList.value.filter(d => formState.value.roleid.includes(d.id))
    const roleObj = roles.find(d => d.roleCode === 'U_MANAGER')
    if (!roleObj || disabledRole.value) {
      resolve(true)
      return
    }
    Modal.confirm({
      title: '提示',
      content: `设置为${roleObj.roleName}角色后，保存后将无法再次修改，是否继续？`,
      type: 'warning',
      centered: true,
      onOk: () => {
        resolve(true)
      },
      onCancel: () => {
        resolve(false)
      },
    })
  })
}

function onSubmit() {
  if (submitLoading.value) {
    return
  }

  formRef.value.validateFields().then(async () => {
    const formData: UserEntity = {
      ...formState.value,
      roleid: formState.value.roleid.toString(),
      orgIds: formState.value.orgIds.map(i => typeof (i) === 'string' ? i : i.value).join(','),
    }

    if (!(await knowSelectedAdminRole()))
      return

    submitLoading.value = true
    const res = await saveUser(formData, signPhoto.value).finally(() => {
      submitLoading.value = false
    })

    message.success('保存成功')
    emits('onSave', res)
    cancel()

    if (window.userSaveCallback) {
      window.userSaveCallback()
    }

    try {
      window.$('#userList').datagrid('reload')
    }
    catch (e) {
      console.error(e)
    }
  })
}

// 关闭弹窗
function cancel() {
  pageProps.value.open = false
  emits('update:open', false)
  formRef.value.resetFields()
  formState.value = new UserEntity()
  signPhoto.value = ''
}

window.$userAdd = {
  save: onSubmit,
  add: (roleId?: string) => {
    if (roleId) {
      sourceRoleId.value = roleId
    }
    else {
      sourceRoleId.value = undefined
    }
    pageProps.value.id = ''
    pageProps.value.open = true
  },
  edit: (id: string) => {
    pageProps.value.id = id
    pageProps.value.open = true
  },
}
</script>
