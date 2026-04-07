<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-table
          id="tableBox"
          :columns="columns"
          :pagination="false"
          :data-source="dataSource"
          bordered
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'enabled'">
              <a-switch
                v-model:checked="record.enabled"
                @change="switchLeve(record)"
              />
            </template>
            <template v-if="column.dataIndex === 'displayName'">
              <a-input
                v-if="record.isEdit"
                v-model:value="record.displayName"
                placeholder="请输入"
              />
              <span v-else>{{ record.displayName }}</span>
            </template>
            <template v-if="column.dataIndex === 'description'">
              <a-input
                v-if="record.isEdit"
                v-model:value="record.description"
                placeholder="请输入"
              />
              <span v-else>{{ record.description }}</span>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a v-if="!record.isEdit" @click="(e) => editRow(e, record)">编辑</a>
                <a v-if="record.isEdit" @click="(e) => saveRow(e, record)">保存</a>
                <a v-if="record.isEdit" @click="(e) => cancelEditRow(e, record)">取消</a>
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */

const columns = [
  {
    title: '管理级别',
    dataIndex: 'name',
  },
  {
    title: '显示名称',
    dataIndex: 'displayName',
  },
  {
    title: '管理级别说明',
    dataIndex: 'description',
  },
  {
    title: '是否启用',
    dataIndex: 'enabled',

  },
  {
    title: '操作',
    dataIndex: 'operation',
  },
]

export default {
  components: {},
  data() {
    return {
      dataSource: [],
      columns,
      spinning: false,
    }
  },
  computed: {},
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.visible = false
      this.spinning = true
      window.$oAjax
        .get(`/rest/chemical/level/all`, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          this.spinning = false
          if (res.code == '20000') {
            this.dataSource = res.data.map((it) => {
              it.isEdit = false
              return it
            })
          }
        })
    },
    editRow(e, row) {
      const flag = this.dataSource.some((it) => {
        return it.isEdit
      })
      if (flag) {
        window.$oAntdMessage.warning('当前存在正在编辑列')
        return
      }
      row.isEdit = true
    },
    switchLeve(row) {
      this.spinning = true
      window.$oAjax({
        method: 'get',
        url: `/rest/chemical/level/enabledSwitch?id=${row.id}&enabled=${row.enabled}`,
      }).then((res) => {
        this.spinning = false
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功')
          this.getData()
        }
        else {
          window.$oAntdMessage.warning(res.message)
        }
      })
    },
    saveRow(e, row) {
      this.spinning = true
      window.$oAjax({
        method: 'POST',
        url: '/rest/chemical/level/modify',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
        data: row,
      }).then((res) => {
        this.spinning = false
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功')
          this.getData()
        }
        else {
          window.$oAntdMessage.warning(res.message)
        }
      })
    },
    cancelEditRow() {
      this.getData()
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
.more-header {
  padding: 8px;
  border-bottom: 1px dashed;
  margin-bottom: 10px;
  color: var(--colorPrimary);
}
</style>
