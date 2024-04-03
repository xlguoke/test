<template>
  <div class="home-page">
    <a-row :gutter="20">
      <a-col :span="16">
        <div class="userinfo-date">
          <a-image style="width: 48px; height: 48px" :src="userInfo.url" fit="cover" />
          <ul class="user-info">
            <li class="user-name">
              <span class="bold">欢迎您，{{ userInfo.userName }}</span>
              [{{ userInfo.corp }}]
            </li>
            <li class="user-wx">
              <span class="blue edit-password">修改密码</span>
              <span v-if="true">
                已绑定微信：
                <span class="bold">{{ userInfo.wx }}</span>
              </span>
              <span v-else>
                尚未绑定微信：
                <span class="blue">前往>></span>
              </span>
            </li>
          </ul>
          <div class="date-box">
            <p>
              {{ nowDate.cMonth }}月{{ nowDate.cDay }}日 &nbsp;
              {{ nowDate.ncWeek }}
            </p>
            <p>
              {{ nowDate.IMonthCn }}{{ nowDate.IDayCn }}
              <span>【{{ nowDate.gzYear }}{{ nowDate.gzMonth }}{{ nowDate.IDayCn }}】</span>
            </p>
          </div>
        </div>
        <!--  原材料预委托   -->
        <a-card shadow="never">
          <p class="card-header">
            <span class="iconfont icon-tianchongxing-"></span>
            <span class="bold title">原材料预委托</span>
          </p>
          <p class="ft16">
            <span class="bold ft16">未受理预委托</span>
            (共计：0份)
          </p>
          <ul class="consign-list">
            <li class="item warning">
              <span class="bold num">0</span>
              份
              <p class="status">
                已取消
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
            <li class="item">
              <span class="bold num">0</span>
              份
              <p class="status">
                填写中
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
            <li class="item">
              <span class="bold num">0</span>
              份
              <p class="status">
                待审核
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
            <li class="item">
              <span class="bold num">0</span>
              份
              <p class="status">
                待收样
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
            <li class="item warning">
              <span class="bold num">0</span>
              份
              <p class="status">
                审核退回
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
            <li class="item warning">
              <span class="bold num">0</span>
              份
              <p class="status">
                收样退回
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
          </ul>
          <p class="ft16">
            <span class="bold ft16">已受理预委托</span>
            (共计：0份)
          </p>
          <ul class="consign-list-two">
            <li class="item">
              <span class="bold num">0</span>
              份
              <p class="status">
                检测中
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
            <li class="item">
              <span class="bold num">0</span>
              份
              <p class="status">
                待领取
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
            <li class="item">
              <span class="bold num">0</span>
              份
              <p class="status">
                已领取
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
            <li class="item">
              <span class="bold num">0</span>
              份
              <p class="status">
                已邮寄
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
          </ul>
        </a-card>
        <!--  现场检测预约   -->
        <a-card shadow="never">
          <p class="card-header">
            <span class="iconfont icon-dingwei"></span>
            <span class="bold title">现场检测预约</span>
          </p>
          <p class="ft16">
            <span class="bold ft16">未受理检测预约</span>
            (共计：0份)
          </p>
          <ul class="consign-list">
            <li class="item error">
              <span class="bold num">0</span>
              份
              <p class="status">
                已取消
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
            <li class="item">
              <span class="bold num">0</span>
              份
              <p class="status">
                填写中
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
            <li class="item">
              <span class="bold num">0</span>
              份
              <p class="status">
                待审核
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
            <li class="item error">
              <span class="bold num">0</span>
              份
              <p class="status">
                审核退回
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
          </ul>
          <p class="ft16">
            <span class="bold ft16">已受理检测预约</span>
            (共计：0份)
          </p>
          <ul class="consign-list-two">
            <li class="item">
              <span class="bold num">0</span>
              份
              <p class="status">
                待检测
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
            <li class="item">
              <span class="bold num">0</span>
              份
              <p class="status">
                检测中
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
            <li class="item">
              <span class="bold num">0</span>
              份
              <p class="status">
                待领取
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
            <li class="item">
              <span class="bold num">0</span>
              份
              <p class="status">
                已领取
                <span class="iconfont icon-jiantou3"></span>
              </p>
            </li>
          </ul>
        </a-card>
      </a-col>
      <a-col :span="8">
        <!--  公告  -->
        <a-card shadow="never">
          <p class="card-header">
            <span class="iconfont icon-xiaolaba"></span>
            <span class="bold title">通知公告</span>
            <span class="notice-num">2</span>
            <span class="show-more" @click="showMoreNotice">
              查看更多
              <span class="iconfont icon-jiantou_yemian_xiangyou_o"></span>
            </span>
          </p>
          <ul class="notice-list">
            <li
              v-for="n in state.noticeDatas"
              :key="n.id"
              class="item"
              @click="openNoticeDetail(n)"
            >
              <span :class="`point ${n.status == 1 ? 'red' : ''}`"></span>
              <span>【系统】</span>
              <span class="content font-1">{{ n.content }}</span>
              <span class="time">2022-05-01</span>
            </li>
          </ul>
        </a-card>
        <!--  项目委托统计  -->
        <a-card shadow="never">
          <p class="card-header">
            <span class="iconfont icon-paixingbang"></span>
            <span class="bold title">项目委托统计</span>
            <span class="fr">累计总数： 999</span>
          </p>
          <ul class="consign-no">
            <li v-for="(n, i) in state.consignNo" :key="n.id" class="item">
              <div class="order-box">
                <img v-if="i < 3" :src="getAssetsFile(`no_${i + 1}.png`)" class="order-bg" />
                <p v-else class="order">{{ i + 1 }}</p>
              </div>
              <div class="content">
                <p class="con-name">
                  <span class="name font-1">{{ n.name }}</span>
                  <span>{{ n.num }}</span>
                </p>
                <div class="con-bar">
                  <p class="side" :style="`width:${n.rate}%`"></p>
                </div>
              </div>
            </li>
          </ul>
        </a-card>
      </a-col>
    </a-row>

    <NoticeList ref="noticeList" />
    <NoticeDetail ref="noticeDetail" />
  </div>
