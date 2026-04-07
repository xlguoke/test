<template>
  <div>
    <a-table
      key="id"
      :data-source="configs"
      :columns="columns"
      :bordered="true"
      size="small"
      :pagination="false"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'explains'">
          <a-select
            v-if="record.editable"
            mode="multiple"
            :default-value="text.length > 0 ? text.split('|') : []"
            style="width: 100%"
            placeholder="Please select"
            @change="(val) => (record.explains = val.join('|'))"
          >
            <a-select-option
              v-for="associate in associateHolder(record.paramId)"
              :key="associate"
            >
              {{ associate }}
            </a-select-option>
          </a-select>
          <span v-else>
            {{ text }}
          </span>
        </template>
        <template v-if="column.dataIndex === 'value'">
          <a-input
            v-if="record.editable"
            style="margin: -5px 0"
            :value="text"
            @change="(e) => (record.value = e.target.value)"
          />
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <template v-if="record.editable">
              <a @click="() => save(record)">save</a>
              <a-popconfirm
                title="Sure to cancel?"
                @confirm="() => cancel(record)"
              >
                <a>cancel</a>
              </a-popconfirm>
            </template>
            <template v-else>
              <a :disabled="editing" @click="() => edit(record)">edit</a>
            </template>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script>
import common, { PROVIDERS } from '../common'

export default {
  name: 'ProviderConfig',
  mixins: [common],
  data() {
    return {
      columns: [
        { title: 'Data Object', dataIndex: 'description', width: 120 },
        {
          title: 'Associates',
          dataIndex: 'explains',
        },
        {
          title: 'Filters',
          dataIndex: 'value',
        },
        {
          title: 'Operation',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' },
          width: 200,
        },
      ],
      configs: [],
      providerProperties: new Map(),
      editing: false,
      cache: {},
    }
  },
  methods: {
    async active() {
      const res = await this.getRawParams(false)
      await this.getProviderProperties()
      if (res.code === 20000) {
        this.configs = res.data.map(d => ({ ...d, editable: false }))
      }
      else {
        window.$oAntdMessage.warning('未能获取到Data Provider 相关配置参数')
      }
    },
    async getProviderProperties() {
      window.$oAjax.get('/rest/publish-config/provider-properties').then((res) => {
        if (res.code === 20000) {
          this.providerProperties = res.data
        }
        else {
          window.$oAntdMessage.warning('未能获取到Data Provider配置参数')
        }
      })
    },
    handling(conf, state) {
      conf.editable = state
      this.editing = state
    },
    edit(conf) {
      this.cache = { ...conf }
      this.handling(conf, true)
    },
    cancel(conf) {
      this.handling(conf, false)
      Object.assign(conf, this.cache)
    },
    associateHolder(val) {
      return Object.values(this.providerProperties[PROVIDERS[val]])
    },
    save(record) {
      this.update(record.id, record.explains, record.value, 'provider').then(
        (res) => {
          if (res.code === 22000) {
            window.$oAntdMessage.success('更新成功')
            this.handling(record, false)
          }
          else {
            window.$oAntdMessage.warning('更新失败')
          }
        },
      )
    },
  },
}
</script>

<style scoped></style>
