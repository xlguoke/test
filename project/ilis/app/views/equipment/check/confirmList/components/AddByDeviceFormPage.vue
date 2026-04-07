<template>
  <AppProvider>
    <div class=" w-full h-full flex gap-3">
      <div v-if="showPreView" class="w-[50%] h-full relative">
        <a-button v-if="!analysisData" class=" absolute right-0 top-0" @click="showPreView = false">
          关闭预览
        </a-button>
        <iframe
          frameborder="0"
          class="w-full h-full rounded-md overflow-hidden"
          :src="`/ilis2/plug-in/pdfjs/web/viewer.html?file=${encodeURIComponent(`${basePathFun()}/reportController.do?displayPDF&attachmentId=${currentFile?.attachmentId}`)}`"
        ></iframe>
      </div>
      <div class="flex-1 h-full overflow-y-auto pb-3">
        <a-alert v-if="analysisData" message="解析结果仅作预览，最终以系统匹配数据为准" banner type="warning" class="mb-3" />
        <BaseTitle>设备信息</BaseTitle>
        <DeviceInfo
          v-model="equipmentId"
          v-model:device-info="deviceInfo"
        />
        <BaseTitle>证书信息</BaseTitle>
        <IlisForm
          ref="certFormRef"
          :cols="2"
          :disabled="isReadonly"
          :init-data="certInitData"
          :entity="EquipmentCheckConfirmEntity"
        >
          <template #checkPeriod="{ data: formState }">
            <a-flex gap="middle">
              <a-input-number v-model:value="formState.checkPeriod" :min="1" class="flex-1" @change="onCalcValidityDate((formState as EquipmentCheckConfirmEntity))" />
              <a-select v-model:value="formState.checkPeriodUnit" style="width: 100px;" @change="onCalcValidityDate((formState as EquipmentCheckConfirmEntity))">
                <a-select-option value="年">
                  年
                </a-select-option>
                <a-select-option value="月">
                  月
                </a-select-option>
                <a-select-option value="日">
                  日
                </a-select-option>
              </a-select>
            </a-flex>
          </template>
          <template #checkTime="{ data: formState }">
            <a-date-picker v-model:value="formState.checkTime" :value-format="EDateFormatType.YYYY_MM_DD" class="w-full" @change="onCalcValidityDate((formState as EquipmentCheckConfirmEntity))"></a-date-picker>
          </template>
          <template #validityDate="{ data: formState }">
            <a-date-picker v-model:value="formState.validityDate" :value-format="EDateFormatType.YYYY_MM_DD" class="w-full"></a-date-picker>
          </template>
          <template #certFile>
            <HtUploadFile
              v-if="!props.id || certInitData.id"
              :is-reandonly="isReadonly"
              :business-id="certInitData.id"
              :business-type="BUSINES_TYPE.EQ_CHECK_FILE"
              force-init
              :accept="['doc', 'xls', 'docx', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png']"
              @get-qr-code-key="fileData.checkFile = $event"
            />
          </template>
          <template #otherFile>
            <HtUploadFile
              v-if="!props.id || certInitData.id"
              :is-reandonly="isReadonly"
              :business-id="certInitData.id"
              :business-type="BUSINES_TYPE.EQ_CHECK_OTHER_FILE"
              force-init
              :accept="['doc', 'xls', 'docx', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png']"
              @get-qr-code-key="fileData.otherFile = $event"
            />
          </template>
        </IlisForm>
        <!-- 证书确认内容 -->
        <div v-if="!analysisData">
          <BaseTitle>证书确认内容</BaseTitle>
          <div v-if="confirmItem.confirmCon?.length">
            <div v-for="(item) in confirmItem.confirmCon" :key="item.id" class="flex justify-between items-center mb-3">
              <div>{{ item.typeName }}</div>
              <a-radio-group
                v-model:value="item.value"
                :options="radioOption"
                :disabled="isReadonly"
              ></a-radio-group>
            </div>
          </div>
        </div>
        <BaseTitle>证书结果确认</BaseTitle>
        <a-alert v-if="isOcrConfirm" message="标红内容为：检校项目/参数为证书中有，但当前设备检校项目/参数中未维护的检校项目/参数" banner type="warning" class="mb-3" />
        <CertResultInfo v-model="certResultInfo" :device-info="deviceInfo" :is-ocr-confirm="isOcrConfirm" />
        <div class="mb-3">
          <a-form-item label="其他附件">
            <HtUploadFile
              v-if="!props.id || certInitData.id"
              :is-reandonly="isReadonly"
              :business-id="certInitData.id"
              :business-type="BUSINES_TYPE.EQ_CHECK_VERDICT_OTHER_FILE"
              force-init
              :accept="['doc', 'xls', 'docx', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png']"
              @get-qr-code-key="fileData.verdictFile = $event"
            />
          </a-form-item>
        </div>
        <!-- 确认结论 -->
        <div v-if="!analysisData">
          <BaseTitle>确认结论</BaseTitle>
          <div v-if="confirmItem.resultConfirm?.length">
            <div v-for="(item) in confirmItem.resultConfirm" :key="item.id" class="flex justify-between items-center mb-3">
              <div>{{ item.typeName }}</div>
              <a-radio-group
                v-model:value="item.value"
                :options="radioOption"
                :disabled="isReadonly"
              ></a-radio-group>
            </div>
          </div>
          <ConclusionInfo v-model:conclusion-info="conclusionInfo" />
        </div>
      </div>
    </div>
  </APPProvider>
