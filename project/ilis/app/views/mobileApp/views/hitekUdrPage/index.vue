<template>
  <div class="hitek-udr-page">
    <van-nav-bar
      left-arrow
      :title="ItemName"
      :border="false"
      @click-left="onLeft"
    >
    </van-nav-bar>
    <div class="div-iframe">
      <iframe
        id="udr"
        class="udr-ifram"
        frameborder="no"
        border="0"
        marginwidth="0"
        marginheight="0"
        scrolling="no"
        allowtransparency="yes"
        :src="openUdrURL"
      />
    </div>
  </div>
</template>

<script>
import {
  showConfirmDialog,
} from 'vant'

export default {
  data() {
    return {
      openUdrURL: null,
      ItemName: null,
    }
  },

  created() {
    this.loadIFrom()
  },

  mounted() {
    if (window.history && window.history.pushState) {
      history.pushState(null, null, document.URL)
      window.addEventListener('popstate', this.backFun, false)
    }
  },

  unmounted() {
    window.removeEventListener('popstate', this.backFun, false)
  },

  methods: {
    backFun() {
      history.pushState(null, null, document.URL)
    },
    loadIFrom() {
      const params = this.$route.params
      const { testTaskId, objectUdrId, htmlJsFile, htmlUrl, templateName }
        = params
      this.ItemName = templateName

      const url = `${htmlUrl}?testTaskId=${testTaskId}&objectUdrId=${objectUdrId}&templateName=${encodeURI(
        templateName,
      )}#${encodeURI(htmlJsFile)}`
      this.openUdrURL = url
    },
    // 返回事件
    onBack() {
      window.removeEventListener('popstate', this.backFun, false)
      this.$router.go(-2)
    },
    // 左侧点击事件
    onLeft() {
      try {
        const udr = document.getElementById('udr')
        const udrWindow = udr.contentWindow

        if (udrWindow) {
          if (udrWindow.onClickSave) {
            udrWindow.onClickSave((res) => {
              if (res === 'success') {
                this.onBack()
              }
              else {
                showConfirmDialog({
                  title: '提示',
                  message: `${res} 保存失败，是否继续退出？`,
                })
                  .then(() => {
                    this.onBack()
                  })
                  .catch(() => {})
              }
            })
          }
          else {
            this.onBack()
          }
        }
      }
      catch (e) {
        console.warn(e)
        this.onBack()
      }
    },
  },
}
</script>

<style lang="less" scoped>
.div-iframe {
  position: fixed;
  top: 55px;
  left: 0;
  right: 0;
  bottom: 0;
}
.udr-ifram {
  width: 100%;
  height: 100%;
}
.hitek-udr-page {
  width: 100%;
  height: 100%;
}
</style>
