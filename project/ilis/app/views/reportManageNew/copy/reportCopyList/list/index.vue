<template>
  <div class="disqualification">
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div class="disqualification-search">
          <div style="padding-top: 10px">
            <a-button @click="handleAdd">
              创建副本
            </a-button>
          </div>
        </div>
        <a-table
          :columns="columns"
          :data-source="data"
          bordered
          :pagination="false"
          row-key="index"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'name'">
              <a-input
                v-if="record.edit"
                v-model:value="record.name"
                style="margin: -5px 0"
                :value="text"
              ></a-input>
              <template v-else>
                {{ text }}
              </template>
            </template>

            <template v-if="column.dataIndex === 'createdDate'">
              <span>{{ date_filter(text) }}</span>
            </template>

            <template v-if="column.dataIndex === 'description'">
              <a-input
                v-if="record.edit"
                v-model:value="record.description"
                style="margin: -5px 0"
                :value="text"
              ></a-input>
              <template v-else>
                {{ text }}
              </template>
            </template>

            <template v-if="column.dataIndex === 'operation'">
              <div class="table-handle">
                <a
                  v-if="!record.edit"
                  href="javascript:"
                  @click="() => openCopy(record)"
                >打开</a>
                <a
                  v-if="record.edit"
                  href="javascript:"
                  @click="() => handleModify(record)"
                >保存</a>
                <a
                  v-if="record.edit"
                  href="javascript:"
                  @click="() => handleCancel(record)"
                >取消</a>
                <a
                  v-if="!record.edit"
                  href="javascript:"
                  @click="() => handleEdit(record)"
                >编辑</a>
                <a-popconfirm
                  v-if="data.length && !record.edit"
                  title="确定要删除吗?"
                  @confirm="() => handleDelete(record.id)"
                >
                  <a href="javascript:">删除</a>
                </a-popconfirm>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>

    <ht-modal v-model:open="visible" title="选择展示的列" @ok="changeRow">
    </ht-modal>
  </div>
</template>

<script>
import sseRequestProgress from '~/components/sseRequestProgress'
import { formatTime, getQueryVariable } from '~/providers/common/utils'

export default {
  data() {
    return {
      reportId: getQueryVariable('reportId'),
      data: [],
      spinning: false,
      visible: false,
      columns: [
        {
          title: '副本名',
          align: 'left',
          dataIndex: 'name',
          width: '30%',
          scopedSlots: { customRender: 'name' },
        },
        {
          title: '创建时间',
          align: 'center',
          dataIndex: 'createdDate',
          width: '15%',
          scopedSlots: { customRender: 'createdDate' },
        },
        {
          title: '创建人',
          align: 'center',
          dataIndex: 'creatorName',
          width: '10%',
        },
        {
          title: '说明',
          align: 'left',
          dataIndex: 'description',
          width: '30%',
          scopedSlots: { customRender: 'description' },
        },
        {
          title: '操作',
          align: 'center',
          dataIndex: 'operation',
          width: '10%',
          scopedSlots: { customRender: 'operation' },
        },
      ],
    }
  },
  computed: {},
  created() {
    this.getData()
  },
  methods: {
    date_filter(d) {
      return formatTime(d, 'YYYY-MM-DD HH:mm:ss')
    },
    async getData() {
      await window.$oAjax
        .get(`${window.$oApi.reportCopyList.reportCopy}?reportId=${this.reportId}`)
        .then((res) => {
          if (res.code === 20000) {
            this.data = res.data.map((item, index) => ({
              ...item,
              index,
              edit: false,
            }))
          }
          else {
            this.data = []
          }
        })
    },
    onlyGetData() {
      window.$oAjax
        .get(`${window.$oApi.reportCopyList.reportCopy}?reportId=${this.reportId}`, null, false)
        .then((res) => {
          // 解构当前获取到的数据
          const nd = res.data.map((item, index) => ({
            ...item,
            index,
            edit: false,
          }))
          // 判断哪些数据在页面上改变了但是没有提交到服务器，将这种改变体现在新的数据集中
          for (let i = 0; i < nd.length; i++) {
            const d = nd[i]
            this.data.forEach((data) => {
              if (data.id === d.id && data.edit === true) {
                d.edit = true
                d.name = data.name
                d.description = data.description
                d.old = data.old
              }
            })
          }
          this.data = nd
        })
    },
    handleDelete(id) {
      window.$oAjax
        .delete(`${window.$oApi.reportCopyList.reportCopy}/${id}`)
        .then(() => this.onlyGetData())
    },
    handleAdd() {
      sseRequestProgress.show({
        api: `${window.$oApi.reportCopyList.reportCopy}/${this.reportId}/copy`,
        description: '正在创建副本...',
        method: 'post',
        onComplete: (res) => {
          if (window.parent.reportCopy) {
            window.parent.reportCopy(this.reportId, res)
          }
          this.onlyGetData()
        },
      })
    },
    handleEdit(record) {
      record.edit = true
      record.old = { name: record.name, description: record.description }
    },
    handleCancel(record) {
      record.edit = false
      if (record.old !== null) {
        record.name = record.old.name
        record.description = record.old.description
        delete record.old
      }
    },
    handleModify(record) {
      record.edit = false
      const params = {
        id: record.id,
        name: record.name,
        description: record.description,
      }
      window.$oAjax.put(`${window.$oApi.reportCopyList.reportCopy}`, params, {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(() => {
        this.onlyGetData()
      })
    },
    openCopy(record) {
      window.parent.openCopyFile
      && window.parent.openCopyFile(record.id, record.attachmentType)
    },
    changeRow() {
      this.visible = false
    },
  },
}
</script>

<style lang="less">
@import './index.less';
.disqualification {
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 6px 8px;
  }
}
</style>
