<template>
  <div class="projectDetail text-sm">
    <div class="projectDetail-title">
      <strong style="font-size: 18px">{{ data.projectName }}</strong>
      <span style="font-size: 12px; margin-left: 10px; color: gray">{{
        data.bidUnit
      }}</span>
    </div>
    <div style="padding: 2px 0" class="mt-2">
      招标公告时间：{{ data.announcementTime }}
    </div>
    <div style="padding: 2px 0">
      开标时间：{{ data.bidTime }}
    </div>
    <div style="padding: 2px 0">
      中标单位：{{ data.winBidUnitName || '无' }}
      <a-button
        type="primary"
        size="small"
        style="height: 22px; margin-left: 5px"
        @click="selectUnit"
      >
        选择
      </a-button>
    </div>
    <div class="projectDetail-tab">
      <div class="projectDetail-tab-btn">
        <router-link to="/">
          本单位投标信息
        </router-link>
        <router-link to="/Other">
          竞争单位投标信息
        </router-link>
        <router-link to="/Accessories">
          附件
        </router-link>
      </div>
      <router-view></router-view>
    </div>
    <SelectUnit :id="id" ref="SelectUnit" :callback="getUnit" />
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import { getQueryVariable } from '~/providers/common/utils'
import SelectUnit from './components/selectUnit.vue'

export default {
  components: {
    SelectUnit,
  },
  data() {
    return {
      id: getQueryVariable('id'),
      data: {},
    }
  },
  created() {
    this.getDetailInfo()
  },
  methods: {
    getDetailInfo() {
      window.$oAjax
        .get(window.$oApi.biddingRecord.detail, {
          params: { id: this.id },
        })
        .then((res) => {
          if (res && res.success) {
            this.data = res.obj
          }
        })
    },
    selectUnit() {
      this.$refs.SelectUnit.showModal()
    },
    getUnit(data) {
      if (data && data.length > 0) {
        window.$oAjax({
          method: 'POST',
          url: `${window.$oApi.biddingRecord.setWinUnit}`,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
          data: {
            id: this.id,
            winBidUnitName: data[0].unitName,
            winBidUnitId: data[0].id,
          },
        }).then((res) => {
          if (res && res.success) {
            message.success(res.message || res.msg)
            this.getDetailInfo()
          }
          else {
            message.error(res.message || res.msg)
          }
        })
      }
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
