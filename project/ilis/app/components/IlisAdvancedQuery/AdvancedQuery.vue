<template>
  <div>
    <a-space v-if="queryTags.length > 0" class="mt-4">
      <a-tag
        v-for="item in queryTags"
        :key="item.label"
        closable
        @close="onCloseTag(item)"
      >
        {{ item.label }}：{{ item.value }}
      </a-tag>
    </a-space>

    <ht-modal
      v-model:open="entity.visible"
      title="高级查询"
      width="520px"
      :mask-closable="false"
    >
      <a-form
        class="pt-4 pr-2 max-h-[70vh] overflow-auto"
        :label-col="{ style: { width: labelWidth } }"
        :wrapper-col="{ style: { flex: 1 } }"
      >
        <template v-for="item in configs">
          <template v-if="item.type === QueryConfigType.自定义">
            <slot :name="item.name" :record="item"></slot>
          </template>
          <template v-else>
            <a-form-item :key="item.name" :label="item.label">
              <!-- 日期 -->
              <a-date-picker v-if="item.type === QueryConfigType.日期选择框" v-model:value="item.value" v-bind="item.props" />

              <!-- 日期范围 -->
              <a-range-picker
                v-else-if="item.type === QueryConfigType.日期范围框"
                v-model:value="item.value"
                class="w-full"
                v-bind="item.props"
              />

              <!-- 下拉选择框 -->
              <a-select v-else-if="item.type === QueryConfigType.选择框" v-model:value="item.value" v-bind="item.props" />

              <!-- 树选择框 -->
              <a-tree-select v-else-if="item.type === QueryConfigType.树选择框" v-model:value="item.value" v-bind="item.props" />

              <!-- 输入框 -->
              <a-input v-else v-model:value.trim="item.value" v-bind="item.props" />
            </a-form-item>
          </template>
        </template>
      </a-form>

      <template #footer>
        <a-button @click="entity.close()">
          取消
        </a-button>
        <a-button type="primary" @click="onQuery">
          查询
        </a-button>
      </template>
    </ht-modal>
  </div>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import type { IlisAdvancedQuery, QueryTagItem } from '~/components/IlisAdvancedQuery/index.ts'
import { QueryConfigType } from '~/components/IlisAdvancedQuery/index.ts'

const props = defineProps({
  entity: {
    type: Object as PropType<IlisAdvancedQuery<any>>,
    default: () => {},
  },
})

/** 实体 */
const entity = computed(() => props.entity)

/** label宽度 */
const labelWidth = computed(() => entity.value?.labelWidth)

/** 配置列表 */
const configs = computed(() => entity.value?.configs)

/** 高级查询结果 */
const queryTags = computed(() => entity.value?.queryTags)

/** 取消查询结果 */
function onCloseTag(item: QueryTagItem) {
  const queryParams: any = entity.value?.queryParams
  const name = item.key

  if (Array.isArray(name)) {
    queryParams[name[0]] = undefined
    queryParams[name[1]] = undefined
  }
  else {
    queryParams[name] = undefined
  }

  // 更新高级查询结果tag
  entity.value?.updateQueryTags()

  // 触发查询
  entity.value?.onQuery(queryParams)
}

/** 查询 */
function onQuery() {
  const queryParams: any = entity.value?.queryParams

  // 赋值查询
  configs.value?.forEach((item) => {
    const name = item.name

    if (Array.isArray(name)) {
      queryParams[name[0]] = item.value ? item.value[0] : undefined
      queryParams[name[1]] = item.value ? item.value[1] : undefined
    }
    else {
      queryParams[name] = item.value
    }
  })

  // 更新高级查询结果tag
  entity.value?.updateQueryTags()

  // 触发查询
  entity.value?.onQuery(queryParams)

  // 关闭
  entity.value?.close()
}
</script>

<style lang="less" scoped>
:deep(.ant-tag) {
  line-height: 26px;
}
</style>
