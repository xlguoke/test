<template>
  <a-collapse v-model:active-key="activeKey">
    <a-collapse-panel key="1" header="取样信息">
      <a-form
        :model="form"
        :label-col="{ span: 7 }"
        label-wrap
        :disabled="blind || disabled"
      >
        <a-form-item label="取样地点">
          <a-input v-model:value.trim="form.samplingPlace" placeholder="请输入取样地点" />
        </a-form-item>
        <a-form-item v-if="blind" label="取样时间">
          <a-input v-model:value="form.samplingDate" />
        </a-form-item>
        <a-form-item v-else label="取样时间">
          <a-date-picker
            v-model:value="form.samplingDate"
            type="date"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </a-form-item>
        <a-form-item label="取样单位">
          <a-input v-model:value.trim="form.samplingCompany" placeholder="请输入取样单位" />
        </a-form-item>
        <a-form-item label="取样人">
          <a-input v-model:value.trim="form.samplingPerson" placeholder="请输入取样人" />
        </a-form-item>
        <a-form-item label="取样人证号">
          <a-input v-model:value.trim="form.samplingPersonNumber" placeholder="请输入取样人证号" />
        </a-form-item>
      </a-form>
    </a-collapse-panel>
  </a-collapse>
</template>

<script setup lang='ts'>
export interface SpamplingFormDTO {
  samplingPlace: string
  samplingDate: string
  samplingCompany: string
  samplingPerson: string
  samplingPersonNumber: string
}

const props = defineProps({
  blind: Boolean,
  disabled: Boolean,
  samplingInfo: {
    type: Object as PropType<SpamplingFormDTO>,
    default: () => ({}),
  },
})

const activeKey = ref('1')
const form = ref<SpamplingFormDTO>({ ...props.samplingInfo })

watch(() => props.samplingInfo, (obj) => {
  if (props.blind) {
    const _f: any = {}
    for (const k in obj) {
      _f[k] = '***'
    }
    form.value = _f
  }
  else {
    form.value = obj
  }
}, {
  immediate: true,
})

function saveData() {
  return props.blind ? props.samplingInfo : { ...form.value }
}
defineExpose({ saveData })
</script>

<style scoped>
.ant-form-item{
  margin-bottom: 12px;
}
:deep(.ant-form-item .ant-form-item-label >label){
  line-height: 14px;
}
</style>
