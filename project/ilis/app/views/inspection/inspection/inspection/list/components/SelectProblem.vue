<template>
  <div>
    <a-table
      :data-source="data"
      :columns="column"
      :row-selection="{ selectedRowKeys: rowKeys, onChange: change }"
      row-key="id"
    >
    </a-table>
  </div>
</template>

<script>
export default {
  name: 'SelectProblem',
  props: {
    data: {},
    record: {
      require: true,
    },
  },
  data() {
    return {
      rowKeys: [],
      column: [
        {
          title: '常见问题',
          dataIndex: 'content',
        },
      ],
      key: '',
    }
  },
  created() {},
  methods: {
    change(value) {
      if (value.length === 0) {
        this.rowKeys = []
      }
      else if (value.length === 1) {
        this.rowKeys = [value[0]]
      }
      else {
        this.rowKeys = [value[1]]
      }
    },
  },
}
</script>

<style scoped></style>
