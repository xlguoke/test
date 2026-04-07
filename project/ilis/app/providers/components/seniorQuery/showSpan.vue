<template>
  <div v-if="(textTip || []).length > 0" id="seniorList" class="seniorList">
    <span class="seniorList-title">筛选条件：</span>
    <div class="seniorList-content">
      <div
        v-for="(item, index) in textTip"
        :key="item.field"
        class="senior-items"
      >
        <a-tag
          class="senior-items-span"
          closable
          @close="closeSpan(item.field, index)"
        >
          <span>{{ item.name }}：{{ item.value }}</span>
        </a-tag>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['callback', 'showData'],
  data() {
    return {
      name: 'SeniorShowSpan',
      textTip: [],
    }
  },
  watch: {
    showData: {
      handler(val) {
        this.textTip = val
        window.$oForceUpdate()
      },
      deep: true, // true 深度监听
    },
  },
  mounted() {
    this.textTip = this.showData
  },
  methods: {
    closeSpan(field) {
      this.textTip = this.textTip.filter(item => item.field !== field)
      if (this.textTip && this.textTip.length > 0) {
        this.callback(field, false)
      }
      else {
        this.callback(field, true)
      }
    },
  },
}
</script>

<style lang="less">
@import './list.less';
</style>
