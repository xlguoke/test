<!-- 信息卡片自定义弹窗 -->
<template>
  <HtModal
    v-model:open="showDialog"
    title="列信息可见性编辑"
    :after-close="onClosed"
    @ok="onOk"
  >
    <a-space direction="vertical" style="width: 100%;">
      <a-alert message="选择隐藏字段后，列表信息将不再展示！" type="warning" show-icon></a-alert>
      <div
        v-for="item in param.options"
        :key="item.label"
        class="h-[40px] bg-[var(--colorPrimaryBg)] flex items-center px-[12px]"
      >
        <a-button
          :icon="!item.hidden ? h(EyeOutlined, { style: { color: 'var(--colorPrimary)', fontSize: '16px' } }) : h(EyeInvisibleOutlined, { style: { color: '#BDC5D1', fontSize: '16px' } })"
          type="ghost"
          @click="item.hidden = !item.hidden"
        ></a-button>
        <span class="ml-[20px]">{{ item.label }}</span>
      </div>
    </a-space>
  </HtModal>
</template>

<script setup lang='ts'>
import type { IComparisonInfoCardOption } from '../interface/IComparisonInfoCardOption'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons-vue'

interface IProps {
  /** 卡片选项 */
  options: IComparisonInfoCardOption[]
}

const props = defineProps<IDialogPropsParam<any, IProps>>()

const showDialog = ref(true)

function onOk() {
  props.onConfirm(props.param?.options)
  showDialog.value = false
}
</script>
