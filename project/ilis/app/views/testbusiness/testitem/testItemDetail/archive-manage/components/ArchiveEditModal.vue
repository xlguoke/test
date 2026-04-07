<!-- 资料归档编辑弹窗 - 与 JSP 页面功能完全一致 -->
<template>
  <HtModal
    v-model:open="visible"
    :title="modalTitle"
    width="90%"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <div class="p-[16px]">
      <!-- 顶部归档资料选择区域 -->
      <div class="p-[12px] bg-[#f5f5f5] border-b border-[var(--colorBorder)] mb-[16px]">
        <a-checkbox-group v-model:value="selectedMaterialIds" class="flex flex-wrap gap-[16px]">
          <a-checkbox
            v-for="material in archiveMaterialList"
            :key="material.id"
            :value="material.id"
            :disabled="isDetailMode"
          >
            {{ material.name }}
          </a-checkbox>
        </a-checkbox-group>
      </div>

      <!-- 表单区域 - 使用 IlisForm 渲染 -->
      <IlisForm
        ref="formRef"
        :entity="ArchiveEditEntity"
        :init-data="formData"
        :cols="1"
        :disabled="isDetailMode"
        :field-list="
          formData.saveType === EArchiveSaveType.UNIFIED
            ? ArchiveEditEntity.getFormFieldList()
            : ArchiveEditEntity.getFormFieldList()?.filter(item => !['archiveSn', 'archiveSiteName'].includes(item))"
      >
        <!-- 归档地址选择插槽 -->
        <template #archiveSiteName="{ data }">
          <div class="flex items-center gap-[8px]">
            <span class="min-w-[150px] text-[var(--colorTextSecondary)]">{{ data?.archiveSiteName || '' }}</span>
            <a-button v-if="!isDetailMode" type="primary" size="small" @click="handleSelectSite">
              选择
            </a-button>
          </div>
        </template>
      </IlisForm>
    </div>

    <!-- 统一存放资料列表 -->
    <div v-show="formData.saveType === EArchiveSaveType.UNIFIED" class="border border-[var(--colorBorder)] rounded-[4px] mx-[16px] mb-[16px]">
      <div class="p-[12px] bg-[#fafafa] font-medium border-b border-[var(--colorBorder)]">
        归档资料
      </div>
      <div
        v-for="(item, index) in unifiedMaterialList"
        :key="item.key"
        class="p-[12px] border-b border-[var(--colorBorder)] last:border-b-0 flex items-center justify-between"
      >
        <div class="flex-1">
          <template v-if="item.isCustom">
            <a-input
              v-model:value="item.typeName"
              placeholder="请输入资料名称"
              :disabled="isDetailMode"
              class="!w-[200px]"
            />
          </template>
          <template v-else>
            <span class="font-medium">{{ item.typeName }}</span>
          </template>
          <span v-if="item.total > 0" class="text-[#999] ml-[8px]">(共{{ item.total }}份)</span>
          <div class="text-[var(--colorTextSecondary)] text-[12px] mt-[4px]">
            {{ item.codes }}
          </div>
        </div>
        <a-button
          v-if="item.isCustom && !isDetailMode"
          type="link"
          danger
          @click="removeUnifiedMaterial(index)"
        >
          <DeleteOutlined />
        </a-button>
      </div>
      <a-button
        v-if="!isDetailMode"
        type="dashed"
        class="!m-[12px] !w-[calc(100%-24px)]"
        @click="addUnifiedMaterial"
      >
        <PlusOutlined /> 添加
      </a-button>
    </div>

    <!-- 分开存放区域 -->
    <div v-show="formData.saveType === EArchiveSaveType.SEPARATE" class="mx-[16px] mb-[16px]">
      <div class="border border-[var(--colorBorder)] rounded-[4px]">
        <div class="p-[12px] bg-[#fafafa] font-medium border-b border-[var(--colorBorder)] grid grid-cols-[2fr_1fr_2fr_80px] gap-[12px]">
          <span>归档资料</span>
          <span>档案编号</span>
          <span>归档地址</span>
        </div>
        <div
          v-for="(item, index) in separateMaterialList"
          :key="item.key"
          class="p-[12px] border-b border-[var(--colorBorder)] last:border-b-0 grid grid-cols-[2fr_1fr_2fr_80px] gap-[12px] items-center"
        >
          <div>
            <template v-if="item.isCustom">
              <a-input
                v-model:value="item.typeName"
                class="w-full"
                placeholder="请输入资料名称"
                :disabled="isDetailMode"
                :maxlength="AppConfig.MAX_LENGTH_INPUT"
              />
            </template>
            <template v-else>
              <span class="font-medium">{{ item.typeName }}</span>
            </template>
            <span v-if="item.total > 0" class="text-[#999] ml-[8px]">(共{{ item.total }}份)</span>
            <div class="text-[var(--colorTextSecondary)] text-[12px] mt-[4px]">
              {{ item.codes }}
            </div>
          </div>
          <div>
            <a-input
              v-model:value="item.archiveSn"
              placeholder="请输入"
              :disabled="isDetailMode"
              :maxlength="AppConfig.MAX_LENGTH_INPUT"
            />
          </div>
          <div class="flex items-center gap-[8px]">
            <span class="text-[var(--colorTextSecondary)]">{{ item.archiveSite || '' }}</span>
            <a-button v-if="!isDetailMode" type="primary" size="small" @click="handleSelectSiteForSeparate(index)">
              选择
            </a-button>
          </div>
          <div>
            <a-button
              v-if="item.isCustom && !isDetailMode"
              type="link"
              danger
              @click="removeSeparateMaterial(index)"
            >
              <DeleteOutlined />
            </a-button>
          </div>
        </div>
        <a-button
          v-if="!isDetailMode"
          type="dashed"
          class="!m-[12px] !w-[calc(100%-24px)]"
          @click="addSeparateMaterial"
        >
          <PlusOutlined /> 添加
        </a-button>
      </div>
    </div>
  </HtModal>
