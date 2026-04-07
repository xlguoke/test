<template>
  <Container>
    <div class="wapper">
      <div class="l">
        <div class="img">
          <img
            v-if="data?.tsAttachment?.realpath"
            class="photo"
            :src="data?.tsAttachment?.realpath"
            alt=""
          />
          <img v-else :src="dfPhoto" class="df-photo" alt="" />
        </div>
      </div>
      <div class="r">
        <div class="line">
          <div class="label">负责人</div>
          <div class="val">{{ data.biddingPersonName }}</div>
        </div>
        <div class="line">
          <div class="label">职称</div>
          <div class="val">{{ data.jobTitle }}</div>
        </div>
        <div class="line">
          <div class="label">电话</div>
          <div class="val">{{ data.phone }}</div>
        </div>
      </div>
    </div>
  </Container>
</template>
<script lang="ts" setup>
import { IBiddingPerson } from "@/interface/ILaboratory"
import Container from "@/views/functionRoom2/components/Container.vue"

const dfPhoto = new URL("@/assets/images/functionRoom2/people.png", import.meta.url).href

defineProps<{
  data: IBiddingPerson
}>()
</script>
<style lang="less" scoped>
.wapper {
  display: flex;
  .l {
    margin-right: 0.54rem;
    .img {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0.14rem;
      width: 2.85rem;
      height: 2.88rem;
      background: rgba(255, 255, 255, 0.5);
      border: 0.01rem solid #ffffff;
      box-sizing: border-box;
      border-radius: 0.16rem;
      .photo {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .df-photo {
        width: 1.5rem;
      }
    }
  }
  .r {
    flex: 1;
    font-size: 0.28rem;
    padding: 0.2rem;
    .line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.35rem;
      .val {
        margin-left: 0.2rem;
        flex: 1;
        text-align: right;
      }
    }
  }
}
</style>
