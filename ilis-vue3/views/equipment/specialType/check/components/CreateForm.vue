<template>
  <ht-modal
    v-model:open="open"
    :title="title"
    width="640px"
    :mask-closable="false"
    :confirm-loading="submitLoading"
    @cancel="cancel"
  >
    <a-form ref="formRef" :model="formState" class="pt-4" :label-col="{ style: 'width: 100px' }" :wrapper-col="{ style: 'flex: 1' }">
      <a-form-item label="设备编号" name="eqId" :rules="[{ required: true, message: '请选择设备！' }]">
        <a-input v-if="isDetail" v-model:value="formState.eqSn" disabled />
        <a-input-group v-else compact>
          <a-input v-model:value.trim="formState.eqSn" placeholder="请选择" readonly style="width: calc(100% - 60px)" />
          <a-button @click="setDeviceVisible(true)">
            选择
          </a-button>
        </a-input-group>
      </a-form-item>
      <a-form-item v-if="formState.eqId" label="设备名称">
        <a-input v-if="isDetail" v-model:value="formState.eqName" disabled />
        <a-input v-else v-model:value.trim="formState.eqName" readonly />
      </a-form-item>
      <a-form-item label="检查时间" name="checkTime" :rules="[{ required: true, message: '请选择检查时间！' }]">
        <a-date-picker v-model:value="formState.checkTime" placeholder="请选择时间" show-time :disabled="isDetail" :value-format="EDateFormatType.YYYY_MM_DD_HH_MM_SS" />
      </a-form-item>
      <a-form-item label="检查人员" name="checkUserId" :rules="[{ required: true, message: '请选择检查人员！' }]">
        <a-input v-if="isDetail" v-model:value="formState.checkUser" disabled />
        <a-input-group v-else compact>
          <a-input v-model:value.trim="formState.checkUser" placeholder="请选择" readonly style="width: calc(100% - 60px)" />
          <a-button @click="setPersonVisible(true)">
            选择
          </a-button>
        </a-input-group>
      </a-form-item>
      <a-form-item label="检查项目">
        <a-textarea v-model:value.trim="formState.checkItem" :rows="1" :disabled="isDetail" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="检查结果">
        <a-textarea v-model:value.trim="formState.checkResult" :rows="1" :disabled="isDetail" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="处理措施">
        <a-textarea v-model:value.trim="formState.measures" :rows="1" :disabled="isDetail" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="维护意见">
        <a-textarea v-model:value.trim="formState.maintenanceOpinion" :rows="1" :disabled="isDetail" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="维护记录">
        <a-textarea v-model:value.trim="formState.maintenanceRecord" :rows="1" :disabled="isDetail" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="备注" name="BZ">
        <a-textarea v-model:value.trim="formState.remark" :rows="1" :disabled="isDetail" placeholder="请输入" />
      </a-form-item>
      <IlisCustomPropertiesForm
        v-if="detailLoaded"
        ref="customizeFormRef"
        customize-type="special_equipment_check"
        :default-value="defaultCustomValues"
        :label-col="{ style: 'width: 100px' }"
        :disabled="isDetail"
      >
      </IlisCustomPropertiesForm>
      <a-form-item label="检查附件">
        <HtUploadFile
          v-if="detailLoaded"
          business-type="EQ"
          force-init
          :business-id="formState.id"
          :is-reandonly="isDetail"
          @get-qr-code-key="formState.attachmentQrKey = $event"
        >
          <template #footer="{ handleCancel: closeFn }">
            <a-space>
              <a-button
                type="primary"
                @click="closeFn"
              >
                确定
              </a-button>
              <a-button @click="closeFn">
                取消
              </a-button>
            </a-space>
          </template>
        </HtUploadFile>
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="cancel">
        {{ isDetail ? "关闭" : "取消" }}
      </a-button>
      <a-button v-if="!isDetail" type="primary" :loading="submitLoading" @click="onSubmit">
        确定
      </a-button>
    </template>

    <DeviceSelector v-model:show="deviceVisible" @confirm="selectEquipment" />

    <PersonSelector v-model:show="personVisible" @confirm="selectPerson" />
  </ht-modal>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import DeviceSelector from '~/components/DeviceSelector.vue'
import PersonSelector from '~/components/PersonSelector.vue'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import type { IDeviceEntity } from '~/interface/IDeviceEntity.ts'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity.ts'
import HtUploadFile from '~/components/htUploadFile/Index.vue'
import type { CheckType } from '~/views/equipment/specialType/check/interface/CreateEqCheck.ts'
import { CreateEqCheckEntity } from '~/views/equipment/specialType/check/interface/CreateEqCheck.ts'
import { createEqCheck, eqCheckDetail, updateEqCheck } from '~/views/equipment/specialType/check/api.ts'
import { IlisCustomPropertiesForm } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps.ts'

const props = defineProps<IDialogPropsParam<null, {
  id?: string
  isDetail?: boolean
  isEdit?: boolean
  checkType?: CheckType
}>>()

const customizeFormRef = ref()

const [deviceVisible, setDeviceVisible] = useStateHooks(false)

const [personVisible, setPersonVisible] = useStateHooks(false)

const formRef = ref()

const id = computed(() => props.param.id)

const isDetail = computed(() => !!props.param.isDetail)

const isEdit = computed(() => !!props.param.isEdit)

const open = ref(true)

const formState = ref(new CreateEqCheckEntity())

const submitLoading = ref(false)

const defaultCustomValues = ref([])

const detailLoaded = ref(false)

const title = computed(() => {
  if (isDetail.value) {
    return '查看详情'
  }

  if (isEdit.value) {
    return '编辑检查'
  }

  return '新增检查'
})

if (isDetail.value || isEdit.value) {
  getDetail()
}
else {
  formState.value.checkType = props.param.checkType
  detailLoaded.value = true
}

async function getDetail() {
  if (id.value) {
    const res = await eqCheckDetail(id.value)

    formState.value = res.data
    defaultCustomValues.value = res.data.customValues.map(i => ({
      columnId: i.customColumnId,
      columnName: i.customColumnName,
      columnValue: i.customColumnValue,
    }))
    detailLoaded.value = true
  }
}

function selectEquipment(rows: IDeviceEntity[]) {
  const [row] = rows

  formState.value.eqId = row.id
  formState.value.eqName = row.name
  formState.value.eqSn = row.equipmentSn

  formRef.value.validate('eqId')
  setDeviceVisible(false)
}

function selectPerson(rows: IUserSelectVoEntity[]) {
  const [row] = rows

  formState.value.checkUserId = row.id
  formState.value.checkUser = row.name

  formRef.value.validate('checkUserId')
  setPersonVisible(false)
}

// 关闭弹窗
function cancel() {
  open.value = false
}

function onSubmit() {
  formRef.value.validateFields().then(async () => {
    const customValues = await customizeFormRef.value.getFormData()
    const formData: CreateEqCheckEntity = {
      ...formState.value,
      customValues: customValues.map(i => ({
        customColumnId: i.columnId,
        customColumnName: i.columnName,
        customColumnValue: i.columnValue,
      })),
    }

    submitLoading.value = true
    if (isEdit.value) {
      await updateEqCheck(formData).finally(() => {
        submitLoading.value = false
      })
    }
    else {
      await createEqCheck(formData).finally(() => {
        submitLoading.value = false
      })
    }

    message.success('保存成功')
    props.onConfirm(null)
    cancel()
  })
}
</script>
