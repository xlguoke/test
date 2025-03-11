<template>
  <a-form :model="formData" :label-col="{ flex: '120px' }" :wrapper-col="{ flex: 'auto' }">
    <a-form-item label="取样地点" name="samplingPlace">
      <a-input
        v-model:value="formData.samplingPlace"
        :disabled="readonly"
        :placeholder="placeholder('请输入取样地点')"
        @focus="bindSpecialCharacter(useSamplingInfo.setSpecialCharacter('samplingPlace'))"
      />
    </a-form-item>
    <a-form-item label="取样时间" name="samplingDate">
      <a-date-picker
        v-model:value="formData.samplingDate"
        style="width:100%;"
        value-format="YYYY-MM-DD"
        :disabled="readonly"
        :placeholder="placeholder('请选择取样时间')"
      />
    </a-form-item>
    <a-form-item label="取样单位" name="samplingCompany">
      <a-input
        v-model:value="formData.samplingCompany"
        :disabled="readonly"
        :placeholder="placeholder('请输入取样单位')"
        @focus="bindSpecialCharacter(useSamplingInfo.setSpecialCharacter('samplingCompany'))"
      />
    </a-form-item>
    <a-form-item label="取样人" name="samplingPerson">
      <a-input
        v-model:value="formData.samplingPerson"
        :disabled="readonly"
        :placeholder="placeholder('请输入取样人')"
        @focus="bindSpecialCharacter(useSamplingInfo.setSpecialCharacter('samplingPerson'))"
      />
    </a-form-item>
    <a-form-item label="取样人证号" name="samplingPersonNumber">
      <a-input
        v-model:value="formData.samplingPersonNumber"
        :disabled="readonly"
        :placeholder="placeholder('请输入取样人证号')"
        @focus="bindSpecialCharacter(useSamplingInfo.setSpecialCharacter('samplingPersonNumber'))"
      />
    </a-form-item>
  </a-form>
</template>

<script setup lang='ts'>
import type { UseSamplingInfo } from '../modules/UseSamplingInfo'
import { usePageState } from '~/views/consign/component/selectSample/hooks/usePageState.ts'

const useSamplingInfo = inject('useSamplingInfo') as UseSamplingInfo

// 特殊字符绑定
const bindSpecialCharacter = inject('bindSpecialCharacter')

const { readonly, placeholder } = usePageState()

const formData = computed(() => useSamplingInfo.data)
</script>
