<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { showSuccessToast } from 'vant'
import { getLogger } from '@ilis/cordova-plugin-log4c'
import { z } from 'zod'
import dayjs from 'dayjs'
import BaseModal from '../../components/BaseModal.vue'
import SelectedEquipment from './components/SelectedEquipment.vue'
import SelectedParams from './components/SelectedParams.vue'
import { request } from '@/axios'
import type { CheckUseLogOverlap, EquipmentUseLog, OverlapTask, SaveUseLogParam } from '@/type/equipment-use-register'
import { checkUseLogOverlap, overlapTask, taskParamEquipment } from '@/type/equipment-use-register'
import type { SelDataItemDTO } from '@/type/common'
import { formatDate } from '@/utils'
import { type User, useUserStore } from '@/stores/users'
import FormItemDate from '@/components/FormItem/FormItemDate.vue'

defineProps({
  isQr: Boolean,
})

const emits = defineEmits(['close', 'load'])

class AddRecordEntity {
  equipmentName = ''
  equipmentId = ''
  equipmentCode = ''
  testParamName = ''
  testParamId = ''
  testObjectParamId = ''
  startUseState = '正常'
  endUseState = '正常'
  // startUseTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  // endUseTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  startUseTime = ''
  endUseTime = ''
  remark = ''
}

const log = getLogger('appUpdate')
const showAdd = ref(false)
const udrVisible = ref(false)
const editData = ref<EquipmentUseLog>()

const { name: userName, id: userId } = useUserStore() as User

const formRef = ref()
const formData = ref(new AddRecordEntity())

/** 扫码登记，选择参数后验证设备是否与参数关联 */
const isCheckEq = ref(false)

const selectedEquipmentRef = ref()
const selectedParamsRef = ref()
let selectedEq: SelDataItemDTO[] = []

const title = computed(() => editData.value ? '编辑设备使用登记' : '新增设备使用登记')

/** 选择设备 */
function chooseEquipment() {
  if (editData.value)
    return
  if (!formData.value.testParamName) {
    showToast('请先选择检测参数')
    return
  }
  selectedEquipmentRef.value.showModal()
}

// 选择设备回调
function selectedEquipment(datas: SelDataItemDTO[]) {
  selectedEq = datas
  formData.value.equipmentCode = datas.map(d => d.equipmentSn).join('，')
  formData.value.equipmentId = datas.map(d => d.id).join('，')
  formData.value.equipmentName = datas.map(d => d.name).join('，')
}

/** 选择参数 */
function chooseTestParams() {
  if (editData.value)
    return
  selectedParamsRef.value.showModal([{
    id: formData.value.testParamId,
    name: formData.value.testParamName,
  }])
}

// 选择参数回调
function selectedParams(datas: SelDataItemDTO[]) {
  formData.value.testParamName = datas[0].name
  formData.value.testParamId = datas[0].testParamId
  formData.value.testObjectParamId = datas[0].testObjectParamId

  if (isCheckEq.value)
    checkEquipmentByParam(datas[0].testParamId)
}

/** 验证设备是否在参数范围内 */
function checkEquipmentByParam(testParamId: string) {
  showLoadingToast({ forbidClick: true, duration: 0 })
  request({
    url: '/ilis2/testTaskUseEquipmentController/in/range',
    method: 'GET',
    params: { testParamId, equipmentId: formData.value.equipmentId },
  }).then((res) => {
    if (res)
      return

    formData.value.equipmentName = ''
    formData.value.equipmentId = ''
    formData.value.equipmentCode = ''
    selectedEq = []
    showDialog({
      title: '设备与参数不匹配',
      message: '当前设备未关联当前检测任务中的参数，请重新选择设备',
    })
  }).finally(() => {
    closeToast()
  })
}

/** 获取设备使用时间冲突的任务 */
async function getEqUseTimeOverlapTask(overlapData: CheckUseLogOverlap[]) {
  const tasks: OverlapTask[] = []
  for (let i = 0; i < overlapData.length; i++) {
    const r = overlapData[i]
    const data = {
      testTaskId: r.testTaskId,
      equipmentId: r.equipmentId,
      startUseTime: r.startUseTime,
      endUseTime: r.endUseTime,
    }
    try {
      const res = await request({
        url: `/ilis2/equipmentController.do?getConflictedUseRecord`,
        method: 'POST',
        data,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        schema: z.object({
          obj: z.array(overlapTask),
          success: z.boolean(),
        }),
      })
      tasks.push(...res.obj)
    }
    catch (err) {
      log.error('获取冲突任务设备使用时间失败', err)
    }
  }
  return tasks
}