</template>

<script setup lang="ts">
import type { ArchiveMaterialEntity } from '../entity/ArchiveMaterialEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { BatchSubmit } from '~/api/report/archive/type'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { AppConfig } from '~/anyThing/AppConfig'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { batchSubmit } from '~/api/report/archive'
import { ProcessType } from '~/components/commonProcess'
import ProcessModal from '~/components/commonProcess/ProcessModal.vue'
import {
  batchSaveArchive,
  delArchiveById,
  getArchiveMaterialAll,
  getArchiveMaterialRelation,
  getReportArchiveDetail,
  getWaitForArchiveList,
  saveArchiveMaterialRelation,
} from '../api'
import { ArchiveDepositEntity } from '../entity/ArchiveDepositEntity'
import { ArchiveEditEntity } from '../entity/ArchiveEditEntity'
import { EArchiveSaveType } from '../entity/EArchiveSaveType'
import ArchiveSiteModal from './ArchiveSiteModal.vue'

/**
 * # 弹窗参数接口 ⚙️
 */
interface IArchiveEditParam {
  /** 报告ID列表，批量归档时使用 */
  reportIds?: string
  /** 单个编辑时的报告ID */
  editId?: string
  /** 是否编辑模式 */
  isEdit?: boolean
  /** 是否详情模式 */
  isDetail?: boolean
}

/**
 * # 系统预定义归档数据类型 📝
 */
interface ISystemArchiveData {
  /** 类型: 1=检测报告, 2=委托单, 3=原始记录单, 4=任务分配单, 0=自定义 */
  type: string
  /** 类型名称 */
  typeName: string
  /** 关联编号集合 */
  codes: string
  /** 总数 */
  total: number
  /** 档案编号 */
  archiveSn?: string
  /** 归档地址ID */
  archiveSiteId?: string
  /** 归档地址名称 */
  archiveSite?: string
  /** 是否自定义 */
  isCustom: boolean
  /** 唯一标识 */
  key: string
  /** 关联对象ID */
  relatedObjectId?: string
  /** 关联对象编号 */
  relatedObjectSn?: string
}

/**
 * # 组件名称 ⚙️
 */
defineOptions({
  name: 'ArchiveEditModal',
})

const props = defineProps<IDialogPropsParam<null, IArchiveEditParam>>()

/** # 弹窗可见性 📝 */
const visible = ref(true)

/** # 加载状态 📝 */
const loading = ref(false)

/** # 表单引用 📝 */
const formRef = ref<any>()

/** # 当前用户信息 📝 */
const currentUser = ref({
  id: '',
  realName: '',
})

/** # 归档资料列表（顶部选择区域）📝 */
const archiveMaterialList = ref<ArchiveMaterialEntity[]>([])

/** # 选中的归档资料ID列表 📝 */
const selectedMaterialIds = ref<string[]>([])

/** # 报告ID列表 📝 */
const reportIdsList = ref<string[]>([])

