<script setup lang='ts'>
import { onBeforeUnmount, ref, toRefs, watch } from 'vue'
import { z } from 'zod'
import dayjs from 'dayjs'
import { useSheetEqParamStore } from '../../provider/useSheetEqParamStore'
import { UdrLifecycle } from '../../provider/UdrLifecycle'
import { useDeviceDataCollectionStore } from '../../provider/useDeviceDataCollectionStore'
import { DeviceConnectionManager } from '../../provider/DeviceConnectionManager'
import SelectedEquipment from './components/SelectedEquipment.vue'
import { EqConnectionType, EquipmentType } from '.'
import type { IotDeviceCollectionDTO, IotDeviceDto, IotDeviceRecordDTO, UdrIotDataCollect } from '.'
import { udrCore } from '@/views/udr/provider/UdrCore'
import { useUdrStore } from '@/views/udr/provider/useUdrStore'
import { taskParam } from '@/type/equipment-use-register'
import type { TaskParam } from '@/type/equipment-use-register'

import { request } from '@/axios'
import type { User } from '@/stores/users'
import { useUserStore } from '@/stores/users'

interface EquipmentCollectionRecord {
  measureTime: number
  value: string
  testTaskId: string
  equipmentId: string
}

const btnIcon1 = new URL('@/assets/images/udr/eq-panel-seleq.svg', import.meta.url).href
const btnIcon2 = new URL('@/assets/images/udr/eq-panel-scan.svg', import.meta.url).href
const btnIcon3 = new URL('@/assets/images/udr/eq-panel-history.svg', import.meta.url).href
const btnIcon4 = new URL('@/assets/images/udr/eq-panel-delete.svg', import.meta.url).href
const btnIcon4A = new URL('@/assets/images/udr/eq-panel-delete-a.svg', import.meta.url).href
const eqDefaultIcon = new URL('@/assets/images/udr/eq-icon-default.svg', import.meta.url).href
const eqDefaultIconA = new URL('@/assets/images/udr/eq-icon-default-a.svg', import.meta.url).href
const eqYbkcIcon = new URL('@/assets/images/udr/eq-icon-ybkc.svg', import.meta.url).href
const eqYbkcIconA = new URL('@/assets/images/udr/eq-icon-ybkc-a.svg', import.meta.url).href
const eqDztpIcon = new URL('@/assets/images/udr/eq-icon-dztp.svg', import.meta.url).href
const eqDztpIconA = new URL('@/assets/images/udr/eq-icon-dztp-a.svg', import.meta.url).href

// 设备连接管理
let deviceConnectionManager: DeviceConnectionManager

const { getTestTaskId } = useUdrStore()

const { sheetName, panelManager } = toRefs(useUdrStore())

const { name: userName, id: userId } = useUserStore() as User

const sheetEqParamStore = useSheetEqParamStore()

const { addSheetEqParamRecord } = sheetEqParamStore
const { eqiumentParamUseRecordList } = toRefs(sheetEqParamStore)

const deviceDataCollectionStore = useDeviceDataCollectionStore()

const { reocrdUseDevice } = deviceDataCollectionStore

const { inUseCollectionDevice, collectionRecordMap } = toRefs(deviceDataCollectionStore)

const selectedEquipmentRef = ref()

const equipments = ref<IotDeviceDto[]>([])

const showDelete = ref(false)

const showParamList = ref(false)

const eqiumentParams = ref<TaskParam[]>([])

const selectedParamIds = ref<string[]>([])

const collectionDataWash = ref(false)

let collectionDataWashTimer: NodeJS.Timeout | null = null

watch(inUseCollectionDevice, (val) => {
  if (!val)
    panelManager.value.eqCollectionHistoryOpen = false
})

function chooseEquipment() {
  selectedEquipmentRef.value.showModal()
}

function addEquipment(eqs: IotDeviceDto[]) {
  const addedIds = equipments.value.map(i => i.id)

  for (let i = 0; i < eqs.length; i++) {
    const item = eqs[i]

    if (!addedIds.includes(item.id))
      equipments.value.push(item)
  }

  if (inUseCollectionDevice.value && eqiumentParams.value.length === 0)
    getParamByIotDevice(inUseCollectionDevice.value)
}

