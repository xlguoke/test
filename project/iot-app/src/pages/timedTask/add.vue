<template>
  <VanNavBar
    :title="title"
    :fixed="true"
    clickable
    placeholder
    :left-arrow="true"
    @click-left="onBack"
  />
  <div p16>
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="laboratory"
          required="auto"
          is-link
          readonly
          name="laboratory"
          label="试验室"
          placeholder="请选择"
          :disabled="isNeedAuth === IsNeedAuth.NO"
          :rules="[{ required: true, message: '请选择', trigger: 'onChange' }]"
          @click="isNeedAuth === IsNeedAuth.YES && (showPickerLaboratory = true)"
        />
        <van-field
          v-model="restType"
          required="auto"
          is-link
          readonly
          name="restType"
          label="重复类型"
          placeholder="请选择"
          :rules="[{ required: true, message: '请选择', trigger: 'onChange' }]"
          @click="showPickerRestType = true"
        />
        <van-field
          v-if="selectedRestType?.[0] === RestType.自定义"
          required="auto"
          readonly
          name="customValue"
          label="自定义重复"
          placeholder="请选择"
        >
          <template #input>
            <van-checkbox-group v-model="customValue" shape="square" direction="horizontal">
              <!-- <div
                flex-x
                flex-wrap
                gap12
              > -->
              <van-checkbox name="2">
                星期一
              </van-checkbox>
              <van-checkbox name="3">
                星期二
              </van-checkbox>
              <van-checkbox name="4">
                星期三
              </van-checkbox>
              <van-checkbox name="5">
                星期四
              </van-checkbox>
              <van-checkbox name="6">
                星期五
              </van-checkbox>
              <van-checkbox name="7">
                星期六
              </van-checkbox>
              <van-checkbox name="1">
                星期天
              </van-checkbox>
              <!-- </div> -->
            </van-checkbox-group>
          </template>
        </van-field>
        <van-field
          v-model="startDateStr"
          required="auto"
          is-link
          readonly
          name="startDateStr"
          label="控制时间"
          placeholder="请选择"
          :rules="[{ required: true, message: '请选择', trigger: 'onChange' }]"
          @click="showPickerStartDate = true"
        />
        <van-field
          v-model="customType"
          required="auto"
          is-link
          readonly
          name="customType"
          label="控制类型"
          placeholder="请选择"
          :rules="[{ required: true, message: '请选择', trigger: 'onChange' }]"
          @click="showPickerCustomType = true"
        />
        <van-field
          v-if="customType === CustomTypeDict.getLabelByKey(CustomType.设置温湿度)"
          required
          label="目标温度"
        >
          <template #input>
            <van-field
              v-model="tStart"
              required="auto"
              type="number"
              class="p0! after:hidden"
              name="tStart"
              placeholder="请输入"
              :rules="[
                { required: true, message: '请输入', trigger: 'onChange' },
                { validator: validatorTem, trigger: 'onChange' },
              ]"
            />
            <div px12>
              -
            </div>
            <van-field
              v-model="tEnd"
              required="auto"
              type="number"
              class="p0!"
              name="tEnd"
              placeholder="请输入"
              :rules="[
                { required: true, message: '请输入', trigger: 'onChange' },
                { validator: validatorTem, trigger: 'onChange' },
              ]"
            />
          </template>
        </van-field>
        <van-field
          v-if="customType === CustomTypeDict.getLabelByKey(CustomType.设置温湿度)"
          required
          label="目标湿度"
        >
          <template #input>
            <van-field
              v-model="rhStart"
              required="auto"
              type="number"
              class="p0! after:hidden"
              name="rhStart"
              placeholder="请输入"
              :rules="[
                { required: true, message: '请输入', trigger: 'onChange' },
                { validator: validatorHum, trigger: 'onChange' },
              ]"
            />
            <div px12>
              -
            </div>
            <van-field
              v-model="rhEnd"
              required="auto"
              type="number"
              class="p0!"
              name="rhEnd"
              placeholder="请输入"
              :rules="[
                { required: true, message: '请输入', trigger: 'onChange' },
                { validator: validatorHum, trigger: 'onChange' },
              ]"
            />
          </template>
        </van-field>
        <van-field
          v-if="customType === CustomTypeDict.getLabelByKey(CustomType.开启)"
          v-model="tem"
          required="auto"
          is-link
          name="tem"
          type="number"
          label="温度（℃）"
          placeholder="请输入"
          :rules="[
            { required: true, message: '请输入', trigger: 'onChange' },
            { validator: validatorTem, trigger: 'onChange' },
          ]"
        />
        <van-field
          required="auto"
          name="status"
          label="启用状态"
        >
          <template #input>
            <div w-full flex-x justify-end>
              <van-switch v-model="status" size="20" />
            </div>
          </template>
        </van-field>
      </van-cell-group>
      <div class="fixed-box flex-x gap12">
        <van-button size="small" block @click="onBack">
          取消
        </van-button>
        <van-button size="small" block type="primary" native-type="submit">
          提交
        </van-button>
      </div>
    </van-form>

    <!-- 试验室选择器 -->
    <van-popup v-model:show="showPickerLaboratory" position="bottom" round>
      <van-picker
        v-model="selectedLaboratory"
        :columns="columns2"
        @confirm="onConfirmField2"
        @cancel="showPickerLaboratory = false"
      />
    </van-popup>
    <!-- 定时类型选择器 -->
    <van-popup v-model:show="showPickerRestType" position="bottom" round>
      <van-picker
        v-model="selectedRestType"
        :columns="columns"
        @confirm="onConfirmField1"
        @cancel="showPickerRestType = false"
      />
    </van-popup>
    <!-- 控制时间选择器 -->
    <van-popup v-model:show="showPickerStartDate" position="bottom" round>
      <van-picker-group
        next-step-text="下一步"
        title="控制时间"
        :tabs="['选择日期', '选择时间']"
        @confirm="onConfirm5"
        @cancel="showPickerStartDate = false"
      >
        <van-date-picker
          v-model="startDate"
        />
        <van-time-picker
          v-model="startTime"
          :columns-type="['hour', 'minute', 'second']"
        />
      </van-picker-group>
    </van-popup>
    <!-- 控制类型选择器 -->
    <van-popup v-model:show="showPickerCustomType" position="bottom" round>
      <van-picker
        v-model="selectedCustomType"
        :columns="columns4"
        @confirm="onConfirmField4"
        @cancel="showPickerCustomType = false"
      />
    </van-popup>
  </div>
