<template>
  <div>
    <div class="line">
      <div class="equipment-name line">
        {{ data.equipmentName }}
      </div>

      <div class="line line_flex">
        <div class="info_l">
          <div class="info_item">
            <CommonLine
              class="line"
              label="外出申请单号："
              align="left"
              :value="data.egressApplySn"
            >
              <template #icon>
                <img class="label-icon" src="@/assets/images/functionRoom2/taskIcon.svg" alt="" />
              </template>
            </CommonLine>
          </div>
        </div>
        <div class="info_r">
          <div class="info_item">
            <CommonLine class="line" label="借用人：" align="left" :value="data.borrowUser">
              <template #icon>
                <img class="label-icon" src="@/assets/images/functionRoom2/userIcon.svg" alt="" />
              </template>
            </CommonLine>
          </div>
        </div>
      </div>
      <div class="line line_flex">
        <div class="info_l">
          <div class="info_item">
            <CommonLine label="外出时间：" :value="egressTime" align="left">
              <template #icon>
                <img class="label-icon" src="@/assets/images/functionRoom2/timeIcon.svg" alt="" />
              </template>
            </CommonLine>
          </div>
        </div>
        <div class="info_r">
          <div class="info_item">
            <CommonLine label="需求日期：" :value="requiredDate" align="left">
              <template #icon>
                <img class="label-icon" src="@/assets/images/functionRoom2/timeIcon.svg" alt="" />
              </template>
            </CommonLine>
          </div>
        </div>
      </div>
      <div class="line line_flex">
        <div class="info_l">
          <div class="info_item">
            <CommonLine label="申请理由：" :value="data.reason || '-'" align="left">
              <template #icon>
                <img class="label-icon" src="@/assets/images/functionRoom2/taskIcon.svg" alt="" />
              </template>
            </CommonLine>
          </div>
        </div>
      </div>
    </div>
    <div class="line action">
      <CommonButton
        class="btn"
        @click="
          router.push({
            path: `/functionRoom2/eqOutApply/${data.id}`
          })
        "
      >
        查看详情
      </CommonButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EqOutApplyData } from "@/api/functionRoom2.api"
import { useRouter } from "vue-router"
import CommonButton from "@/views/functionRoom2/components/CommonButton.vue"
import CommonLine from "@/views/functionRoom2/components/CommonLine.vue"
import { useDateFormat } from "@vueuse/core"
import { computed } from "vue"

const props = defineProps<{
  data: EqOutApplyData
}>()

const egressTime = computed(() => {
  return props.data.egressTime ? useDateFormat(props.data.egressTime, "YYYY-MM-DD HH:mm:ss") : "-"
})

const requiredDate = computed(() => {
  return props.data.requiredDate ? useDateFormat(props.data.requiredDate, "YYYY-MM-DD") : "-"
})

const router = useRouter()
</script>

<style lang="less" scoped>
.equipment-name {
  white-space: nowrap;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.28rem;
  font-weight: 700;
}
.line {
  margin-bottom: 0.24rem;
  &:nth-last-child(1) {
    margin-bottom: 0rem;
  }
  &.line_flex {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    > .info_l,
    .info_r {
      flex: 1;
    }
  }
  &.action {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .btn + .btn {
      margin-left: 0.24rem;
    }
    .show_more {
      padding: 12px 20px;
      color: #0066ec;
    }
  }
  .info_item {
    display: flex;
    align-items: center;
    & + .info_item {
      margin-top: 0.16rem;
    }
    > span {
      flex: 1;
      display: flex;
      align-items: center;
      .label {
        white-space: nowrap;
        margin-right: 0.12rem;
      }
      .value {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    img {
      width: 0.24rem;
      height: 0.24rem;
      margin-right: 0.12rem;
    }
  }
}
</style>
