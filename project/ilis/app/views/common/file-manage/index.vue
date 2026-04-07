<template>
  <IlisContainer
    app-id="file-manage"
    :body-style="{ flex: 1, height: 0, padding: '0px', overflowY: 'auto', backgroundColor: 'var(--colorBgLayout)' }"
  >
    <BaseSpinWrapper :spinning="loading">
      <div class="flex h-full">
        <div class="w-[280px] mr-[4px] bg-[var(--colorBgContainer)] px-[12px] py-[16px]">
          <FileCatalogTree
            @select="selectedFolderId = $event"
          ></FileCatalogTree>
        </div>
        <div class="flex-1 h-full flex flex-col pb-[12px]">
          <div class="mb-[27px] bg-[var(--colorBgContainer)] p-[16px]">
            <IlisFormSearch
              class="mb-[14px]"
              :entity="FileSearchEntity"
              @search="searchParams = $event"
              @reset="searchParams = undefined"
            ></IlisFormSearch>
            <!-- 操作列 -->
            <div v-if="selectedFolderId" class="w-full flex items-center gap-3">
              <HtUploadFile
                ref="uploadRef"
                :key="selectedFolderId"
                v-model:loading="loading"
                v-permission="'fileManageUpload'"
                :business-type="BUSINES_TYPE.DOCUMENT_MANAGEMENT"
                :business-id="selectedFolderId"
                :order-by="orderByField"
                :order="orderDirection"
                recursion
                hide-file-list
                @get-data="handleGetData"
                @get-qr-code-key="qrCodeKey = $event"
              />
              <a-button
                v-permission="'fileManageDownload'"
                @click="handleBatchDownload()"
              >
                下载文件
              </a-button>
              <a-button
                v-permission="'fileManageFileVisble'"
                @click="handleBatchHideFile()"
              >
                隐藏文件
              </a-button>
              <a-button
                v-permission="'fileManageDel'"
                @click="handleBatchDelete()"
              >
                删除文件
              </a-button>
              <!-- 排序功能 -->
              <div class="flex-1 flex justify-end">
                <a-select
                  v-model:value="sortValue"
                  style="width: 140px"
                  placeholder="排序方式"
                  :options="options"
                  @change="handleSortChange"
                >
                </a-select>
              </div>
            </div>
          </div>
          <a-checkbox-group
            v-model:value="selectedIds"
            class="flex-1 overflow-auto"
            style="width: 100%"
          >
            <div v-if="selectedFolderId" class=" relative px-[18px] flex-1 overflow-auto flex flex-wrap items-start gap-4">
              <label
                v-for="item in filteredDataSource"
                :key="item.attachmentId"
                class=" relative"
              >
                <a-checkbox :value="item.attachmentId" class="!absolute top-[2px] left-[4px] z-10" size="large"></a-checkbox>
                <FileCard
                  :file="item"
                  :qr-key="qrCodeKey"
                  @change="uploadRef?.init()"
                ></FileCard>
              </label>
            </div>
          </a-checkbox-group>

          <div v-if="selectedFolderId" class="flex items-center justify-between px-[12px] pt-[12px]">
            <span>共 {{ filteredTotal }} 条数据</span>
            <a-pagination v-model:current="current" v-model:page-size="pageSize" show-quick-jumper :total="filteredTotal" />
          </div>
        </div>
      </div>
    </BaseSpinWrapper>
  </IlisContainer>
</template>

<script lang="ts" setup>
import type { SelectValue } from 'ant-design-vue/es/select'
import type { EOrderByField, IFileEntity } from './api'
import { message, Modal } from 'ant-design-vue'
import { watch } from 'vue'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import { deleteFileBatch, EOrderDirection, hideFile } from './api'
import FileCard from './components/FileCard.vue'
import FileCatalogTree from './components/FileCatalogTree.vue'
import { FileSearchEntity } from './FileSearchEntity'