</template>

<script setup lang="ts">
import type { Attachment } from '~/components/attachmentList'
import type { IlisFormExpose } from '~/components/ilisComponent'
import type { IAnalysisData } from '~/interface/IAnalysisData'
import type { IOption } from '~/interface/IOption'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getDictByCode } from '~/api/common'
import AppProvider from '~/components/AppProvider.vue'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import { BaseTitle } from '~/components/UI'
import { DeviceEntity } from '~/views/equipment/DeviceEntity'
import { getEquipmentCheckConfirmDetail, getEquipmentCheckConfirmItem } from '../api'
import { CertConfirmEntity } from '../CertConfirmEntity'
import { EquipmentCheckConfirmEntity } from '../EquipmentCheckConfirmEntity'
import CertResultInfo from './CertResultInfo.vue'
import ConclusionInfo from './ConclusionInfo.vue'
import DeviceInfo from './DeviceInfo.vue'

interface IProps {
  /** # 系统控制参数 检校确认仅支持从已通过审批的计划中引用设备 */
  equipment10?: boolean
  /** # 检校确认数据id（编辑详情传入） */
  id?: string
  /** # 是否只读 */
  isReadonly?: boolean
  isOcrConfirm?: boolean
}

interface IComfirmItem {
  confirmCon: Record<string, any>
  resultConfirm: Record<string, any>
}

const props = defineProps<IProps>()
const fileData = ref({
  checkFile: undefined, // 设备检校附件（证书）
  otherFile: undefined, // 设备检校其他附件
  verdictFile: undefined, // 其他附件
})
provide('EQUIPMENT_10', props?.equipment10)

provide('isReadonly', props?.isReadonly)

provide('id', props?.id)

const analysisData = inject('analysisData') as IAnalysisData

const radioOption: IOption[] = [
  { label: '是', value: '1' },
  { label: '否', value: '0' },
]

const showPreView = ref(!!analysisData)

/** # 选中设备的id */
const equipmentId = ref('')

/** # 选中设备的信息（仅展示） */
const deviceInfo = ref(DeviceEntity.fromJSON(analysisData?.deviceInfo || {}))

/** # 证书信息表单ref */
const certFormRef = ref<IlisFormExpose<EquipmentCheckConfirmEntity>>()

/** # 证书信息表单初始化数据 */
const certInitData = ref(EquipmentCheckConfirmEntity.fromJSON(analysisData?.certInfo || {
  checkPeriodUnit: '年',
}))

/** # 证书结果确认（表格） */
const certResultInfo = ref<CertConfirmEntity[]>(CertConfirmEntity.fromJsonArray(analysisData?.certConfirmInfo || []))

/** # 证书确认内容/确认结论（依赖字典渲染的单选项） */
const confirmItem = ref<IComfirmItem>({
  confirmCon: [],
  resultConfirm: [],
})

/** # 确认结论-文本内容 */
const conclusionInfo = ref('')

const currentFile = ref<Attachment>({
  attachmentId: analysisData?.attachmentId,
} as Attachment)

watchEffect(() => {
  if (props.id) {
    return
  }
  const accordingTo = certInitData.value.gist
  const standard = certResultInfo.value.map(i => i.testSpecifications)?.filter(i => i)?.join(',')
  if (accordingTo) {
    conclusionInfo.value = `根据${accordingTo}及该设备对应开展的检测项目${standard ? `及检测规范${standard}` : ''}，该设备满足试验检测工作要求。`
  }
})

