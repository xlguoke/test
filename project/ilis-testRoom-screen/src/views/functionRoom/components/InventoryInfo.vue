<!-- 库存信息 -->
<template>
  <div class="inventory-info-item">
    <div class="info-title">{{ title }}</div>
    <div :class="`info-content ${inline ? 'info-content-inline' : ''}`">
      <div class="item">
        {{ entryTxt || "入库" }}
        <span class="mk">{{ entryNum || 0 }}</span>
        {{ unit || "组" }}
        <p v-if="inline" class="bg-btn bg-btn-min" @click="goDetailsEntry">查看详情</p>
      </div>
      <img src="@/assets/images/1111.png" class="line" />
      <div class="item">
        {{ outTxt || "出库" }}
        <span class="mk">{{ outNum || 0 }}</span>
        {{ unit || "组" }}
        <p v-if="inline" class="bg-btn bg-btn-min" @click="goDetailsOut">查看详情</p>
      </div>
      <div v-if="!inline" class="btn-box">
        <p class="bg-btn bg-btn-min" @click="goDetails">查看详情</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue"
interface PropsType {
  title: string
  entryNum: number
  outNum: number
  inline?: boolean
  entryTxt?: String
  outTxt?: String
  unit?: String
}
const emits = defineEmits(["click", "entry", "out"])
const props = defineProps<PropsType>()
const { title, entryNum, outNum, inline, entryTxt, outTxt, unit } = toRefs(props)

function goDetailsEntry() {
  emits("entry")
}
function goDetailsOut() {
  emits("out")
}
function goDetails() {
  emits("click")
}
</script>

<style lang="less" scoped>
.inventory-info-item {
  border: 1px solid rgba(0, 102, 236, 0.6);
  .info-title {
    background: url(@/assets/images/1122.png) no-repeat;
    background-size: 100% 100%;
    width: 100%;
    line-height: 0.7rem;
    text-align: center;
    font-size: 0.35rem;
    font-family: "YSFont";
  }

  .info-content {
    padding: 0.1rem 0 0.12rem;
    .line {
      display: block;
      margin: 0.1rem auto;
      width: 100%;
      height: 1px;
    }

    .item {
      text-align: center;
      font-family: "YSFont";
      letter-spacing: 2px;
      font-size: 0.3rem;
    }

    .mk {
      background: linear-gradient(180deg, #2cf1ff 0%, #2c8bff 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: #2c8bff;
      font-size: 0.45rem;
    }
  }
  .info-content-inline {
    display: flex;
    align-items: center;
    .line {
      margin: -0.6rem;
      transform: rotate(90deg);
      width: 1.2rem;
    }
    .item {
      flex: 1;
      .bg-btn {
        margin: 0.2rem auto 0;
        display: block;
        width: 2.2rem;
      }
    }
  }
  .btn-box {
    margin-top: 0.2rem;
    text-align: center;
  }
}
</style>
