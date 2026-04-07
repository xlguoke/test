<template>
  <div class="content-wrap flex-column">
    <RoomCard title="功能室信息" class="flex-column">
      <!-- 试验室信息 -->
      <RoomLabInfo :lab-info="labInfo" />
    </RoomCard>
    <RoomCard title="库存信息" class="flex-column flex-h-1">
      <div class="flex-1">
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

        <div class="invantory-info-wrap">
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
import api from "@/api/sampleRoom.api"
import { formatDate } from "@/utils/utils"
import { useRouter } from "vue-router"
const { labInfo } = useBaseInfo()

const router = useRouter()
const loading = ref(inject("loading") as boolean)
// 样品室统计数据
let expireInfoData = ref({
  total: 0, // 库存总量
  todayExpire: 0, // 今日过期
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
    path: "/functionRoom/sampleRoomDetails",
    query: {
      type: type,
      labId: labInfo.value.id,
      unitName: ""
    }
  })
}

/**
 * 获取样品室统计数据
 */
const getSampleRoomInfo = () => {
  if (!labInfo.value.id) return
  // 通过结构获取样品室统计数据
  api
    .getStatistics(labInfo.value.id)
    .then((res) => {
      loading.value = false
      if (res.code !== 20000) {
        return message.error(res.message || "系统异常，请稍后重试")
      }
      expireInfoData.value = res.data
      updateTime.value = formatDate(new Date(), 3)
      console.log(updateTime)
    })
    .catch((err) => {
      loading.value = false
      console.error(err)
    })
}

watchEffect(() => {
  getSampleRoomInfo()
})
</script>
<style scoped lang="less">
.inventory-total {
  margin-top: 0.25rem;
  margin-bottom: 0.3rem;
  text-align: center;
  font-family: "YSFont";
  letter-spacing: 2px;

  .num-box {
    font-size: 0.35rem;
    display: inline-block;
    position: relative;

    .num {
      font-size: 0.64rem;
      text-shadow: 0px 0px 10px #00c8ff;
      vertical-align: middle;
      display: inline-block;
      margin-bottom: 4px;
    }
  }

  .num-detail {
    font-size: 0.24rem;
    background: linear-gradient(180deg, #2cf1ff 0%, #2c8bff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: #2c8bff;
    position: absolute;
    right: -2.3rem;
    top: 46%;
    transform: translateY(-50%);
    padding: 0.16rem;
  }

  .update-time {
    font-size: 0.24rem;
    text-shadow: 0px 0px 4px #50c9f8;
    .van-icon {
      margin-right: 0.06rem;
      color: #bceaff;
      box-shadow: 0px 0px 2px 0px #0066ec;
    }
  }
}
.invantory-info-wrap {
  display: flex;
  justify-content: space-between;
  padding: 0 0.3rem;
  .inventory-info-item {
    width: 32%;
  }
}
</style>
