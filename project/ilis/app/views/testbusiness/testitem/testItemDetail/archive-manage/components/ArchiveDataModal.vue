<!-- 归档资料配置弹窗 - 与 JSP 完全一致 -->
<template>
  <HtModal
    v-model:open="visible"
    title="归档资料配置"
    width="90%"
    height="90%"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <div class="flex flex-col gap-[16px]">
      <!-- 操作按钮 -->
      <div class="flex justify-between items-center">
        <a-space>
          <a-button
            v-permission="'saveArchiveMaterial'"
            type="primary"
            @click="handleAdd"
          >
            新增
          </a-button>
        </a-space>
      </div>

      <!-- 表格区域 -->
      <IlisTable
        ref="tableRef"
        row-key="id"
        :entity="ArchiveDataEntity"
        :data-source="dataSource"
        :loading="loading"
        :show-index="false"
        resizable
      >
        <template #bodyCell="{ column, record, index }">
          <!-- 归档资料列 - 编辑状态显示输入框 -->
          <template v-if="column.dataIndex === 'name'">
            <div v-if="isEditing(index)">
              <a-input
                v-model:value="editData[index].name"
                placeholder="请输入归档资料名称"
                @press-enter="handleSave(index)"
              />
            </div>
            <span v-else>{{ record.name }}</span>
          </template>

          <!-- 操作列 -->
          <template v-else-if="column.dataIndex === 'operation'">
            <a-space>
              <a-button
                v-permission="'saveArchiveMaterial'"
                type="link"
                :disabled="hasEditingRow && !isEditing(index)"
                @click="handleEdit(record as ArchiveDataEntity, index)"
              >
                编辑
              </a-button>
              <a-button
                v-permission="'delArchiveMaterial'"
                type="link"
                danger
                :disabled="hasEditingRow && !isEditing(index)"
                @click="handleDelete(record as ArchiveDataEntity, index)"
              >
                删除
              </a-button>
              <a-button
                v-permission="'saveArchiveMaterial'"
                type="link"
                :disabled="!isEditing(index)"
                @click="handleSave(index)"
              >
                保存
              </a-button>
            </a-space>
          </template>
        </template>
      </IlisTable>
    </div>
  </HtModal>
</template>

<script setup lang="ts">
import type { IDialogProps } from '~/anyThing/interface/IDialogProps'
import { message, Modal } from 'ant-design-vue'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import { ArchiveDataEntity } from '../entity/ArchiveDataEntity'

/**
 * # 组件名称 ⚙️
 */
defineOptions({
  name: 'ArchiveDataModal',
})

const props = defineProps<IDialogProps<null>>()

/** # 弹窗可见性 📝 */
const visible = ref(true)

/** # 加载状态 📝 */
const loading = ref(false)

/** # 数据源 📝 */
const dataSource = ref<ArchiveDataEntity[]>([])

/** # 表格引用 📝 */
const tableRef = ref()

/** # 当前编辑行索引 📝 */
const editingIndex = ref<number>(-1)

/** # 编辑数据缓存 📝 */
const editData = ref<ArchiveDataEntity[]>([])

/** # 原始数据缓存（用于比较变化）📝 */
const originalData = ref<ArchiveDataEntity[]>([])

/** # 是否有正在编辑的行 📝 */
const hasEditingRow = computed(() => editingIndex.value !== -1)

/** # 当前用户名 📝 */
const username = ref('')

/**
 * # 组件挂载时初始化 🚀
 */
onMounted(() => {
  // 获取当前用户名
  username.value = '当前用户' // 实际应从用户信息中获取
  loadData()
})

/**
 * # 加载数据 🌐
 */
async function loadData() {
  loading.value = true
  const { data } = await IlisApiHelper.get<any>('archiveMaterialController/getMaterialAll.do', {}).finally(() => {
    loading.value = false
  })
  // JSP 中数据格式为 { obj: [...] }
  const rows = data?.obj || []
  dataSource.value = rows
  // 初始化编辑数据缓存
  editData.value = JSON.parse(JSON.stringify(rows))
  originalData.value = JSON.parse(JSON.stringify(rows))
}

