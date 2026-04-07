<template>
  <div class="flex h-full pb-2">
    <ul v-if="udrData.length > 1" class="conclusionList" style="width: 250px">
      <template v-for="(item, index) in udrData" :key="index">
        <li
          :class="item.actived ? 'active' : ''"
          @click="selParameterTab(item, index)"
        >
          {{ item.name }}
        </li>
      </template>
    </ul>
    <div style="width: calc(100% - 300px)">
      <a-space class="p-2">
        <a-button type="primary" @click="cleanRadio">
          清除选择
        </a-button>
        <a-input
          v-model:value="queryCode"
          placeholder="输入数据候选者或者说明关键词"
          class="w-[320px]"
          @press-enter="getData"
        />
        <a-button @click="getData">
          查询
        </a-button>
      </a-space>
      <a-table
        :columns="columns"
        :row-selection="rowSelection"
        :custom-row="customRow"
        :data-source="data"
        :pagination="pagination"
        :row-class-name="rowClassName"
        bordered
        :loading="loading"
        row-key="id"
        @change="onChange"
      ></a-table>
    </div>
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const columns = [
  {
    title: '序号',
    dataIndex: 'sort',
    width: '10%',
  },
  {
    title: '候选值',
    dataIndex: 'value',
  },
  {
    title: '说明',
    dataIndex: 'description',
    width: '30%',
  },
]

export default {
  components: {},
  emits: ['on-change'],
  data() {
    return {
      udrData: [],
      pageType: '', // 1 :备注 2：结论
      sampleId: '', //
      queryCode: '',
      data: [],
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10, // 每页中显示10条数据
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'], // 每页中显示的数据
        showTotal: total => `共有 ${total} 条数据`, // 分页中显示总的数据
      },
      columns,
      loading: false,
      selectedRowKeys: [],
      selectedRows: [],
      scrollY: '70vh',
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.id]
            this.selectedRows = [record]
            for (let i = 0; i < this.udrData.length; i++) {
              if (this.udrData[i].actived) {
                this.udrData[i].textObj = this.selectedRows[0]
                this.udrData[i].current = this.pagination.current
              }
            }
            //
            $emit(this, 'on-change', this.selectedRows)
          },
        }
      },
    }
  },
  // props: ["_selectPage"],
  computed: {
    rowSelection() {
      return {
        type: 'radio',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
          for (let i = 0; i < this.udrData.length; i++) {
            if (this.udrData[i].actived) {
              this.udrData[i].textObj = selectedRows[0]
              this.udrData[i].current = this.pagination.current
            }
          }
        },
        getCheckboxProps: () => ({
          props: {},
        }),
      }
    },
  },
  created() {
    this.pageType = String(getQueryVariable('type'))

    // this.sampleId = "402882827d21b25c017d27beea8c4731"
    // this.udrData = JSON.parse('[{"name":"检验结论","result":"","memo":""},{"name":"检验结论1","result":"","memo":""},{"name":"检验结论2","result":"","memo":""}]')
    // this.getData();

    if (window.top.returnConclusionList) {
      this.udrData = window.top.returnConclusionList().conclusionList
      this.sampleId = window.top.returnConclusionList().sampleId
    }
    else {
      throw new Error('未获取到结论项数据！！')
    }
    for (let i = 0; i < this.udrData.length; i++) {
      if (i === 0) {
        this.udrData[i].actived = true
      }
      else {
        this.udrData[i].actived = false
      }
    }
    this.getData()

    window.top.returnConfigData = () => {
      const attribute = this.pageType === '1' ? 'memo' : 'result'

      const d = []
      for (let i = 0; i < this.udrData.length; i++) {
        if (this.udrData[i].textObj) {
          d.push({
            name: this.udrData[i].name,
            [attribute]: this.udrData[i].textObj.value,
          })
        }
      }
      return d
    }
  },
  methods: {
    selParameterTab(v, i) {
      for (let j = 0; j < this.udrData.length; j++) {
        this.udrData[j].actived = false
      }
      if (v.textObj) {
        this.selectedRowKeys = [v.textObj.id]
        this.selectedRows = [v.textObj]
        this.pagination.current = v.current
      }
      else {
        this.selectedRowKeys = []
        this.selectedRows = []
        this.pagination.current = 1
      }

      this.udrData[i].actived = true
      window.$oForceUpdate()
      this.getData()
      //
    },
    cleanRadio() {
      for (let i = 0; i < this.udrData.length; i++) {
        if (this.udrData[i].actived) {
          this.udrData[i].current = 1
          delete this.udrData[i].textObj
          this.selectedRowKeys = []
          this.selectedRows = []
          this.pagination.current = 1
        }
      }
    },
    onChange(v) {
      this.pagination.current = v.current
      this.pagination.pageSize = v.pageSize
      this.getData()
    },
    onShowSizeChange: (page, size) => {
      this.pagination.current = page
      this.pagination.size = size
      this.getData()
    },
    selectCallback(k) {
      this.tabValue = k
      this.getData()
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      this.loading = true
      window.$oAjax({
        method: 'get',
        url: `/rest/alternative/lib/test/${
          this.pageType === '1' ? 'remark' : 'conclusion'
        }`,
        headers: {
          'content-type': 'application/json',
        },
        params: {
          page: this.pagination.current,
          rows: this.pagination.pageSize,
          sampleId: this.sampleId,
          quickQuery: this.queryCode,
        },
      })
        .then((res) => {
          if (res.code && res.code === 20000) {
            this.data = res.data.rows
            this.pagination.total = res.data.total
            // this.selectedRowKeys = [];
            // this.selectedRows = [];
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
  },
}
</script>

<style scoped>
.conclusionList{
  width: 200px;
  border-right: 1px solid #ccc;
  height: 100vh;
  overflow: auto;
}

.conclusionList li{
  background: #eeeeee;
  padding: 12px;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
}

.conclusionList li:hover{
  background: #18aeff;
  color: #fff;
}

.conclusionList .active{
  background: #18aeff;
  color: #fff;
}
</style>
