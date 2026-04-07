<!-- 归档地址配置/选择弹窗 - 与 JSP 完全一致 -->
<template>
  <HtModal
    v-model:open="visible"
    :title="modalTitle"
    width="90%"
    height="90%"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <div class="flex flex-col gap-[16px]">
      <!-- 操作按钮 - 配置模式显示 -->
      <div v-if="!isSelectorMode" class="flex justify-between items-center">
        <a-space>
          <a-button
            v-permission="'saveArchiveSite'"
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
        :entity="ArchiveSiteEntity"
        :data-source="dataSource"
        :loading="loading"
        :show-index="false"
        :row-selection="isSelectorMode ? rowSelection : undefined"
        :custom-row="isSelectorMode ? customRow : undefined"
        resizable
      >
        <template #bodyCell="{ column, record, index }">
          <!-- 归档地址列 - 编辑状态显示输入框 -->
          <template v-if="column.dataIndex === 'site'">
            <div v-if="isEditing(index)">
              <a-input
                v-model:value="editData[index].site"
                placeholder="请输入归档地址"
                @press-enter="handleSave(index)"
              />
            </div>
            <span v-else>{{ record.site }}</span>
          </template>

          <!-- 操作列 - 配置模式显示 -->
          <template v-else-if="column.dataIndex === 'operation' && !isSelectorMode">
            <a-space>
              <a-button
                v-permission="'saveArchiveSite'"
                type="link"
                :disabled="hasEditingRow && !isEditing(index)"
                @click="handleEdit(record as ArchiveSiteEntity, index)"
              >
                编辑
              </a-button>
              <a-button
                v-permission="'delArchiveSite'"
                type="link"
                danger
                :disabled="hasEditingRow && !isEditing(index)"
                @click="handleDelete(record as ArchiveSiteEntity, index)"
              >
                删除
              </a-button>
              <a-button
                v-permission="'saveArchiveSite'"
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
import type { Key } from 'ant-design-vue/es/table/interface'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message, Modal } from 'ant-design-vue'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import { getArchiveSiteList } from '../api'
import { ArchiveSiteEntity } from '../entity/ArchiveSiteEntity'

/**
 * # 弹窗参数接口 ⚙️
 */
interface IArchiveSiteParam {
  /** 是否为选择模式 */
  isSelector?: boolean
}

/**
 * # 组件名称 ⚙️
 */
defineOptions({
  name: 'ArchiveSiteModal',
})

const props = defineProps<IDialogPropsParam<ArchiveSiteEntity[], IArchiveSiteParam>>()

/** # 弹窗可见性 📝 */
const visible = ref(true)

/** # 加载状态 📝 */
const loading = ref(false)

/** # 数据源 📝 */
const dataSource = ref<ArchiveSiteEntity[]>([])

/** # 表格引用 📝 */
const tableRef = ref()

/** # 当前编辑行索引 📝 */
const editingIndex = ref<number>(-1)

/** # 编辑数据缓存 📝 */
const editData = ref<ArchiveSiteEntity[]>([])

/** # 原始数据缓存（用于比较变化）📝 */
const originalData = ref<ArchiveSiteEntity[]>([])

/** # 选中的行 📝 */
const selectedRowKeys = ref<Key[]>([])

/** # 选中的行数据 📝 */
const selectedRows = ref<ArchiveSiteEntity[]>([])

/** # 当前用户名 📝 */
const username = ref('')

/**
 * # 是否为选择模式 📝
 */
const isSelectorMode = computed(() => props.param?.isSelector === true)

/**
 * # 弹窗标题 📝
 */
const modalTitle = computed(() => isSelectorMode.value ? '选择归档地址' : '归档地址配置')

/**
 * # 是否有正在编辑的行 📝
 */
const hasEditingRow = computed(() => editingIndex.value !== -1)

/**
 * # 行选择配置 📝
 */
const rowSelection = computed(() => ({
  type: 'radio' as const,
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: Key[], rows: ArchiveSiteEntity[]) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
  },
}))

/**
 * # 自定义行配置 - 选择模式下点击行选中 📝
 */
function customRow(record: ArchiveSiteEntity) {
  return {
    onClick: () => {
      selectedRowKeys.value = [record.id as Key]
      selectedRows.value = [record]
    },
  }
}

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
  try {
    const { data } = await getArchiveSiteList({})
    dataSource.value = data?.rows || []
    // 初始化编辑数据缓存
    editData.value = JSON.parse(JSON.stringify(dataSource.value))
    originalData.value = JSON.parse(JSON.stringify(dataSource.value))
  }
  catch (error) {
    console.error('加载数据失败:', error)
    message.error('加载数据失败')
  }
  finally {
    loading.value = false
  }
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
    message.error('请先输入地址，保存数据')
    editingIndex.value = lastIndex
    return
  }

  // 添加新行
  const newRow = ArchiveSiteEntity.fromJSON({
    site: '',
    createDate: new Date(),
    createName: username.value,
  })
  dataSource.value.push(newRow)
  editData.value.push(ArchiveSiteEntity.fromJSON({ ...newRow }))
  originalData.value.push(ArchiveSiteEntity.fromJSON({ ...newRow }))

  // 进入编辑模式
  editingIndex.value = dataSource.value.length - 1
}

/**
 * # 处理编辑 ✏️
 * @param record 行数据
 * @param index 行索引
 */
async function handleEdit(record: ArchiveSiteEntity, index: number) {
  if (!record.id) {
    // 新增行直接编辑
    editingIndex.value = index
    return
  }

  // 检查地址是否被使用
  try {
    const { data } = await IlisApiHelper.get<any>('archiveSiteController.do?countArchiveBySite', {
      archiveSiteId: record.id,
    })

    if (data?.obj > 0) {
      // 地址已被使用，提示确认
      Modal.confirm({
        title: '确认编辑',
        content: '当前归档地址已被使用，修改后将相应报告归档地址，是否继续？',
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
    console.error('检查地址使用状态失败:', error)
    message.error('检查地址使用状态失败')
  }
}

/**
 * # 处理删除 🗑️
 * @param record 行数据
 * @param index 行索引
 */
function handleDelete(record: ArchiveSiteEntity, index: number) {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该归档地址吗？',
    onOk: async () => {
      if (record.id) {
        // 有 id 调用删除接口
        try {
          await IlisApiHelper.postForm('archiveSiteController.do?delArchiveSite', {
            archiveSiteId: record.id,
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

  if (!row.site) {
    message.error('请输入归档地址')
    return
  }

  const url = row.id ? 'archiveSiteController.do?saveOrUpdate' : 'archiveSiteController.do?saveOrUpdate'
  const data = row.id ? { id: row.id, site: row.site } : { site: row.site }

  const { data: res } = await IlisApiHelper.postForm<any>(url, data)
  message.success('保存成功')

  // 更新数据源
  dataSource.value[index] = { ...row, id: res.obj || row.id }
  originalData.value[index] = { ...dataSource.value[index] }
  editData.value[index] = { ...dataSource.value[index] }

  editingIndex.value = -1
}

/**
 * # 处理确认按钮点击 ✅
 */
function handleOk() {
  // 选择模式
  if (isSelectorMode.value) {
    if (selectedRows.value.length === 0) {
      message.warning('请选择归档地址')
      return
    }
    visible.value = false
    props.onConfirm(selectedRows.value)
    return
  }

  // 配置模式
  // 如果有正在编辑的行，先保存
  if (editingIndex.value !== -1) {
    handleSave(editingIndex.value)
  }
  visible.value = false
  props.onConfirm(dataSource.value)
}
</script>