const uploadRef = ref<InstanceType<typeof HtUploadFile>>()

const loading = ref(false)

const selectedFolderId = ref('')

const dataSource = reactive<IFileEntity[]>([])

const searchParams = ref<Record<string, any>>()

const current = ref(1)

const pageSize = ref(10)

const qrCodeKey = ref('')

/** # 选中的文件ID列表 */
const selectedIds = ref<string[]>([])

/** # 排序值，默认添加时间倒序 */
const sortValue = ref('createDate-DESC')

/** # 排序字段 */
const orderByField = ref<EOrderByField | undefined>()

/** # 排序方向 */
const orderDirection = ref<EOrderDirection | undefined>(EOrderDirection.DESC)

const options = [
  { label: '文件名升序', value: 'fileName-ASC' },
  { label: '文件名降序', value: 'fileName-DESC' },
  { label: '文件类型升序', value: 'fileType-ASC' },
  { label: '文件类型降序', value: 'fileType-DESC' },
  { label: '添加时间升序', value: 'createDate-ASC' },
  { label: '添加时间倒序', value: 'createDate-DESC' },
]

/** # 处理排序变更 */
function handleSortChange(value: SelectValue) {
  const [field, direction] = String(value).split('-') as [EOrderByField, EOrderDirection]
  orderByField.value = field as EOrderByField
  orderDirection.value = direction
  nextTick(() => {
    uploadRef.value?.init()
  })
}

// 监听搜索条件变化，重置页码
watch([searchParams, selectedFolderId], () => {
  current.value = 1
}, { deep: true })

// 监听文件夹变化时，重置排序为默认
watch(selectedFolderId, () => {
  sortValue.value = 'createDate-DESC'
  orderByField.value = undefined
  orderDirection.value = undefined
})

const filteredDataSource = computed(() => {
  // 先进行数据过滤
  const filtered = searchParams.value?.q
    ? dataSource.filter(item => item.name.includes(searchParams.value?.q || ''))
    : dataSource

  // 基于过滤后的数据进行分页
  const start = (current.value - 1) * pageSize.value
  const end = current.value * pageSize.value
  return filtered.slice(start, end)
})

// 计算过滤后的数据总数
const filteredTotal = computed(() => {
  if (!searchParams.value?.q) {
    return dataSource?.length || 0
  }
  return dataSource.filter(item => item.name.includes(searchParams.value?.q || '')).length
})

function handleGetData({ fileDatas }: { fileDatas: any }) {
  dataSource.splice(0, dataSource.length, ...fileDatas)
}

async function handleBatchDelete() {
  if (!selectedIds.value?.length) {
    message.warning('请选择要删除的文件')
    return
  }
  Modal.confirm({
    title: '确认删除选中的文件吗？',
    okText: '确认',
    okType: 'danger',
    onOk: async () => {
      loading.value = true
      await deleteFileBatch(selectedIds.value).finally(() => {
        loading.value = false
      })
      message.success('删除成功')
      selectedIds.value = []
      await uploadRef.value?.init()
    },
  })
}

async function handleBatchDownload() {
  if (!selectedIds.value?.length) {
    message.warning('请选择要下载的文件')
    return
  }
  const selectedFiles = selectedIds.value.map(id => dataSource.find(item => item.attachmentId === id))
  if (selectedFiles?.length) {
    loading.value = true
    await Promise.all(selectedFiles.map(async (file) => {
      return downloader.excute(file!.url, file!.name)
    })).finally(() => {
      loading.value = false
    })
  }
}

async function handleBatchHideFile() {
  if (!selectedIds.value?.length) {
    message.warning('请选择要隐藏的文件')
    return
  }
  loading.value = true
  await hideFile({
    hide: true,
    docIds: selectedIds.value,
  }).finally(() => {
    loading.value = false
  })
  message.success('隐藏成功')
  selectedIds.value = []
  await uploadRef.value?.init()
}
</script>
