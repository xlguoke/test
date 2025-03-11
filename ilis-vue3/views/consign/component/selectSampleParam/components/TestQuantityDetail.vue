<template>
  <a-modal
    :open="open"
    title="应收样品数量详情"
    :keyboard="false"
    :mask-closable="false"
    centered
    width="460px"
    @cancel="onCancel"
  >
    <div>
      <a-alert class="mb-2 items-baseline" show-icon>
        <template #message>
          <p>1、当前仅为预计应收样品数量，实际收样数量还受样品组数影响</p>
          <p>2、检测参数-试验数量配置，请前往“单位配置-参数试验数量设置”</p>
        </template>
      </a-alert>
      <table class="tqd-table">
        <thead class="bg-slate-50">
          <tr>
            <td width="70%" class="p-2">
              参数名称
            </td>
            <td width="30%" class="p-2">
              试验数量
            </td>
          </tr>
        </thead>
        <tbody>
          <template v-for="(arr, index1) in renderData">
            <tr v-for="(item, index2) in arr" :key="`${index1}-${index2}`">
              <td>{{ item.displayName }}</td>
              <td v-if="index1 === 0">
                <template v-if="isDefined(item.selectedTestQuantity)">
                  {{ item.selectedTestQuantity }}{{ item.unitMeasure }}
                </template>
                <template v-else>
                  -
                </template>
              </td>
              <td v-if="index1 > 0 && index2 === 0" :rowspan="arr.length">
                <template v-if="isDefined(item.selectedTestQuantity)">
                  {{ item.selectedTestQuantity }}{{ item.unitMeasure }}
                </template>
                <template v-else>
                  -
                </template>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <template #footer>
      <a-button @click="onCancel">
        关闭
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import type { ViewTestParamsItem } from '~/views/consign/component/selectSampleParam/modules/BaseTestParams.ts'
import type { UseSelectTestParam } from '~/views/consign/component/selectSampleParam/modules/UseSelectTestParam.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:open'])

const useSelectTestParam = inject('useSelectTestParam') as UseSelectTestParam

const open = computed(() => props.open)

const renderData = ref([])

watch(() => props.open, (val) => {
  if (val) {
    init()
  }
})

function init() {
  const data: ViewTestParamsItem[] = [...useSelectTestParam.selectedRows]
  const obj = {
    common: [],
  }
  const result = []

  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const shareTestQuantityIdent = item.shareTestQuantityIdent

    if (shareTestQuantityIdent) {
      if (!obj[shareTestQuantityIdent]) {
        obj[shareTestQuantityIdent] = []
      }

      obj[shareTestQuantityIdent].push(item)
    }
    else {
      obj.common.push(item)
    }
  }

  for (const key in obj) {
    result.push(obj[key])
  }

  renderData.value = result
}

// 关闭弹窗
function onCancel() {
  emits('update:open', false)
}
</script>

<style lang="less" scoped>
.tqd-table {
  width: 100%;
  border-collapse: collapse;
  border-top: solid 1px #e2e2e2;
  border-left: solid 1px #e2e2e2;

  td {
    padding: 8px;
    border-right: solid 1px #e2e2e2;
    border-bottom: solid 1px #e2e2e2;
  }
}
</style>
