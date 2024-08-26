<script setup lang="ts">
import { message } from 'ant-design-vue'
import { AppList, SetUsers } from './applications/components'
import type { DataSource as UserData } from '@/types/users.d'
import type { AppUser, BaseItem, DataSource, EmitData } from '@/types/applications.d'
import useMyFetch from '@/composables/useMyFetch'

// 权限菜单
const appInfo = ref<BaseItem>({
  name: '',
  id: '',
})
const api = ref('')
const { data, execute } = useMyFetch<DataSource>(api, {}, { immediate: false })

// 设置用户
function setUsers(data: EmitData<AppUser>) {
  appInfo.value = data.appInfo
  api.value = `/api/v1/applications/${appInfo.value.id}`
  execute()
}

// 删除用户
async function delAppUser(obj: AppUser) {
  const { error } = await useMyFetch(`/api/v1/applications/${appInfo.value.id}/user`, {
    method: 'DELETE',
    body: JSON.stringify({
      owners: [{ id: obj.id, username: obj.username }],
    }),
  })
  if (error.value)
    return ''
  message.success('删除成功')
  execute()
}

// 保存用户
async function saveAppUser(rows: UserData[], cb: (bol: boolean) => void) {
  const owners = rows.map(d => ({ id: d.id, username: d.username }))
  const { error } = await useMyFetch(`/api/v1/applications/${appInfo.value.id}/user`, {
    method: 'PUT',
    body: JSON.stringify({
      owners,
    }),
  })
  if (error.value)
    return cb(false)
  message.success('保存成功')
  cb(true)
  refreshList()
  execute()
}

// 刷新角色列表
const appListRef = ref()
function refreshList() {
  appListRef.value.getList()
}

// 路由meta标题
definePage({
  meta: {
    title: '子系统管理',
    authName: 'applications',
  },
})
</script>

<template>
  <div class="flex h-full">
    <!-- 系统列表 -->
    <div class="h-full mr-[24px] flex-1">
      <a-card
        title="系统列表"
        class="h-full"
        :head-style="{ padding: '0 16px', minHeight: '48px' }"
        :body-style="{
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
        }"
      >
        <AppList ref="appListRef" @set-users="setUsers" />
      </a-card>
    </div>
    <!-- 用户列表 -->
    <div class="w-2/5 h-full min-w-[400px]">
      <a-card
        title="用户列表"
        class="h-full"
        :head-style="{ padding: '0 16px', minHeight: '48px' }"
        :body-style="{
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
        }"
      >
        <template v-if="appInfo.id">
          <p bg-gray-1 py-1 px-2 rounded>
            系统名称：{{ appInfo.name }}
          </p>
          <!-- 用户列表 -->
          <SetUsers
            permission-code="applications:user"
            :app-info="appInfo"
            :selected-datas="data?.owners || []"
            @del="delAppUser"
            @save="saveAppUser"
          />
        </template>
        <p
          v-else
          class="mt-1/2 text-center text-4 color-gray "
        >
          点击角色列表用户按钮设置
        </p>
      </a-card>
    </div>
  </div>
</template>
