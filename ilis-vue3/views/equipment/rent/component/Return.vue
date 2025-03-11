<template>
  <HtModal
    v-model:open="visible"
    :title="param?.isDetail ? '设备借用归还记录' : '设备借用归还'"
    width="500px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <template v-if="param?.isDetail" #footer>
      <a-button @click="visible = false">
        关闭
      </a-button>
    </template>
    <IlisForm
      :key="initData.rentType"
      ref="ilisFormRef"
      :cols="1"
      :entity="EquipmentReturnEntity"
      :init-data="initData"
      :disabled="param?.isDetail"
      :label-col="{
        style: { width: '100px' },
      }"
    >
      <template #eqStatus="{ data }">
        <IlisInput
          v-model="data.eqStatus"
          :entity="EquipmentReturnEntity"
          :options="deviceOption"
          :disabled="param?.isDetail"
          field="eqStatus"
        ></IlisInput>
      </template>
      <template #confirmUserName="{ data }">
        <div class="flex gap-3">
          <IlisInput
            v-model="data.confirmUserName"
            class="flex-1"
            :entity="EquipmentReturnEntity"
            disabled
            field="confirmUserName"
          ></IlisInput>
          <a-button @click="showPersonSelector = true">
            选择
          </a-button>
        </div>
      </template>
      <template #returnOrg="{ data }">
        <div class="flex gap-3">
          <IlisInput
            v-model="data.returnOrg"
            class="flex-1"
            :entity="EquipmentReturnEntity"
            disabled
            field="returnOrg"
          ></IlisInput>
          <a-button @click="showProjectOrgSelector = true">
            选择
          </a-button>
        </div>
      </template>
      <template #form-after>
        <a-form-item
          label="附件材料"
        >
          <a-button v-if="!param?.isDetail" :icon="h(UploadOutlined)" @click="showUplaod = true">
            上传文件
          </a-button>
          <div v-for="(item, index) in fileList" :key="index">
            <a :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.uid}`">{{ item.name }}</a>
          </div>
        </a-form-item>
        <a-form-item
          v-if="initData.returnSignerFile?.url"
          label="签名图片"
        >
          <a-image
            :width="200"
            :src="initData.returnSignerFile?.url"
          />
        </a-form-item>
      </template>
    </IlisForm>
    <!-- 附件上传 -->
    <IlisUpload
      v-model:show="showUplaod"
      :file-list="fileList"
      :max="1"
      @success="handleUploadSuccess"
    ></IlisUpload>
    <!-- 人员选择器 -->
    <PersonSelector
      v-model:show="showPersonSelector"
      @confirm="handleSelectPerson($event)"
    />
    <!-- 部门、项目选择器 -->
    <ProjectOrgSelector
      v-model:show="showProjectOrgSelector"
      @confirm="handleSelectProjectOrg($event)"
    />
  </HtModal>
</template>

<script lang="ts" setup>
import { UploadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { EquipmentReturnEntity } from '../EquipmentReturnEntity'
import { changeSignStatus, getEquipmentRentDetail, submitEquipmentReturn } from '../api'
import { EquipmentRentEntity, EquipmentRentSignStatus, EquipmentRentStatus, EquipmentRentType } from '../EquipmentRentEntity'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisForm, IlisInput, IlisSignature, IlisUpload } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { getQrcodeLink } from '~/components/IlisSignature/api'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { getCurrentUserInfo, getListByGroupId } from '~/api/common'
import type { IOption } from '~/interface/IOption'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { SignType } from '~/components/IlisSignature'
import { preCheckProcess } from '~/components/commonProcess/api'
import { ProcessType } from '~/components/commonProcess'
import { getEquipmentRentDetailWithouAuth } from '~/views/mobile/signature/api'
import type { IProjectOrg } from '~/interface/IProjectOrg'
import ProjectOrgSelector from '~/components/ProjectOrgSelector.vue'

interface IProps {
  data: EquipmentReturnEntity
  isDetail: boolean
}

const props = defineProps<IDialogPropsParam<null, IProps>>()

const loading = ref(false)

const visible = ref(true)

const initData = ref(EquipmentReturnEntity.fromJSON(props.param.data))

const ilisFormRef = ref<IlisFormExpose<EquipmentReturnEntity>>()

const showUplaod = ref(false)

const fileList = ref([] as any[])

const rootUrl = import.meta.env.VITE_ILIS_BASE

const deviceOption = ref<IOption[]>([])

const showPersonSelector = ref(false)

const showProjectOrgSelector = ref(false)

async function init() {
  // 获取设备状态字典
  const { data } = await getListByGroupId('402882cd5f998a58015f9998ff71001b')
  deviceOption.value = data.obj.map((item: any) => ({
    label: item.typename,
    value: item.typecode,
  }))
  if (props.param.data.id) {
    const { data } = await getEquipmentRentDetail(EquipmentRentEntity.fromJSON(props.param.data))
    initData.value = EquipmentReturnEntity.fromJSON(data)
    // 文件回显
    if (props.param.data.returnId && data.returnFiles?.length) {
      initData.value.attachmentIds = props.param.data?.returnFiles?.map((item: any) => item.id)?.join(',')
      fileList.value = data?.returnFiles?.map((item: any) => ({
        uid: item.attachmentId,
        name: item.name,
        url: item.url,
      }))
    }
  }
  if (!props.param.data?.returnId) {
    // 归还确认人默认当前登陆人
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    initData.value.confirmUserId = userInfo?.userId
    initData.value.confirmUserName = userInfo?.realName
    initData.value.returnTime = new Date()
  }
}
init()

async function handleUploadSuccess(files: any[]) {
  if (files.length === 0) {
    return
  }
  fileList.value = files.map(item => ({
    uid: item.id || item.uid,
    name: item.attachmenttitle || item.name,
    status: 'done',
    url: item.realpath || item.url,
  }))
  initData.value.attachmentIds = files.map(item => item.id).join(',')
}

function handleSelectPerson(data: IUserSelectVoEntity[]) {
  showPersonSelector.value = false
  initData.value.confirmUserId = data[0].id
  initData.value.confirmUserName = data[0].name
}

function handleSelectProjectOrg(data: IProjectOrg[]) {
  showProjectOrgSelector.value = false
  initData.value.returnOrgId = data[0].id
  initData.value.returnOrg = data[0].name
}

async function handleOk() {
  const formData = await ilisFormRef.value?.getFormData()
  const { data: userInfoRes } = await getCurrentUserInfo()
  const query = {
    ...formData,
    applyUserId: localStorage.getItem('userId'),
    departId: userInfoRes?.obj?.departid,
  }
  // 把参数缓存到服务器，二维码侧仅携带返回的key
  const keyId = await setServerCacheData(query)
  const { data: { haveProcess } } = await preCheckProcess(ProcessType.EQ_RENT)
  let signerImgData
  // 外借归还且配置了审批流程的情况下需要签字
  if ([EquipmentRentType.OUT_BORROW, EquipmentRentType.OUT_RENT].includes(props.param.data.rentType) && haveProcess) {
    changeSignStatus(props.param.data.id, 'RETURN', keyId)
    const { data: link } = await getQrcodeLink()
    const linkQuery = {
      keyId,
      id: props.param?.data.id,
      type: SignType.RETURN,
    }
    const { data } = await getEquipmentRentDetail(EquipmentRentEntity.fromJSON(props.param.data))

    if (!data.signerStatus || data.signerStatus === EquipmentRentSignStatus.RENT || data.signerStatus === EquipmentRentSignStatus.NO_RETURN) {
      const res = await AnyDialogHelper.showModel(IlisSignature, {
        value: `${link}&${new URLSearchParams(linkQuery)}`,
      }) as string
      if (!res) {
        return
      }
      signerImgData = res
    }
  }

  const unitCode = localStorage.getItem('unitCode') || ''
  loading.value = true
  await submitEquipmentReturn(unitCode, initData.value.id, keyId, signerImgData)
    .catch(async (err) => {
      const { data } = await getEquipmentRentDetailWithouAuth(unitCode, props.param?.data?.id)
      if ([EquipmentRentStatus.RETURNED].includes(data.applyStatus)) {
        props.onConfirm(null)
        visible.value = false
      }
      throw err
    })
    .finally(() => {
      loading.value = false
    })
  props.onConfirm(null)
  message.success('操作成功！')
  visible.value = false
}
</script>