// 扫码结果
(window as any).eqCollectionScanCallback = async (ercode: string) => {
  if (!ercode.includes('goEquipmentDetail')) {
    udrCore.$this.setUdrVisibility(false)
    showDialog({
      title: '提示',
      message: '请扫描设备二维码！',
    }).finally(() => {
      udrCore.$this.setUdrVisibility(true)
    })
    return
  }

  const url = new URL(ercode)

  udrCore.$this.setUdrVisibility(false)
  showLoadingToast({ duration: 0, forbidClick: true })
  const res: any = await request(`/ilis2/rest/equipmentNewController?getById`, {
    params: {
      id: url.searchParams.get('id'),
    },
  }).finally(() => {
    closeToast()
  }).catch((err) => {
    showDialog({
      title: '提示',
      message: err.message,
    })
  })

  if (!res.obj) {
    showDialog({
      title: '提示',
      message: '未找到设备信息！',
    })
    return
  }

  showLoadingToast({ duration: 0, forbidClick: true })
  const deviceList = await request('/ilis2/rest/eq/device/list', {
    params: {
      type: EquipmentType.量具,
    },
  }).finally(() => {
    closeToast()
  }).catch((err) => {
    showDialog({
      title: '提示',
      message: err.message,
    })
  }) as IotDeviceDto[] | undefined

  if (deviceList) {
    const item = deviceList.find(i => i.eqsn === res.obj.equipmentSn)
    if (item) {
      if (equipments.value.find(i => i.id === item.id)) {
        showDialog({
          title: '提示',
          message: '该设备已添加！',
        })
      }
      else {
        addEquipment([item])
      }
    }
    else {
      showDialog({
        title: '提示',
        message: '请先将设备配置在物联网平台中！',
      })
    }
  }
  else {
    showDialog({
      title: '提示',
      message: '请先将设备配置在物联网平台中！',
    })
  }
}

function scanEquipment() {
  udrCore.$this.startScanErCode('udr-main', 'eqCollectionScanCallback')
}

// 查看设备采集历史
function checkCollectionHistory() {
  if (panelManager.value.eqCollectionHistoryOpen) {
    panelManager.value.eqCollectionHistoryOpen = false
    return
  }

  if (!inUseCollectionDevice.value) {
    // eslint-disable-next-line no-alert
    alert('请先选择设备！')
    return
  }

  showDelete.value = false
  panelManager.value.eqCollectionHistoryOpen = true
}

function onDelete(item: IotDeviceDto) {
  equipments.value = equipments.value.filter(i => i.id !== item.id)

  if (item.id === inUseCollectionDevice.value?.id) {
    inUseCollectionDevice.value = null

    if (item.connectionType === EqConnectionType.蓝牙)
      udrCore.$this.disconnectIotDevice(item.id)
  }

  if (!equipments.value.length)
    showDelete.value = false
}

// 取消订阅
function destorySubscribeDeviceCb() {
  (window as any).btnSubscribeIot_callback = null
}

// 订阅物联网设备数据
function subscribeDeviceData(item: IotDeviceDto) {
  const callbackKey = `btnSubscribeIot_callback`

  // 该控制的意义：
  // 订阅事件可能会推送几条之前采集过的数据，之前的控制逻辑为采集时间大于当前时间60秒的都不管
  // 但用户在断开连接的情况下，采集数据后立马连接设备，返回的采集时间为当前，此处根据该参数限制刚订阅时收到的采集信息一律不管
  collectionDataWash.value = true

  if (collectionDataWashTimer) {
    clearTimeout(collectionDataWashTimer)
    collectionDataWashTimer = null
  }

  setTimeout(() => {
    collectionDataWash.value = false
  }, 3000)

  ;(window as any)[callbackKey] = (cData: string) => {
    if (collectionDataWash.value)
      return

    const parseData: IotDeviceCollectionDTO = JSON.parse(cData)

    // 采集设备ID
    const deviceId = parseData.data?.data[0]?.entityId?.id
    // 采集数据
    const value = parseData.data?.data[0]?.latest?.TIME_SERIES?.value?.value
    // 采集时间
    const ts = parseData.data?.data[0]?.latest?.TIME_SERIES?.value?.ts

    // 控制采集的数据为用户当前选中的设备
    if (inUseCollectionDevice.value?.id !== deviceId)
      return

    // 没有值不管，可能是发送的其他信息并非采集数据信息
    if (!value)
      return

    // 由于刚订阅设备时，设备会推送几条最近的数据，此处根据时间来频闭这种错误
    if (dayjs().diff(dayjs(ts), 's') > 60)
      return

    // 没选参数时，即使采集了数据也不允许录入
    if (!selectedParamIds.value.length) {
      udrCore.$this.setUdrVisibility(false)
      showDialog({
        title: '提示',
        message: '请先选择参数！',
      }).then(() => {
        udrCore.$this.setUdrVisibility(true)
      })
      return
    }

    // 将读取的数据应用到UDR
    const data: UdrIotDataCollect = {
      deviceId: inUseCollectionDevice.value?.id as string,
      deviceName: inUseCollectionDevice.value?.name as string,
      deviceTypeName: inUseCollectionDevice.value?.name as string,
      data: [value],
    }

    udrCore.$this.iotDataCollect(JSON.stringify(data))

    // 记录参数使用记录
    eqiumentParams.value.filter(p => selectedParamIds.value.includes(p.testParamId)).forEach((item) => {
      if (inUseCollectionDevice.value)
        addSheetEqParamRecord(sheetName.value, { ...inUseCollectionDevice.value }, { ...item })
    })
  }

  udrCore.$this.subscribeDataChange(item.id, 'udr-main', callbackKey)
}

