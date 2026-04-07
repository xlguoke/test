<template>
  <div class="main">
    <HomeTitle></HomeTitle>
    <template v-for="(item, index) in renderTemplate" :key="index">
      <component :is="item.component" :config="item.config" :lab-id="labId"></component>
    </template>
  </div>
</template>
<script lang="ts" setup>
import HomeTitle from "./components/HomeTitle.vue"
import { type Component, computed, inject, onUnmounted, provide, Ref, ref, toRefs } from "vue"
import { useStore } from "@/store"
import { functionRoom2Store } from "@/store/functionRoom2"
import { parseAddressToObj } from "@/utils/utils"
import { getLabDetail, getTemplateConfig } from "@/api/functionRoom2.api"
import { ModuleMap, WidgetList, HomeCustom, DefaultModule } from "."
import { onBeforeRouteLeave } from "vue-router"
import { IotDataRequest, TemHumData, TsSubCmdItem } from "@/utils/iotDataRequest"
import { ILabIotEq } from "@/interface/ILaboratory"

const { screenConfig } = toRefs(useStore())
const function2Store = functionRoom2Store()

const showSampleSend = inject<Ref<boolean>>("showSampleSend")

const iotDataRequest = new IotDataRequest()

const labId = computed(() => {
  if (!screenConfig.value.url) return ""
  const query = parseAddressToObj(screenConfig.value.url)
  return query.labId || ""
})

const templateConfig = ref<any>()

const renderTemplate = ref<any>([])
function initRenderTemplate(): any {
  console.log("templateConfig", templateConfig.value)
  const parsedData = JSON.parse(templateConfig?.value?.metadata || "{}")
  const renderWidgets = parsedData?.renderWidgets
  // 旧版本兼容
  if (renderWidgets === undefined || !templateConfig.value) {
    return Object.entries(DefaultModule).map((i) => {
      return {
        component: i[1],
        config: {}
      }
    })
  } else {
    const arr = [] as { component: Component; config: Record<string, any> }[]
    renderWidgets.forEach((i) => {
      const key = i.key
      if (ModuleMap[key] && !(key === WidgetList.SampleInfo && !showSampleSend?.value)) {
        arr.push({
          component: ModuleMap[key],
          config: i
        })
      }
      // 自定义组件
      if (i.category === "CUSTOM") {
        arr.push({
          component: HomeCustom,
          config: i
        })
      }
    })
    return arr
  }
}

async function getTempConfig() {
  const templateId = screenConfig.value.templateId
  if (templateId) {
    const { code, data } = await getTemplateConfig(templateId).catch((err) => {
      console.error(err)
    })
    if (code === 20000) {
      templateConfig.value = data
    }
  }
  renderTemplate.value = initRenderTemplate()
}

// 功能室温湿度数据
const iotTemHumData = ref<TemHumData["data"]>()

// 注入温湿度数据，需要的子组件不用再单独去获取
provide("iotTemHumData", iotTemHumData)

function listenIotData(listData: ILabIotEq[]) {
  const lData: TsSubCmdItem[] = []

  listData.forEach((item, index) => {
    if (item && item.iotEqId) {
      lData.push({
        entityType: "DEVICE",
        entityId: item.iotEqId,
        cmdId: index
      })
    }
  })

  if (lData.length === 0) {
    iotDataRequest.closeWebSocket()
    return
  }

  iotDataRequest.listenDataUpdate(lData, (res) => {
    iotTemHumData.value = res.data
  })
}

// 获取功能室信息
async function getLabData() {
  const { code, data } = await getLabDetail(labId.value)

  if (code === 20000) {
    function2Store.labData = data
    listenIotData([data?.info?.labIotEq as ILabIotEq])
  }
}

// 获取功能室配置的自定义资料项
function2Store.getCustomCompoent()

// 查看自定义资料项，离开页面时动态设置详情页标题
onBeforeRouteLeave((to, from, next) => {
  if (to.name === "customDetail") {
    to.meta.title = to.query.title
  }
  next()
})

async function initData() {
  await getLabData()
  getTempConfig()
}
initData()

onUnmounted(() => {
  iotDataRequest.closeWebSocket()
})
</script>
<style lang="less" scoped></style>
