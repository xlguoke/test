<template>
  <div class="noticeBoxDetail">
    <MobileTitleBar left-arrow :show-user="true" @click-left="$router.go(-1)" />

    <van-field
      v-model="data.title"
      label-width="3em"
      label="标题"
      type="textarea"
      rows="1"
      autosize
      readonly
    />
    <div class="noticeBoxDetail_info">
      <h4>详情</h4>
      <p>{{ data.content }}</p>
    </div>
  </div>
</template>

<script>
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
      id: this.$route.params.id,
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    async getDetail() {
      const res = await mRequest(api.home.getMessageDetail, {
        params: { msgId: this.id },
      })
      this.data = res.data
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
