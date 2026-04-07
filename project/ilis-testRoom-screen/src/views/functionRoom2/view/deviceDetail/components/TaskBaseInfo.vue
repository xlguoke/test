<template>
  <div class="task-baseinfo">
    <Container>
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
              <span class="label">检测人员：</span>
              <span class="value">张三</span>
            </span>
          </div>
        </div>
        <div class="info_r">
          <div class="info_item">
            <img src="@/assets/images/functionRoom2/timeIcon.png" alt="" />
            <span>
              <span class="label">要求报告时间：</span>
              <span class="value">09-24 15:10 -- 09-24 15:10</span>
            </span>
          </div>
        </div>
      </div>
    </Container>
    <CommonTitle>
      <template #icon>
        <img
          style="width: 100%; height: 100%"
          src="@/assets/images/functionRoom2/sampleIcon.png"
          alt=""
        />
      </template>
      样品信息
    </CommonTitle>
    <Container>
      <CommonLine class="line" label="样品名称：" value="路面标线用玻璃珠"></CommonLine>
      <CommonLine class="line" label="规格型号：" value="head-body"></CommonLine>
      <CommonLine class="line" label="工程部位/用途：" value="测试工程部位/用途"></CommonLine>
      <CommonLine
        class="line"
        label="检测部位："
        value="测试检测部位1;测试检测部位2;测试检测部位3"
      ></CommonLine>
      <CommonLine class="line" label="样品描述：" value="测试样品描述"></CommonLine>
      <CommonLine class="line" label="样品数量：" value="1g"></CommonLine>
      <CommonLine class="line" label="代表数量：" value="2m³"></CommonLine>
      <CommonLine class="line" label="生产日期：" value="2024-12-30 13:59:59"></CommonLine>
      <CommonLine class="line" label="批号：" value="***"></CommonLine>
      <CommonLine class="line" label="生产厂家：" value="***"></CommonLine>
      <CommonLine class="line" label="进场日期：" value="2024-12-30 13:59:59"></CommonLine>
      <CommonLine class="line" label="出厂编号：" value="CCBH-12138"></CommonLine>
    </Container>
    <CommonTitle>
      <template #icon>
        <img
          style="width: 100%; height: 100%"
          src="@/assets/images/functionRoom2/sampleIcon.png"
          alt=""
        />
      </template>
      送样信息
    </CommonTitle>
    <Container>
      <CommonSteps :steps="steps"></CommonSteps>
    </Container>
  </div>
</template>
<script lang="ts" setup>
import CommonLine from "@/views/functionRoom2/components/CommonLine.vue"
import CommonSteps from "@/views/functionRoom2/components/CommonSteps.vue"
import CommonTitle from "@/views/functionRoom2/components/CommonTitle.vue"
import Container from "@/views/functionRoom2/components/Container.vue"

const steps = [
  {
    title: "2024-12-30 13:59:59",
    content: "已送样"
  },
  {
    title: "2024-12-30 13:59:59",
    content: "已送样"
  },
  {
    title: "2024-12-30 13:59:59",
    content: "已送样"
  }
]
</script>
<style lang="less" scoped>
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
  &.action {
    display: flex;
    justify-content: flex-end;
    .btn + .btn {
      margin-left: 0.24rem;
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
