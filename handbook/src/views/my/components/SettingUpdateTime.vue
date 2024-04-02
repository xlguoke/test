<script setup lang="ts">
import { RightOutlined } from '@ant-design/icons-vue'
import { Modal, Radio, RadioGroup } from 'ant-design-vue'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import autoUpdate from '@/stores/autoUpdate'

const { autoUpdateTime } = storeToRefs(autoUpdate())

const visible = ref<boolean>(false)
const updateTime = ref(1)
function openSet() {
  updateTime.value = autoUpdateTime.value
  visible.value = true
}

function handleOk() {
  autoUpdate().setUpdateTime(updateTime.value)
  visible.value = false
}
</script>

<template>
  <div>
    <span class="label">自动更新时间设置</span>
    <div class="value" @click="openSet">
      <span v-if="autoUpdateTime">每隔 {{ autoUpdateTime }} 小时更新一次</span>
      <span v-else>不自动更新</span>
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
      <RadioGroup v-model:value="updateTime" style="width: 100%">
        <Radio :value="1">
          每隔 1 小时更新一次
        </Radio>
        <Radio :value="0.5">
          每隔 0.5 小时更新一次
        </Radio>
        <Radio :value="0">
          不自动更新
        </Radio>
      </RadioGroup>
    </Modal>
  </div>
</template>

<style></style>
