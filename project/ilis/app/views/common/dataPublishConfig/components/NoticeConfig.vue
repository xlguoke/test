<template>
  <div>
    <a-table
      key="id"
      :data-source="properties"
      :columns="columns"
      :bordered="true"
      size="small"
      :pagination="false"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'value'">
          <a-switch
            checked-children="启用"
            un-checked-children="关闭"
            :checked="text === '1'"
            :loading="loading"
            @change="(checked) => handleSwitcher(checked, record)"
          />
        </template>
      </template>
    </a-table>
  </div>
</template>

<script>
import common from '../common'

export default {
  name: 'NoticeConfig',
  mixins: [common],
  data() {
    return {
      columns: [
        { title: '消息类型', dataIndex: 'description' },
        { title: '消息标题', dataIndex: 'explains' },
        {
          title: '开启推送',
          dataIndex: 'value',
        },
      ],
      properties: [],
      loading: false,
    }
  },
  methods: {
    async active() {
      await this.getNoticeProperties()
    },
    async getNoticeProperties() {
      window.$oAjax.get('/rest/publish-config/notice-properties').then((res) => {
        if (res.code === 20000) {
          this.properties = res.data
        }
        else {
          window.$oAntdMessage.warning('未能获取到Data Provider配置参数')
        }
      })
    },
    handleSwitcher(checked, record) {
      const val = checked ? '1' : '0'
      this.loading = true
      this.update(record.id, record.explains, val, 'notice')
        .then((res) => {
          this.loading = false
          if (res.code === 22000) {
            record.value = val
            window.$oAntdMessage.success('更新成功')
          }
          else {
            window.$oAntdMessage.warning('更新失败')
          }
        })
        .catch(() => {
          this.loading = false
          window.$oAntdMessage.error('更新失败')
        })
    },
  },
}
</script>

<style scoped></style>