/** # 表单数据 📝 */
const formData = ref<ArchiveEditEntity>(new ArchiveEditEntity())

/** # 统一存放资料列表 📝 */
const unifiedMaterialList = ref<ISystemArchiveData[]>([])

/** # 分开存放资料列表 📝 */
const separateMaterialList = ref<ISystemArchiveData[]>([])

/** # 保存参数（用于编辑时记录原始数据）📝 */
const saveParamList = ref<ArchiveDepositEntity[]>([])

/** # 添加计数器（用于生成唯一key）📝 */
const addNumber = ref(0)

/**
 * # 计算弹窗标题 📝
 */
const modalTitle = computed(() => {
  if (props.param?.isDetail) {
    return '查看资料归档详情'
  }
  if (props.param?.isEdit) {
    return '重新编辑归档'
  }
  if (reportIdsList.value.length > 1) {
    return '批量编辑归档'
  }
  return '资料归档'
})

/**
 * # 是否详情模式 📝
 */
const isDetailMode = computed(() => props.param?.isDetail === true)

/**
 * # 初始化 🚀
 */
onMounted(async () => {
  // 获取当前用户信息
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    const user = JSON.parse(userInfo)
    currentUser.value = {
      id: user.userId || '',
      realName: user.realName || '',
    }
    formData.value.archivePersonName = user.realName || ''
    formData.value.archiveDate = dayjs().format('YYYY-MM-DD')
    formData.value.saveType = EArchiveSaveType.UNIFIED
  }

  // 初始化报告ID列表
  if (props.param?.editId) {
    reportIdsList.value = [props.param.editId]
  }
  else if (props.param?.reportIds) {
    reportIdsList.value = props.param.reportIds.split(',')
  }

  // 加载归档资料列表
  await loadArchiveMaterialList()

  // 根据模式加载数据
  if (props.param?.editId) {
    await loadEditData()
  }
  else if (props.param?.reportIds) {
    await loadReportData()
  }
})

/**
 * # 加载归档资料列表 📋
 */
async function loadArchiveMaterialList() {
  try {
    const { data } = await getArchiveMaterialAll()
    if (data.success) {
      archiveMaterialList.value = data.obj || []
    }
  }
  catch (error) {
    console.error('加载归档资料列表失败:', error)
  }
}

/**
 * # 加载编辑数据 📝
 */
async function loadEditData() {
  if (!props.param?.editId)
    return

  try {
    loading.value = true
    const { data } = await getReportArchiveDetail(props.param.editId)
    if (data.success && data.obj) {
      renderData(data.obj)
      // 加载资料关联关系
      await loadMaterialRelation(props.param.editId)
    }
  }
  catch (error) {
    console.error('加载编辑数据失败:', error)
    message.error('加载编辑数据失败')
  }
  finally {
    loading.value = false
  }
}

/**
 * # 加载报告数据 📝
 */
async function loadReportData() {
  if (!props.param?.reportIds)
    return

  try {
    loading.value = true
    const { data } = await getWaitForArchiveList(props.param.reportIds)
    if (data.success && data.obj) {
      // 转换为归档数据格式
      const archiveData = convertWaitForArchiveData(data.obj)
      renderData(archiveData)
    }
  }
  catch (error) {
    console.error('加载报告数据失败:', error)
    message.error('加载报告数据失败')
  }
  finally {
    loading.value = false
  }
}

/**
 * # 加载资料关联关系 📝
 */
async function loadMaterialRelation(reportId: string) {
  try {
    const { data } = await getArchiveMaterialRelation(reportId)
    if (data.success && data.obj) {
      selectedMaterialIds.value = data.obj.map((item: any) => item.archiveMaterialId)
    }
  }
  catch (error) {
    console.error('加载资料关联关系失败:', error)
  }
}

/**
 * # 转换待归档数据 🔄
 */
function convertWaitForArchiveData(data: any[]): ArchiveDepositEntity[] {
  return data
    .filter(item => item.archiveType !== '0') // 排除自定义资料
    .map(item => ({
      id: item.id,
      reportId: item.reportId,
      archiveType: item.archiveType,
      relatedObjectSn: item.relatedObjectSn,
      relatedObjectId: item.relatedObjectId,
      userArchiveTitle: item.userArchiveTitle,
    } as ArchiveDepositEntity))
}

/**
 * # 渲染数据 🎨
 */
