<template>
  <div style="height: 100%">
    <div class="upload-wrap">
      <a-spin :spinning="spinning">
        <div class="upload-con">
          <template v-if="isUpload">
            <p class="upload-status finish">
              <i class="iconfont icon-chenggong"></i>
              <span>已上传</span>
            </p>
            <a-button type="primary" style="margin-right: 20px" @click="showPdf">查看</a-button>
          </template>
          <template v-else>
            <p class="upload-status">
              <i class="iconfont icon-file-pdf"></i>
              <span class="error">未上传</span>
            </p>
          </template>
          <div style="display: inline-block">
            <UploadFile
              v-model:value="fileList"
              hide-file-list
              :config="{
                multiple: false,
                btnName: isUpload ? '更新' : '点击上传',
                types: ['pdf']
              }"
              @success="uploadSuccess"
            />
          </div>
          <ul class="upload-hint">
            <li>1、必须先上传业绩申报承诺书，才可使用业绩上报功能</li>
            <li>2、上传的业绩申报书必须为承诺书原件，盖有鲜章，复印件无效</li>
            <li>
              3、请先下载
              <span
                class="blue"
                target="_blank"
                @click="downloadByNameOrUrl('业绩自主申报承诺书.pdf')"
              >
                业绩自主申报承诺书
              </span>
              模板，仔细阅读后打印，签字盖章，并上传
            </li>
          </ul>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { message } from "ant-design-vue"
import {
  commitmentUpload,
  commitmentUpdate,
  checkApi,
  commitmentDetail
} from "@/api/performance.api"
import type { filesType } from "@/type/common/common"
import { previewPDF } from "@/assets/js/common"
import { downloadByNameOrUrl, getMinioFileUrl } from "@/config/minio.config"
import UploadFile from "@/components/uploadFile/index.vue"
import userStore from "@/stores/userInfo"
const { userInfo } = userStore()
const fileList = ref<filesType[]>([])
const isUpload = ref<boolean>(false)
const spinning = ref<boolean>(false)

// 数据加载
onMounted(() => {
  checkCommitment()
})

// 检查是否上传承诺书
const checkCommitment = () => {
  spinning.value = true
  checkApi(userInfo.orgId as string)
    .then((res) => {
      spinning.value = false
      if (!res) return
      isUpload.value = !!res
    })
    .catch(() => {
      spinning.value = false
    })
}

const showPdf = () => {
  commitmentDetail(userInfo.orgId).then(async (res: any) => {
    if (!res) return
    const url = await getMinioFileUrl(res.url)
    previewPDF(url)
  })
}

// 上传-更新承诺书
const uploadSuccess = (files) => {
  let url = ""
  if (files.length) {
    url = files[0].url
  }
  spinning.value = true
  if (isUpload.value) {
    // 更新
    commitmentUpdate({
      url,
      orgId: userInfo.orgId
    })
      .then((res) => {
        message.success("更新成功")
        spinning.value = false
      })
      .catch(() => {
        spinning.value = false
      })
  } else {
    // 新增
    commitmentUpload({
      url,
      orgId: userInfo.orgId
    })
      .then((res) => {
        isUpload.value = true
        spinning.value = false
      })
      .catch(() => {
        spinning.value = false
      })
  }
}
</script>

<style scoped lang="less">
.upload-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  .upload-con {
    height: 360px;
    text-align: center;
  }

  .upload-status {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30px;
    font-size: 24px;
    color: @error_color;

    &.finish {
      color: @success_color;

      .icon-chenggong {
        font-size: 66px;
      }
    }

    .icon-file-pdf {
      border: 1px solid #ddd;
      border-radius: 50%;
      padding: 16px;
      font-size: 40px;
    }

    span {
      margin-left: 20px;
      font-weight: 600;
    }
  }

  .upload-hint {
    margin-top: 30px;
    line-height: 20px;
    text-align: left;
  }
}
</style>