</template>
<script lang="ts" setup name="Home">
import { onMounted, reactive, ref } from "vue"
import { getAssetsFile } from "@/utils/index"
import calendar from "@/utils/calendar.js"
import NoticeList from "./components/noticeList.vue"
import NoticeDetail from "./components/noticeDetail.vue"

const userInfo = reactive({
  url: "",
  userName: "管理员",
  corp: "xxxx",
  wx: "微信昵称"
})

const nowDate = ref<any>({})
const initDate = () => {
  const date = new Date()
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  nowDate.value = calendar.solar2lunar(y, m, d)
}

onMounted(() => {
  initDate()
})
interface noticeType {
  id: string
  content: string
  status: number
}
interface consignNoType {
  id: string
  name: string
  rate: number
  num: number
}
const state = reactive<{
  noticeDatas: Array<noticeType>
  consignNo: Array<consignNoType>
}>({
  noticeDatas: [
    {
      id: "1",
      content: "公告内容公告内容公告内容公告内容公告内容公告内容容",
      status: 1
    },
    { id: "2", content: "公告内容公告内容", status: 1 },
    { id: "3", content: "公告内容公告内容", status: 0 },
    { id: "4", content: "公告内容公告内容", status: 0 },
    { id: "5", content: "公告内容公告内容", status: 0 }
  ],
  consignNo: [
    {
      id: "1",
      name: "委托单位委托单位委托单位委位委托单位委托单位委托单位委",
      num: 299,
      rate: 100
    },
    { id: "2", name: "委托单位", num: 19, rate: 80 },
    { id: "3", name: "委托单位", num: 99, rate: 65 },
    { id: "4", name: "委托单位", num: 69, rate: 51 },
    { id: "5", name: "委托单位", num: 19, rate: 32 }
  ]
})

const noticeList = ref()
const showMoreNotice = () => {
  noticeList.value.openDialog()
}

const noticeDetail = ref()
const openNoticeDetail = (d: noticeType) => {
  noticeDetail.value.openDialog(d)
}
</script>

