<script setup lang="ts">
import { useDataAcquisition } from '../modules/useDataAcquisition'
import TextEllipsis from './TextEllipsis.vue'
import NoData from './NoData.vue'
import CustomProperties from './CustomProperties.vue'
import CellSelect from './CellSelect.vue'

defineProps({
  datas: {
    type: Array<any>,
    default: () => [],
  },
  columns: {
    type: Array<any>,
    default: () => [],
  },
})

const { formatTableCellText } = useDataAcquisition()
</script>

<template>
  <div class="data-list">
    <div class="data-table-wrap">
      <div class="data-table-body">
        <table class="data-table" style="border-right: none">
          <thead v-if="columns.length > 0">
            <tr>
              <th v-for="item in columns" :key="item.filedCode">
                {{ item.displayName }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in datas" :key="item.id">
              <td v-for="col in columns" :key="col.filedCode">
                <!-- 自定义属性 -->
                <CustomProperties
                  v-if="!!col.columnName"
                  v-model:value="item[col.filedCode]"
                  :columns="col"
                />
                <!-- 数据匹配、数据采集用途 -->
                <CellSelect
                  v-else-if="col.linkOpts"
                  v-model:value="item[col.valueKey]"
                  :columns="col.linkOpts"
                  :is-default="col.isDefault"
                />
                <!-- 文本 -->
                <TextEllipsis
                  v-else
                  :text="formatTableCellText(item, col.filedCode)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="columns.length > 0" class="data-table-handle">
        <table class="data-table">
          <thead>
            <tr>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in datas" :key="item.id">
              <td>
                <slot name="handle" :index="i" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <NoData v-if="datas.length === 0" style="border-top: 1px solid #ccc" />
  </div>
</template>

<style scoped lang="less">
.data-list {
  border: 1px solid #ccc;
  border-top: none;
  .data-table-wrap {
    display: flex;
  }

  .data-table-body {
    flex: 1;
    width: 0;
    overflow-x: auto;
  }

  .data-table-handle {
    min-width: 7rem;
    text-align: center;
  }

  .data-table {
    min-width: 100%;
    border-collapse: collapse;
    overflow: hidden;

    th,
    td {
      padding: 0.8rem 1.2rem;
      height: 3.8rem;
      border-left: 1px solid #ccc;
      border-top: 1px solid #ccc;
      white-space: nowrap;
      font-size: 1.4rem;
    }

    th {
      background-color: #f2f2f2;
    }
  }

  .data-table-body .data-table {
    th,
    td {
      &:first-child {
        border-left: none;
      }
    }
  }
}
</style>