/**
 * # 判断是否正在编辑 📝
 * @param index 行索引
 */
function isEditing(index: number): boolean {
  return editingIndex.value === index
}

/**
 * # 处理新增 ➕
 */
function handleAdd() {
  // 检查最后一行是否有 id
  const lastIndex = dataSource.value.length - 1
  if (lastIndex >= 0 && !dataSource.value[lastIndex].id) {
    message.error('请先输入资料名称，保存数据')
    editingIndex.value = lastIndex
    return
  }

  // 添加新行
  const newRow = ArchiveDataEntity.fromJSON({
    name: '',
    createDate: new Date(),
    createName: username.value,
  })
  dataSource.value.push(newRow)
  editData.value.push(ArchiveDataEntity.fromJSON({ ...newRow }))
  originalData.value.push(ArchiveDataEntity.fromJSON({ ...newRow }))

  // 进入编辑模式
  editingIndex.value = dataSource.value.length - 1
}

/**
 * # 处理编辑 ✏️
 * @param record 行数据
 * @param index 行索引
 */
async function handleEdit(record: ArchiveDataEntity, index: number) {
  if (!record.id) {
    // 新增行直接编辑
    editingIndex.value = index
    return
  }

  // 检查资料是否被使用（与归档地址配置类似）
  try {
    const { data } = await IlisApiHelper.get<any>('archiveMaterialController/countMaterialById.do', {
      materialId: record.id,
    })

    if (data?.obj > 0) {
      // 资料已被使用，提示确认
      Modal.confirm({
        title: '确认编辑',
        content: '当前归档资料已被使用，修改后将相应报告归档资料，是否继续？',
        onOk: () => {
          editingIndex.value = index
        },
      })
    }
    else {
      editingIndex.value = index
    }
  }
  catch (error) {
    console.error('检查资料使用状态失败:', error)
    // 如果接口不存在，直接允许编辑
    editingIndex.value = index
  }
}

/**
 * # 处理删除 🗑️
 * @param record 行数据
 * @param index 行索引
 */
function handleDelete(record: ArchiveDataEntity, index: number) {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该归档资料吗？',
    onOk: async () => {
      if (record.id) {
        // 有 id 调用删除接口
        try {
          await IlisApiHelper.postForm('archiveMaterialController/delete.do', {
            id: record.id,
          })
          message.success('删除成功')
        }
        catch (error) {
          console.error('删除失败:', error)
          message.error('删除失败')
          return
        }
      }

      // 从数据源中移除
      dataSource.value.splice(index, 1)
      editData.value.splice(index, 1)
      originalData.value.splice(index, 1)

      // 如果删除的是编辑行，重置编辑状态
      if (editingIndex.value === index) {
        editingIndex.value = -1
      }
      else if (editingIndex.value > index) {
        editingIndex.value--
      }
    },
  })
}

/**
 * # 处理保存 ✅
 * @param index 行索引
 */
async function handleSave(index: number) {
  const row = editData.value[index]
  const originalRow = originalData.value[index]

  // 检查数据是否有变化
  const hasChanged = JSON.stringify(row) !== JSON.stringify(originalRow)

  if (!hasChanged && row.id) {
    // 数据无变化且不是新增行，直接退出编辑
    editingIndex.value = -1
    return
  }

  if (!row.name) {
    message.error('请输入归档资料名称')
    return
  }

  const data = row.id
    ? { id: row.id, name: row.name }
    : { name: row.name }

  // JSP 中使用 application/json 格式提交
  await IlisApiHelper.post('archiveMaterialController/saveOrUpdate.do', data)
  message.success('保存成功')
  await loadData()
  editingIndex.value = -1
}

/**
 * # 处理确认按钮点击 ✅
 */
function handleOk() {
  // 如果有正在编辑的行，先保存
  if (editingIndex.value !== -1) {
    handleSave(editingIndex.value)
  }
  visible.value = false
  props.onConfirm(null)
}
</script>
