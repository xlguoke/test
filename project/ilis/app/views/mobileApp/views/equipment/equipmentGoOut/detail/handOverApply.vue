<template>
  <div class="hand-over-apply">
    <van-form :model="formData" label-width="120px">
      <van-cell-group>
        <!-- 接收人 -->
        <van-field
          v-model="formData.receiveUser"
          label="接收人："
          readonly
        />
        <!-- 转交人 -->
        <van-field
          v-model="formData.transitionUser"
          label="转交人："
          readonly
        />
        <!-- 转交时状态 -->
        <van-field
          v-model="formData.equipmentStatusName"
          label="转交时状态："
          required
          readonly
          placeholder="请选择"
          :rules="[{ required: true, message: '请选择转交时状态' }]"
          @click="showStatusPicker = true"
        />

        <!-- 转交时间 -->
        <FormItemDate
          v-model:value="formData.operationTime"
          label="转交时间："
          enable-time
          required
          placeholder="请选择转交时间"
        />

        <!-- 备注 -->
        <van-field
          v-model="formData.remark"
          label="备注："
          placeholder="请输入备注"
          autosize
          rows="2"
          type="textarea"
        />

        <!-- 附件上传 -->
        <div style="padding: 10px 16px; color: #646566">
          附件上传：<span style="font-size: 12px; color: #999">（仅支持图片格式文件上传）</span>
        </div>
        <van-field name="uploader" label="" input-align="left">
          <template #input>
            <AttachmentHandler
              business-type="EQ_EGRESS"
              accept="*"
              @init="formData.qrKey = $event.qrKey"
            />
          </template>
        </van-field>
      </van-cell-group>
    </van-form>

    <!-- 状态选择器 -->
    <van-popup v-model:show="showStatusPicker" position="bottom">
      <van-picker
        :columns="statusColumns"
        @confirm="onStatusConfirm"
        @cancel="showStatusPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import AttachmentHandler from '~/views/mobileApp/components/AttachmentHandler.vue'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useEquipmentStore } from '~/views/mobileApp/store/useEquipmentStore'

/**
 * # 设备信息接口
 */
interface IEquipmentData {
  id?: string
  name?: string
  equipmentSn?: string
  archiveSn?: string
  assetSn?: string
  standard?: string
  borrowUser?: string
  egressStatusName?: string
}

/**
 * # 表单数据接口
 */
interface IFormData {
  id: string
  equipmentStatus: string
  equipmentStatusName: string
  operationTime: string
  remark: string
  qrKey: string
  receiveUser: string
  transitionUser: string
}

/**
 * # 状态列选项接口
 */
interface IStatusColumn {
  text: string
  value: string
}

const props = defineProps<{
  transitionUser: string
}>()

// Router
const router = useRouter()

// Reactive data
const showStatusPicker = ref(false)
const statusData = ref<IStatusColumn[]>([])
const statusColumns = ref<IStatusColumn[]>([])
const equipmentData = ref<IEquipmentData>({})

const formData = reactive<IFormData>({
  id: '',
  equipmentStatus: '',
  equipmentStatusName: '',
  operationTime: '',
  remark: '',
  qrKey: '',
  receiveUser: '',
  transitionUser: '',
})

/**
 * # 初始化数据
 */
async function initData() {
  const equipmentStore = useEquipmentStore()
  const eqData = equipmentStore.eqDataList as any[]
  if (Array.isArray(eqData) && eqData.length > 0) {
    equipmentData.value = eqData[0]
    const { data } = await IlisApiHelper.post<any>('/eqEgress/transition-record/equipment', {
      equipmentIds: [equipmentData.value.id],
    })
    formData.receiveUser = data?.[equipmentData.value.id!]?.[0]?.borrowUser || ''
    formData.transitionUser = props.transitionUser
  }
  else {
    showToast('未获取到设备信息')
    router.go(-1)
  }
}

/**
 * # 获取设备状态数据
 */
async function getStatusData() {
  try {
    const res = await mRequest.get('rest/type/getTypesByGroupCode', {
      params: { groupCode: 'eq_status' },
    }) as any
    if (res.code === 20000 && res.data) {
      statusData.value = res.data
      statusColumns.value = res.data.map((item: { typeName: string, typeCode: string }) => ({
        text: item.typeName,
        value: item.typeCode,
      }))
    }
  }
  catch (error) {
    console.error('获取设备状态失败:', error)
  }
}

/**
 * # 状态选择确认
 */
function onStatusConfirm({ selectedOptions }: { selectedOptions: IStatusColumn[] }) {
  formData.equipmentStatus = selectedOptions[0].value
  formData.equipmentStatusName = selectedOptions[0].text
  showStatusPicker.value = false
}

defineExpose({
  formData,
})

// 初始化
onMounted(() => {
  initData()
  getStatusData()
})
</script>
