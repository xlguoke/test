<template>
  <a-modal
    v-model:open="internalOpen"
    centered
    title="问卷设置"
    destroy-on-close
    width="540px"
    :keyboard="false"
    :mask-closable="false"
    :body-style="{ height: '70vh', overflowY: 'auto', padding: '12px' }"
    :confirm-loading="loading"
    @cancel="internalOpen = false"
    @ok="handleOk"
  >
    <BaseTitle>问卷名称</BaseTitle>
    <IlisForm
      ref="formRef"
      :entity="EvaluateModelEntity"
      :init-data="initData"
      :cols="1"
    ></IlisForm>
    <BaseTitle>问题列表</BaseTitle>
    <a-space direction="vertical" style="width: 100%;">
      <a-button
        v-if="!data.recordNum"
        @click="editQuestionData = EvaluateQuestionEntity.fromJSON({});showEditQuestion = true"
      >
        新增问题
      </a-button>
      <a-alert
        show-icon
        type="info"
        message="按住鼠标左键可拖动调整问题顺序"
      />
      <VueDraggable
        v-model="initData.problemList"
        :animation="300"
      >
        <PreviewQuestionItem
          v-for="item in initData?.problemList"
          :key="item.id"
          :data="item"
          class=" p-3 hover:bg-[#e5f3ff]"
        >
          <template #title-right>
            <a-dropdown v-if="!data.recordNum">
              <EllipsisOutlined />
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="editQuestionData = EvaluateQuestionEntity.fromJSON(item); showEditQuestion = true">
                    <a-button type="link" size="small">
                      编辑
                    </a-button>
                  </a-menu-item>
                  <a-menu-item @click="handleDeleteQuestion(item)">
                    <a-button type="link" size="small" danger>
                      删除
                    </a-button>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </PreviewQuestionItem>
      </VueDraggable>
    </a-space>
    <EditQuestion
      v-model:show="showEditQuestion"
      :data="editQuestionData"
      :current-qustion-list="initData.problemList"
      @confirm="handleEditQuestionConfirm($event)"
    ></EditQuestion>
  </a-modal>
</template>

<script lang="ts" setup>
import { EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import { VueDraggable } from 'vue-draggable-plus'
import { createVNode } from 'vue'
import { EvaluateModelEntity } from '../EvaluateModelEntity'
import { EvaluateQuestionEntity } from '../EvaluateQuestionEntity'
import { addEvaluateModel, editEvaluateModel, getEvaluateModelDetail } from '../api'
import EditQuestion from './EditQuestion.vue'
import PreviewQuestionItem from './PreviewQuestionItem.vue'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisForm } from '~/components/ilisComponent'

const props = withDefaults(defineProps<{
  show: boolean
  data: EvaluateModelEntity
}>(), { show: false })

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const formRef = ref<IlisFormExpose<EvaluateModelEntity>>()

const internalOpen = ref(props.show)

const showEditQuestion = ref(false)

const editQuestionData = ref<EvaluateQuestionEntity>(new EvaluateQuestionEntity())

const initData = ref(props.data || new EvaluateModelEntity())

const loading = ref(false)

watch(() => props.show, (val) => {
  internalOpen.value = val
  if (val) {
    init()
  }
})

watch(internalOpen, (val) => {
  emits('update:show', val)
  if (!val) {
    emits('close')
  }
})

async function getDetail(row: EvaluateModelEntity) {
  const { data } = await getEvaluateModelDetail(row)
  initData.value = EvaluateModelEntity.fromJSON(data)
}

function handleEditQuestionConfirm(data: EvaluateQuestionEntity) {
  const index = initData.value?.problemList?.findIndex(i => i.id === data.id)
  if (index !== undefined && index !== -1) {
    initData.value?.problemList?.splice(index, 1, data)
  }
  else {
    initData.value?.problemList?.push(data)
  }
  showEditQuestion.value = false
}

async function handleOk() {
  const data = await formRef.value!.getFormData()
  data?.problemList?.forEach((item, index) => {
    item.sort = index
  })
  loading.value = true
  if (data.id) {
    await editEvaluateModel(data).finally(() => {
      loading.value = false
    })
  }
  else {
    await addEvaluateModel(data).finally(() => {
      loading.value = false
    })
  }
  message.success('操作成功')
  emits('confirm')
  internalOpen.value = false
}

function handleDeleteQuestion(row: EvaluateQuestionEntity) {
  Modal.confirm({
    title: '您正在删除问卷问题！',
    icon: createVNode(ExclamationCircleOutlined),
    content: '您确定要删除该问题吗？',
    centered: true,
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      const index = initData.value.problemList.findIndex((i: EvaluateQuestionEntity) => i.id === row.id)
      initData.value.problemList.splice(index, 1)
    },
  })
}

function init() {
  initData.value = props.data
  if (props.data?.id) {
    getDetail(props.data)
  }
}
</script>
