<template>
  <div card line-height-22>
    <div mb8 ellipsis>
      {{ data.toName }}
    </div>
    <div v-if="data.tem" mb8 flex-x justify-between>
      <div flex-x>
        <img src="@/assets/tColorIconBig.svg" class="h14 w14">
        <span class="ml4">温度：</span>
      </div>
      <div>{{ data.tem || '-' }}℃</div>
    </div>
    <div v-if="data.hum" flex-x justify-between>
      <div flex-x>
        <img src="@/assets/rhColorIconBig.svg" class="h14 w14">
        <span class="ml4">湿度：</span>
      </div>
      <div>{{ data.hum || '-' }}%RH</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  data: Record<string, any>
}>()
</script>
