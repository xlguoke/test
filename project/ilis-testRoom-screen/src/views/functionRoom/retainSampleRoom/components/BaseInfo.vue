<template>
  <div class="content-wrap flex-column">
    <RoomCard title="功能室信息" class="flex-column">
      <!-- 试验室信息 -->
      <RoomLabInfo :lab-info="labInfo" />
    </RoomCard>
    <RoomCard title="库存信息" class="flex-h-1 flex-column">
      <div id="contentWrap" class="expire-info-warp flex-column flex-1">
        <div class="inventory-total">
          <p class="num-box">
            库存总量
            <span class="num">{{ expireInfoData.total }}</span>
            组
            <span class="num-detail" @click="goDetails('ALL')">查看详情></span>
          </p>
          <p class="update-time">
            <van-icon name="clock" />
            <span>更新时间：{{ updateTime }}</span>
          </p>
        </div>

        <InventoryInfo
          title="到期信息"
          inline
          entry-txt="即将到期"
          out-txt="已超期"
          :entry-num="expireInfoData.threeDayExpire"
          :out-num="expireInfoData.expired"
          @entry="goDetails('THREE_DAY_EXPIRE')"
          @out="goDetails('EXPIRED')"
        />

        <div class="invantory-info-wrap mt">
          <InventoryInfo
            title="今日"
            :entry-num="expireInfoData.todayIn"
            :out-num="expireInfoData.todayOut"
            @click="goDetails(2)"
          />
          <InventoryInfo
            title="本周"
            :entry-num="expireInfoData.weekIn"
            :out-num="expireInfoData.weekOut"
            @click="goDetails(3)"
          />
          <InventoryInfo
            title="本月"
            :entry-num="expireInfoData.monthIn"
            :out-num="expireInfoData.monthOut"
            @click="goDetails(4)"
          />
        </div>
      </div>
    </RoomCard>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, watchEffect } from "vue"
import { message } from "ant-design-vue"
import { RoomCard, RoomLabInfo, InventoryInfo } from "../../components"
import { useBaseInfo } from "../../composables/useBaseInfo"
import { getStandardCuringRoom } from "@/api/retainSampleRoom.api"
import { formatDate } from "@/utils/utils"
import { useRouter } from "vue-router"
const { labInfo } = useBaseInfo()

const router = useRouter()
const loading = ref(inject("loading") as boolean)
let expireInfoData = ref({
  total: 0, // 库存总量
  threeDayExpire: 0, // 即将到期
  expired: 0, // 已过期
  todayIn: 0,
  todayOut: 0,
  weekIn: 0,
  weekOut: 0,
  monthIn: 0,
  monthOut: 0
})

// 最新更新日期
let updateTime = ref(formatDate(new Date(), 3))

const goDetails = (type) => {
  router.push({
    path: "/functionRoom/retainSampleRoomDetails",
    query: {
      type: type,
      labId: labInfo.value.id
    }
  })
}

const getStandardCuringRoomInfo = () => {
  if (!labInfo.value.id) return
  getStandardCuringRoom(labInfo.value.id)
    .then((res) => {
      loading.value = false
      if (res.code !== 20000) {
        return message.error(res.message || "系统异常，请稍后重试")
      }

      expireInfoData.value = res.data
      updateTime.value = formatDate(new Date(), 3)
    })
    .catch((err) => {
      loading.value = false
      console.error(err)
    })
}

watchEffect(() => {
  getStandardCuringRoomInfo()
})
</script>
