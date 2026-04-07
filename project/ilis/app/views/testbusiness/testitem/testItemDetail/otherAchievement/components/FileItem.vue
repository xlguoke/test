<template>
  <div v-if="fileData.uid" class="com-file-item">
    <p v-if="showFileName" class="file-name">
      {{ fileData.name }}
    </p>

    <div style="margin-left: 12px">
      <a v-if="showPreview" class="text-colorPrimary" @click="preview"> 预览 </a>
      <a-dropdown v-if="showEdit" style="margin-left: 8px">
        <a class="text-colorPrimary">编辑 <DownOutlined /></a>
        <template #overlay>
          <a-menu @click="handleEdit">
            <!-- <a-menu-item key="1" disabled>
                <a href="javascript:;">在线编辑原文件</a>
              </a-menu-item> -->
            <a-menu-item key="2">
              <a href="javascript:;">HitekOffice编辑原文件</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <a class="ml-2 text-colorPrimary" @click="download"> 下载 </a>
    </div>
  </div>
</template>

<script>
import { DownOutlined } from '@ant-design/icons-vue'
import { debounce, downloadFile } from '~/providers/common/utils'
import { rootUrl } from '~/providers/configs/rootUrl'
import openHitekUdrTool from '~/providers/libs/openHitekUdrTool'

export default {
  components: {
    DownOutlined,
  },
  props: {
    showFileName: {
      type: Boolean,
      default: true,
    },
    fileData: {
      type: Object,
      default: () => ({}),
    },
    achievementId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      defaultEditType: '',
    }
  },
  computed: {
    fileType() {
      const name = this.fileData.name
      if (!name)
        return ''
      const n = name.lastIndexOf('.')
      return name.substr(n + 1).toLowerCase()
    },
    showPreview() {
      return ['png', 'jpg', 'jpge', 'pdf'].includes(this.fileType)
    },
    showEdit() {
      return ['doc', 'docx'].includes(this.fileType)
    },
  },
  mounted() {
    this.getBusinessParam()
  },
  methods: {
    preview() {
      window.open(this.fileData.url, '_blank')
    },
    // 编辑
    handleEdit(e) {
      // 打开带有hitek插件的word
      if (e.key === '2') {
        let url = `${location.origin}${rootUrl}/wordReportController.do?goUdrOpenWord`
        url += `&isOtherAchievementEdit=1`
        url += `&attachmentId=${this.fileData.uid}`

        openHitekUdrTool(url, 'hide', true)
      }
    },
    download() {
      debounce(() => {
        window.$oAjax
          .get(this.fileData.url, {
            responseType: 'blob',
          })
          .then((res) => {
            const blob = new Blob([res])
            const url = window.URL.createObjectURL(blob)
            downloadFile(url, this.fileData.name)
          })
      }, 500)
    },
    /**
     * 获取系统控制参数 - 在线编辑文件的默认编辑方式控制参数
     * FILE_EDIT_TYPE_UDR： udr编辑原文件
     * FILE_EDIT_TYPE_ONLINE： 在线编辑原文件
     */
    async getBusinessParam() {
      await window.$oAjax({
        url: 'tSBusinessParamController.do?getBusinessParam&key=ACHIEVEMENT_FILE_EDIT_TYPE',
        method: 'get',
      }).then((res) => {
        if (res.success) {
          this.defaultEditType = res.obj
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.com-file-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  line-height: 18px;
  .file-name {
    flex: 1;
    width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.ant-dropdown-menu-item-disabled {
  background-color: #eee;
  a {
    cursor: not-allowed;
    color: #aaa;
  }
}
</style>
