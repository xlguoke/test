<template>
  <div class="loginPage">
    <a-layout-header>
      <a-row class="header_wrap">
        <a-col :span="12" class="lt">
          <img :src="getAssetsFile('logo2.png')" alt="logo" />
        </a-col>
        <a-col :span="12" class="rt">
          <ul>
            <li>客服电话：023-1231456</li>
            <li>QQ:12312312414</li>
            <li>
              <i class="iconfont icon-erweima"></i>
              <span>APP下载</span>
            </li>
          </ul>
        </a-col>
      </a-row>
    </a-layout-header>
    <a-layout-content class="container_wrap">
      <div class="message_wrap">
        <span>1/5</span>
        <span>
          <i class="iconfont icon-zuo"></i>
          <i class="iconfont icon-you"></i>
        </span>
        <span>公告：</span>
        <span>
          >与现实生活一致： 与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念；在界面中一致：
          所有的元素和结构需保持一致，比如：设计样式、图标和文本、元素的位置等。
        </span>
        <span>
          <a>查看详情</a>
          <i style="vertical-align: middle" class="iconfont icon-jiantou_yemian_xiangyou_o"></i>
        </span>
      </div>
      <div class="login_form">
        <ul>
          <li :class="activeTab == 1 ? 'active' : ''" @click="tabCut(1)">密码登录</li>
          <li :class="activeTab == 2 ? 'active' : ''" @click="tabCut(2)">微信登录</li>
        </ul>
        <div v-show="activeTab == 1" class="login_input_wrap">
          <a-input v-model="userName" class="input_row" size="large" placeholder="请输入用户名" />
          <a-input v-model="passWord" class="input_row" size="large" placeholder="请输入密码" />

          <div class="forget_password">
            <a-checkbox v-model="remember" label="记住密码" size="large" />
            <a-link type="primary">忘记密码？</a-link>
          </div>
          <div class="login_btn">
            <a-button class="btn" type="primary" size="large" @click="login">登录</a-button>
          </div>

          <div class="register_link">
            <span>我要注册：</span>
            <a-link type="primary" style="margin-right: 10px">委托单位注册</a-link>
            <a-link type="primary">检测中心注册</a-link>
          </div>
        </div>
        <div v-show="activeTab == 2" class="login_wx_wrap">
          <img
            src="https://img2.baidu.com/it/u=1989038259,1842360401&fm=253&fmt=auto&app=138&f=PNG?w=500&h=500"
          />
        </div>
      </div>
    </a-layout-content>
    <a-layout-footer class="foot_wrap">
      <ul>
        <li>
          <a-link>帮助中心</a-link>
        </li>
        <li>
          <a-link>隐私相关</a-link>
        </li>
        <li>
          <a-link>使用条例</a-link>
        </li>
      </ul>
      <p class="">
        <span>渝ICP备11002727号-1 C1998-2022</span>
        <a-link type="primary">重庆海特科技发展有限公司</a-link>
      </p>
    </a-layout-footer>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import type { Ref } from "vue"
import { useRouter } from "vue-router"
import { loginAPI } from "@/api/login.api"
import { message } from "ant-design-vue"
import { userLocalStorage, getAssetsFile } from "@/utils/index"
let route = useRouter()

let userName: Ref<string> = ref("13618335427")
let passWord: Ref<string> = ref("11111111")
let remember: Ref<boolean> = ref(true)

let activeTab: Ref<number> = ref(1)

const tabCut = (val: number) => {
  activeTab.value = val
}

const login = () => {
  loginAPI({
    UserNameOrEmailAddress: userName.value,
    password: passWord.value,
    RememberClient: remember.value
  }).then((res) => {
    if (res.success) {
      userLocalStorage.set("userToken", res.result)
      route.push("/dashboard")
      message.success("登录成功！")
    }
  })
}
</script>

<style lang="less" scoped>
.loginPage {
  .header_wrap {
    height: 60px;
    padding: 0 10px;

    .lt {
      display: flex;
      align-items: center;

      // img {
      //     height: 37px;
      // }

      span {
        color: #fff;
        margin-left: 20px;
      }
    }

    .rt {
      ul {
        display: flex;
        align-items: center;
        justify-content: end;
      }

      li i {
        color: #fff;
        cursor: pointer;
      }

      li {
        margin: 10px;
        font-size: 14px;
        color: @text2_color;
      }

      li:last-child {
        background: #e6f0fd;
        padding: 6px 10px;
        border-radius: 21px;

        span {
          color: @theme_color;
        }

        i {
          color: @theme_color;
          margin-right: 5px;
        }
      }
    }
  }

  .container_wrap {
    height: calc(100vh - 228px);
    background: url("@/assets/images/login_bg.png") no-repeat;
    // background-size: 100% 100%;

    .message_wrap {
      text-align: center;
      color: #fff;
      display: flex;
      align-items: center;
      padding-left: 180px;

      span {
        margin: 0 5px;
      }
    }

    .login_form {
      width: 350px;
      background: #fff;
      padding: 20px;
      border-radius: 5px;
      float: right;
      margin-right: 150px;
      margin-top: 150px;

      ul {
        display: flex;
        padding: 10px;
        border-bottom: 1px solid #ebebeb;
        margin-bottom: 20px;

        li {
          margin: 0 20px;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .active {
          color: #0066ec;
          font-size: 16px;
        }
      }

      .login_input_wrap {
        .input_row {
          margin-bottom: 20px;
        }
      }

      .login_wx_wrap {
        text-align: center;

        img {
          width: 70%;
          height: 67%;
        }
      }

      .forget_password {
        display: flex;
        justify-content: space-between;
        padding: 0 3px;
      }

      .login_btn {
        margin-bottom: 20px;

        .btn {
          width: 100%;
        }
      }

      .register_link {
        display: flex;
        margin-bottom: 10px;

        span {
          color: #ababab;
          margin-right: 5px;
        }
      }
    }
  }

  .foot_wrap {
    p {
      text-align: center;
      margin-top: 15px;
      color: @text2_color;
    }

    ul {
      text-align: center;

      li {
        display: inline-block;
      }

      li:not(:last-child):after {
        content: "|";
        margin: 0 10px;
        font-size: 12px;
        vertical-align: top;
        color: #ccc;
      }
    }
  }
}
</style>

<style lang="less">
.el-input__prefix-inner > :first-child,
.el-input__prefix-inner > :first-child.el-input__icon {
  font-size: 18px !important;
  color: @theme_color !important;
}
</style>
