<template>
  <div v-if="repeatList.length > 0" class="sn-repeat-warp">
    <p><span style="color: #d91f1f">当前编号已被占用！</span>编号详情如下：</p>
    <ul class="repeat-list">
      <li v-for="(d, i) in repeatList" :key="i" class="item">
        {{ snTypes[d.snType] }}编号：
        <span :class="`${d.preset == '1' ? 'preset' : ''}`">{{ d.sn }}</span>
        <span v-if="d.preset == '1'" class="preset">（预设未占用）</span>
        <span v-else>（已占用）</span>
      </li>
    </ul>
    <p v-if="showGray" style="margin-top: 5px">
      灰色表示已创建预设编号但未占用正式编号
    </p>
  </div>
</template>

<script>
export default {
  name: 'SnRepeatHint',
  props: {
    datas: {
      type: Array,
      default(d) {
        return d || []
      },
    },
  },
  data() {
    return {
      repeatList: this.datas,
      snTypes: {
        10: '委托',
        20: '样品',
        30: '任务',
        40: '记录',
        50: '报告',
      },
    }
  },
  computed: {
    showGray() {
      return this.repeatList.filter(d => `${d.preset}` === '1').length > 0
    },
  },
  watch: {
    datas(d) {
      this.repeatList = d
    },
  },
  methods: {},
}
</script>

<style lang="less">
.sn-repeat-warp {
  margin-top: 8px;
}
.repeat-list {
  padding: 10px;
  margin-top: 5px;
  background-color: #f8f8f8;
  border-radius: 4px;
  .item {
    line-height: 24px;
  }
  .preset {
    color: #aaa;
  }
}
</style>