/** 设备使用时间冲突提示 */
function eqUseTimeOverlapTip(overlapData: CheckUseLogOverlap[]) {
  return new Promise((resolve) => {
    getEqUseTimeOverlapTask(overlapData).then((overlapTask: OverlapTask[]) => {
      closeToast()
      const msg = [h('p', { style: { fontWeight: 'bold' } }, '以下设备的使用时间与其他检测任务的设备使用记录存在使用时间交叉的情况，是否继续保存？')]
      overlapData.forEach((d) => {
        msg.push(h('p', `设备名称：${d.equipmentName}\n档案编号：${d.equipmentCode || ''}\n使用时间：${d.startUseTime || '--'} ~ ${d.endUseTime || '--'}\n`))
      })
      msg.push(h('p', { style: 'margin-top: 10px;font-weight: bold;' }, '其他检测任务的设备使用记录：'))
      overlapTask.forEach((d) => {
        const t1 = d.startUseTime ? formatDate(d.startUseTime, 2) : '--'
        const t2 = d.endUseTime ? formatDate(d.endUseTime, 2) : '--'
        msg.push(h('p', { style: 'margin-bottom: 6px;' }, `任务编号：${d.testTaskCode}\n记录编号：${d.testRecordCode}\n使用人：${d.userName}\n使用时间：${t1} ~ ${t2}\n`))
      })
      showDialog({
        title: '设备使用时间冲突',
        message: h('div', { style: 'text-align: left;' }, msg) as any,
        showCancelButton: true,
        width: '80%',
        confirmButtonText: '继续保存',
      }).then(() => {
        resolve(true)
      }).catch(() => {
        resolve(false)
      })
    })
  })
}

