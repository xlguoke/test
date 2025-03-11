<template>
  <div>
    <a-alert v-if="isBatch && isConsign" show-icon class="mb-4 items-start">
      <template #icon>
        <ExclamationCircleFilled style="margin-top: 4px;font-size: 16px;" />
      </template>
      <template #message>
        <p>您当前正在使用批量委托签名模式，您需要注意：</p>
        <p>系统将提取您所选委托中的委托人、建设单位见证人和监理单位见证人的姓名+电话相同的人员；</p>
      </template>
    </a-alert>
    <BaseTitle>签字方式</BaseTitle>
    <a-radio-group v-model:value="signType">
      <a-radio v-for="d in signTypeDict" :key="d.label" :value="d.key">
        {{ d.label }}
      </a-radio>
    </a-radio-group>

    <BaseTitle class="mt-6">
      人员列表
    </BaseTitle>

    <a-alert
      v-if="signType !== SIGN_TYPE.HAND_WRITE"
      message="若您无法选择时，请确认该人员的电话号码是否正确！"
      class="mb-2"
    />

    <IlisTable
      row-key="key"
      :entity="isConsign ? ConsignUserEntity : OnlineUserEntity"
      :data-source="dataSource"
      :pagination="false"
      :field-list="fieldList"
      :row-selection="{
        type: signType === SIGN_TYPE.SMS ? 'checkbox' : 'radio',
        selectedRowKeys,
        onChange: (keys: Key[]) => {
          selectedRowKeys = keys
        },
        getCheckboxProps: (record) => ({
          disabled: record.disabled && signType !== SIGN_TYPE.HAND_WRITE,
        }),
      }"
      :custom-row="getCustomRow"
    >
      <template #bodyCell="{ text, column }">
        <template v-if="isConsign && column.dataIndex === 'identity'">
          {{ identityLabel(text) }}
        </template>
        <template v-if="column.dataIndex === 'signed'">
          {{ text ? '已签字' : '待签字' }}
        </template>
      </template>
    </IlisTable>

    <!-- 二维码签名 -->
    <QrCodeSign v-if="signType === SIGN_TYPE.QR_CODE" :source="source" :phone="selectedPhone" />
  </div>
</template>

<script setup lang='ts'>
import { ExclamationCircleFilled } from '@ant-design/icons-vue'
import type { Key } from 'ant-design-vue/es/_util/type'
import { message } from 'ant-design-vue'
import type { SignaturePerson } from './api'
import { getConsignSignPerson, getReportSignPerson, sendSignSms, sendSignSmsReport } from './api'
import type { SignatureData } from '.'
import { CONSIGN_SIGN_TYPE_DICT, ConsignUserEntity, OnlineUserEntity, SIGNATURE_SOURCE, SIGN_TYPE, SIGN_TYPE_DICT } from '.'

interface PropType {
  source?: SIGNATURE_SOURCE
  dataId: string
}

const props = defineProps<PropType>()

// 是否批量签字
const isBatch = computed(() => props.dataId.includes(','))
// 是否为委托方签字
const isConsign = computed(() => props.source === SIGNATURE_SOURCE.CONSIGN)
const signType = ref(isConsign.value ? SIGN_TYPE.HAND_WRITE : SIGN_TYPE.QR_CODE)
// 批量委托方签字时，不显示签字状态列
const fieldList = computed(() => {
  const fileds = ConsignUserEntity.getTableFieldList()
  if (!isBatch.value) {
    return fileds
  }
  return fileds.filter(d => d !== 'signed')
})

// 委托方签字才显示手写板
const signTypeDict = computed(() => {
  return isConsign.value ? SIGN_TYPE_DICT : SIGN_TYPE_DICT.exclude([SIGN_TYPE.HAND_WRITE])
})

const dataSource = ref<SignaturePerson[]>([])
const selectedRowKeys = ref<Key[]>([])
const selectedRows = computed(() => dataSource.value.filter(item => selectedRowKeys.value.includes(item.key)))
const selectedPhone = computed(() => selectedRows.value[0]?.phone || '')

// 签字类型
function identityLabel(text: string) {
  const arr = text.split(',')
  return arr.map(d => CONSIGN_SIGN_TYPE_DICT.getLabelByKey(d)).join('/')
}

