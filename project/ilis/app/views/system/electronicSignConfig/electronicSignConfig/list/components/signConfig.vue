<template>
  <div>
    <a-row type="flex">
      <a-col :span="23" :offset="1" style="margin-bottom: 10px">
        电子签名模式：
        <a-radio-group
          v-model:value="signType.propertyValue"
          @change="signTypeChange"
        >
          <a-radio value="1">
            签审合一
          </a-radio>
          <a-radio value="0">
            签审分离
          </a-radio>
        </a-radio-group>
        <span> （仅对签名模式为电子签名的生效，图片签名插入即签名） </span>
      </a-col>
    </a-row>
    <a-row type="flex">
      <a-col :span="24">
        <a-table
          :columns="columns"
          :data-source="data"
          :pagination="false"
          row-key="id"
          bordered
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'signMode'">
              <a-select
                v-if="record.editable"
                v-model:value="record.signMode"
                style="width: 100%"
                placeholder="请选择签名方式"
                @change="(e) => handleChange(e, record.id, 'signMode')"
              >
                <a-select-option
                  v-for="item in signMode"
                  :key="item.id"
                  :value="item.typecode"
                >
                  {{ item.typename }}
                </a-select-option>
              </a-select>
              <template v-else>
                {{ mode_filter(text) }}
              </template>
            </template>
            <template v-if="column.dataIndex === 'orderNum'">
              <a-tooltip placement="top" :open="record.tooltipVisible">
                <template #title>
                  <span>请输入正整数</span>
                </template>
                <a-input
                  v-if="record.editable && record.isRegular !== '1'"
                  style="margin: -5px 0"
                  :value="text"
                  @change="(e) => keyup(e, record, 'orderNum')"
                />
                <template v-else>
                  {{ text }}
                </template>
              </a-tooltip>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <div class="editable-row-operations">
                <template v-if="record.editable">
                  <a @click="() => save(record.id)">保存</a>
                  <a-popconfirm
                    title="确定要取消操作吗?"
                    @confirm="() => cancel(record.id)"
                  >
                    <a>取消</a>
                  </a-popconfirm>
                </template>
                <template v-else>
                  <a-button :disabled="editingKey !== ''" type="link" @click="() => edit(record.id)">
                    编辑
                  </a-button>
                </template>
              </div>
            </template>
          </template>
        </a-table>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import qs from 'qs'

export default {
  data() {
    return {
      data: [],
      tooltipVisible: false,
      cacheData: [],
      signType: {},
      signMode: [],
      columns: [
        {
          title: '流程人员',
          dataIndex: 'description',
          width: '35%',
        },
        {
          title: '签名方式',
          dataIndex: 'signMode',
          width: '15%',
        },
        {
          title: '顺序',
          dataIndex: 'orderNum',
          width: '10%',
        },
        {
          title: '操作',
          dataIndex: 'operation',
        },
      ],
      editingKey: '',
    }
  },
  created() {
    this.getDictData()
    this.getSignType()
    this.getData()
  },
  methods: {
    mode_filter(val) {
      const relation = {
        none: '不签名',
        picture: '图片签名',
        electronic: '电子签名',
      }
      return relation[val]
    },
    getDictData() {
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.signConfig.dictContent,
        method: 'POST',
        data: qs.stringify({
          list: JSON.stringify(['@signType@']),
        }),
      }).then((res) => {
        // eslint-disable-next-line ts/no-this-alias
        const _this = this
        if (res.success) {
          const relation = {
            notSign: 'none',
            picSign: 'picture',
            eleSign: 'electronic',
          }
          // eslint-disable-next-line array-callback-return
          res.attributes.signType.map((it) => {
            _this.signMode.push({ ...it, typecode: relation[it.typecode] })
          })
        }
      })
    },
    getSignType() {
      this.spinning = true
      window.$oAjax.get(window.$oApi.signConfig.signType).then((res) => {
        this.signType = res.data
      })
    },
    getData() {
      window.$oAjax({
        method: 'GET',
        url: `${window.$oApi.signConfig.list}`,
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success(res.message || '数据加载成功！')
          // eslint-disable-next-line array-callback-return
          res.data.map((it) => {
            it.tooltipVisible = false
          })
          this.data = res.data
          this.cacheData = this.data.map(item => ({ ...item }))
        }
        else {
          window.$oAntdMessage.error(res.message || '数据加载失败！')
        }
      })
    },
    handleChange(value, key, column) {
      const newData = [...this.data]
      const target = newData.filter(item => key === item.id)[0]
      if (target) {
        target[column] = value
        this.data = newData
      }
    },
    keyup(event, record, column) {
      const newData = [...this.data]
      const target = newData.filter(item => record.id === item.id)[0]
      const value = event.target.value
      // eslint-disable-next-line regexp/no-unused-capturing-group
      if (value !== '' && !/(^[1-9]\d*$)/.test(value)) {
        record.tooltipVisible = true
        setTimeout(() => {
          record.tooltipVisible = false
        }, 1000)
      }
      else {
        record.tooltipVisible = false
        if (target) {
          target[column] = value
          this.data = newData
        }
      }
    },
    edit(key) {
      const newData = [...this.data]
      const target = newData.filter(item => key === item.id)[0]
      this.editingKey = key
      if (target) {
        target.editable = true
        this.data = newData
      }
    },
    save(key) {
      const newData = [...this.data]
      const newCacheData = [...this.cacheData]
      const target = newData.filter(item => key === item.id)[0]
      const targetCache = newCacheData.filter(item => key === item.id)[0]
      if (target && targetCache) {
        window.$oAjax
          .put(window.$oApi.signConfig.default, {
            id: target.id,
            orderNum: target.orderNum,
            signMode: target.signMode,
          }, {
            headers: {
              'content-type': 'application/json',
            },
          })
          .then(() => {
            this.getData()
          })
      }
      this.editingKey = ''
    },
    cancel(key) {
      const newData = [...this.data]
      const target = newData.filter(item => key === item.id)[0]
      this.editingKey = ''
      if (target) {
        Object.assign(
          target,
          this.cacheData.filter(item => key === item.id)[0],
        )
        delete target.editable
        this.data = newData
      }
    },
    signTypeChange() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      if (_this.signType.propertyValue === '1') {
        window.$oAntdConfirm({
          title: '确定要将电子签名模式切换成签审合一吗?',
          content:
            '该操作会把系统控制参数【审核批准时查看记录报告的方式】切换成【pdf】',
          okText: '确定',
          okType: 'primary',
          cancelText: '取消',
          onOk() {
            _this.signTypeChangeHandle()
          },
          onCancel() {
            _this.signType.propertyValue
              = _this.signType.propertyValue === '1' ? '0' : '1'
          },
        })
      }
      else if (_this.signType.propertyValue === '0') {
        window.$oAntdConfirm({
          title: '确定要将电子签名模式切换成签审分离吗?',
          content: '',
          okText: '确定',
          okType: 'primary',
          cancelText: '取消',
          onOk() {
            _this.signTypeChangeHandle()
          },
          onCancel() {
            _this.signType.propertyValue
              = _this.signType.propertyValue === '0' ? '1' : '0'
          },
        })
      }
    },
    signTypeChangeHandle() {
      window.$oAjax({
        url: window.$oApi.signConfig.signType,
        method: 'PUT',
        params: { id: this.signType.id, value: this.signType.propertyValue },
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success(res.message || '切换成功！')
        }
        else {
          this.signType.propertyValue
            = this.signType.propertyValue === '1' ? '0' : '1'
          window.$oAntdMessage.success(res.message || '切换失败！')
        }
      })
    },
  },
}
</script>

<style></style>
