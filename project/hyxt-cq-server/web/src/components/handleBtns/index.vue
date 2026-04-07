<template>
  <a-space>
    <template v-for="(btn, i) in showDatas">
      <a-button
        v-if="!btn.isHide"
        :key="i"
        :loading="btn.loading"
        :disabled="btn.disabled"
        :type="`${btn.type || ''}`"
        @click="clickBtn(btn)"
      >
        {{ btn.btnName }}
      </a-button>
    </template>
    <template v-if="hideDatas.length > 0">
      <a-dropdown>
        <template #overlay>
          <a-menu @click="clickBtn">
            <template v-for="(btn, i) in hideDatas">
              <a-menu-item v-if="!btn.isHide" :key="i" :disabled="btn.disabled">
                {{ btn.btnName }}
              </a-menu-item>
            </template>
          </a-menu>
        </template>
        <a-button>
          更多
          <DownOutlined />
        </a-button>
      </a-dropdown>
    </template>
  </a-space>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, PropType } from "vue"
import { message, Modal } from "ant-design-vue"
import { type ButtonType } from "ant-design-vue/lib/button/buttonTypes"
import { DownOutlined } from "@ant-design/icons-vue"
import type { btnsType } from "@/type/common/common"
import { syncDatas } from "@/api/organization.api"
import { storeToRefs } from "pinia"
import existingTag from "@/stores/existingTag"
import userStore from "@/stores/userInfo"
const { currentView } = storeToRefs(existingTag())
const { userInfo } = storeToRefs(userStore())

const props = defineProps({
  datas: {
    type: Array as PropType<btnsType[]>,
    default: () => []
  },
  type: {
    type: String as PropType<ButtonType>,
    default: ""
  }
})

const showDatas = ref<btnsType[]>([])
const hideDatas = ref<btnsType[]>([])

const initBtnDatas = () => {
  // 根据权限过滤按钮
  const auths = (currentView.value as any).auths
  const authCode = auths.map((d) => d.code)
  const authDatas = props.datas.filter((d) => {
    return authCode.includes(d.authCode) || d.authCode === "*"
  })

  if (authDatas.length <= 3) {
    showDatas.value = authDatas
  } else {
    showDatas.value = authDatas.slice(0, 2)
    hideDatas.value = authDatas.slice(2)
  }
}

watch(
  () => props.datas,
  () => {
    console.log(props.datas)
    initBtnDatas()
  },
  {
    deep: true,
    immediate: true
  }
)

const clickBtn = (e) => {
  let btn = e
  if (btn.key !== undefined) {
    btn = hideDatas.value[e.key]
  }
  if (btn.syncType) {
    syncPartDatas(btn)
  } else {
    btn.click()
  }
}

//  同步部平台数据
// ORG-机构，PERSON-人员，CERT-证书，QUALIFY-资质，EQ_QUALIFY_PARSON-资质-人员对应表，EQ_QUALIFY_PARAM-参数，EQUIPMENT-设备
const syncPartDatas = (btnItem) => {
  Modal.confirm({
    title: "同步提示",
    content: "预计同步时间较长，同步将在后台进行，是否立即同步?",
    okText: "立即同步",
    onOk() {
      btnItem.loading = true
      syncDatas({
        orgId: userInfo.value.type == "ORG" ? userInfo.value.orgId : ""
      })
        .then(() => {
          message.success("数据同步中...")
          btnItem.loading = false
          nextTick(() => {
            btnItem.click()
          })
        })
        .catch(() => {
          btnItem.loading = false
        })
    }
  })
}
</script>

<style lang="less" scoped>
.handle-box {
  button {
    margin-left: 10px;
  }
}
</style>
