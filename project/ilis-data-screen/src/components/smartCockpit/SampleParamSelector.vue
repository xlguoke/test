<template>
  <div class="flex gap-30">
    <a-select
      v-model:value="sampleId"
      class="w-420"
      :options="sampleOptions"
      allow-clear
      placeholder="请选择样品"
      show-search
      @change="onChangeSample"
    ></a-select>

    <a-select
      v-model:value="paramId"
      class="w-420"
      :options="paramsOptions"
      allow-clear
      :loading="loading"
      :placeholder="`请选择${type === 'nonconformity' ? '参数' : '指标'}`"
      show-search
      @change="onChangeParam"
    ></a-select>
  </div>
</template>

<script setup lang="ts">
import {
  getSupplierNonconformitySample,
  getSupplierStabilitySample,
  getSupplierNonconformityParams,
  getSupplierStabilityParams
} from "@/api/smartCockpit.test.api"
import { computed, PropType, ref, watch } from "vue"
import { IOption } from "@/interface/IOption"

const emits = defineEmits(["onSelect", "update:checked"])

const props = defineProps({
  type: {
    // nonconformity - 不合格
    // nonconformity - 稳定性
    type: String as PropType<"nonconformity" | "stability">,
    default: ""
  },
  query: {
    type: Object,
    default: () => ({})
  }
})

const sampleOptions = ref<IOption[]>([])

const paramsOptions = ref<IOption[]>([])

const sampleId = ref<string>()

const paramId = ref<string>()

const query = computed(() => props.query)

const loading = ref(false)

watch(
  query,
  (newVal, oldVal) => {
    if (newVal && oldVal) {
      if (newVal.start === oldVal.start && newVal.end === oldVal.end) {
        return
      }
    }

    sampleOptions.value = []
    paramsOptions.value = []
    sampleId.value = undefined
    paramId.value = undefined
    loadSampleList()
  },
  { deep: true, immediate: true }
)

function onChangeSample(val) {
  paramId.value = undefined

  if (val) {
    loadParamsList()
  }

  emits("onSelect", {
    sampleName: sampleId.value,
    paramName: paramId.value
  })
}

function onChangeParam() {
  emits("onSelect", {
    sampleName: sampleId.value,
    paramName: paramId.value
  })
}

async function loadParamsList() {
  if (sampleId.value) {
    if (props.type === "nonconformity") {
      const res = await getSupplierNonconformityParams({
        sampleName: sampleId.value,
        ...query.value
      })

      paramsOptions.value = res.data.map((item) => ({
        label: item.paramName,
        value: item.paramName
      }))
    }

    if (props.type === "stability") {
      const res = await getSupplierStabilityParams({
        sampleName: sampleId.value,
        ...query.value
      })
      paramsOptions.value = res.data.map((item) => ({
        label: item.paramName,
        value: item.paramName
      }))
    }
  }
}

async function loadSampleList() {
  if (props.type === "nonconformity") {
    loading.value = true
    const res = await getSupplierNonconformitySample(query.value).finally(() => {
      loading.value = false
    })
    sampleOptions.value = (res.data || []).map((item) => ({
      label: item.sampleName,
      value: item.sampleName
    }))

    const data = localStorage.getItem("smartCockpitTestNonconformityQuery")
    if (data) {
      const queryData = JSON.parse(data)
      const item: any = sampleOptions.value.find((i: any) => i.value === queryData.sampleName)
      if (item) {
        sampleId.value = queryData.sampleName

        loading.value = true
        await loadParamsList().finally(() => {
          loading.value = false
        })

        const selectParamItem = paramsOptions.value.find((i) => i.value === queryData.paramName)
        if (selectParamItem) {
          paramId.value = queryData.paramName
          emits("onSelect", {
            sampleName: queryData.sampleName,
            paramName: queryData.paramName
          })
          return
        }
      }
    }

    emits("onSelect")
  }

  if (props.type === "stability") {
    loading.value = true

    const res = await getSupplierStabilitySample(query.value).finally(() => {
      loading.value = false
    })

    sampleOptions.value = (res.data || []).map((item) => ({
      label: item.sampleName,
      value: item.sampleName
    }))

    const data = localStorage.getItem("smartCockpitTestStabilityQuery")
    if (data) {
      const queryData = JSON.parse(data)

      const item: any = sampleOptions.value.find((i: any) => i.value === queryData.sampleName)
      if (item) {
        sampleId.value = queryData.sampleName

        loading.value = true
        await loadParamsList().finally(() => {
          loading.value = false
        })

        const selectParamItem = paramsOptions.value.find((i) => i.value === queryData.paramName)
        if (selectParamItem) {
          paramId.value = queryData.paramName
          emits("onSelect", {
            sampleName: queryData.sampleName,
            paramName: queryData.paramName
          })
          return
        }
      }
    }

    if (sampleOptions.value.length > 0) {
      const firstItem: any = sampleOptions.value[0]
      loading.value = true
      await loadParamsList().finally(() => {
        loading.value = false
      })

      if (firstItem.children && firstItem.children.length > 0) {
        const selectNode = firstItem.children[0]
        paramId.value = selectNode.value
        emits("onSelect", selectNode)
      }
    } else {
      emits("onSelect")
    }
  }
}
</script>

<style lang="less" scoped></style>
