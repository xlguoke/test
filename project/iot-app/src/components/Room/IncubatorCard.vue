<template>
  <div card line-height-22 px8 whitespace-nowrap>
    <div mb8 ellipsis>
      {{ data.name }}
    </div>
    <div mb8 flex-x justify-between>
      <div flex-x>
        <img src="@/assets/tColorIconBig.svg" class="h12 w12">
        <span class="ml4">标准温度：</span>
      </div>
      <div>{{ baseConfig.temRange || '--' }}</div>
    </div>
    <div mb8 flex-x justify-between>
      <div flex-x>
        <img src="@/assets/tColorIconBig.svg" class="h12 w12">
        <span class="ml4">当前温度：</span>
      </div>
      <div>{{ data.temperature || '--' }}<span v-if="data.temperature">℃</span></div>
    </div>
    <div mb8 flex-x justify-between>
      <div flex-x>
        <img src="@/assets/rhColorIconBig.svg" class="h12 w12">
        <span class="ml4">标准湿度：</span>
      </div>
      <div>{{ baseConfig.humRange || '--' }}</div>
    </div>
    <div mb8 flex-x justify-between>
      <div flex-x>
        <img src="@/assets/rhColorIconBig.svg" class="h12 w12">
        <span class="ml4">当前湿度：</span>
      </div>
      <div>{{ data.humidity || '--' }}<span v-if="data.humidity">%rh</span></div>
    </div>
    <van-button
      size="small"
      type="primary"
      w-full
      @click="onDetail"
    >
      数据详情
    </van-button>
  </div>
</template>

<script lang="ts" setup>
import type { HumitureBookBaseConfig } from '@/pages/incubator'

const props = defineProps<{
  data: Record<string, any>
  baseConfig: HumitureBookBaseConfig
}>()

const router = useRouter()

function onDetail() {
  router.push({
    path: `/incubator/${props.data.id}`,
    query: {
      name: props.data.name,
    },
  })
}
</script>
