<template>
  <div class="checkParams-main">
    <div class="title">设备检测参数</div>
    <CustomTable :data-source="data" :columns="columns" :pagination="false"></CustomTable>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue"
import CustomTable from "../../component/CustomTable.vue"
import { DeviceParamEntity } from "../DeviceDetailEntity"

defineProps<{ data: DeviceParamEntity[] }>()

const columns = ref([
  {
    title: "检测大类",
    dataIndex: "bigCategory",
    key: "bigCategory"
  },
  {
    title: "试验参数系统名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "试验参数显示名称",
    dataIndex: "displayName",
    key: "displayName"
  },
  {
    title: "备注",
    dataIndex: "remark",
    key: "remark"
  }
])
</script>
<style lang="less" scoped>
.checkParams-main {
  color: #eef5ff;

  .title {
    font-size: 36px;
    font-weight: bold;
    text-align: center;
    padding: 60px 0;
  }
}
</style>
