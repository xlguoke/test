<template>
  <div class="audit-detail-card">
    <div
      v-for="(item, index) in data"
      :key="index"
      class="audit-detail-card-item"
    >
      <div class="audit-detail-card-label">
        {{ item.label }}：
      </div>
      <div class="audit-detail-card-value">
        {{ item.value || '' }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['data'],
  data() {
    return {}
  },
}
</script>

<style lang="less" scoped>
.audit-detail-card {
  background: #fff;
  border-radius: 4px;
  padding: 8px 12px;
  .audit-detail-card-item {
    margin-top: 4px;
    display: flex;
    font-size: 12px;

    &:first-child {
      margin-top: 0;
    }
  }

  .audit-detail-card-label {
    color: #666;
  }

  .audit-detail-card-value {
    color: #333;
    flex: 1;
    text-align: right;
    word-break: break-all;
  }
}
</style>
