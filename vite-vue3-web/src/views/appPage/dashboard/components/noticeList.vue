<template>
  <div>
    <a-modal
      v-model:visible="dialogVisible"
      title="通知公告"
      width="80%"
      :mask-closable="false"
      :keyboard="false"
      :centered="true"
    >
      <div class="search-box">
        <a-form ref="searchForm" inline :model="form">
          <a-form-item label="公告标题" prop="title">
            <a-input
              v-model="form.title"
              placeholder="通知公告关键字"
              clearable
              style="width: 200px"
            />
          </a-form-item>
          <a-form-item label="状态" prop="status">
            <a-select v-model="form.status" placeholder="请选择" clearable>
              <a-option value="0" label="未读"></a-option>
              <a-option value="1" label="已读"></a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="发布时间" prop="date">
            <a-date-picker
              v-model="form.date"
              style="width: 220px"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
          <a-form-item>
            <a-button @click="resetFrom(searchForm)">重置</a-button>
            <a-button type="primary" @click="queryFrom(searchForm)">查询</a-button>
          </a-form-item>
        </a-form>
        <a href="#" class="all blue fr">全部已读</a>
      </div>
      <a-table v-loading="loadingTable" :data="tableData" stripe border :height="maxHeight()">
        <a-table-column prop="title" label="标题" />
        <a-table-column prop="content" label="公告内容" />
        <a-table-column prop="person" label="发布人" />
        <a-table-column prop="time" label="发布时间" />
        <a-table-column prop="handle" label="操作" width="80px">
          <template #default="scope">
            <a-button link type="primary" @click="openNoticeDetail(scope.row)">查看</a-button>
          </template>
        </a-table-column>
      </a-table>
      <a-pagination
        :page-sizes="pagination.pageSizes"
        :layout="pagination.layout"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </a-modal>

    <NoticeDetail ref="noticeDetail" />
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, reactive, ref } from "vue"
import type { FormInstance } from "ant-design-vue"
import NoticeDetail from "./noticeDetail.vue"
const instance: any = getCurrentInstance()?.appContext.config.globalProperties

const maxHeight = () => {
  return (window.innerHeight || document.body.clientHeight) * 0.6
}

const dialogVisible = ref<boolean>(false)

const openDialog = () => {
  dialogVisible.value = true
}

defineExpose({
  openDialog
})

const searchForm = ref<FormInstance>()
const form = reactive({
  title: "",
  status: "",
  date: []
})
// 查询
const queryFrom = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  try {
    await formEl.validateFields()
  } catch (err) {
    console.log(err)
  }
}
// 重置
const resetFrom = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

// 分页
const pagination = instance.pagination
const tableData = ref([
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {}
])
const loadingTable = ref<boolean>(false)
const getTableData = () => {
  console.log(`output->1`, 1)
}

// 修改每页条数
const handleSizeChange = (val: number) => {
  pagination.maxResultCount = val
  getTableData()
}

// 修改分页
const handleCurrentChange = (val: number) => {
  pagination.skipCount = val - 1
  getTableData()
}

const noticeDetail = ref()
const openNoticeDetail = (d: any) => {
  noticeDetail.value.openDialog(d)
}
</script>

<style scoped lang="less">
.search-box {
  display: flex;

  .el-form-item {
    margin-bottom: 8px;
  }

  .el-form {
    flex: 1;
  }

  .all {
    margin-left: 30px;
    margin-right: 20px;
    line-height: 28px;
    white-space: nowrap;
  }
}
</style>