</template>

<script lang="ts" setup>
import { getLaboratoryWithoutIOT } from '@/api'
import {
  createHumitureTimer,
  CustomType,
  CustomTypeDict,
  editHumitureTimer,
  type ITimedTask,
  RestType,
  RestTypeDict,
} from '.'
import { StatusType } from '../room'
import { closeToast, showFailToast, showLoadingToast, showSuccessToast } from 'vant'
import dayjs from 'dayjs'
import type { ILaboratory } from '@/interface/dataInterface/ILaboratory'
import { usePermissionStore } from '@/stores'
import { IsNeedAuth } from '@/stores/modules/permissionStore'

const router = useRouter()
const route = useRoute()
const title = ref('新增定时任务')

const query = route.query as unknown as ITimedTask
const { isNeedAuth } = usePermissionStore()

if (query.id) {
  title.value = '编辑定时任务'
}

// 试验室选择器
const laboratory = ref('')
const selectedLaboratory = ref([query.laboratoryId])
const showPickerLaboratory = ref(false)
const columns2 = ref([])

const laboratoryList = ref([] as ILaboratory[])

const currentLaboratory = ref({} as ILaboratory)
async function getLaboratoryList() {
  showLoadingToast('')
  const { data } = await getLaboratoryWithoutIOT({ page: 1, size: 999, isIotLab: '1' }).finally(() => {
    closeToast()
  })
  laboratoryList.value = data.rows
  columns2.value = data?.rows.map((item) => {
    return {
      text: item.name,
      value: item.id,
    }
  })
  currentLaboratory.value = data?.rows?.find(item => item.id === query.laboratoryId) || {}
  laboratory.value = data?.rows?.find(item => item.id === query.laboratoryId)?.name || ''
}
getLaboratoryList()
function onConfirmField2({ selectedOptions }) {
  laboratory.value = selectedOptions[0]?.text
  currentLaboratory.value = laboratoryList.value.find(item => item.id === selectedOptions[0]?.value)
  if (currentLaboratory.value.maxConTem === null
    || currentLaboratory.value.minConTem === null
    || currentLaboratory.value.maxConHum === null
    || currentLaboratory.value.minConHum === null
  ) {
    showDialog({
      message: '未正确配置功能室可控范围，请检查功能室配置',
    })
  }
  setHumitureByLaboratoryId(selectedOptions[0]?.value)
  showPickerLaboratory.value = false
}

function validatorTem(val) {
  if (currentLaboratory.value.maxConTem === null
    || currentLaboratory.value.minConTem === null) {
    return '未配置可控范围'
  }
  if (val > currentLaboratory.value.maxConTem) {
    return `超过最大值${currentLaboratory.value.maxConTem}`
  }
  if (val < currentLaboratory.value.minConTem) {
    return `低于最小值${currentLaboratory.value.minConTem}`
  }
  return true
}

