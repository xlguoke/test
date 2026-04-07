<template>
  <div class="device-manage">
    <div class="l">
      <!-- 设备 -->
      <van-skeleton :row="20" :loading="loading">
        <DeviceList v-model:current-device="currentDevice" :data="listData"></DeviceList>
      </van-skeleton>
    </div>
    <div class="r">
      <!-- 操作 -->
      <div class="top-menu">
        <ScrollXContainer :style="{ display: 'flex', 'flex-shrink': 0, gap: '16px' }">
          <Container :class="{ 'menu-item': true, target: target === 0 }" @click="target = 0">
            <img src="@/assets/images/functionRoom2/device1.svg" alt="设备详情" />
            <div>设备详情</div>
          </Container>
          <Container :class="{ 'menu-item': true, target: target === 1 }" @click="target = 1">
            <img src="@/assets/images/functionRoom2/device2.svg" alt="操作指南" />
            <div>操作指南</div>
          </Container>
          <Container :class="{ 'menu-item': true, target: target === 2 }" @click="target = 2">
            <img src="@/assets/images/functionRoom2/device2.svg" alt="保养指南" />
            <div>保养指南</div>
          </Container>
          <Container :class="{ 'menu-item': true, target: target === 3 }" @click="target = 3">
            <img src="@/assets/images/functionRoom2/device3.svg" alt="校验详情" />
            <div>校验详情</div>
          </Container>
          <Container :class="{ 'menu-item': true, target: target === 4 }" @click="target = 4">
            <img src="@/assets/images/functionRoom2/device4.svg" alt="设备使用台账" />
            <div>设备使用台账</div>
          </Container>
          <Container :class="{ 'menu-item': true, target: target === 5 }" @click="target = 5">
            <img src="@/assets/images/functionRoom2/device3.svg" alt="期间核查详情" />
            <div>期间核查详情</div>
          </Container>
        </ScrollXContainer>
      </div>
      <Container class="content">
        <DeviceDetail v-show="target === 0" :id="currentDevice.id"></DeviceDetail>
        <DeviceManual v-show="target === 1" :id="currentDevice.id" :type="type"></DeviceManual>
        <KeepManual v-show="target === 2" :id="currentDevice.id" :type="type"></KeepManual>
        <Certification v-if="target === 3" :id="currentDevice.id"></Certification>
        <Record v-show="target === 4" :id="currentDevice.id"></Record>
        <PeriodCheck v-show="target === 5" :id="currentDevice.id" />
      </Container>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from "vue"
import DeviceList from "./components/DeviceList.vue"
import Container from "../../components/Container.vue"
import DeviceDetail from "./components/DeviceDetail.vue"
import DeviceManual from "./components/DeviceManual.vue"
import KeepManual from "./components/KeepManual.vue"
import Certification from "./components/Certification.vue"
import Record from "./components/Record.vue"
import { useRoute } from "vue-router"
import { useScreenHooks } from "@/hooks/useScreenHooks"
import { useStore } from "@/store"
import { DeviceEntity } from "@/views/deviceSmallScreen/Home/DeviceEntity"
import { parseAddressToObj } from "@/utils/utils"
import { showFailToast } from "vant"
import { getDeviceListWithoutDesc } from "@/api/deviceSmallScreen.api"
import pinyin from "js-pinyin"
import PeriodCheck from "./components/PeriodCheck.vue"
import ScrollXContainer from "./components/ScrollXContainer.vue"

pinyin.setOptions({ checkPolyphone: true, charCase: 0 })

const target = ref(0)

const {
  back,
  ids: backIds,
  target: initTarget, //初始面板
  type //初始类型（对应设备指南下的文件/视频）
} = useRoute().query as { ids: string; back?: string; target?: string; type?: string }

if (initTarget) {
  target.value = Number(initTarget)
}

const { refreshData } = useScreenHooks()

const { screenConfig, getUnitCode } = toRefs(useStore())

const listData = ref([])

const currentDevice = ref<DeviceEntity>({} as DeviceEntity)

const ids = computed(() => {
  if (back) {
    if (backIds) return backIds
    return ""
  }
  if (!screenConfig.value.url) return ""
  const query = parseAddressToObj(screenConfig.value.url)
  console.log("query", query)

  return query.ids || ""
})

const loading = ref(false)
async function getList() {
  if (!ids.value) return showFailToast("请配置设备。")
  loading.value = true
  const { data, code } = await getDeviceListWithoutDesc(ids.value).finally(() => {
    loading.value = false
  })
  if (code === 20000) {
    // 蜀工目前按排序号排序：他们按设备重要程度自行排序
    console.warn("蜀工单位，不显示首字母排序")
    if (getUnitCode.value() !== "sgjc") {
      data.forEach((d) => {
        const result = pinyin.getFullChars(d.name)
        const initial = result.slice(0, 1)
        if (/[a-zA-Z]/.test(initial)) {
          d.letter = initial
        } else {
          d.letter = "zzz"
        }
      })
      data.sort((a, b) => (a.letter > b.letter ? 1 : -1))
    }
    listData.value = data

    if (!currentDevice.value) {
      currentDevice.value = data[0]
    } else {
      currentDevice.value = data.find((item) => item.id === currentDevice.value.id) || data[0]
    }
  }
}

getList()
if (!back) {
  refreshData(getList)
}
</script>

<style lang="less" scoped>
.device-manage {
  display: flex;
  height: 100%;
  .l {
    height: 100%;
    width: 260px;
    margin-right: 24px;
  }
  .r {
    flex: 1;
    width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    .top-menu {
      user-select: none;
      position: relative;
      padding-bottom: 16px;
      margin-bottom: 16px;

      .menu-item {
        width: 23%;
        padding: 15px 0;
        display: flex;
        flex-shrink: 0;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-bottom: unset;
        transition: all 0.3s;
        &.target {
          background: #0066ec;
          color: #fff;
        }
        img {
          width: 0.88rem;
        }
      }
    }
    .content {
      position: relative;
      flex: 1;
      height: 0;
      width: 100%;
      overflow-y: auto;
      margin-bottom: unset;
      z-index: 2;
    }
  }
}
</style>
