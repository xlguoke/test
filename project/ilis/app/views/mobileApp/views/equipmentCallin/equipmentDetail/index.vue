<template>
  <div class="equipmentDetail">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <div
      v-for="item in eqDetilList"
      :key="item.id"
      style="margin: 10px 0; border-bottom: 1px solid #ccc; padding: 10px"
    >
      <p style="font-weight: 900">
        xxxxxx设备
      </p>
      <p>项目名称：{{ item.testItem }}</p>
      <p>调出方：{{ item.callOutName }}</p>
      <p>调出时间：{{ formatDate(item.transferStart, 'YYYY-MM-DD') }}</p>
      <p>调入方：{{ item.callInName }}</p>
      <p>调入时间：{{ formatDate(item.callInTime, 'YYYY-MM-DD') }}</p>
      <p>预计归还时间：{{ formatDate(item.expectReturnTime, 'YYYY-MM-DD') }}</p>
    </div>
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      formatDate,
      eqDetilList: [],
    }
  },
  computed: {},
  created() {
    this.getHistoryList()
  },
  methods: {
    getHistoryList() {
      const { id } = this.$route.params
      mRequest
        .get('rest/eqTransfer/list', { params: { eqId: id, callOutType: 10 } })
        .then((res) => {
          if (res.code === 20000) {
            this.eqDetilList = res.data
          }
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
