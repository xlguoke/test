<template>
  <div is-link class="card">
    <div class="title">
      <div class="name">
        {{ data.inventoryName }}
      </div>
      <div
        class="status"
        :style="{
          backgroundColor:
            statusMap[data.status] && statusMap[data.status].color,
        }"
      >
        {{ statusMap[data.status] && statusMap[data.status].label }}
      </div>
    </div>
    <div
      class="line"
      style="
        border-bottom: 1px solid #e5e5e5;
        color: #d7d7d7;
        padding-bottom: 6px;
        margin-bottom: 6px;
        justify-content: space-between;
      "
    >
      <div style="font-size: 12px">
        盘点单号：{{ data.inventorySn }}
      </div>
      <div style="font-size: 12px">
        创建日期：{{ data.createDate }}
      </div>
    </div>
    <van-row gutter="20">
      <van-col span="12">
        <div class="line">
          <span class="label">盘点进度：</span>
          <span>{{ data.inventoryProgress }}</span>
        </div>
      </van-col>
      <van-col span="12">
        <div class="line">
          <span class="label">正常：</span>
          <span>{{ data['20'] }}</span>
        </div>
      </van-col>
      <van-col span="12">
        <div class="line">
          <span class="label">盘点异常：</span>
          <span>{{ data['30'] }}</span>
        </div>
      </van-col>
      <van-col span="12">
        <div class="line">
          <span class="label">位置异常：</span>
          <span>{{ data['40'] }}</span>
        </div>
      </van-col>
    </van-row>
  </div>
</template>

<script>
export default {
  name: 'OrderCard',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      statusMap: {
        10: { label: '进行中', color: '#555555' },
        20: { label: '待提交', color: '#0066ec' },
        30: { label: '审核中', color: '#f59a23' },
        40: { label: '未通过', color: '#d9001b' },
        50: { label: '已通过', color: '#70b603' },
      },
    }
  },
}
</script>

<style lang="less" scoped>
.card {
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 12px;
  margin-bottom: 16px;
  background-color: #fff;
  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .name {
      flex: 1;
      font-weight: 700;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .status {
      font-size: 12px !important;
      color: #fff;
      border-radius: 4px;
      padding: 0px 8px;
      background-color: #555555;
    }
  }
}
.line {
  display: flex;
  align-items: center;
}
.label {
  display: inline-block;
  color: #888;
  width: 70px !important;
  text-align: right;
  white-space: nowrap;
}
</style>
