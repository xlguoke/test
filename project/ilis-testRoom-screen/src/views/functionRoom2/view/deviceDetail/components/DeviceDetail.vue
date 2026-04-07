<template>
  <div class="device-detail">
    <CommonTitle>
      <template #icon>
        <img style="width: 100%; height: 100%" src="@/assets/images/functionRoom2/infoIcon.png" />
      </template>
      基础信息
    </CommonTitle>
    <van-skeleton :row="10" class="line" :loading="loading1">
      <div>
        <CommonLine class="line" label="设备状态：" :value="deviceDetail.status"></CommonLine>
        <CommonLine class="line" label="资产编号：" :value="deviceDetail.assetSn"></CommonLine>
        <CommonLine
          class="line"
          label="检测管理编号："
          :value="deviceDetail.testManageSn"
        ></CommonLine>
        <CommonLine class="line" label="部门保管人：" :value="deviceDetail.keeperName"></CommonLine>
        <CommonLine class="line" label="存放位置：" :value="deviceDetail.storageSite"></CommonLine>
        <CommonLine class="line" label="规格型号：" :value="deviceDetail.standard"></CommonLine>
        <CommonLine class="line" label="量程：" :value="deviceDetail.eqRange"></CommonLine>
        <CommonLine class="line" label="精度：" :value="deviceDetail.accuracy"></CommonLine>
        <CommonLine class="line" label="外形尺寸：" :value="deviceDetail.size"></CommonLine>
        <CommonLine class="line" label="校检类型：" :value="deviceDetail.checkType"></CommonLine>
        <CommonLine
          class="line"
          label="校检周期："
          :value="`${deviceDetail.checkPeriod || '--'}${deviceDetail.checkPeriodUnit || ''}`"
        ></CommonLine>
        <CommonLine
          class="line"
          label="前次校检时间："
          :value="(deviceDetail.preCheckDate && formatDate(deviceDetail.preCheckDate)) || '--'"
        ></CommonLine>
        <CommonLine
          class="line"
          label="下次校检时间："
          :value="(deviceDetail.nextCheckDate && formatDate(deviceDetail.nextCheckDate)) || '--'"
        ></CommonLine>
        <CommonLine class="line" label="校检单位：" :value="deviceDetail.checkUnit"></CommonLine>
        <CommonLine
          class="line"
          label="纳入设备授权管理："
          :value="deviceDetail.isIot === IsIot.YES ? '是' : '否'"
        ></CommonLine>
        <CommonLine
          class="line"
          label="是否为公路水运系统相关设备："
          :value="deviceDetail.isGlsy === IsGlsy.YES ? '是' : '否'"
        ></CommonLine>
        <CommonLine
          class="line"
          label="所在位置："
          :value="deviceDetail.serveLocation"
        ></CommonLine>
      </div>
    </van-skeleton>
    <CommonTitle>
      <template #icon>
        <img style="width: 100%; height: 100%" src="@/assets/images/functionRoom2/infoIcon.png" />
      </template>
      其他信息
    </CommonTitle>
    <van-skeleton :row="10" class="line" :loading="loading1">
      <div>
        <CommonLine class="line" label="供应商：" :value="deviceDetail.supplierName"></CommonLine>
        <CommonLine
          class="line"
          label="供应商电话："
          :value="deviceDetail.supplierTel"
        ></CommonLine>
        <CommonLine
          class="line"
          label="购置日期："
          :value="(deviceDetail.buyDate && formatDate(deviceDetail.buyDate)) || '--'"
        ></CommonLine>
        <CommonLine
          class="line"
          label="投产日期："
          :value="(deviceDetail.operationDate && formatDate(deviceDetail.operationDate)) || '--'"
        ></CommonLine>
        <CommonLine class="line" label="出厂编号：" :value="deviceDetail.factorySn"></CommonLine>
        <CommonLine class="line" label="生产厂家：" :value="deviceDetail.factory"></CommonLine>
        <CommonLine
          class="line"
          label="厂家技术支持电话："
          :value="deviceDetail.factorySupportTel"
        ></CommonLine>
        <CommonLine
          class="line"
          label="出厂日期："
          :value="(deviceDetail.productionDate && formatDate(deviceDetail.productionDate)) || '--'"
        ></CommonLine>
        <CommonLine class="line" label="功率：" :value="deviceDetail.power"></CommonLine>
        <CommonLine class="line" label="出厂价：" :value="deviceDetail.factoryPrice"></CommonLine>
        <CommonLine class="line" label="净值：" :value="deviceDetail.netValue"></CommonLine>
        <CommonLine class="line" label="运杂费：" :value="deviceDetail.transportFee"></CommonLine>
        <CommonLine
          class="line"
          label="复杂系数(电)："
          :value="deviceDetail.coefficientElectronic"
        ></CommonLine>
        <CommonLine
          class="line"
          label="复杂系数(机)："
          :value="deviceDetail.coefficientMachine"
        ></CommonLine>
        <CommonLine
          class="line"
          label="复杂系数(热)："
          :value="deviceDetail.coefficientHot"
        ></CommonLine>
      </div>
    </van-skeleton>
    <CommonTitle>
      <template #icon>
        <img style="width: 100%; height: 100%" src="@/assets/images/functionRoom2/infoIcon.png" />
      </template>
      设备检测参数
    </CommonTitle>
    <van-skeleton :row="10" class="line" :loading="loading2">
      <div v-if="deviceParamList?.length">
        <Container v-for="item in deviceParamList" :key="item.id">
          <CommonLine class="line" label="检测大类：" :value="item.bigCategory"></CommonLine>
          <CommonLine class="line" label="试验参数系统名称：" :value="item.name"></CommonLine>
          <CommonLine
            class="line"
            label="试验参数显示名称："
            :value="item.displayName"
          ></CommonLine>
          <CommonLine label="备注：" :value="item.remark"></CommonLine>
        </Container>
      </div>
      <van-empty v-else description="暂无数据" :image="emptyImage" />
    </van-skeleton>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import {
  DeviceDetailEntity,
  DeviceParamEntity,
  IsGlsy,
  IsIot
} from "@/views/deviceSmallScreen/detail/DeviceDetailEntity"
import Container from "@/views/functionRoom2/components/Container.vue"
import { formatDate } from "@/utils/utils"
import CommonTitle from "@/views/functionRoom2/components/CommonTitle.vue"
import { getDeviceInfo, getDeviceParam } from "@/api/deviceSmallScreen.api"
import CommonLine from "@/views/functionRoom2/components/CommonLine.vue"
import emptyImage from "@/assets/images/functionRoom2/empty.svg"

const props = defineProps<{
  id: string
}>()

const deviceDetail = ref({} as DeviceDetailEntity)

const deviceParamList = ref([] as DeviceParamEntity[])

watch(
  () => props.id,
  () => {
    getDetail()
    getParam()
  }
)
const loading1 = ref(false)
const loading2 = ref(false)

/**
 * 获取设备详情
 */
async function getDetail() {
  if (!props.id) return
  loading1.value = true
  const { data, code } = await getDeviceInfo(props.id).finally(() => {
    loading1.value = false
  })
  if (code === 20000) {
    deviceDetail.value = data as DeviceDetailEntity
  }
}
async function getParam() {
  if (!props.id) return
  loading2.value = true
  const { data, code } = await getDeviceParam(props.id).finally(() => {
    loading2.value = false
  })
  if (code === 20000) {
    deviceParamList.value = data as DeviceParamEntity[]
  }
}

getDetail()
getParam()
</script>

<style lang="less" scoped>
.line {
  margin-bottom: 0.24rem;
}
</style>
