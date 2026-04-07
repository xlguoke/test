<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="查看报告归档详情"
      centered
      :force-render="true"
      :mask-closable="false"
      width="80%"
      @cancel="handleCancel"
    >
      <template #footer>
        <div>
          <!-- <a-button v-if="!isDetail" @click="handleCancel">取消</a-button> -->
          <!-- <a-button v-if="!isDetail" type="primary" @click="handleOk">确定</a-button> -->
          <a-button style="display: none" type="primary" @click="handleCancel">
            关闭
          </a-button>
          <a-button type="primary" @click="handleCancel">
            关闭
          </a-button>
        </div>
      </template>
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <div style="padding: 10px 0"></div>
          <div class="content-table">
            <a-table
              id="tableBox"
              :columns="columns"
              :pagination="data.length > 0 ? pagination : false"
              :data-source="data"
              bordered
              row-key="id"
              :row-class-name="rowClassName"
            >
              <template #bodyCell="{ column, record, text }">
                <template v-if="column.dataIndex === 'archived'">
                  <a
                    v-if="text"
                    style="color: #40a9ff; text-decoration: underline"
                    @click="goArchive('1', record)"
                  >{{ text }}</a>
                  <span v-else>{{ text }}</span>
                </template>
                <template v-if="column.dataIndex === 'waitArchive'">
                  <a
                    v-if="text"
                    style="color: #40a9ff; text-decoration: underline"
                    @click="goArchive('0', record)"
                  >{{ text }}</a>
                  <span v-else>{{ text }}</span>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'

const columns = [
  {
    title: '委托单位',
    dataIndex: 'consignUnit',
    width: '30%',
  },
  {
    title: '工程项目',
    dataIndex: 'consignProject',
    width: '30%',
    // customRender:({ text })=>(  egressStatusData.find(item=>item.value==text)?egressStatusData.find(item=>item.value==text).name:"" )
  },
  {
    title: '已归档报告份数',
    dataIndex: 'archived',
    width: '20%',
  },
  {
    title: '未归档报告份数',
    dataIndex: 'waitArchive',
    width: '20%',
  },
]

export default {
  components: {},
  props: ['callback'],
  data() {
    return {
      dayjs,
      data: [],
      visible: false,
      columns,
      spinning: false,
      page: 1,
      size: 10,
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          // this.getData();
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.size = size
          // this.getData();
        },
      },
    }
  },
  computed: {},
  created() {},
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    goArchive(tabsType, record) {
      const url = `archiveController.do?goListPage&dataType=${tabsType}
         &isCurrencyArchive=1&consignUnitId=${
            record.consignUnitId || ''
          }&consignProjectId=${record.consignProjectId || ''}`

      top.addTabs
      && top.addTabs({
        id: '1',
        title: '资料归档',
        close: false,
        url,
      })
    },
    handleOk() {
      // this.callback();
      this.handleCancel()
    },
    handleCancel() {
      this.visible = false
    },
    showModal(data) {
      this.visible = true
      if (data.length > 0) {
        this.data = data
        // this.pagination.total = res.total || 0;
        // this.pagination.current = page;
        // this.pagination.pageSize = size;
      }
      else {
        this.data = []
      }
    },
    getData() {
      // let {page, size} = this,
      //   params = {
      //     page,
      //     size
      //   };
      // this.loading = true;
      // window.$oAjax({
      //   url: window.$oApi.equipCommon.equipList,
      //   params,
      // }).then(res => {
      //   if (res && res.total > 0) {
      //     this.data = res.rows;
      //     this.pagination.total = res.total || 0;
      //     this.pagination.current = page;
      //     this.pagination.pageSize = size;
      //   } else {
      //     this.data = [];
      //   }
      //   this.loading = false;
      // });
    },
  },
}
</script>

<style lang="less">
.container-search-all {
  width: 400px;
  margin-right: 5px;
  .ant-table-thead {
    .ant-checkbox {
      display: none;
    }
  }
}
.content-table {
  height: 400px;
  overflow-y: auto;
}
</style>
