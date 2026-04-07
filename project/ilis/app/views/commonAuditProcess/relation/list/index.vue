<template>
  <div class="aduit-process">
    <a-table
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="false"
      :loading="loading"
      :row-class-name="rowClassName"
      row-key="id"
    >
      <template #bodyCell="{ column, record, text, index }">
        <template v-if="column.dataIndex === 'businessName'">
          <div>
            <div v-if="record.editable && processType === 'common'">
              <a-input
                style="margin: -5px 0"
                :value="text"
                placeholder="请输入流程名称"
                @change="
                  (e) => handleChange(e.target.value, record.id, 'businessName')
                "
              />
            </div>
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>

        <template v-if="column.dataIndex === 'processName'">
          <span>
            <span v-if="record.editable">
              <a-select
                allow-clear
                :value="record.processInstanceKey"
                style="width: 100%"
                placeholder="请选择适用流程模型"
                @change="(e) => handleChange(e, record.id, 'processInstanceKey')"
              >
                <a-select-option
                  v-for="item in typeData"
                  :key="item.processInstanceKey"
                  :value="item.processInstanceKey"
                >
                  {{ item.processName }}
                </a-select-option>
              </a-select>
            </span>
            <span v-else>{{ text }}</span>
          </span>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <template v-if="record.editable">
              <a-button type="link" @click="save(record)">
                保存
              </a-button>
              <a-popconfirm
                v-if="record.editable && record.id"
                title="确定取消吗?"
                @confirm="cancel(record.id)"
              >
                <a-button type="link">
                  取消
                </a-button>
              </a-popconfirm>
            </template>
            <template v-else>
              <a-button type="link" @click="edit(record.id)">
                编辑
              </a-button>
            </template>
            <a-popconfirm
              title="确定删除吗?"
              @confirm="deleteCommon(record.id, index)"
            >
              <a-button
                v-if="processType === 'common'"
                type="link"
                style="color: #d33333"
              >
                删除
              </a-button>
            </a-popconfirm>
          </div>
        </template>
      </template>
    </a-table>
    <div style="margin-top: 10px">
      <a-button v-if="processType === 'common'" type="link" @click="addCommon">
        <PlusCircleOutlined />
        新增
      </a-button>
    </div>
    <div v-if="isAdd" style="padding-top: 10px">
      <a-button
        type="primary"
        style="margin-right: 5px"
        :loading="btnLoading"
        @click="save"
      >
        保存
      </a-button>
      <a-button @click="cancel">
        取消
      </a-button>
    </div>
  </div>
</template>

<script>
import { PlusCircleOutlined } from '@ant-design/icons-vue'
import { getQueryVariable } from '~/providers/common/utils'

const columns = [
  {
    title: '流程名称',
    dataIndex: 'businessName',
    width: '40%',
    scopedSlots: { customRender: 'businessName' },
  },
  {
    title: '适用流程模型',
    dataIndex: 'processName',
    width: '40%',
    scopedSlots: { customRender: 'processName' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '20%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    PlusCircleOutlined,
  },
  data() {
    return {
      data: [],
      cacheData: [],
      typeData: [],
      columns,
      loading: false,
      isAdd: false,
      btnLoading: false,
      processType: 'business',
    }
  },
  created() {
    this.processType
      = getQueryVariable('type') === 'common' ? 'common' : 'business'
    this.getData()
    this.getTypeData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      this.loading = true
      window.$oAjax
        .get(
          `${window.$oApi.auditProcessRelation.getRelations
          }?processType=${this.processType}`,
          {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            },
          },
        )
        .then((res) => {
          if (res.code && res.code !== 20010) {
            this.data = res.data
            this.cacheData = this.data.map(item => ({ ...item }))
            this.loading = false
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
            this.loading = false
          }
        })
    },
    getTypeData() {
      this.loading = true
      window.$oAjax
        .get(window.$oApi.auditProcessRelation.getCommonProcessList, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res.code && res.code !== 20010) {
            this.typeData = res.data
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
          }
        })
    },
    handleChange(value, id, column) {
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      if (target) {
        target[column] = value
        this.data = newData
      }
    },
    // 新增通用类流程
    addCommon() {
      this.data.push({
        processType: 'common',
        businessType: '',
        businessName: '',
        processInstanceKey: undefined,
        processName: '',
        editable: true,
      })
    },
    edit(id) {
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      this.editId = id
      if (target) {
        target.editable = true
        this.data = newData
      }
    },
    deleteCommon(id, ind) {
      if (!id) {
        this.data.splice(ind, 1)
        return
      }
      window.$oAjax({
        url: `${window.$oApi.auditProcessRelation.delete}/${id}`,
        method: 'delete',
      }).then(() => {
        window.$oAntdMessage.success('删除成功')
        this.getData()
      })
    },
    async save(record) {
      const params = {
        id: record.id,
        businessType: '9999',
        processType: 'common',
        processInstanceKey: record.processInstanceKey || '',
        processName: '',
        businessName: record.businessName,
      }
      if (record.processInstanceKey) {
        params.processName = this.typeData.find(
          item => record.processInstanceKey == item.processInstanceKey,
        ).processName
      }
      let res = null
      try {
        this.loading = true
        if (!record.id) {
          res = await window.$oAjax({
            method: 'post',
            url: window.$oApi.auditProcessRelation.saveCommon,
            data: params,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
          })
        }
        else {
          res = await window.$oAjax({
            method: 'PUT',
            url: window.$oApi.auditProcessRelation.save,
            params,
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            },
          })
        }
        this.loading = false
        if (res.code && res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          this.getData()
        }
        else {
          window.$oAntdModal.warning(
            window.$oMsgTips.info(res.msg || res.message || '操作异常'),
          )
        }
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (err) {
        this.loading = false
      }
    },
    cancel(id) {
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      if (target) {
        Object.assign(
          target,
          this.cacheData.filter(item => id === item.id)[0],
        )
        delete target.editable
        this.data = newData
      }
    },
  },
}
</script>

<style lang="less" scoped>
.aduit-process {
  :deep(.ant-table-thead > tr > th i.anticon),
  :deep(.ant-table-tbody > tr > td i.anticon) {
    font-size: 14px !important;
    margin-right: 0;
  }
}
@import './index.less';
</style>
