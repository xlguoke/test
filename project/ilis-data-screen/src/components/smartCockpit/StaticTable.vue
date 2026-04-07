<template>
  <div class="static-table-wrap pt-60">
    <div v-if="loading" class="static-table-loading">
      <LoadingOutlined />
      加载中...
    </div>

    <ul class="table-head">
      <li class="table-tr">
        <div
          v-for="head in columns"
          :key="head.key"
          :class="`text-${head.align || 'center'} table-td`"
          :style="{ width: head.width || '0', flex: head.width ? 'inherit' : 1 }"
        >
          {{ head.title }}
        </div>
      </li>
    </ul>
    <div class="table-body">
      <div v-for="(d, i) in dataList" :key="i" class="table-tr">
        <div
          v-for="head in columns"
          :key="head.key"
          :class="`text-${head.align || 'center'} table-td`"
          :style="{ width: head.width || '0', flex: head.width ? 'inherit' : 1 }"
        >
          <slot :name="head.key" :item="d">
            {{ d[head.key] || "" }}
          </slot>
        </div>
      </div>
      <NoData v-if="!loading && dataList.length === 0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import NoData from "./NoData.vue"
import { LoadingOutlined } from "@ant-design/icons-vue"

export interface DataTableHead {
  title: string
  key: string
  align?: "left" | "center" | "right"
  width?: string
}

const props = withDefaults(
  defineProps<{
    columns: DataTableHead[]
    datas: Record<string, any>[]
    loading: boolean
  }>(),
  {
    columns: () => [],
    datas: () => [],
    loading: false
  }
)

const dataList = computed(() => props.datas)
</script>

<style scoped lang="less">
.static-table-wrap {
  display: flex;
  height: 100%;
  flex: 1;
  flex-direction: column;
  color: #fff;
  position: relative;

  .static-table-loading {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.4rem;
    z-index: 100;
    background: rgba(0, 0, 0, 0.4);
    font-size: 0.38rem;
  }

  .table-tr {
    display: flex;
  }

  .table-td {
    padding: 0.1rem 0.3rem;
    display: flex;
    align-items: center;
    word-break: break-all;
    font-size: 0.36rem;
    line-height: 0.46rem;
    background-color: rgba(64, 231, 214, 0.04);
    border-right: 1px solid rgba(76, 184, 176, 0.4);
    border-bottom: 1px solid rgba(76, 184, 176, 0.4);
  }

  .table-head {
    border-top: 1px solid rgba(76, 184, 176, 0.4);
    border-left: 1px solid rgba(76, 184, 176, 0.4);
    margin-bottom: 0;
    background: rgba(64, 231, 213, 0.1);
    min-height: 1.3rem;

    .table-tr {
      background-color: rgba(64, 231, 214, 0.1);
      height: 100%;
    }

    .table-td {
      height: 100%;
    }
  }

  .table-body {
    margin-top: 0.04rem;
    flex: 1;
    height: 0;
    overflow-y: auto;

    .table-tr {
      min-height: calc(100% / 10);

      .table-td:first-child {
        border-left: 1px solid rgba(76, 184, 176, 0.4);
      }

      &:nth-child(2n) {
        background-color: rgba(64, 231, 214, 0.1);
      }
    }

    &::-webkit-scrollbar {
      width: 0px;
      height: 0px;
      background-color: #03174a;
      border-radius: 5px;
    }
  }

  .text-left {
    justify-content: flex-start;
  }
  .text-center {
    justify-content: center;
  }
  .text-right {
    justify-content: flex-end;
  }
}
</style>
