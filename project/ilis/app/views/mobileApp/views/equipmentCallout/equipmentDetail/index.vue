<template>
  <div class="equipmentDetail">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <div class="p-4">
      <ListCard
        v-for="item in eqDetilList"
        :key="item.id"
        :rows="[
          { label: '项目名称', value: item.testItem },
          { label: '调出方', value: item.callOutName },
          { label: '调出时间', value: formatDate(item.transferStart, 'YYYY-MM-DD') },
          { label: '调入方', value: item.callInName },
          { label: '调入时间', value: formatDate(item.callInTime, 'YYYY-MM-DD') },
          { label: '预计归还时间', value: formatDate(item.expectReturnTime, 'YYYY-MM-DD') },
        ]"
      >
      </ListCard>
    </div>
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    ListCard,
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
        .get('rest/eqTransfer/list', { params: { eqId: id, operateType: 10 } })
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