// 根据检校周期和前次检校日期计算
function onCalcValidityDate(formState: EquipmentCheckConfirmEntity) {
  const { checkPeriod, checkPeriodUnit, checkTime } = formState

  if (checkPeriod && checkPeriodUnit && checkTime) {
    const time = new Date(checkTime)
    let nextTime

    if (checkPeriodUnit === '年') {
      nextTime = time.setFullYear((time.getFullYear() + Number(checkPeriod)), time.getMonth(), time.getDate() - 1)
    }
    else if (checkPeriodUnit === '月') {
      time.setMonth((time.getMonth() + Number(checkPeriod)))
      nextTime = time.setDate(time.getDate() - 1)
    }
    else {
      nextTime = time.setDate((time.getDate() + Number(checkPeriod)))
    }

    formState.validityDate = dayjs(new Date(nextTime)).format(EDateFormatType.YYYY_MM_DD)
    certFormRef.value.validateFields(['validityDate'])
  }
}

async function getCertDetail(id: string) {
  const { data: { obj } } = await getEquipmentCheckConfirmDetail(id)
  equipmentId.value = obj.equipment.id
  obj.equipment.departName = obj.eqDepartName
  deviceInfo.value = DeviceEntity.fromJSON(obj.equipment)
  certInitData.value = EquipmentCheckConfirmEntity.fromJSON(obj.check);
  ['checkTime', 'validityDate'].forEach((key: string) => {
    if (certInitData.value[key]) {
      certInitData.value[key] = dayjs(certInitData.value[key]).format(EDateFormatType.YYYY_MM_DD)
    }
  })
  conclusionInfo.value = obj?.check?.confirmResult
  // 字典数据回显
  const confirmItemSource = JSON.parse(obj.check.confirmItem || '')
  const confirmConEntries = Object.entries(confirmItemSource.confirmCon || {})
  const resultConfirmEntries = Object.entries(confirmItemSource.resultConfirm || {})
  confirmConEntries.forEach(([key, value]) => {
    const item = confirmItem.value.confirmCon?.find((i: any) => i.key === key)

    if (item) {
      item.value = value
    }
  })
  resultConfirmEntries.forEach(([key, value]) => {
    const item = confirmItem.value.resultConfirm?.find((i: any) => i.key === key)
    if (item) {
      item.value = value
    }
  })
}

async function getCertResultDetail(id: string) {
  const { data: { obj } } = await getEquipmentCheckConfirmItem(id)
  certResultInfo.value = CertConfirmEntity.fromJsonArray(obj)
}

/** # 获取证书确认内容字典 */
async function getCertConfirmItem() {
  const { data } = await getDictByCode('EQ_CHECK_CERT_CONFIRM_CONTENT')
  confirmItem.value.confirmCon = data.map((i, index) => {
    return {
      ...i,
      key: `confirmCon${index + 1}`,
    }
  })
}
/** # 获取证书结果确认字典 */
async function getCertResultItem() {
  const { data } = await getDictByCode('EQ_CHECK_CONFIRM_OPTIONS')
  confirmItem.value.resultConfirm = data.map((i, index) => {
    return {
      ...i,
      key: `resultConfirm${index + 1}`,
    }
  })
}

function basePathFun() {
  // 获得根目录
  const strFullPath = window.document.location.href
  const strPath = window.document.location.pathname
  const pos = strFullPath.indexOf(strPath)
  const prePath = strFullPath.substring(0, pos)
  const postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1)
  const basePath = prePath + postPath
  return basePath
}

async function init() {
  await Promise.all([
    getCertConfirmItem(),
    getCertResultItem(),
  ])
  if (props?.id) {
    getCertDetail(props?.id)
    getCertResultDetail(props?.id)
  }
}

/**
 * # 向外暴露的获取数据方法
 */
async function getData() {
  if (!equipmentId.value) {
    message.warning('请选择设备')
    return false
  }
  const certFormData = await certFormRef.value?.getFormData()

  // 确认项和旧版本数据结构保持一致，避免兼容问题
  const transformConfirmItem = {
    confirmCon: Object.fromEntries(confirmItem.value.confirmCon.map((i: any) => [i.key, i.value])),
    resultConfirm: Object.fromEntries(confirmItem.value.resultConfirm.map((i: any) => [i.key, i.value])),
  }

  return {
    id: props?.id,
    ...certFormData,
    equipmentId: equipmentId.value,
    checkedItemStr: JSON.stringify(certResultInfo.value),
    confirmItem: JSON.stringify(transformConfirmItem), // 以前的确认项
    confirmResult: conclusionInfo.value,
    ...fileData.value,
  }
}
init()
defineExpose({
  getData,
})
</script>