function renderData(data: ArchiveDepositEntity[]) {
  if (!data || data.length === 0)
    return

  // 保存原始数据
  saveParamList.value = JSON.parse(JSON.stringify(data))

  // 设置表单数据
  const firstItem = data[0]
  formData.value.saveType = firstItem.saveType as EArchiveSaveType || EArchiveSaveType.UNIFIED
  formData.value.archivePersonName = firstItem.archivePersonName || currentUser.value.realName
  formData.value.archiveDate = firstItem.archiveDate
    ? dayjs(firstItem.archiveDate).format('YYYY-MM-DD')
    : dayjs().format('YYYY-MM-DD')

  if (firstItem.saveType === EArchiveSaveType.UNIFIED) {
    formData.value.archiveSn = firstItem.archiveSn || ''
    formData.value.archiveSiteId = firstItem.archiveSiteId || ''
    formData.value.archiveSiteName = firstItem.archiveSite || ''
  }

  // 初始化系统预定义数据
  const reportData: Record<string, ISystemArchiveData> = {
    1: { type: '1', typeName: '检测报告', codes: '', total: 0, isCustom: false, key: '1' },
    2: { type: '2', typeName: '委托单', codes: '', total: 0, isCustom: false, key: '2' },
    3: { type: '3', typeName: '原始记录单', codes: '', total: 0, isCustom: false, key: '3' },
    4: { type: '4', typeName: '任务分配单', codes: '', total: 0, isCustom: false, key: '4' },
  }

  // 处理数据
  data.forEach((item, index) => {
    const type = item.archiveType
    if (reportData[type]) {
      // 系统预定义类型
      const obj = reportData[type]
      if (item.relatedObjectSn && !obj.codes.includes(item.relatedObjectSn)) {
        obj.codes += (obj.codes ? ',' : '') + item.relatedObjectSn
        obj.total++
      }
      obj.archiveSn = item.archiveSn || ''
      obj.archiveSite = item.archiveSite || ''
      obj.archiveSiteId = item.archiveSiteId || ''
      obj.relatedObjectSn = item.relatedObjectSn || ''
      obj.relatedObjectId = item.relatedObjectId || ''
    }
    else if (type === '0') {
      // 自定义类型
      const len = Object.keys(reportData).length + 1
      reportData[len.toString()] = {
        type: '0',
        typeName: item.userArchiveTitle || '',
        codes: item.relatedObjectSn || '',
        total: item.relatedObjectSn ? 1 : 0,
        isCustom: true,
        key: `${type}_${index}`,
        archiveSn: item.archiveSn || '',
        archiveSite: item.archiveSite || '',
        archiveSiteId: item.archiveSiteId || '',
        relatedObjectSn: item.relatedObjectSn || '',
        relatedObjectId: item.relatedObjectId || '',
      }
    }
  })

  // 转换为列表
  const list = Object.values(reportData).filter(item => item.total > 0 || item.type === '0')
  unifiedMaterialList.value = list
  separateMaterialList.value = list
}

/**
 * # 选择归档地址（统一存放）📍
 */
async function handleSelectSite() {
  const result = await AnyDialogHelper.showModel<any[]>(ArchiveSiteModal, { isSelector: true })
  if (result && result.length > 0) {
    formData.value.archiveSiteId = result[0].id
    formData.value.archiveSiteName = result[0].site
  }
}

/**
 * # 选择归档地址（分开存放）📍
 */
async function handleSelectSiteForSeparate(index: number) {
  const result = await AnyDialogHelper.showModel<any[]>(ArchiveSiteModal, { isSelector: true })
  if (result && result.length > 0) {
    separateMaterialList.value[index].archiveSiteId = result[0].id
    separateMaterialList.value[index].archiveSite = result[0].site
  }
}

/**
 * # 添加统一存放资料 ➕
 */
function addUnifiedMaterial() {
  const key = `custom_${addNumber.value++}`
  unifiedMaterialList.value.push({
    type: '0',
    typeName: '',
    codes: '',
    total: 0,
    isCustom: true,
    key,
  })
}

/**
 * # 移除统一存放资料 ➖
 */
async function removeUnifiedMaterial(index: number) {
  const item = unifiedMaterialList.value[index]

  // 如果有归档ID，先调用删除接口
  if (item.key && item.key.includes('_')) {
    const archiveId = item.key.split('_')[1]
    if (archiveId) {
      await delArchiveById(archiveId)
    }
  }

  unifiedMaterialList.value.splice(index, 1)
}

/**
 * # 添加分开存放资料 ➕
 */
