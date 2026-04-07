<template>
  <van-popup
    v-if="show"
    v-model:show="show"
    position="right"
    :style="{ width: '90%', height: '100%' }"
    :transition-appear="true"
    @close="cancel"
  >
    <div class="flex flex-col h-full">
      <van-nav-bar
        :title="title"
        left-arrow
        @click-left="cancel"
      />
      <div class="flex py-4 font-bold bg-gray-200">
        <div class="flex-1 px-4">
          设备名称（编号）
        </div>
        <div class="w-[85px]">
          授权状态
        </div>
      </div>
      <div class="flex-1 h-0 overflow-y-auto">
        <div v-for="item in eqList" :key="item.equipmentSn" class="flex py-3 border-b leading-[18px]">
          <div class="flex-1 px-4">
            {{ item.name }}({{ item.equipmentSn }})
          </div>
          <div class="w-[85px]">
            <span v-if="item.status === '20'">审核中</span>
            <span v-if="item.status === '40'">生效中</span>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps.ts'
import { getUserAuthEqAuth } from '~/views/mobile/eqDetNotLogin/api.ts'

const props = defineProps<IDialogPropsParam<null, {
  id: string
  unitCode: string
  title: string
}>>()

const show = ref(true)

const title = computed(() => props.param.title)

const eqList = ref<any[]>([])

getUserAuthEqAuth(props.param.id, props.param.unitCode).then((res) => {
  eqList.value = res.data
})

function cancel() {
  show.value = false
}
</script>

<style lang="less" scoped>
:deep(.van-nav-bar__content) {
  background: #0066ec;
}

:deep(.van-nav-bar__title) {
  color: #fff;
  font-size: 14px;
  font-weight: initial;
}

:deep(.van-nav-bar .van-icon) {
  color: #fff;
}
</style>
