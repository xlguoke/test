<template>
  <HtModal
    v-model:open="visible"
    title="设备借用详情"
    width="70vw"
    :confirm-loading="loading"
    :after-close="onClosed"
  >
    <template #footer>
      <a-button @click="visible = false">
        关闭
      </a-button>
    </template>
    <IlisForm
      :key="initData.rentType"
      ref="ilisFormRef"
      :cols="2"
      :entity="EquipmentRentEntity"
      :init-data="initData"
      disabled
      :label-col="{
        style: { width: '120px' },
      }"
      :wrapper-col="{
        style: { paddingRight: '20px' },
      }"
      :field-list="EquipmentRentEntity.getFormFieldList()?.filter((i) => !['rentType', 'equipmentSn', 'equipmentName', 'eqStandard', 'outOrg', 'inOrg', 'outOrgContacts', 'inOrgContacts'].includes(i))"
    >
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
            disabled
          />
        </a-form-item>
        <!-- <a-form-item
          v-else
          name="equipmentSn"
          label="选择设备"
          :rules="AnyValidatorHelper.getValidateRules(EquipmentRentEntity)?.equipmentSn"
        >
          <div class="w-full flex gap-3">
            <a-input class="flex-1" :value="data.equipmentName" disabled readonly></a-input>
          </div>
          <div v-if="initData.equipmentId" class="flex items-center pt-2">
            <BaseText class="flex-1">
              设备编号：{{ initData.equipmentSn }}
            </BaseText>
            <BaseText class="flex-1">
              设备规格：{{ initData.eqStandard }}
            </BaseText>
          </div>
        </a-form-item> -->
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
          </div>
          <IlisInput
            v-else
            v-model="data.outOrg"
            disabled
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
          </div>
          <IlisInput
            v-else
            v-model="data.outOrgContacts"
            :entity="EquipmentRentEntity"
            disabled
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
          </div>
          <IlisInput
            v-else
            v-model="data.inOrg"
            disabled
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
          </div>
          <IlisInput
            v-else
            v-model="data.inOrgContacts"
            :entity="EquipmentRentEntity"
            disabled
            field="inOrgContacts"
          />
        </a-form-item>
      </template>
      <template #form-after>
        <a-form-item
          label="附件材料"
        >
          <div v-for="(item, index) in fileList" :key="index">
            <a :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.uid}`">{{ item.name }}</a>
          </div>
        </a-form-item>
        <a-form-item
          v-if="initData.rentSignerFile?.url"
          label="签名图片"
        >
          <a-image
            :width="200"
            :src="initData.rentSignerFile?.url"
          />
        </a-form-item>
      </template>
    </IlisForm>
  </HtModal>
</template>

<script lang="ts" setup>
import { EquipmentRentEntity, EquipmentRentType } from '../EquipmentRentEntity'
import { getEquipmentRentDetail } from '../api'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisForm, IlisInput } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { AnyValidatorHelper } from '~/anyThing/helper/AnyValidatorHelper'

const props = defineProps<IDialogPropsParam<null, EquipmentRentEntity>>()

const loading = ref(false)

const visible = ref(true)

const initData = ref(props.param)

const ilisFormRef = ref<IlisFormExpose<EquipmentRentEntity>>()

const fileList = ref([] as any[])

const rootUrl = import.meta.env.VITE_ILIS_BASE

async function init() {
  if (props.param.id) {
    const { data } = await getEquipmentRentDetail(props.param)
    initData.value = EquipmentRentEntity.fromJSON(data)
    fileList.value = data.files.map((item: any) => ({
      uid: item.attachmentId,
      name: item.name,
      url: item.url,
    }))
  }
}
init()
</script>
