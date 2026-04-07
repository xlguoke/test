<template>
  <ht-modal
    :title="modalTitle"
    centered
    :mask-closable="false"
    :open="visible"
    @cancel="handleCancel"
  >
    <template #footer>
      <a-button style="display: none" @click="handleCancel">
        关闭
      </a-button>
      <a-button @click="handleCancel">
        关闭
      </a-button>
    </template>
    <a-spin :spinning="spinning">
      <div id="spin-conten">
        <a-form :model="formState">
          <a-row>
            <a-col :span="18">
              <a-form-item
                label="配置类型"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <a-select
                  v-model:value="formState.typeId"
                  placeholder="请选择"
                  :disabled="isDetail"
                  @change="handleSelectChange"
                >
                  <a-select-option
                    v-for="(item, index) in dictData"
                    :key="index"
                    :value="item.id"
                  >
                    {{ item.typename }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6" style="text-align: right">
              <a-button type="primary" @click="add">
                新增
              </a-button>
            </a-col>
          </a-row>
        </a-form>
        <a-table
          :columns="columns"
          :pagination="false"
          :data-source="data"
          :scroll="{ y: 300 }"
          bordered
          row-key="id"
          :row-class-name="rowClassName"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'name'">
              <div v-if="record.editable">
                <a-input
                  placeholder="请输入"
                  :value="text"
                  @change="(e) => handleChange(e.target.value, record, 'name')"
                />
              </div>
              <span v-else>{{ text }}</span>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <div class="editable-row-operations">
                <template v-if="record.editable">
                  <a-button type="link" @click="() => save(record)">
                    保存
                  </a-button>
                  <a-popconfirm
                    title="确定要取消吗?"
                    @confirm="() => cancel(record)"
                  >
                    <a-button type="link">
                      取消
                    </a-button>
                  </a-popconfirm>
                </template>
                <template v-else>
                  <a-button type="link" :disabled="editId !== ''" @click="() => edit(record)">
                    编辑
                  </a-button>
                  <a-button type="link" danger @click="() => deleteData(record)">
                    删除
                  </a-button>
                </template>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
  </ht-modal>
</template>

<script>
import qs from 'qs'

const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    scopedSlots: { customRender: 'name' },
    width: '70%',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
  },
]
export default {
  components: {},
  props: ['callback'],
  data() {
    return {
      visible: false,
      data: [],
      columns,
      spinning: false,
      modalTitle: '引用类型配置',
      typeId: '',
      typeName: '',
      isAdd: false,
      fristLoad: false,
      formLayout: 'horizontal',
      formState: {},
      isDetail: false,
      dictData: [],
      editId: '',
    }
  },
  computed: {},
  created() {
    this.getDictData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getDictData() {
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.testTemplate.getDict,
        method: 'POST',
        data: qs.stringify({
          list: JSON.stringify(['@data_manage_standard@']),
        }),
      }).then((res) => {
        this.spinning = false
        this.fristLoad = true
        if (
          res.success
          && res.attributes
          && res.attributes.data_manage_standard
          && res.attributes.data_manage_standard.length > 0
        ) {
          this.dictData = res.attributes.data_manage_standard
        }
        else {
          this.dictData = []
        }
      })
    },
    handleSelectChange(value) {
      this.typeId = value
      this.typeName = this.dictData.filter(
        item => item.id === value,
      )[0].typename
      this.getData()
    },
    getData() {
      if (this.fristLoad) {
        window.$oAjax({
          method: 'GET',
          params: {
            typeId: this.typeId,
          },
          url: window.$oApi.dataCollection.listQuote,
        }).then((res) => {
          this.spinning = false
          if (res.code === 20000 && res.data && res.data.length > 0) {
            this.data = res.data
            this.cacheData = this.data.map(item => ({ ...item }))
          }
          else {
            this.data = []
            this.cacheData = []
          }
        })
      }
    },
    showModal() {
      this.visible = true
    },
    handleCancel() {
      this.formState = {}
      this.typeId = ''
      this.editId = ''
      this.data = []
      this.cacheData = []
      this.isAdd = false
      this.visible = false
    },
    add() {
      if (this.typeId) {
        if (this.editId != '') {
          window.$oAntdModal.warning(window.$oMsgTips.info('请先完成当前编辑或新增!'))
          return
        }
        this.editId = new Date().getTime()
        this.isAdd = true
        this.data.push({ id: this.editId, name: '', editable: true })

        window.$oNextTick(() => {
          document
            .getElementById('spin-conten')
            .getElementsByClassName('ant-table-scroll')[0]
            .getElementsByClassName('ant-table-body')[0]
            .scrollTo({
              top: 10000,
              behavior: 'smooth',
            })
        })
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择配置类型'))
      }
    },
    handleChange(value, record, column) {
      const newData = [...this.data]
      const target = newData.filter(item => record.id === item.id)[0]
      if (target) {
        target[column] = value
        this.data = newData
      }
    },
    edit(record) {
      const newData = [...this.data]
      const target = newData.filter(item => record.id === item.id)[0]
      this.editId = record.id
      if (target) {
        target.editable = true
        this.data = newData
      }
    },
    save(record) {
      let url
      const data = {
        name: record.name,
      }
      if (this.isAdd === false) {
        data.id = record.id
        url = window.$oApi.dataCollection.updateQuote
      }
      if (this.isAdd === true) {
        url = window.$oApi.dataCollection.addQuote
        data.typeId = this.typeId
        data.typeName = this.typeName
      }
      window.$oAjax({
        method: 'POST',
        url,
        data: JSON.stringify(data),
        headers: {
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          this.isAdd = false
          this.editId = ''
          this.getData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    cancel(record) {
      const newData = [...this.data]
      const target = newData.filter(item => record.id === item.id)[0]
      if (this.isAdd) {
        this.isAdd = false
        if (target) {
          this.data = newData.filter(item => item.id !== record.id)
        }
      }
      else {
        if (target) {
          Object.assign(
            target,
            this.cacheData.filter(item => record.id === item.id)[0],
          )
          delete target.editable
          this.data = newData
        }
      }
      this.editId = ''
    },
    // 删除
    deleteData(record) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除吗？`,
        okText: '确认',
        mask: false,
        cancelText: '取消',
        onOk: () => {
          window.$oAjax({
            method: 'delete',
            url: window.$oApi.dataCollection.delQuote,
            params: { id: record.id },
          }).then((res) => {
            if (res.code && res.code === 20000) {
              window.$oAntdMessage.success('操作成功')
              this.editId = ''
              this.getData()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
          })
        },
      })
    },
  },
}
</script>