// 取消选择设备
function onCancelSelectDevice() {
  if (!inUseCollectionDevice.value)
    return

  // 蓝牙设备断开连接
  if (inUseCollectionDevice.value.connectionType === EqConnectionType.蓝牙)
    udrCore.$this.disconnectIotDevice(inUseCollectionDevice.value.id)

  // 取消使用中设备标记
  inUseCollectionDevice.value = null

  // 销毁订阅监听回调方法
  destorySubscribeDeviceCb()

  if (collectionDataWashTimer) {
    clearTimeout(collectionDataWashTimer)
    collectionDataWashTimer = null
  }
}

// 选择设备
async function onSelectDevice(item: IotDeviceDto) {
  // 当前使用设备ID
  const inUseDeviceId = inUseCollectionDevice.value?.id

  // 取消已选设备
  onCancelSelectDevice()

  // 关闭设备占用连接
  deviceConnectionManager.closeUseConnect()

  // 点击相同设备忽略
  if (inUseDeviceId && item.id === inUseDeviceId)
    return

  // 主设备只能查看历史采集记录，其他逻辑不管
  if (item.type === EquipmentType.主设备) {
    inUseCollectionDevice.value = item
    return
  }

  udrCore.$this.setUdrVisibility(false)

  // 设备抢占
  const result = await deviceConnectionManager.connectDevice(item)

  if (!result)
    return

  // 记录使用设备
  reocrdUseDevice(item)

  // 获取设备关联参数
  getParamByIotDevice(item)

  // 记录当前选中设备
  inUseCollectionDevice.value = item

  try {
    if (item.connectionType === EqConnectionType.蓝牙) {
      // 蓝牙连接设备
      udrCore.$this.connectIotDevice(item.id)
    }

    // 订阅物联网设备
    subscribeDeviceData(item)
  }
  catch (e: any) {
    // eslint-disable-next-line no-alert
    alert(`【${item.name}】订阅失败：${e.message}`)
  }

  udrCore.$this.setUdrVisibility(true)
}

/** 设备关联参数api */
async function getParamApi(equipmentCode?: string) {
  try {
    return await request({
      url: `/ilis2/testTask/testParam/${getTestTaskId()}`,
      method: 'get',
      params: {
        equipmentCode,
      },
      schema: z.array(taskParam),
    })
  }
  catch (err) {
    console.error(err)
    return []
  }
}

const loadParam = ref(false)
/** 获取设备关联参数 */
async function getParamByIotDevice(item: IotDeviceDto) {
  if (item.type === EquipmentType.主设备)
    return

  eqiumentParams.value = []
  showParamList.value = true
  loadParam.value = true
  let isSelected = true
  // 获取任务下设备关联的参数，存在时默认选中
  let params = await getParamApi(item.eqsn)
  // 如果没有关联参数，则获取任务下所有参数
  if (params.length === 0) {
    isSelected = false
    params = await getParamApi()
  }

  eqiumentParams.value = params

  if (isSelected)
    selectedParamIds.value = params.map(p => p.testParamId)
  else
    selectedParamIds.value = []

  loadParam.value = false

  closeToast()
}

/** 选择参数 */
function onSelectParams(item: TaskParam) {
  if (selectedParamIds.value.includes(item.testParamId))
    selectedParamIds.value = selectedParamIds.value.filter(id => id !== item.testParamId)
  else
    selectedParamIds.value.push(item.testParamId)

  ;(event as any).target?.blur()
}

// 保存使用设备时，采集到的数据
async function saveCollectValues() {
  const equipmentCollectionRecord: EquipmentCollectionRecord[] = []

  for (const equipmentId in collectionRecordMap.value) {
    const res: any = await request('/ilis2/rest/eq/iot/device/values', {
      params: {
        iotEquipmentId: equipmentId,
        start: collectionRecordMap.value[equipmentId],
        end: '',
      },
    });

    (res.value || []).forEach((vItem: IotDeviceRecordDTO) => {
      equipmentCollectionRecord.push({
        measureTime: vItem.ts,
        value: vItem.value,
        testTaskId: getTestTaskId(),
        equipmentId,
      })
    })
  }

  if (!equipmentCollectionRecord.length)
    return

  await request('/ilis2/rest/data/gather/measure/values', {
    method: 'post',
    data: equipmentCollectionRecord,
  })
}

