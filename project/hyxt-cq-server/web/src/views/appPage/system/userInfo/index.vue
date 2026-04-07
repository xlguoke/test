<template>
  <div style="padding: 50px 80px">
    <a-spin :spinning="spinning">
      <a-tabs v-model:activeKey="activePage" tab-position="left" @change="changeTabs">
        <a-tab-pane key="user" tab="基本信息">
          <div class="user-info">
            <a-descriptions
              size="small"
              :column="1"
              :label-style="{ width: '140px', 'justify-content': 'end', 'padding-right': '10px' }"
            >
              <a-descriptions-item label="所属机构">{{ userInfo.orgName }}</a-descriptions-item>
              <a-descriptions-item label="名称">{{ userInfo.name }}</a-descriptions-item>
              <a-descriptions-item label="用户名">{{ userInfo.username }}</a-descriptions-item>
              <a-descriptions-item label="账户角色">{{ userInfo.role }}</a-descriptions-item>
              <a-descriptions-item label="保管人姓名">{{ userInfo.custodian }}</a-descriptions-item>
              <a-descriptions-item label="保管人电话">
                {{ userInfo.custodianPhone }}
              </a-descriptions-item>
              <a-descriptions-item label="保管人联系地址">
                {{ userInfo.custodianAddr }}
              </a-descriptions-item>
            </a-descriptions>

            <div class="user-avatar">
              <a-avatar :size="64" :src="avatarUrl">
                <template #icon>
                  <UserOutlined />
                </template>
              </a-avatar>
              <span class="name">{{ userInfo.name }}</span>
              <div style="margin-top: 40px">
                <UploadFile
                  btn-type="info"
                  :multiple="false"
                  btn-name="更换头像"
                  hide-file-list
                  @success="uploadFinish"
                />
              </div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="pwd" tab="修改密码" force-render>
          <EditPassword :key="activePage" />
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { message } from "ant-design-vue"
import { UserOutlined } from "@ant-design/icons-vue"
import { storeToRefs } from "pinia"
import userInfoStore from "@/stores/userInfo"
import UploadFile from "@/components/uploadFile/index.vue"
import EditPassword from "@/components/editPassword/passwordForm.vue"
import { editUserAPI } from "@/api/system.api"
import { getMinioFileUrl } from "@/config/minio.config"

const route = useRoute()
const router = useRouter()
const userStoreReal: any = userInfoStore()

const { userInfo } = storeToRefs(userInfoStore())

const spinning = ref<boolean>(false)
const activePage = ref<string>("user")
const avatarUrl = ref("")
onMounted(async () => {
  activePage.value = (route.query.k as string) || "user"
  avatarUrl.value = await getMinioFileUrl(userInfo.value.avatar)
})
watch(route, () => {
  activePage.value = (route.query.k as string) || "user"
})

const changeTabs = (k) => {
  router.push({
    path: "/userInfo",
    query: {
      k
    }
  })
}

// 更新头像
const uploadFinish = (list) => {
  const url = list[0].url
  const userPar = {
    ...userInfo.value,
    avatar: url
  }
  spinning.value = true
  editUserAPI(userPar)
    .then(async () => {
      spinning.value = false
      message.success("更新成功")
      avatarUrl.value = await getMinioFileUrl(url)
      userStoreReal.$state = {
        userInfo: {
          ...userPar
        }
      }
    })
    .catch(() => {
      spinning.value = false
    })
}
</script>

<style scoped lang="less">
.user-info {
  display: flex;
  justify-content: space-between;

  .ant-descriptions {
    flex: 1;
  }

  .user-avatar {
    width: 300px;
    text-align: center;

    .name {
      margin-left: 20px;
      font-size: 18px;
    }
  }
}
</style>