function validatorHum(val) {
  if (currentLaboratory.value.maxConHum === null
    || currentLaboratory.value.minConHum === null) {
    return '未配置可控范围'
  }
  if (val > currentLaboratory.value.maxConHum) {
    return `超过最大值${currentLaboratory.value.maxConHum}`
  }
  if (val < currentLaboratory.value.minConHum) {
    return `低于最小值${currentLaboratory.value.minConHum}`
  }
  return true
}

// 定时类型选择器
const restType = ref(RestTypeDict.getLabelByKey(query?.restType || RestType.不重复))
const selectedRestType = ref([query?.restType || RestType.不重复])
const showPickerRestType = ref(false)
const columns = RestTypeDict.map((itme) => {
  return {
    text: itme.label as string,
    value: itme.key as string,
  }
})
function onConfirmField1({ selectedOptions }) {
  restType.value = selectedOptions[0]?.text
  showPickerRestType.value = false
}

// 定时类型选择器
const customValue = ref(query.customValue?.length ? query.customValue.split(',') : [])

// 控制时间选择器
const startDate = ref(dayjs().format('YYYY-MM-DD').split('-'))
const startTime = ref(dayjs().format('HH:mm:00').split(':'))
if (query.startDate) {
  startDate.value = dayjs(Number(query.startDate)).format('YYYY-MM-DD').split('-')
  startTime.value = dayjs(Number(query.startDate)).format('HH:mm:ss').split(':')
}

const startDateStr = computed(() => {
  return `${startDate.value.join('-')} ${startTime.value.join(':')}`
})
const showPickerStartDate = ref(false)
function onConfirm5() {
  showPickerStartDate.value = false
}

// 控制类型选择器
const customType = ref(CustomTypeDict.getLabelByKey(query?.customType || CustomType.设置温湿度))
const selectedCustomType = ref([query.customType || CustomType.设置温湿度])
const showPickerCustomType = ref(false)
const columns4 = CustomTypeDict.map((itme) => {
  return {
    text: itme.label as string,
    value: itme.key as string,
  }
})
function onConfirmField4({ selectedOptions }) {
  customType.value = selectedOptions[0]?.text
  showPickerCustomType.value = false
}

// 目标温度
const tStart = ref(query.tem || '')
const tEnd = ref(query.maxTem || '')

// 目标湿度
const rhStart = ref(query.hum || '')
const rhEnd = ref(query.maxHum || '')

// 温度
const tem = ref(query.tem || '')

// 启用状态(编辑时使用数据状态、新增时默认开启)
const status = ref(query.id ? query.status === StatusType.开启 : true)

function setHumitureByLaboratoryId(id: string) {
  const target = laboratoryList.value.find((item) => {
    return item.id === id
  }) as ILaboratory
  tStart.value = target.minTemperature
  tEnd.value = target.maxTemperature
  rhStart.value = target.minHumidity
  rhEnd.value = target.maxHumidity
}

async function onSubmit() {
  const form = {
    // 目前写死功能室
    laboratoryIotEqType: 'LAB',
    laboratoryId: selectedLaboratory.value[0],
    restType: selectedRestType.value[0],
    customValue: customValue.value?.join(','),
    startDate: startDateStr.value,
    customType: selectedCustomType.value[0],
    status: status.value ? StatusType.开启 : StatusType.关闭,
    tem: tStart.value,
    maxTem: tEnd.value,
    hum: rhStart.value,
    maxHum: rhEnd.value,
  }

  if (selectedCustomType.value[0] === CustomType.设置温湿度) {
    if (tStart.value > tEnd.value) {
      showFailToast('目标温度，最小温度不能大于最大温度！')
      return
    }
    if (rhStart.value > rhEnd.value) {
      showFailToast('目标湿度，最小湿度不能大于最大湿度！')
      return
    }
  }
  else {
    if (selectedCustomType.value[0] === CustomType.关闭) {
      form.tem = undefined
    }
    else {
      form.tem = tem.value
    }
    form.maxTem = undefined
    form.hum = undefined
    form.maxHum = undefined
  }
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  if (query.id) {
    await editHumitureTimer({ ...form, id: query.id as string }).finally(() => {
      closeToast()
    })
  }
  else {
    await createHumitureTimer(form).finally(() => {
      closeToast()
    })
  }
  showSuccessToast('操作成功')
  router.back()
}

function onBack() {
  if (window.history.state.back)
    history.back()
  else
    router.replace('/')
}
</script>

<route lang="json">
  {
    "name": "addOrEditTimedTask",
    "meta": {
      "hiddenNavBar": true

    }
  }
</route>
