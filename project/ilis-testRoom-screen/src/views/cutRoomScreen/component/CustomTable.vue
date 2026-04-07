<template>
  <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#001a75 ',
        wireframe: false,
        colorText: '#ECF6FF',
        colorBorderSecondary: '#00186C',
        colorFillSecondary: 'rgba(0, 0, 0, 0)',
        colorFillQuaternary: 'rgba(0, 0, 0, 0)',
        colorFillTertiary: 'rgba(0, 0, 0, 0)',
        colorBgContainer: '#000b32',
        colorBgLayout: 'rgba(0, 0, 0, 0)',
        colorBgSpotlight: 'rgba(0, 0, 0, 0)',
        colorBgElevated: '#000b32',
        colorBorder: '#00186C',
        colorTextBase: '#ECF6FF;',
        colorBgBase: '#030a20',
        fontSize: 14,
        colorTextQuaternary: '#244F9B'
      }
    }"
  >
    <a-table
      v-bind="$attrs"
      :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : '')"
      @change="handleChange"
    />
  </a-config-provider>
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
  .ant-table-thead {
    background: linear-gradient(
      270deg,
      rgba(42, 122, 255, 0) 0%,
      rgba(42, 122, 255, 0.4) 52%,
      rgba(42, 122, 255, 0) 100%
    );
    .ant-table-cell {
      background-color: transparent !important;
    }
  }
  table {
    border-radius: 8px 8px 0 0 !important;
  }
  th {
    font-size: 16px;
    padding: 16px !important;
    &::before {
      background-color: transparent !important;
    }
  }
  td {
    padding: 16px !important;
    font-size: 16px;
    color: #eef5ff;
    text-shadow: 0px 0px 6px #0066ec;
  }
}
.table-striped {
  background: rgba(0, 29, 85, 0.4);
}
</style>
