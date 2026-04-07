import { defineAsyncComponent } from "vue"

const HomeRoomInfo = defineAsyncComponent(() => import("./components/HomeRoomInfo.vue"))
const HomeDeviceInfo = defineAsyncComponent(() => import("./components/HomeDeviceInfo.vue"))
const HomeTemperatureInfo = defineAsyncComponent(
  () => import("./components/HomeTemperatureInfo.vue")
)
const HomeSampleSendManage = defineAsyncComponent(
  () => import("./components/HomeSampleSendManage.vue")
)
const HomeTask = defineAsyncComponent(() => import("./components/HomeTask.vue"))
const HomeEqOutApply = defineAsyncComponent(() => import("./components/HomeEqOutApply.vue"))
const HomeStandardRoom = defineAsyncComponent(() => import("./components/HomeStandardRoom.vue"))
const HomeExternalCheckRoom = defineAsyncComponent(
  () => import("./components/HomeExternalCheckRoom.vue")
)
const HomeStandardSubstanceRoom = defineAsyncComponent(
  () => import("./components/HomeStandardSubstanceRoom.vue")
)
const HomeSampleRoom = defineAsyncComponent(() => import("./components/HomeSampleRoom.vue"))
const HomeSampleStorageRoom = defineAsyncComponent(
  () => import("./components/HomeSampleStorageRoom.vue")
)
const HomeMedicineRoom = defineAsyncComponent(() => import("./components/HomeMedicineRoom.vue"))

export const HomeCustom = defineAsyncComponent(() => import("./components/HomeCustom.vue"))

/**
 * # 已有组件板块枚举
 * 调整后注意更新授权设备屏相应枚举与模块渲染逻辑
 */
export enum WidgetList {
  /** 功能室简介模块组件 */
  LabIntro = "LabIntro",
  /** # 任务模块组件 */
  Task = "Task",
  /** # 温湿度模块组件 */
  HumitureInfo = "HumitureInfo",
  /** # 送样模块组件 */
  SampleInfo = "SampleInfo",
  /** # 设备模块组件 */
  DeviceInfo = "DeviceInfo",
  /** # 设备外出申请管理 */
  EqOutApply = "EqOutApply",
  /** # 标养室 */
  StandardRoom = "StandardRoom",
  /** # 外检室 */
  ExternalCheckRoom = "ExternalCheckRoom",
  /** # 标准物质间 */
  StandardSubstanceRoom = "StandardSubstanceRoom",
  /** # 样品室 */
  SampleRoom = "SampleRoom",
  /** # 留样室 */
  SampleStorageRoom = "SampleStorageRoom",
  /** # 药品室 */
  MedicineRoom = "MedicineRoom"
}

export const DefaultModule = {
  [WidgetList.HumitureInfo]: HomeTemperatureInfo,
  [WidgetList.Task]: HomeTask,
  [WidgetList.DeviceInfo]: HomeDeviceInfo,
  [WidgetList.SampleInfo]: HomeSampleSendManage
}

export const ModuleMap = {
  [WidgetList.LabIntro]: HomeRoomInfo,
  [WidgetList.HumitureInfo]: HomeTemperatureInfo,
  [WidgetList.Task]: HomeTask,
  [WidgetList.DeviceInfo]: HomeDeviceInfo,
  [WidgetList.SampleInfo]: HomeSampleSendManage,
  [WidgetList.EqOutApply]: HomeEqOutApply,
  [WidgetList.StandardRoom]: HomeStandardRoom,
  [WidgetList.ExternalCheckRoom]: HomeExternalCheckRoom,
  [WidgetList.StandardSubstanceRoom]: HomeStandardSubstanceRoom,
  [WidgetList.SampleRoom]: HomeSampleRoom,
  [WidgetList.SampleStorageRoom]: HomeSampleStorageRoom,
  [WidgetList.MedicineRoom]: HomeMedicineRoom
}
