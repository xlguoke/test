<template>
  <a-table v-bind="$attrs" @change="handleChange" />
</template>
<script lang="ts" setup>
const emits = defineEmits(["change"])
const handleChange = (pagination, filters, sorter, { currentDataSource }) => {
  emits("change", {
    pagination,
    filters,
    sorter,
    currentDataSource
  })
}
</script>
<style lang="less" scoped>
:deep(.ant-table) {
  background-color: transparent;
  border-top: 1px solid #0024a2;
  table {
    border-radius: 8px 8px 0 0 !important;
  }
  th {
    padding: 16px !important;
    font-size: 28px;
    &::before {
      background-color: transparent !important;
    }
  }
  td {
    padding: 16px !important;
    font-size: 20px;
    color: #eef5ff;
    text-shadow: 0px 0px 6px #0066ec;
  }
}
:deep(.ant-pagination) {
  margin: 16px 0 !important;
  font-size: 24px;
  .ant-pagination-prev,
  .ant-pagination-next,
  .ant-pagination-jump-prev,
  .ant-pagination-jump-next {
    height: 32px !important;
    min-width: 32px !important;
    line-height: 32px !important;
    border-radius: 6px !important;
  }
  .ant-pagination-total-text {
    height: 32px !important;
    line-height: 30px !important;
    margin-inline-end: 8px !important;
  }
  .ant-pagination-item-link {
    font-size: 20px !important;
    border-radius: 6px !important;
  }
  .ant-pagination-item {
    min-width: 32px !important;
    height: 32px !important;
    line-height: 30px !important;
    border-radius: 6px !important;
    margin-inline-end: 8px !important;
    a {
      padding: 0 6px !important;
    }
  }
  .ant-pagination-options {
    margin-inline-start: 16px !important;
    .ant-select-single {
      font-size: 24px !important;
      .ant-select-selector {
        height: 32px !important;
        padding: 0 11px !important;
        font-size: 24px !important;
        border-radius: 6px !important;
        .ant-select-selection-search {
          inset-inline-start: 11px !important;
          inset-inline-end: 11px !important;
          .ant-select-selection-search-input {
            height: 30px !important;
          }
        }
      }
    }
  }
  .ant-select-selection-item,
  .ant-select-selection-placeholder {
    line-height: 30px !important;
    padding-inline-end: 30px !important;
  }
  .ant-select-arrow {
    inset-inline-end: 11px !important;
    height: 20px !important;
    margin-top: -10px !important;
    font-size: 20px !important;
  }
  .ant-pagination-options-quick-jumper {
    height: 32px;
    line-height: 32px;
    margin-inline-start: 8px;
    input {
      width: 50px !important;
      padding: 3px 11px !important;
      font-size: 24px !important;
      border-radius: 6px !important;
      margin-inline-start: 8px !important;
      margin-inline-end: 8px !important;
      height: 32px !important;
    }
  }
}
</style>
