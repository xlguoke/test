<template>
  <div class="login">
    <div class="login-main">
      <div class="login-main-left">
        <p class="login-title">试验检测监控数据展示平台</p>
        <img src="../../assets/login/login-img.png" />
      </div>
      <div class="login-main-right">
        <div class="login-form">
          <div class="login-form-title">欢迎登录</div>
          <div class="login-form-item">
            <img src="../../assets/icon/login-username.png" />
            <input type="text" placeholder="请输入用户名" v-model="userNameOrEmailAddress" />
          </div>
          <div class="login-form-item">
            <img src="../../assets/icon/login-password.png" />
            <input type="password" placeholder="请输入密码" v-model="password" />
          </div>
          <!-- <div class="login-form-item">
            <img src="../../assets/icon/login-password.png" />
            <input type="text" placeholder="请输入验证码" />
            <img :src="authCode" class="login-code" />
          </div> -->

          <button class="login-submit" @click="login">登录</button>
        </div>
      </div>
    </div>
    <p class="login-copyright">渝ICP备11002727号-1 ©1998-2022 重庆海特科技发展有限公司</p>
  </div>
</template>

<script>
import ajax from "@/lib/ajax";
import userAuth from "@/lib/userAuth";

export default {
  name: "LoginPage",
  data() {
    return {
      userNameOrEmailAddress: null,
      password: null,
      loading: false
    }
  },
  methods: {
    getAuthCode() {
      const that = this;
      const { userNameOrEmailAddress } = this;
      if (!userNameOrEmailAddress) {
        return;
      }

      ajax.get("/api/Users/GetValidCode", {
        responseType: "blob",
        params: { userName: userNameOrEmailAddress }
      }).then((res) => {
        var reader = new FileReader();
        reader.readAsDataURL(res.data);
        reader.onload = function (e) {
          that.AuthCodeContent = e.target.result;
        };
      });
    },
    async login() {
      const { userNameOrEmailAddress, password } = this;
      const password2 = window.Base64.encode(password);
      
      this.loading = true;
      const msg = this.$Message.loading({
        content: "登录中...",
        duration: 0
      });

      try {
        const res = await ajax.post(`${window.qdmWebApiUrl}/api/user/Authenticate`, {
          userNameOrEmailAddress,
          password2
        });

        if (res.success) {
          this.$Message.success("登录成功");
          userAuth.setUserLaboratoryID(res.result.userInfo.laboratoryID);
          this.$router.push({ name: "home" });
        } else {
          this.$Modal.warning({
            title: "提示",
            content: res.message || "登录失败"
          });
        }
      } catch(e) {
        this.$Modal.error({
          title: "提示",
          content: "网络异常，登录失败"
        });
      }

      this.loading = false;
      msg();
    }
  }
};
</script>

<style lang="less" scoped>
@import url("./index.less");
</style>