function addSeparateMaterial() {
  const key = `custom_${addNumber.value++}`
  separateMaterialList.value.push({
    type: '0',
    typeName: '',
    codes: '',
    total: 0,
    isCustom: true,
    key,
  })
}

/**
 * # 移除分开存放资料 ➖
 */
async function removeSeparateMaterial(index: number) {
  const item = separateMaterialList.value[index]

  // 如果有归档ID，先调用删除接口
  if (item.key && item.key.includes('_')) {
    const archiveId = item.key.split('_')[1]
    if (archiveId) {
      try {
        const { data } = await delArchiveById(archiveId)
        if (!data.success) {
          message.error(data.msg || '删除失败')
          return
        }
      }
      catch (error) {
        console.error('删除归档失败:', error)
        return
      }
    }
  }

  separateMaterialList.value.splice(index, 1)
}

/**
 * # 处理确认按钮点击 ✅
 */
async function handleOk() {
  if (isDetailMode.value) {
    visible.value = false
    props.onConfirm(null)
    return
  }

  // 表单验证
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true

    // 构建保存参数
    const archiveList = buildSaveParams()
    const reportIds = reportIdsList.value.join(',')
    if (props.param.isEdit) {
      // 保存归档数据
      await batchSaveArchive(archiveList)
      // 保存资料关联关系
      await saveArchiveMaterialRelation(reportIds, selectedMaterialIds.value)
    }
    else {
      await AnyDialogHelper.showModel(ProcessModal, {
        processType: ProcessType.REPORT_ARCHIVE,
        submitAuditApi: batchSubmit,
        submitDataTransfer: (data: any) => {
          return {
            archiveListStr: JSON.stringify(archiveList),
            archiveMaterialIds: selectedMaterialIds.value,
            presetAuditors: data.presetAuditers ? data.presetAuditers : '',
            formPropertyJson: data.formPropertyJson ? data.formPropertyJson : '',
            remark: data.remark,
          }
        },
      } as BatchSubmit)
    }

    message.success('保存成功')
    visible.value = false
    props.onConfirm(null)
  }
  finally {
    loading.value = false
  }
}

/**
 * # 表单验证 ✅
 */
function validateForm(): boolean {
  if (!formData.value.archiveDate) {
    message.error('归档日期不能为空')
    return false
  }
  if (!formData.value.archivePersonName) {
    message.error('归档人员不能为空')
    return false
  }

  if (formData.value.saveType === EArchiveSaveType.UNIFIED) {
    if (!formData.value.archiveSiteId) {
      message.error('归档地址不能为空')
      return false
    }
  }
  else {
    // 分开存放验证
    for (const item of separateMaterialList.value) {
      if (!item.archiveSiteId) {
        message.error(`【${item.typeName}】的归档地址不能为空`)
        return false
      }
    }
  }

  return true
}

/**
 * # 构建保存参数 🔧
 */
function buildSaveParams(): ArchiveDepositEntity[] {
  const archivePersonId = formData.value.archivePersonName === currentUser.value.realName
    ? currentUser.value.id
    : ''

  const baseParams = {
    archivePersonName: formData.value.archivePersonName,
    archiveDate: dayjs(formData.value.archiveDate).format('YYYY-MM-DD'),
    saveType: formData.value.saveType,
    archivePersonId,
  }

  const result: ArchiveDepositEntity[] = []
  const currentList = formData.value.saveType === EArchiveSaveType.UNIFIED
    ? unifiedMaterialList.value
    : separateMaterialList.value

  currentList.forEach((item) => {
    reportIdsList.value.forEach((reportId) => {
      const archiveItem = ArchiveDepositEntity.fromJSON({
        ...baseParams,
        reportId,
        archiveType: item.type,
        userArchiveTitle: item.typeName,
        relatedObjectId: item.relatedObjectId,
        relatedObjectSn: item.relatedObjectSn,
      })

      if (formData.value.saveType === EArchiveSaveType.UNIFIED) {
        archiveItem.archiveSn = formData.value.archiveSn || ''
        archiveItem.archiveSiteId = formData.value.archiveSiteId || ''
      }
      else {
        archiveItem.archiveSn = item.archiveSn || ''
        archiveItem.archiveSiteId = item.archiveSiteId || ''
      }
      result.push(archiveItem)
    })
  })

  return result
}
</script>

<style scoped>
:deep(.ant-checkbox-wrapper) {
  margin-left: 0;
}
</style>