/**
 * 保存使用记录
 */
async function saveEquipmentUseLog() {
  const endUseTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  const eq2StartUseTime: Record<string, string> = {}

  // 找出最小的开始时间
  eqiumentParamUseRecordList.value.forEach((item) => {
    if (!eq2StartUseTime[item.equipment.id] || new Date(eq2StartUseTime[item.equipment.id]) > new Date(item.startUseTime))
      eq2StartUseTime[item.equipment.id] = item.startUseTime
  })

  const data: Array<{
    testObjectParamId: string
    useEquipmentsJson: any[]
  }> = []

  eqiumentParamUseRecordList.value.forEach((item) => {
    const paramItem = data.find(i => i.testObjectParamId === item.taskParam.testObjectParamId)
    const eqJson = {
      sourceFrom: 'IOT_AUTO_CREATE',
      id: '',
      equipmentId: item.equipment.equipmentId,
      equipmentName: item.equipment.equipment || '',
      equipmentCode: item.equipment.eqsn || '',
      equipmentSn: item.equipment.eqsn || '',
      iotEquipmentId: item.equipment.id,
      mac: item.equipment.mac || '',
      standard: '',
      userId,
      userName,
      startUseTime: eq2StartUseTime[item.equipment.id],
      endUseTime,
      startUseState: '正常',
      endUseState: '正常',
    }

    if (!paramItem) {
      data.push({
        testObjectParamId: item.taskParam.testObjectParamId,
        useEquipmentsJson: [eqJson],
      })
    }
    else {
      paramItem.useEquipmentsJson.push(eqJson)
    }
  })

  if (!data.length)
    return

  for (let i = 0; i < data.length; i++) {
    const d = data[i]

    await request({
      url: `/ilis2/equipmentController.do?doSaveUseEquipments`,
      method: 'POST',
      data: {
        testObjectParamId: d.testObjectParamId,
        useEquipmentsJson: JSON.stringify(d.useEquipmentsJson),
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).catch((e) => {
      console.error(e)
    })
  }

  eqiumentParamUseRecordList.value = []
}

UdrLifecycle.subscribe('OnFileOpenAfter', () => {
  if (!deviceConnectionManager)
    deviceConnectionManager = new DeviceConnectionManager(onCancelSelectDevice)
})

// udr切换任务
UdrLifecycle.subscribe('OnTestTaskChanged', () => {
  // 切换任务需要取消使用设备
  onCancelSelectDevice()
  deviceConnectionManager.closeUseConnect()
})

// udr保存成功后，需要保存设备采集记录
UdrLifecycle.subscribe('OnSaveComplete', async (status) => {
  if (status === 1) {
    udrCore.$this.setUdrVisibility(false)
    const loading = showLoadingToast({ duration: 0, forbidClick: true })
    // 保存采集数据
    await saveCollectValues()
    // 保存使用记录
    await saveEquipmentUseLog()
    loading.close()
    udrCore.$this.setUdrVisibility(true)

    collectionRecordMap.value = {}
    if (inUseCollectionDevice.value)
      reocrdUseDevice(inUseCollectionDevice.value)
  }
})

onBeforeUnmount(() => {
  // 页面离开时，取消设备占用
  onCancelSelectDevice()

  // 关闭设备占用连接
  deviceConnectionManager.closeUseConnect()
})
</script>

<template>
  <div class="udr-main-device">
    <div class="panel-main">
      <div class="panel-content">
        <div v-if="equipments.length === 0" class="no-data">
          <img src="@/assets/images/udr/eq-panel-nodata.svg" alt="">
          <p>暂无设备，请添加！</p>
        </div>
        <div v-else>
          <div class="device-list">
            <div
              v-for="item in equipments"
              :key="item.id"
              class="device-list-item"
              :class="{
                active: inUseCollectionDevice?.id === item.id,
              }"
              @click="onSelectDevice(item)"
            >
              <div class="device-list-box">
                <img v-if="item.measureEqType === '游标卡尺'" class="device-list-box-d" :src="inUseCollectionDevice?.id === item.id ? eqYbkcIconA : eqYbkcIcon" />
                <img v-else-if="item.measureEqType === '电子天平'" class="device-list-box-d" :src="inUseCollectionDevice?.id === item.id ? eqDztpIconA : eqDztpIcon" />
                <img v-else class="device-list-box-d" :src="inUseCollectionDevice?.id === item.id ? eqDefaultIconA : eqDefaultIcon" />

                <van-icon v-if="showDelete" name="clear" class="device-list-del" @click.stop="onDelete(item)" />
              </div>
              <div class="device-list-name">
                {{ item.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="panel-handler">
        <van-button :icon="btnIcon1" size="small" @click="chooseEquipment">
          添加设备
        </van-button>
        <van-button :icon="btnIcon2" size="small" @click="scanEquipment">
          扫码添加设备
        </van-button>
        <van-button
          :class="{ active: panelManager.eqCollectionHistoryOpen }"
          :icon="btnIcon3"
          size="small"
          @click="checkCollectionHistory"
        >
          设备采集历史
        </van-button>
        <van-button
          :icon="showDelete ? btnIcon4A : btnIcon4"
          size="small"
          :type="showDelete ? 'danger' : 'default'"
          @click="() => {
            if (!equipments.length) {
              return
            }
            showDelete = !showDelete;
          }"
        >
          移除设备
        </van-button>
        <van-button
          :disabled="inUseCollectionDevice?.type === EquipmentType.主设备"
          size="small"
          @click="showParamList = !showParamList"
        >
          <van-icon :name="`${showParamList ? 'arrow-up' : 'arrow-down'}`" />
          参数选择
        </van-button>
      </div>

      <div v-show="showParamList" class="param-list-wrap">
        <van-button
          v-for="d in eqiumentParams" :key="d.id"
          size="small"
          :type="selectedParamIds.includes(d.testParamId) ? 'primary' : 'default'"
          @click="onSelectParams(d)"
        >
          {{ d.name }}
        </van-button>
        <div v-if="loadParam" style="flex:1;padding-top: 0.4rem;text-align: center;">
          <van-loading type="spinner" color="#0066ec" size="2rem" />
          <p style="color:#0066ec;font-size:12px;margin-top: 0.8rem">
            正在加载参数信息...
          </p>
        </div>
        <div v-else-if="eqiumentParams.length === 0" style="flex:1;padding-top: 0.4rem;text-align: center;">
          <p style="color:#999;font-size:12px;">
            暂无参数信息
          </p>
        </div>
      </div>
    </div>

    <!-- 选择设备 -->
    <SelectedEquipment ref="selectedEquipmentRef" @select="addEquipment" />
  </div>
</template>

<style scoped lang="less">
.udr-main-device{
  margin: 1.6rem 2.4rem 0;

  .device-list {
    display: flex;
    gap: 54px;
  }

  .device-list-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;

    &.active .device-list-box {
      border-color: #0066EC;
    }
  }

  .device-list-name {
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: #3D3D3D;
    width: 100%;
    text-align: center;
  }

  .device-list-del {
    position: absolute;
    right: -0.8rem;
    top: -0.8rem;
    font-size: 1.6rem;
    color: #FF6666;
    cursor: pointer;
  }

  .device-list-box {
    width: 5.4rem;
    height: 5.4rem;
    border-radius: 4px;
    border: 1px solid #EEEEEE;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    background: #fff;

    .device-list-box-connect {
      position: absolute;
      right: 0;
      top: 0;
      width: 2.6rem;
    }
  }

  .panel-main {
    padding: 1.6rem;
    background-color: #fff;
    box-shadow: 0px 3px 8px 0px rgba(0, 102, 236, 0.1);
  }

  .no-data{
    text-align: center;
    color: #aaa;
    margin: 20px 0;
    margin-top: 1.2rem;
    margin-bottom: 2.4rem;
  }

  .panel-handler{
    display: flex;
    flex-wrap: wrap;
    column-gap: 1.2rem;
    row-gap: 0.8rem;
    padding-top: 1.2rem;
    margin-top: 1.2rem;
    border-top: 1px solid #eee;

    .van-button {
      font-size: 1.4rem;

      &.active {
        background: #0066EC;
        color: #fff;

        :deep(.van-icon__image){
          filter: invert(100%) brightness(200%) contrast(105%);
        }
      }
    }

    :deep(.van-icon__image){
      width: 1.6rem;
      height: 1.6rem;
    }
  }
}

.param-list-wrap{
  padding-top: 1rem;
  margin-top: 1.2rem;
  display: flex;
  column-gap: 1.2rem;
  row-gap: 0.8rem;
  border-top: 1px dashed #eee;
  overflow: hidden;
  transition: 0.2s;
}
</style>
