<template>
  <div>
    <a-collapse v-model:active-key="activeKey">
      <a-collapse-panel
        v-for="[key, { module, properties }] of configs"
        :key="key"
        :header="module"
      >
        <a-table
          key="name"
          :data-source="properties"
          :columns="columns"
          :bordered="true"
          :show-header="false"
          size="small"
          :pagination="false"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'on'">
              <a-switch
                v-if="record.editable"
                checked-children="on"
                un-checked-children="off"
                :checked="text"
                @change="(value) => (record.on = value)"
              />
              <span v-else>
                <a-tag :color="text ? 'green' : 'volcano'">
                  {{ text ? '启用' : '未启用' }}
                </a-tag>
              </span>
            </template>
            <template v-if="column.dataIndex === 'providers'">
              <a-select
                v-if="record.editable"
                mode="multiple"
                :default-value="text"
                style="width: 100%"
                placeholder="Please select"
                @change="(value) => (record.providers = value)"
              >
                <a-select-option
                  v-for="provider in providersHolder"
                  :key="provider"
                >
                  {{ provider }}
                </a-select-option>
              </a-select>
              <span v-else>
                {{ record.providers.join('|') }}
              </span>
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
                  <a
                    :disabled="editing || record.disabled"
                    @click="() => edit(record)"
                  >edit</a>
                </template>
              </div>
            </template>
          </template>
        </a-table>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script>
import common, { PROVIDERS } from '../common'

export default {
  name: 'OperationConfig',
  mixins: [common],
  data() {
    return {
      configs: new Map(),
      activeKey: undefined,
      columns: [
        { title: '节点', dataIndex: 'name', width: 120 },
        {
          title: '启用',
          dataIndex: 'on',
          scopedSlots: { customRender: 'on' },
          width: 120,
          align: 'center',
        },
        {
          title: 'Providers',
          dataIndex: 'providers',
          scopedSlots: { customRender: 'providers' },
        },
        {
          title: 'operation',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' },
          width: 200,
        },
      ],
      editing: false,
      providersHolder: Object.keys(PROVIDERS),
      providerConfigs: [],
      cache: {},
    }
  },
  computed: {},
  mounted() {
    this.active(true)
  },
  methods: {
    async active() {
      const res = await this.getRawParams(true)
      if (res.code === 20000) {
        this.parseProperties(res.data)
      }
      else {
        window.$oAntdMessage.warning('未能获取到配置参数')
      }
    },
    parseProperties(rawData) {
      const configs = new Map()
      for (const p of rawData) {
        if (!p.typeId) {
          if (!this.activeKey) {
            this.activeKey = p.id
          }
          const group = {
            module: p.description,
            properties: [],
          }
          configs.set(p.id, group)
        }
        else {
          const group = configs.get(p.typeId)
          const prop = {
            id: p.id,
            pid: p.typeId,
            name: p.description,
            providers: p.explains.split('|'),
            disabled: p.isShow !== '1',
            on: p.value === '1',
            editable: false,
          }
          group.properties.push(prop)
        }
      }
      this.configs = configs
    },
    save(prop) {
      const providers = prop.providers
      if (providers.length < 1) {
        window.$oAntdMessage.warning('请至少选择一个Data Provider')
        return
      }
      this.restore(prop)
      this.update(
        prop.id,
        providers.join('|'),
        prop.on ? '1' : '0',
        'operation',
      ).then((res) => {
        if (res.code === 22000) {
          window.$oForceUpdate()
          window.$oAntdMessage.success('更新成功')
        }
        else {
          window.$oAntdMessage.warning('更新失败')
        }
      })
    },
    restore(prop) {
      prop.editable = false
      this.editing = false
    },
    edit(prop) {
      this.cache = { ...prop }
      prop.editable = true
      this.editing = true
      window.$oForceUpdate()
    },
    cancel(prop) {
      this.restore(prop)
      Object.assign(prop, this.cache)
      window.$oForceUpdate()
    },
  },
}
</script>

<style scoped></style>
