<template>
  <div class="web-footer">
    <!-- <div class="web-footer-link">
      <ul class="web-links">
        <li
          v-for="(item, i) in webLinksData"
          :key="i"
          class="web-links-item"
          @click.stop="tiggleShow(i)"
        >
          <span class="text">{{ item.title }}</span>
          <DownOutlined :class="`${item.show ? 'show' : ''}`" />
          <ul :class="`web-link ${item.show ? 'show' : ''}`">
            <li v-for="(d, j) in item.children" :key="i + j + ''" class="item">
              <a :href="d.link" target="_blank">{{ d.title }}</a>
            </li>
          </ul>
        </li>
      </ul>
    </div> -->
    <div class="page-content firends-link">
      <p class="title fl">相关链接</p>
      <div class="firendship-link clearfix">
        <a href="http://www.mot.gov.cn/" target="_blank" class="fl link-item">交通运输部</a>
        <a href=" https://www.ttiis.cn/" target="_blank" class="fl link-item">
          公路水运工程质量检测管理信息系统
        </a>
        <a href="http://zizhan.mot.gov.cn/sj2019/anzhis/" target="_blank" class="fl link-item">
          交通运输部安全与质量监督管理司
        </a>
        <a href="https://ticc.ctvic.cn/home" target="_blank" class="fl link-item">
          中国交通建设监理协会试验检测工作委员会
        </a>
        <a href="https://jtj.cq.gov.cn" target="_blank" class="fl link-item">
          重庆市交通运输委员会
        </a>
        <a href="https://xyjt.jtj.cq.gov.cn:8088/gl" target="_blank" class="fl link-item">
          重庆市公路建设市场监督管理系统
        </a>
        <a href="https://xyjt.jtj.cq.gov.cn:8088/gl/sy" target="_blank" class="fl link-item">
          重庆市水运建设市场信用信息管理系统
        </a>
      </div>
    </div>
    <div style="display: none">{{ count }}</div>
    <div class="footer-info">
      <div class="xhy-flinka underlines">
        <a href="https://jtj.cq.gov.cn/ggbf_search/lxwm/" target="_blank">联系我们</a>
        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
        <a href="https://jtj.cq.gov.cn/ggbf_search/wzdt/" target="_blank">网站地图</a>
        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
        <a href="https://jtj.cq.gov.cn/ggbf_search/bqsm/" target="_blank">版权声明</a>
      </div>
      <p>版权所有 重庆市交通运输委员会 &nbsp;&nbsp;&nbsp; 主办单位：重庆市交通运输委员会</p>
      <p>
        <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">
          ICP备案：渝ICP备2021005620号-2
        </a>
        &nbsp;&nbsp;&nbsp;&nbsp;网站标识码：5000000041 &nbsp;&nbsp;
        <a
          href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=50011202501695"
          target="_blank"
        >
          <img src="@/assets/images/m8-badge1.png" alt="" />
          渝公网安备50011202501695号
        </a>
      </p>
      <p>重庆市交通运输委员会值班电话：023-89183000 &nbsp;&nbsp;&nbsp; 传真：023-89183222</p>
      <p>行政审批咨询电话：023-88754038 &nbsp;&nbsp;&nbsp; 服务监督电话：023-12328</p>
      <p>公路、水运建设市场信用系统咨询电话：023-88754038</p>

      <div class="xhy-badges">
        <a
          href="http://bszs.conac.cn/sitename?method=show&amp;id=2A36EF07B79F7931E053022819ACE4E3"
          target="_blank"
        >
          <img src="@/assets/images/m8-badge2.png" alt="" />
        </a>
        &nbsp;&nbsp;&nbsp;
        <a
          href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=50011202501695"
          target="_blank"
        >
          <img src="@/assets/images/m8-badge3.png" alt="" />
        </a>
        <span style="margin-left: 13px">
          <span id="_span_jiucuo" style="display: inline-block">
            <img
              onclick="Link('5000000041')"
              style="margin: 0; border: 0; cursor: pointer"
              src="https://zfwzgl.www.gov.cn/exposure/images/jiucuo.png?v=5000000041"
            />
          </span>
        </span>
        <a target="_blank" href="http://wza.isc.org.cn/rzpt/bsgl/dt/20230311/1452.html">
          <img style="width: 120px" src="@/assets/images/wzalogobottom.png" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { DownOutlined } from "@ant-design/icons-vue"
import webLinks from "@/assets/js/webLinks"
import { getSysFlowRate } from "@/api/home.api"

const webLinksData = ref<any>()
const count = ref<number>(0)
onMounted(() => {
  const list = [...webLinks]
  for (let i = 0; i < list.length; i++) {
    const link = list[i]
    link.show = false
  }
  webLinksData.value = list

  document.onclick = function () {
    webLinksData.value.forEach((item) => {
      item.show = false
    })
  }

  getSysFlowRate().then((res) => {
    count.value = res || 0
  })
})

const tiggleShow = (ind) => {
  const list = webLinksData.value
  for (let i = 0; i < list.length; i++) {
    if (ind === i) {
      list[i].show = !list[i].show
    } else {
      list[i].show = false
    }
  }
  webLinksData.value = list
}
</script>

<style scoped lang="less">
.web-footer {
  margin-top: 60px;
  overflow: hidden;
  background: #fff;
  a:hover {
    color: #333;
  }
  .web-footer-link {
    text-align: center;
    border-bottom: 1px solid #ddd;
  }
  .web-links {
    display: inline-block;
    .web-links-item {
      display: inline-block;
      position: relative;
      width: 200px;
      line-height: 57px;
      text-align: center;
      cursor: pointer;
      &:not(:last-child)::after {
        content: "";
        position: absolute;
        right: 0;
        top: 20px;
        width: 1px;
        height: 16px;
        background-color: @theme_color;
      }
      .text {
        margin-right: 8px;
        font-size: 15px;
      }
      .anticon {
        font-size: 12px;
        color: #aaa;
        transition: 0.5s;
        &.show {
          transform: rotate(180deg);
        }
      }
    }
  }
  .web-link {
    position: absolute;
    left: 0;
    top: 58px;
    z-index: 10;
    padding: 0 15px;
    height: 0;
    width: 200px;
    overflow: hidden;
    line-height: 24px;
    font-size: 12px;
    text-align: left;
    background-color: #fff;
    border: 1px solid #ddd;
    border-top: none;
    transition: 0.5s;
    opacity: 0;
    &.show {
      height: 100px;
      opacity: 1;
      overflow-y: auto;
    }
    .item {
      white-space: nowrap;
      a {
        display: block;
        &:hover {
          color: #333;
          text-decoration: underline;
        }
      }
    }
  }

  .firends-link {
    margin-top: 20px;
    margin-bottom: 30px;

    .title {
      color: #4a8de5;
      font-size: 18px;
      font-weight: 700;
    }

    .firendship-link {
      margin-left: 100px;
    }

    .link-item {
      margin-right: 30px;
      line-height: 30px;
    }
  }

  .footer-info {
    padding: 15px 0;
    text-align: center;
    p {
      line-height: 26px;
      color: #888;
      a {
        color: #555;
        &:hover {
          color: #555;
        }
      }
    }
  }
}
</style>
