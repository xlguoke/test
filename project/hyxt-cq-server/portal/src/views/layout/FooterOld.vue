<!--
 * @Author: lijing
 * @Date: 2023-08-08 11:33:42
 * @LastEditors: your name
 * @LastEditTime: 2023-09-20 10:21:33
 * @Description: 
 * @FilePath: \portal\src\views\layout\Footer.vue
-->
<template>
  <div class="web-footer">
    <div class="page-content">
      <p style="padding: 5px 18px; width: 100%; color: #4a8de5" class="fl link-title">友情链接:</p>
      <div class="firendship-link clearfix">
        <a href="http://www.mot.gov.cn/" target="_blank" class="fl link-item">交通运输部</a>
        <a href="http://zizhan.mot.gov.cn/sj2019/anzhis/" target="_blank" class="fl link-item">
          交通运输部安全与质量监督管理司
        </a>
        <a href="https://ticc.ctvic.cn/home" target="_blank" class="fl link-item">
          中国交通建设监理协会试验检测工作委员会
        </a>
        <a href="https://jtj.cq.gov.cn" target="_blank" class="fl link-item">重庆市交通局</a>
        <a href="https://xyjt.jtj.cq.gov.cn:8088/gl" target="_blank" class="fl link-item">
          重庆市公路建设市场监督管理系统
        </a>
        <a href="https://xyjt.jtj.cq.gov.cn:8088/gl/sy" target="_blank" class="fl link-item">
          重庆市水运建设市场信用信息管理系统
        </a>
      </div>
      <p class="fangke">
        您是第
        <span class="num">{{ count }}</span>
        位访客
      </p>
      <p class="banquan">
        2022版权所有
        <a href="https://jtj.cq.gov.cn/" target="_blank" style="margin: 0 10px">重庆市交通局</a>
        联系电话：023-62806051 传真：023-62822494
        <!-- <a
          style="margin: 0 10px;"
          href="https://beian.miit.gov.cn/#/Integrated/index"
          target="_blank"
        >渝ICP09003439号</a> -->
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { getSysFlowRate } from "@/api/home.api"

const count = ref<number>(0)
onMounted(() => {
  getSysFlowRate().then((res) => {
    count.value = res || 0
  })
})
</script>

<style scoped lang="less">
.web-footer {
  margin-top: 60px;
  height: 200px;
  overflow: hidden;
  background: #f2f7fd;
  .link-title {
    font-size: 20px;
    font-weight: 700;
    color: @theme_color;
  }
  .firendship-link {
    padding: 28px 0 38px 0;
    line-height: 20px;
    border-bottom: 1px solid #92bbef;
    .link-item {
      margin-left: 20px;
      &:hover {
        color: @theme_color_hover;
      }
      &:not(:last-child)::after {
        content: "|";
        float: right;
        margin-left: 20px;
        color: #aaa;
        font-size: 12px;
      }
    }
  }
  .fangke {
    margin-top: 22px;
    .num {
      font-size: 16px;
      font-weight: 700;
      color: @theme_color;
    }
  }
  .banquan {
    margin-top: 16px;
  }
}
</style>