// 保存
async function onSubmit() {
  await formRef.value.validate()

  if (
    formData.value.startUseTime
    && formData.value.endUseTime
    && new Date(formData.value.startUseTime) > new Date(formData.value.endUseTime)
  ) {
    showDialog({
      title: '提示',
      message: '截止使用时间不能小于开始使用时间！',
    })
    return
  }

  try {
    showLoadingToast({ forbidClick: true, duration: 0 })
    const form = { ...formData.value }
    const eqs: SaveUseLogParam[] = []

    selectedEq.forEach((d) => {
      eqs.push({
        id: editData.value?.id || '',
        ...form,
        userName,
        userId,
        standard: d.standard,
        equipmentId: d.id,
        equipmentName: d.name,
        equipmentCode: d.equipmentSn || '',
        equipmentSn: d.equipmentSn || '',
        iotEquipmentId: d.iotEquipmentId || '',
        mac: d.mac || '',
      })
    })

    const params = {
      testObjectParamId: formData.value.testObjectParamId,
      useEquipmentsJson: JSON.stringify(eqs),
    }
    // 设备使用时间冲突检查：不同任务下同设备使用时间冲突
    const res = await request({
      url: `/ilis2/equipmentController.do?checkConflictedUseRecord`,
      method: 'POST',
      data: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      schema: z.object({
        obj: z.array(checkUseLogOverlap),
        success: z.boolean(),
      }),
    })
    // 设备使用时间冲突提示
    if (res.obj && res.obj.length > 0) {
      const isOk = await eqUseTimeOverlapTip(res.obj)
      if (!isOk)
        return
    }

    showLoadingToast({ forbidClick: true, duration: 0 })
    // 保存设备使用记录
    await request({
      url: `/ilis2/equipmentController.do?doSaveUseEquipments`,
      method: 'POST',
      data: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    showSuccessToast('保存成功')

    setTimeout(() => {
      emits('load')
      cancelModal()
    }, 500)
  }
  catch (err: any) {
    closeToast()
    log.error('新增设备使用记录失败：', err)
  }
}

function cancelModal() {
  showAdd.value = false
  formRef.value.resetValidation()
  formData.value = new AddRecordEntity()
  closeToast()
  emits('close')
}

/**
 * 扫码获取设备详情
 * @param ercode 二维码返回信息：http://192.168.2.65/ilis2/rest/app/equipment/goEquipmentDetail?id=402882c196148b42019614a01b7e06fe&unitCode=gfzx
 */
async function getEquipmentDetail(ercode: string) {
  try {
    showLoadingToast({ forbidClick: true, duration: 0 })
    const urlParam = new URLSearchParams(ercode.split('?')[1])
    const id = urlParam.get('id')
    const res = await request({
      url: `/ilis2/api/equipmentNewController?getById&id=${id}`,
      method: 'get',
      schema: z.object({
        success: z.boolean(),
        obj: taskParamEquipment,
      }),
    })
    if (res.success) {
      formData.value.equipmentId = res.obj.id
      formData.value.equipmentName = res.obj.name
      formData.value.equipmentCode = res.obj.equipmentSn || ''
      selectedEq = [res.obj]
    }
  }
  catch (err: any) {
    showDialog({
      title: '扫码获取设备详情失败',
      message: err.message || `系统异常，请联系系统管理员或稍后重试: ${ercode}`,
    })
    log.error('扫码获取设备详情失败', err)
  }
  closeToast()
}

function showModal(logData?: EquipmentUseLog) {
  editData.value = logData
  if (logData) {
    formData.value = {
      equipmentName: logData.equipmentName || '',
      equipmentId: logData.equipmentId || '',
      equipmentCode: logData.equipmentCode || '',
      testParamName: logData.testParamDisplayName || '',
      testParamId: logData.testObjectParamId || '',
      testObjectParamId: logData.testObjectParamId || '',
      startUseTime: logData.startUseTime ? dayjs(logData.startUseTime).format('YYYY-MM-DD HH:mm:ss') : '',
      endUseTime: logData.endUseTime ? dayjs(logData.endUseTime).format('YYYY-MM-DD HH:mm:ss') : '',
      startUseState: logData.startUseState || '正常',
      endUseState: logData.endUseState || '正常',
      remark: logData.remark || '',
    }
    selectedEq = [{
      id: logData.equipmentId || '',
      name: logData.equipmentName || '',
      equipmentSn: logData.equipmentCode || '',
    }]
  }
  else {
    formData.value = new AddRecordEntity()
  }
  isCheckEq.value = false
  udrVisible.value = false
  showAdd.value = true
}

/**
 * 通过扫码登记打开
 * @param ercode 扫码结果
 */
function showScanModal(ercode: string) {
  udrVisible.value = true
  showAdd.value = true
  isCheckEq.value = true
  getEquipmentDetail(ercode)
}

defineExpose({
  showModal,
  showScanModal,
})
</script>

<template>
  <BaseModal v-model:show="showAdd" :title="title" :udr-visible="udrVisible" @close="cancelModal">
    <div class="eq-use-record-add">
      <div class="custom-card">
        <van-form
          ref="formRef"
          class="custom-form"
          label-align="top"
          required="auto"
        >
          <van-field
            v-model="formData.testParamName"
            name="testParamName"
            placeholder="请选择检测参数"
            readonly
            label="检测参数"
            :right-icon="editData ? undefined : 'arrow'"
            :rules="[{ required: true, message: '请选择检测参数' }]"
            @click="chooseTestParams"
          />
          <van-field
            v-model="formData.equipmentName"
            name="equipmentName"
            placeholder="请选择设备"
            readonly
            label="设备名称"
            :right-icon="editData ? undefined : 'arrow'"
            :rules="[{ required: true, message: '请选择设备' }]"
            @click="chooseEquipment"
          />
          <van-field
            v-model="formData.equipmentCode"
            name="equipmentCode"
            placeholder="选择设备自动录入"
            readonly
            label="设备编号"
          />

          <FormItemDate
            v-model:value="formData.startUseTime"
            name="startUseTime"
            label="开始使用时间"
            placeholder="请选择开始使用时间"
            enable-time
          />

          <FormItemDate
            v-model:value="formData.endUseTime"
            name="endUseTime"
            label="截止使用时间"
            placeholder="请选择截止使用时间"
            enable-time
          />

          <van-field name="startUseState" readonly label="使用前状态">
            <template #input>
              <van-radio-group
                v-model="formData.startUseState"
                direction="horizontal"
                shape="dot"
              >
                <van-radio name="正常" icon-size="1.8rem">
                  正常
                </van-radio>
                <van-radio name="不正常" icon-size="1.8rem">
                  不正常
                </van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field name="endUseState" readonly label="使用后状态">
            <template #input>
              <van-radio-group
                v-model="formData.endUseState"
                direction="horizontal"
                shape="dot"
              >
                <van-radio name="正常" icon-size="1.8rem">
                  正常
                </van-radio>
                <van-radio name="不正常" icon-size="1.8rem">
                  不正常
                </van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field
            v-model="formData.remark"
            name="remark"
            placeholder="请输入备注"
            label="备注"
            type="textarea"
          />
        </van-form>
      </div>
    </div>

    <SelectedEquipment
      v-if="showAdd"
      ref="selectedEquipmentRef"
      :test-object-param-id="formData.testObjectParamId"
      @select="selectedEquipment"
    />

    <SelectedParams
      v-if="showAdd"
      ref="selectedParamsRef"
      @select="selectedParams"
    />

    <template #footer>
      <van-button type="primary" block @click="onSubmit">
        保存
      </van-button>
    </template>
  </BaseModal>
</template>

<style lang="less" scoped>
.eq-use-record-add {
  margin: 1.2rem 1.6rem;
  background-color: #fff;

  .custom-card{
    padding: 2.4rem;
  }
}

.van-radio--horizontal {
  margin-right: 5rem;
}

.custom-form .van-cell:last-child {
  margin-bottom: 0;
}

.custom-form .van-radio-group{
  padding-left: 1rem;
  margin-top: 1rem;
}

.icon-group{
  display: flex;
  align-items: center;
  column-gap: 1.6rem;
}
</style>