<style lang="less" scoped>
.home-page {
  .el-card {
    margin-bottom: 15px;
  }

  .bold {
    font-weight: 700;
  }

  .ft16 {
    font-size: 16px;
  }

  .userinfo-date {
    display: flex;
    align-items: center;
    padding: 16px 24px;
    margin-bottom: 15px;
    background: url("@/assets/images/userinfo_bg.png") 100% 100% no-repeat #e6f0fd;
    border-radius: 4px;

    .el-image {
      border-radius: 50%;
    }

    .user-info {
      margin-left: 10px;
      flex: 1;

      .user-name,
      .user-name .bold {
        font-size: 16px;
      }

      .user-wx {
        margin-top: 8px;
        font-size: 14px;

        .blue {
          cursor: pointer;
        }
      }

      .edit-password {
        display: inline-block;
        margin-right: 10px;
        padding-right: 10px;
        border-right: 1px solid #ccc;
      }
    }

    .date-box {
      color: #fff;
      text-align: right;

      p:first-child {
        margin-bottom: 10px;
      }
    }
  }

  .card-header {
    margin-bottom: 16px;
    line-height: 24px;

    & > .iconfont {
      display: inline-block;
      margin-right: 5px;
      width: 24px;
      height: 24px;
      font-size: 14px;
      text-align: center;
      color: #fff;
      background-color: @theme_color;
      border-radius: 50%;
      vertical-align: bottom;
    }

    .title {
      font-size: 18px;
    }
  }

  .consign-list,
  .consign-list-two {
    display: flex;
    margin: 10px 0 20px 0;

    .item:not(:first-child) {
      margin-left: 15px;
    }

    .item {
      flex: 1;
      padding: 10px 15px;
      border-top: 2px solid @theme_color;
      border-radius: 3px;
      background-color: #fafafa;

      &.warning {
        border-color: @warning_color;
      }

      &.error {
        border-color: @error_color;
      }
    }

    .num {
      margin-right: 5px;
      font-size: 32px;
    }

    .status {
      margin-top: 8px;

      .iconfont {
        display: inline-block;
        width: 16px;
        height: 16px;
        line-height: 16px;
        font-size: 12px;
        color: #666;
        text-align: center;
        background-color: #e8e8e8;
        border-radius: 3px;
        vertical-align: middle;
      }
    }
  }

  .consign-list-two {
    display: block;
    margin: 10px 0 0;
    border-radius: 3px;

    .item:not(:first-child) {
      margin-left: 0;
      position: relative;

      &::before {
        position: absolute;
        left: 0;
        top: 15%;
        width: 2px;
        border-radius: 2px;
        height: 70%;
        background-color: #dcdcdc;
        content: "";
      }
    }

    .item {
      padding: 10px 20px;
      display: inline-block;
      width: 25%;
      border-top: 0;
      border-radius: 0;
      box-sizing: border-box;
    }
  }

  .notice-num {
    display: inline-block;
    padding: 0 5px;
    margin-left: 10px;
    min-width: 20px;
    text-align: center;
    color: #fff;
    background-color: @error_color;
    border-radius: 20px;
    font-size: 12px;
  }

  .show-more {
    float: right;
    display: flex;
    align-items: center;
    cursor: pointer;

    span {
      font-size: 24px;
      vertical-align: middle;
      color: #999;
    }
  }

  .notice-list {
    border-radius: 3px;
    border: 1px solid #e4e7ed;

    .item {
      padding: 0 12px;
      height: 44px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: 0.2s;

      &:not(:first-child) {
        border-top: 1px solid #e4e7ed;
      }

      &:nth-child(even) {
        background-color: #fafafa;
      }

      &:hover {
        background-color: #e6f0fd;

        .content {
          color: @theme_color;
        }
      }

      .point {
        width: 6px;
        height: 6px;
        background-color: #ccc;
        border-radius: 10px;
        margin-right: 5px;

        &.red {
          background-color: @error_color;
        }
      }

      .content {
        margin-right: 10px;
        width: 0;
        flex: 1;
        color: #666;
      }

      .time {
        color: #999;
      }
    }
  }

  .consign-no {
    margin-top: 40px;

    .item {
      display: flex;
      align-items: center;
      margin-top: 20px;

      .order-box {
        width: 30px;

        .order-bg {
          display: block;
          margin: 0 auto;
          width: 24px;
          height: auto;
        }

        .order {
          margin: 0 auto;
          width: 22px;
          height: 22px;
          text-align: center;
          line-height: 22px;
          font-size: 12px;
          background-color: #eee;
          border-radius: 50%;
        }
      }

      .content {
        flex: 1;
        margin-left: 10px;
      }

      .con-name {
        display: flex;
        align-items: center;

        .name {
          margin-right: 30px;
          flex: 1;
          width: 0;
        }
      }

      .con-bar {
        margin-top: 8px;
        width: 100%;
        height: 12px;
        background-color: #eee;
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;

        .side {
          height: 100%;
          border-top-right-radius: 10px;
          border-bottom-right-radius: 10px;
          background-color: @theme_color;
        }
      }
    }
  }
}
</style>
