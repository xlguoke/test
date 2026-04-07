<template>
  <HtModal
    v-model:open="visible"
    :title="param.id ? '编辑设备借用' : '新增设备借用'"
    width="520px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <IlisForm
      :key="initData.rentType"
      ref="ilisFormRef"
      :cols="1"
      :entity="EquipmentRentEntity"
      :init-data="initData"
      :label-col="{
        style: { width: '120px' },
      }"
      :field-list="EquipmentRentEntity.getFormFieldList()?.filter((i) => !['rentType', 'equipmentSn', 'equipmentName', 'eqStandard', 'outOrg', 'inOrg', 'outOrgContacts', 'inOrgContacts'].includes(i))"
    >
      <!-- 自定义实体中属性 -->
      <template #equipmentPrice="{ data }">
        <div class="flex">
          <IlisInput
            v-model="data.equipmentPrice"
            field="equipmentPrice"
            :entity="EquipmentRentEntity"
            @change="handlePriceChange"
          >
          </IlisInput>
          <img :src="rmbImg" class=" w-8 h-8" />
        </div>
      </template>
      <template #form-before="{ data }">
        <a-form-item
          :label="EquipmentRentEntity.getFormFieldLabel('rentType')"
          name="rentType"
          :rules="AnyValidatorHelper.getValidateRules(EquipmentRentEntity)?.rentType"
        >
          <IlisInput
            v-model="data.rentType"
            :entity="EquipmentRentEntity"
            :options="EquipmentRentEntity.getOptions('rentType')"
            field="rentType"
            :disabled="!!param.id"
          />
        </a-form-item>
        <!-- 设备信息 -->
        <div v-if="[EquipmentRentType.OUT_BORROW].includes(data.rentType)">
          <a-form-item
            v-for=" key in ['equipmentSn', 'equipmentName', 'eqStandard']"
            :key="key"
            :name="key"
            :label="EquipmentRentEntity.getFormFieldLabel(key)"
            :rules="AnyValidatorHelper.getValidateRules(EquipmentRentEntity)?.[key]"
          >
            <IlisInput
              v-model="data[key]"
              :entity="EquipmentRentEntity"
              :field="key"
            />
          </a-form-item>
        </div>
        <a-form-item
          v-else
          name="equipmentSn"
          label="选择设备"
          :rules="AnyValidatorHelper.getValidateRules(EquipmentRentEntity)?.equipmentSn"
        >
          <div class="w-full flex gap-3">
            <a-input
              class="flex-1"
              :value="data.equipmentName"
              disabled
              readonly
            ></a-input>
            <a-button @click="showDeviceSelector = true">
              选择
            </a-button>
          </div>
          <div v-if="initData.equipmentId" class="flex items-center pt-2">
            <BaseText class="flex-1">
              设备编号：{{ initData.equipmentSn }}
            </BaseText>
            <BaseText class="flex-1">
              设备规格：{{ initData.eqStandard }}
            </BaseText>
          </div>
        </a-form-item>
        <!-- 借出部门 -->
        <a-form-item
          name="outOrg"
          :label="EquipmentRentEntity.getFormFieldLabel('outOrg')"
          :rules="AnyValidatorHelper.getValidateRules(EquipmentRentEntity)?.outOrg"
        >
          <div
            v-if="[EquipmentRentType.OUT_RENT, EquipmentRentType.INNER_BORROW].includes(data.rentType)"
            class="w-full flex gap-3"
          >
            <a-input
              class="flex-1"
              :value="data.outOrg"
              disabled
              readonly
            ></a-input>
            <a-button @click="currentOrgEvent = 'out' ; showOrgSelector = true">
              选择
            </a-button>
          </div>
          <IlisInput
            v-else
            v-model="data.outOrg"
            :entity="EquipmentRentEntity"
            field="outOrg"
          />
        </a-form-item>
        <!-- 借出联系人 -->
        <a-form-item
          name="outOrgContacts"
          :label="EquipmentRentEntity.getFormFieldLabel('outOrgContacts')"
          :rules="AnyValidatorHelper.getValidateRules(EquipmentRentEntity)?.outOrgContacts"
        >
          <div
            v-if="[EquipmentRentType.OUT_RENT, EquipmentRentType.INNER_BORROW].includes(data.rentType)"
            class="w-full flex gap-3"
          >
            <a-input
              class="flex-1"
              :value="data.outOrgContacts"
              disabled
              readonly
            ></a-input>
            <a-button @click="currentPersonEvent = 'out' ; showPersonSelector = true">
              选择
            </a-button>
          </div>
          <IlisInput
            v-else
            v-model="data.outOrgContacts"
            :entity="EquipmentRentEntity"
            field="outOrgContacts"
          />
        </a-form-item>
        <!-- 借入部门 -->
        <a-form-item
          name="inOrg"
          :label="EquipmentRentEntity.getFormFieldLabel('inOrg')"
          :rules="AnyValidatorHelper.getValidateRules(EquipmentRentEntity)?.inOrg"
        >
          <div
            v-if="[EquipmentRentType.OUT_BORROW, EquipmentRentType.INNER_BORROW].includes(data.rentType)"
            class="w-full flex gap-3"
          >
            <a-input
              class="flex-1"
              :value="data.inOrg"
              disabled
              readonly
            ></a-input>
            <a-button @click="currentOrgEvent = 'in' ; showOrgSelector = true">
              选择
            </a-button>
          </div>
          <IlisInput
            v-else
            v-model="data.inOrg"
            :entity="EquipmentRentEntity"
            field="inOrg"
          />
        </a-form-item>
        <!-- 借入联系人 -->
        <a-form-item
          name="inOrgContacts"
          :label="EquipmentRentEntity.getFormFieldLabel('inOrgContacts')"
          :rules="AnyValidatorHelper.getValidateRules(EquipmentRentEntity)?.inOrgContacts"
        >
          <div
            v-if="[EquipmentRentType.OUT_BORROW, EquipmentRentType.INNER_BORROW].includes(data.rentType)"
            class="w-full flex gap-3"
          >
            <a-input
              class="flex-1"
              :value="data.inOrgContacts"
              disabled
              readonly
            ></a-input>
            <a-button @click="currentPersonEvent = 'in' ; showPersonSelector = true">
              选择
            </a-button>
          </div>
          <IlisInput
            v-else
            v-model="data.inOrgContacts"
            :entity="EquipmentRentEntity"
            field="inOrgContacts"
          />
        </a-form-item>
      </template>
      <template #form-after>
        <a-form-item
          label="附件材料"
        >
          <a-button @click="showUplaod = true">
            上传文件
          </a-button>
          <div v-for="(item, index) in fileList" :key="index">
            <a :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.uid}`">{{ item.name }}</a>
          </div>
        </a-form-item>
      </template>
    </IlisForm>
    <!-- 设备选择器 -->
    <DeviceSelector
      v-model:show="showDeviceSelector"
      :payload="{
      }"
      @confirm="handleSelectDevice($event)"
    />
    <!-- 部门选择器 -->
    <OrgSelector
      v-model:show="showOrgSelector"
      @confirm="handleOrg($event)"
    />
    <!-- 人员选择器 -->
    <PersonSelector
      v-model:show="showPersonSelector"
      @confirm="handlePerson($event)"
    />
    <!-- 附件上传 -->
    <IlisUpload
      v-model:show="showUplaod"
      :file-list="fileList"
      :max="1"
      @success="handleUploadSuccess"
    ></IlisUpload>
  </HtModal>
</template>

<script lang="ts" setup>
import type { DeviceEntity } from '../../DeviceEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IlisFormExpose } from '~/components/ilisComponent'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { message } from 'ant-design-vue'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { AnyValidatorHelper } from '~/anyThing/helper/AnyValidatorHelper'
import { BaseText } from '~/components/UI'
import { addEquipmentRent, getEquipmentRentDetail } from '../api'
import { EquipmentRentEntity, EquipmentRentType } from '../EquipmentRentEntity'

const props = defineProps<IDialogPropsParam<null, EquipmentRentEntity>>()

const loading = ref(false)

const visible = ref(true)

const initData = ref(props.param)

const ilisFormRef = ref<IlisFormExpose<EquipmentRentEntity>>()

const showDeviceSelector = ref(false)

const showOrgSelector = ref(false)

const showPersonSelector = ref(false)

const showUplaod = ref(false)

const currentOrgEvent = ref<'in' | 'out'>('in')

const currentPersonEvent = ref<'in' | 'out'>('in')

const fileList = ref([] as any[])

const rootUrl = import.meta.env.VITE_ILIS_BASE

const rmbImg = new URL('~/assets/img/rmb.png', import.meta.url).href

const equipmentPrice = ref('')
function handlePriceChange(e: any) {
  let value = e?.target?.value ?? e
  if (value === undefined || value === null) {
    value = ''
  }
  else {
    value = value.toString()
  }
  // 更新值
  equipmentPrice.value = value
}
async function init() {
  if (props.param.id) {
    const { data } = await getEquipmentRentDetail(props.param)
    initData.value = EquipmentRentEntity.fromJSON(data)
    initData.value.attachmentIds = data.files.map((item: any) => item.attachmentId)?.join(',')
    fileList.value = data.files.map((item: any) => ({
      uid: item.attachmentId,
      name: item.name,
      url: item.url,
    }))
  }
}
init()
function handleOrg(e: IDepartmentEntity[]) {
  if (currentOrgEvent.value === 'in') {
    handleSelectOrgIn(e)
  }
  else {
    handleSelectOrgOut(e)
  }
}

function handlePerson(e: IUserSelectVoEntity[]) {
  if (currentPersonEvent.value === 'in') {
    handleSelectPersonIn(e)
  }
  else {
    handleSelectPersonOut(e)
  }
}

function handleSelectDevice(data: DeviceEntity[]) {
  showDeviceSelector.value = false
  const device = data[0]
  initData.value.equipmentId = device.id
  initData.value.equipmentName = device.name
  initData.value.equipmentSn = device.equipmentSn
  initData.value.eqStandard = device.standard
  initData.value.outOrg = device.departName
  initData.value.outOrgId = device.departId

  // 设备状态字典里存的是设备状态名称，设备借用里存的是设备状态值
  const options = EquipmentRentEntity.getOptions('rentEqStatus')
  const rentState = options?.find (item => item.label === device.status)?.value
  initData.value.rentEqStatus = rentState as string
}

function handleSelectOrgOut(data: IDepartmentEntity[]) {
  showOrgSelector.value = false
  initData.value.outOrg = data[0].text
  initData.value.outOrgId = data[0].id
}

function handleSelectOrgIn(data: IDepartmentEntity[]) {
  showOrgSelector.value = false
  initData.value.inOrg = data[0].text
  initData.value.inOrgId = data[0].id
}

function handleSelectPersonOut(data: IUserSelectVoEntity[]) {
  showPersonSelector.value = false
  initData.value.outOrgContactsId = data[0].id
  initData.value.outOrgContacts = data[0].name
}

function handleSelectPersonIn(data: IUserSelectVoEntity[]) {
  showPersonSelector.value = false
  initData.value.inOrgContactsId = data[0].id
  initData.value.inOrgContacts = data[0].name
}

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

async function handleOk() {
  const formData = await ilisFormRef.value?.getFormData()
  // formData.equipmentPrice = equipmentPrice.value
  const parts = equipmentPrice.value.split('.')
  if (!(parts.length === 1 || (parts.length === 2 && parts[1].length <= 2))) {
    message.error('请输入正确的金额！')
    return
  }
  loading.value = true
  await addEquipmentRent(formData!).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}
</script>
