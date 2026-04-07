<template>
  <div class="setting">
    <div class="setting-bg">
      <div class="setting-bg-title">
        我的
      </div>
      <div class="setting-bg-box">
        <div class="setting-bg-img">
          <img v-if="userInfo.iconUrl" :src="userInfo.iconUrl" />
          <img v-else :src="userPng" />
        </div>
        <div class="setting-bg-con">
          <div class="flex gap-2 items-center mb-1 text-lg">
            {{ userInfo.realName }}
            <img
              :src="editSvg"
              class="w-4"
              @click="goBaseInfo"
            />
          </div>
          <div>{{ userInfo.departName }}</div>
        </div>
      </div>
      <img :src="mineBgPng" style="width: 100%" />
    </div>

    <div class="setting-box">
      <van-cell to="/setting/password" title="密码修改" is-link>
        <template #icon>
          <img
            :src="logoPasswordSvg"
            style="width: 20px; margin-right: 8px"
          />
        </template>
      </van-cell>
      <!-- <van-cell title="账号绑定" @click="bindWechat" is-link>
          <template #icon>
            <van-icon
              class-prefix="iconfont"
              name="bindWechat"
              size="16"
              style="margin-right: 5px"
            />
          </template>
        </van-cell> -->
      <van-cell to="/setting/notice" title="消息设置" is-link>
        <template #icon>
          <img
            :src="settingSetSvg"
            style="width: 20px; margin-right: 8px"
          />
        </template>
      </van-cell>
      <van-cell v-if="InAndroid" title="清理缓存" is-link @click="clearCacheOk">
        <template #icon>
          <img
            :src="settingCacheSvg"
            style="width: 20px; margin-right: 8px"
          />
        </template>
      </van-cell>
      <van-cell to="/setting/aboutUs" title="关于" is-link>
        <template #icon>
          <img
            :src="aboutUsSvg"
            style="width: 18px; margin-right: 8px"
          />
        </template>
      </van-cell>
    </div>

    <div style="margin-top: 32px; padding: 0 15px">
      <van-button block type="primary" native-type="button" @click="logOut()">
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import {
  showConfirmDialog,
  showDialog,
  showLoadingToast,
  showNotify,
} from 'vant'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { InAndroid, InMiniProgram } from '~/views/mobileApp/provides/utils/referrer'
import { useAppIndustryStore } from '~/views/mobileApp/store/useAppIndustryStore.js'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

export default {
  data() {
    return {
      userPng: new URL(`~/views/mobileApp/assets/user.png`, import.meta.url).href,
      settingCacheSvg: new URL(`~/views/mobileApp/assets/icon/setting-cache.svg`, import.meta.url).href,
      settingSetSvg: new URL(`~/views/mobileApp/assets/icon/setting-set.svg`, import.meta.url).href,
      aboutUsSvg: new URL(`~/views/mobileApp/assets/icon/about-us.svg`, import.meta.url).href,
      logoPasswordSvg: new URL(`~/views/mobileApp/assets/icon/logo-password.svg`, import.meta.url).href,
      editSvg: new URL(`~/views/mobileApp/assets/icon/edit.svg`, import.meta.url).href,
      mineBgPng: new URL(`~/views/mobileApp/assets/background/mine-bg.png`, import.meta.url).href,
      formatDate,
      InMiniProgram,
      InAndroid,
    }
  },
  computed: {
    ...mapState(useAppUserStore, ['userInfo']),
  },
  methods: {
    goBaseInfo() {
      this.$router.push({ name: 'settingBaseInfo' })
    },
    bindWechat() {
      showDialog({ message: '⛔ 前方代码施工中···' })
    },
    clearCacheOk() {
      showConfirmDialog({
        title: '提示',
        message: '清理缓存后需重新登录，确认清理缓存吗？',
      })
        .then(() => {
          this.clearCache()
        })
    },
    clearCache() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      if (window._appPlus) {
        plus.cache.clear(() => {
          _this.$router.push({ name: 'login' })
          _this.$nextTick(() => {
            window.location.reload()
          })
        })
      }
      else {
        document.addEventListener(
          'plusready',
          () => {
            plus.cache.clear(() => {
              _this.$router.push({ name: 'login' })
              _this.$nextTick(() => {
                window.location.reload()
              })
            })
          },
          false,
        )
      }
    },

    async logOut() {
      showConfirmDialog({
        title: '提示',
        message: '确认退出登录吗？',
      }).then(async () => {
        const toast = showLoadingToast({
          duration: 0,
          forbidClick: true,
        })
        const res = await mRequest({
          url: api.applogin.loginOut,
        }).finally(() => {
          toast.close()
        })
        if (res) {
          this.clearCache()
          useAppUserStore().$reset()
          useAppIndustryStore().$reset()
          localStorage.removeItem('userInfo')
          // if (this.aweixin) {
          //   this.aweixin.logout(
          //     (e) => {
          //       // plus.nativeUI.alert("注销登录认证成功!"+JSON.stringify(e));
          //     },
          //     (e) => {
          //       // console.log("注销登录认证失败: " + JSON.stringify(e));
          //     },
          //   )
          // }
          showNotify({
            type: 'primary',
            message: '已退出登录',
            duration: 1000,
          })

          this.$router.push({ name: 'login' })
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
