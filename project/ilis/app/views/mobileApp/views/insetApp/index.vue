<template>
  <div style="height: 100vh; width: 100vw">
    <iframe
      style="display: block; width: 100%; height: 100%"
      :src="iframeSrc"
      frameborder="0"
    ></iframe>
  </div>
</template>

<script>
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  data() {
    return {
      iframeSrc: '',
    }
  },
  async created() {
    this.iframeSrc = await this.getIframeSrc()
    window.back = this.back
    window.login = this.login
  },
  methods: {
    async getIframeSrc() {
      let url = this.$route.query.url

      if (url.includes('iot-app')) {
        const toast = showLoadingToast({
          duration: 0,
          forbidClick: true,
        })
        const res = await mRequest.post('/rest/get/token').finally(() => {
          toast.close()
        })
        if (res.code !== 20010) {
          url += `&accessToken=${res.data.ACCESS_TOKEN}`
        }
      }

      return url
    },
    back() {
      this.$router.back()
    },
    login() {
      this.$router.push({
        name: 'login',
        query: {
          redirectURL: this.$route.fullPath,
        },
      })
    },
  },
}
</script>
