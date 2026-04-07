<template>
  <div class="flex flex-col items-center" style="padding: 0 24px 50px">
    <div
      id="unitName"
      class="text-center text-2xl my-[33px] font-black text-colorPrimary"
      style="text-shadow: 0px 2px 2px rgba(0, 102, 236, 0.29);"
    >
      {{ unitName }}
    </div>
    <ul id="personInfo" class="w-full py-3 px-4 my-0 mx-auto rounded-lg" style="box-shadow: 0px 0px 10px 0px rgba(139, 189, 255, 0.2);">
      <li
        v-for="item in personData" :key="item.label"
        class=" flex justify-between py-2 px-0 text-[#3D3D3D] text-xs"
      >
        <span class="min-w-[100px] max-w-[30%] break-all">{{ item.label }}：</span>
        <span>{{ item.value }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { getPersonInfo } from './api'

interface PersonData {
  label: string
  value: string
}

interface PersonTypeDict {
  typeCode: string
  typeName: string
}
export interface Props {
  catalog: { personId: string, unitCode: string }
}
const props = defineProps<Props>()

const personId = ref(props.catalog?.personId || '')
const unitCode = ref(props.catalog?.unitCode || '')
const personData = ref<PersonData[]>([])
const unitName = ref('')

// 备案状态集合
const personArchiveStatusDict = ref<PersonTypeDict[]>([])
// 职称级别集合
const jobTitleLevelDict = ref<PersonTypeDict[]>([])
// 学历集合
const personEducationDict = ref<PersonTypeDict[]>([])
// 职称集合
const personJobTitleDict = ref<PersonTypeDict[]>([])
// 工作职务集合
const personPositionDict = ref<PersonTypeDict[]>([])

const FORMAT_RULES = {
  // 日期格式化
  entryTime: (value: any) => dayjs(value || '').format('YYYY-MM-DD'),
  dateOfBirth: (value: any) => dayjs(value || '').format('YYYY-MM-DD'),
  graduatedDate: (value: any) => dayjs(value || '').format('YYYY-MM-DD'),
  contractStartTime: (value: any) => dayjs(value || '').format('YYYY-MM-DD'),
  contractEndTime: (value: any) => dayjs(value || '').format('YYYY-MM-DD'),
  // 布尔值转文字
  personStatus: (value: any) => value === '0' ? '在职' : '离职',
  employmentType: (value: any) => value ? '正式员工' : '非正式员工',
  retirementStatus: (value: any) => value ? '是' : '否',
  specialEquipmentOperator: (value: any) => value ? '是' : '否',
  // 字典映射
  archiveStatus: (value: any) => personArchiveStatusDict.value.find(item => item.typeCode === value)?.typeName || '',
  jobTitleLevel: (value: any) => jobTitleLevelDict.value.find(item => item.typeCode === value)?.typeName || '',
  education: (value: any) => personEducationDict.value.find(item => item.typeCode === value)?.typeName || '',
  jobTitle: (value: any) => personJobTitleDict.value.find(item => item.typeCode === value)?.typeName || '',
  position: (value: any) => personPositionDict.value.find(item => item.typeCode === value)?.typeName || '',
}

// 获取人员信息
async function initData() {
  const { data } = await getPersonInfo(personId.value, unitCode.value)
  const personInfo = data.biddingPerson || {} // 获取人员信息
  // 自定义信息平铺到人员信息上
  const customData = data.customizeValue || [] // 自定义信息
  customData.forEach((item: any) => {
    personInfo[item.columnId] = item.columnValue
  })
  personArchiveStatusDict.value = data.personArchiveStatusTypes || []
  personEducationDict.value = data.personEducationTypes || []
  jobTitleLevelDict.value = data.personJobTitleLevelTypes || []
  personJobTitleDict.value = data.personJobTitleTypes || []
  personPositionDict.value = data.personPositionTypes || []
  const personAttributes = data.chosenColumns || [] // 获取要展示的人员信息列
  unitName.value = data.companyShortName || '人员信息' // 单位名称

  personData.value = personAttributes.map((item: any) => {
    const columnKey = item.columnKey
    let value = personInfo[columnKey]

    if (value !== null && FORMAT_RULES[columnKey as keyof typeof FORMAT_RULES]) {
      value = FORMAT_RULES[columnKey as keyof typeof FORMAT_RULES](value)
    }

    return {
      label: item.columnName,
      value: value || '--',
    } as PersonData
  })
}

onMounted(async () => {
  await initData()
})
</script>
