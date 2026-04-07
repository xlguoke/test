<template>
  <div class="common-steps">
    <div v-for="(item, index) in steps" :key="index" class="steps-item">
      <div class="title">
        <i class="step-icon">
          <i class="dot"></i>
        </i>
        {{ item.title }}
      </div>
      <div class="content">{{ item.content }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
export interface ICommonSteps {
  title?: string
  content?: string
}

defineProps<{
  steps: ICommonSteps[]
}>()
</script>
<style lang="less" scoped>
.common-steps {
  position: relative;
  .steps-item {
    padding: 0 0.3rem;
    border-left: 1px solid #0066ec;
    &:last-child {
      border-left: none;
    }
    .title {
      position: relative;
      margin-bottom: 0.16rem;
      .step-icon {
        display: inline-block;
        position: absolute;
        left: -0.42rem;
        top: 50%;
        transform: translateY(-50%);
        width: 0.24rem;
        height: 0.24rem;
        border-radius: 50%;
        border: 1px solid #0066ec;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #fff;

        .dot {
          width: 0.14rem;
          height: 0.14rem;
          border-radius: 50%;
          background-color: #0066ec;
        }
      }
    }
    .content {
      height: 1.4rem;
    }
  }
}
</style>