// 获取用户列表
async function getSignUsers() {
  const res = await getSignUsersApi()
  if (!res || res.length === 0)
    return

  res.forEach((item, i) => {
    const bol = /^1\d{10}$/.test(item.phone)
    item.disabled = !bol
    item.key = `${i}-${item.phone}`
  })

  // 设置默认选中项
  if (signType.value === SIGN_TYPE.HAND_WRITE) {
    selectedRowKeys.value = [res[0].key]
  }
  else {
    const list = res.filter(d => !d.disabled)
    selectedRowKeys.value = list.length > 0 ? [list[0].key] : []
  }

  dataSource.value = res
}

async function getSignUsersApi() {
  try {
    if (isConsign.value) {
      const idArr = props.dataId.split(',')
      const { data } = await getConsignSignPerson(idArr)
      // 批量委托方签字时，根据 名称 + 手机号 合并数据
      if (isBatch.value) {
        const dataMap = new Map()
        for (let i = 0; i < data.length; i++) {
          const item = data[i]
          const key = (item.name + item.phone) || i
          const d = dataMap.get(key)
          if (!d) {
            dataMap.set(key, item)
          }
          else {
            d.identity += `,${item.identity}`
          }
        }
        return Array.from(dataMap.values())
      }
      return data
    }
    const { data } = await getReportSignPerson(props.dataId)
    return data
  }
  catch (err) {
    console.error(err)
  }
}

watch(() => props.dataId, (id: string) => {
  if (!id) {
    message.error('id不存在')
    return
  }

  getSignUsers()
}, {
  immediate: true,
})

/**
 * 点击行选择事件
 */
function getCustomRow(record: any) {
  return {
    onClick: () => {
      if (signType.value !== SIGN_TYPE.HAND_WRITE && record.disabled) {
        return
      }
      if (signType.value === SIGN_TYPE.SMS) {
        const ind = selectedRowKeys.value.findIndex(d => d === record.key)
        if (ind === -1) {
          selectedRowKeys.value.push(record.key)
        }
        else {
          selectedRowKeys.value.splice(ind, 1)
        }
      }
      else {
        selectedRowKeys.value = [record.key]
      }
    },
  }
}

/**
 * 切换签字类型：非手写板签字时，需要验证手机号格式，格式不正确时，禁止选择
 */
watch(() => signType.value, (_val, oldVal) => {
  if (oldVal === SIGN_TYPE.HAND_WRITE) {
    const item = dataSource.value.find(d => d.key === selectedRowKeys.value[0])
    if (item?.disabled) {
      selectedRowKeys.value = []
    }
  }
  else if (oldVal === SIGN_TYPE.SMS && selectedRowKeys.value.length) {
    selectedRowKeys.value = [selectedRowKeys.value[0]]
  }
})

/**
 * 发送短信
 */
async function sendSMS(users: SignaturePerson[]) {
  try {
    const phones = users.map(u => u.phone)
    if (props.source === SIGNATURE_SOURCE.CONSIGN) {
      await sendSignSms(props.dataId, phones)
    }
    else if (props.source === SIGNATURE_SOURCE.REPORT) {
      await sendSignSmsReport(props.dataId, phones)
    }
    message.success('发送成功')
    return true
  }
  catch (err) {
    console.error(err)
    return false
  }
}

/**
 * 签字信息
 * @returns {object} 返回值对象
 * @returns {string} returns.signType - 签字类型
 * @returns {Array<SignaturePerson>} returns.users - 签字人员信息
 */
async function saveSignatures(): Promise<SignatureData | undefined> {
  if (selectedRowKeys.value.length === 0 && signType.value !== SIGN_TYPE.QR_CODE) {
    message.error('请选择签字人员')
    return
  }
  const users = dataSource.value.filter(d => selectedRowKeys.value.includes(d.key))
  if (signType.value === SIGN_TYPE.SMS) {
    const isSend = await sendSMS(users)
    if (!isSend)
      return
  }
  return {
    signType: signType.value,
    users,
  }
}

defineExpose({
  saveSignatures,
})
</script>

<style>

</style>
