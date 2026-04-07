<template>
  <Container title="试验预约" link="/functionRoom2" link-text="查看更多">
    <div class="list">
      <div v-for="item in 2" :key="item" class="item">
        <div class="title line">
          <div class="name">混凝土抗压试验</div>
          <div class="status">试验进行中</div>
        </div>
        <div class="line">
          <span class="label">任务编号：</span>
          <span>RW241534564654</span>
        </div>
        <div class="line line_flex">
          <div class="info_l">
            <div class="info_item">
              <img src="@/assets/images/functionRoom2/userIcon.png" alt="" />
              <span>
                <span class="label">预约人员：</span>
                <span class="value">张三</span>
              </span>
            </div>
            <div class="info_item">
              <img src="@/assets/images/functionRoom2/rhIcon.png" alt="" />
              <span>
                <span class="label">预约湿度：</span>
                <span class="value">90%rh</span>
              </span>
            </div>
          </div>
          <div class="info_r">
            <div class="info_item">
              <img src="@/assets/images/functionRoom2/tIcon.png" alt="" />
              <span>
                <span class="label">预约温度：</span>
                <span class="value">25℃</span>
              </span>
            </div>
            <div class="info_item">
              <img src="@/assets/images/functionRoom2/timeIcon.png" alt="" />
              <span>
                <span class="label">任务时间：</span>
                <span class="value">09-24 15:10 -- 09-24 15:10</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Container>
</template>
<script lang="ts" setup>
import Container from "../../../components/Container.vue"
</script>
<style lang="less" scoped>
.item {
  border-top: 1px solid #ffffff;
  padding-top: 0.32rem;
  margin-top: 0.32rem;
}
.label {
  color: #707c8c;
}
.line {
  margin-bottom: 0.16rem;
  &:nth-last-child(1) {
    margin-bottom: 0rem;
  }
  &.line_flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
.title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .name {
    flex: 1;
    white-space: nowrap;
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .status {
    font-weight: bold;
    font-size: 0.28rem;
  }
}
</style>
