<script setup lang="ts">
import { RightOutlined } from '@ant-design/icons-vue'
import { Modal, Radio, RadioGroup } from 'ant-design-vue'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import autoUpdate from '@/stores/autoUpdate'

const { autoUpdateNetwrok } = storeToRefs(autoUpdate())

const visible = ref<boolean>(false)
const newWorks = ref<any>({
  all: 'wifi和移动网络下',
  wifi: '仅在wifi下',
  cellular: '仅在移动网络下',
})

const updateType = ref('all')
function openSet() {
  updateType.value = autoUpdateNetwrok.value
  visible.value = true
}

function handleOk() {
  autoUpdate().setNetWork(updateType.value)
  visible.value = false
}
</script>

<template>
  <div>
    <span class="label">自动更新数据方式</span>
    <div class="value" @click="openSet">
      {{ newWorks[autoUpdateNetwrok] }}
      <RightOutlined />
    </div>

    <Modal
      v-model:open="visible"
      :closable="false"
      :mask-closable="false"
      :keyboard="false"
      centered
      class="sys-modal"
      style="width: 80%; max-width: 400px"
      @ok="handleOk"
    >
      <RadioGroup v-model:value="updateType" style="width: 100%">
        <template v-for="(v, k) in newWorks" :key="k">
          <Radio :value="k">
            {{ v }}
          </Radio>
        </template>
      </RadioGroup>
    </Modal>
  </div>
</template>

<style></style>
