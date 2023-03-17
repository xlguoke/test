<template>
  <a-config-provider :component-size="size" :locale="zhCN" :auto-insert-space-in-button="false">
    <RouterView></RouterView>
  </a-config-provider>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router"
import { provide, reactive, ref } from "vue"
import zhCN from "ant-design-vue/es/locale/zh_CN"
import "dayjs/locale/zh-cn"
import type { PaginationProps } from "ant-design-vue"

const size: any = ref("middle")

const pagination = reactive<PaginationProps>({
  current: 1,
  pageSize: 10,
  total: 0,
  showQuickJumper: true,
  showSizeChanger: true,
  showTotal: (total: number, range: number[]) =>
    `显示${range[0]}-${range[1]}条记录，检索到 ${total} 条记录`
})

provide("commonPagination", pagination)
</script>

<style lang="less">
#app {
  height: 100vh;
  width: 100vw;
}

.blue {
  color: @theme_color;

  &:hover {
    opacity: 0.8;
    cursor: pointer;
  }
}

.error {
  color: @error_color;
}

.fl {
  float: left;
}

.fr {
  float: right;
}

.clearfix::after {
  content: "";
  display: block;
  clear: both;
  visibility: hidden;
}

.font-1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font(@num) {
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: @num; // 显示多行，修改这里的数字即可
  -webkit-box-orient: vertical;
}

.search-form {
  .el-form-item {
    margin-right: 15px !important;
    margin-bottom: 8px;
  }
}

.el-pagination {
  margin-top: 6px;
}

.el-table .el-table__body .el-table__cell {
  padding: 5px 0 !important;
}

.query-form-wrap {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  & > div {
    margin-bottom: 10px;
  }

  .ant-select,
  .ant-input {
    min-width: 150px;
  }
}

.ant-modal-body {
  max-height: calc(100vh - 260px);
  overflow: auto;
}
</style>
