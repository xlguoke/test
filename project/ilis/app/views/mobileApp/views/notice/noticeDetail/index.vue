<template>
  <div class="noticeBoxDetail">
    <MobileTitleBar left-arrow :show-user="true" @click-left="$router.go(-1)" />

    <van-field
      v-model="data.noticeTitle"
      label="公告标题"
      type="textarea"
      rows="1"
      autosize
      readonly
    />
    <div class="noticeBoxDetail_info">
      <h4>公告内容</h4>
      <p v-html="data.noticeContent"></p>
    </div>
  </div>
</template>

<script>
import {
  showDialog,
} from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      data: {},
      File: null,
      id: this.$route.params.id,
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    async getDetail() {
      const res = await mRequest(api.home.getNoticeDetail, {
        params: { noticeId: this.id },
      })

      if (res.success) {
        this.data = res.obj
      }
      else {
        showDialog({ message: res.msg || res.message })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.noticeBoxDetail {
  &_info {
    margin: 15px auto 20px;

    h4 {
      padding-left: 16px;
      margin: 10px auto;
      font-weight: normal;
    }
    p {
      background: #fff;
      padding: 10px;
      text-indent: 2em;
    }

    :deep(.van-card__header) {
      align-items: center;
    }

    :deep(.van-card__thumb) {
      width: 60px;
      height: 60px;

      img {
        border-radius: 0;
      }
    }

    :deep(.van-card__content) {
      min-height: initial;
    }
  }
}
</style>
