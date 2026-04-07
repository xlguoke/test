<template>
  <div style="padding: 15px 0">
    <div style="font-size: 14px; font-weight: bold">
      中标({{ data.filter((item) => item.bidStatus == '2').length }})：
    </div>
    <div>
      <div v-for="(item, index) in data" :key="index">
        <div v-if="item.bidStatus == '2'">
          <span>[{{ item.referenceRole }}]</span>
          <a
            href="javascript:;"
            style="text-decoration: underline"
            @click="goPage(item.recordId)"
          >{{ item.projectName }}</a>
          <span style="color: gray; margin-left: 5px">{{ item.bidTime }}</span>
        </div>
      </div>
    </div>

    <div style="font-size: 14px; font-weight: bold; padding-top: 10px">
      未开标({{ data.filter((item) => item.bidStatus == '0').length }})：
    </div>
    <div>
      <div v-for="(item, index) in data" :key="index">
        <div v-if="item.bidStatus == '0'">
          <span>[{{ item.referenceRole }}]</span>
          <a
            href="javascript:;"
            style="text-decoration: underline"
            @click="goPage(item.recordId)"
          >{{ item.projectName }}</a>
          <span style="color: gray; margin-left: 5px">{{ item.bidTime }}</span>
        </div>
      </div>
    </div>

    <div style="font-size: 14px; font-weight: bold; padding-top: 10px">
      未中标({{ data.filter((item) => item.bidStatus == '1').length }})：
    </div>
    <div>
      <div v-for="(item, index) in data" :key="index">
        <div v-if="item.bidStatus == '1'">
          <span>[{{ item.referenceRole }}]</span>
          <a
            href="javascript:;"
            style="text-decoration: underline"
            @click="goPage(item.recordId)"
          >{{ item.projectName }}</a>
          <span style="color: gray; margin-left: 5px">{{ item.bidTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

export default {
  data() {
    return {
      id: getQueryVariable('id'),
      data: [],
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.biddingPerson.record, {
          params: { biddingPersonId: this.id },
        })
        .then((res) => {
          if (res && res.success) {
            this.data = res.obj
          }
          this.spinning = false
        })
    },
    goPage(id) {
      top.addTabs
      && top.addTabs({
        id,
        title: '投标记录详情',
        close: false,
        url: `biddingController.do?biddingRecordDetail&id=${id}`,
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
