<template>
  <div class="reportNoticeModify">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <div class="qualification-stamp-page">
      <van-collapse v-model="activeNames">
        <van-collapse-item
          v-for="(item, index) in dataList"
          :key="item.reportAttachId"
          :name="index + 1"
        >
          <template #title>
            <div class="collapse-title">
              <div @click.stop="() => {}">
                <van-checkbox v-model="item.checked" />
              </div>
              <span class="name">{{ item.attachmentName }}</span>
            </div>
          </template>
          <div v-for="(d, i) in item.seals" :key="i">
            <p class="qualification-name">
              {{ d.sealName }}
            </p>
            <div class="field-box">
              <van-field
                v-model="columnsToText[d.formatType]"
                label="盖章设置"
                readonly
                clickable
                placeholder="请选择"
                @click="setFormatType(index, i, d.formatType)"
              />
              <van-field
                v-if="['10', '20', '50', '60'].includes(d.formatType)"
                :value="`${columnsToText[d.formatType]}，无需输入页码`"
                disabled
                label="页码设置"
              />
              <van-field
                v-else
                v-model="d.stampPage"
                label="页码设置"
                placeholder="请输入页码"
              />
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>
      <p class="page-set-info">
        多页码时，使用 | 隔开，例：1|2|3；连续页码时可用-链接，例：1-5|7-10；
      </p>
    </div>

    <div class="reportNoticeModify-btns">
      <van-row>
        <van-col span="12">
          <van-button block square @click="onCancel">
            取消
          </van-button>
        </van-col>
        <van-col span="12">
          <van-button block type="primary" square @click="ok">
            确定
          </van-button>
        </van-col>
      </van-row>
    </div>

    <van-popup v-model:show="showPicker" round position="bottom">
      <van-picker
        title="选择盖章类型"
        :default-index="defaultIndex"
        show-toolbar
        :columns="columns"
        @cancel="showPicker = false"
        @confirm="onConfirm"
      />
    </van-popup>
  </div>
</template>

<script>
import {
  showDialog,
  showNotify,
} from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'

export default {
  components: {
    MobileTitleBar,
  },
  beforeRouteLeave(to, from, next) {
    if (this.isSubmit === true) {
      if (this.isSetRoute === true) {
        next()
      }
      else {
        const toPageState = useAppPageStateStore().getPage(to.name)

        toPageState.resetPage = true
        const routerObj = { name: to.name, params: { ...to.params } }
        if (to.name === 'reportDetail') {
          toPageState.isSubmit = true
        }
        this.isSetRoute = true
        this.$router.replace(routerObj)
      }
    }
    else {
      next()
    }
  },
  data() {
    return {
      isSubmit: false,
      isSetRoute: false,
      showPicker: false,
      reportId: this.$route.params.reportId,
      dataList: [],
      activeNames: [1],
      columns: [
        { value: '10', text: '不签章' },
        { value: '20', text: '每页均盖章' },
        { value: '30', text: '固定页码盖章' },
        { value: '40', text: '除固定页码外盖章' },
        { value: '50', text: '除首尾页码外均签章' },
        { value: '60', text: '除尾页外均签章' },
      ],
      columnsToText: {
        10: '不签章',
        20: '每页均盖章',
        30: '固定页码盖章',
        40: '除固定页码外盖章',
        50: '除首尾页码外均签章',
        60: '除尾页外均签章',
      },
      defaultIndex: 0,
      editRow: -1,
      editRowItem: -1,
    }
  },
  created() {
    this.getDatas()
  },
  methods: {
    getDatas() {
      if (!this.reportId) {
        return showNotify({ type: 'danger', message: '报告id不存在' })
      }
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest
        .get(`/rest/common-body/report/seal/file/${this.reportId}`)
        .then((res) => {
          if (res.code === 20000) {
            const selected = res.data.selected || []
            const unSelected = res.data.noSelected || []
            const list = [...selected, ...unSelected]
            for (let i = 0; i < list.length; i++) {
              list[i].checked = list[i].selected === true
              this.activeNames.push(i + 1)
              for (let j = 0; j < list[i].seals.length; j++) {
                const vo = list[i].seals[j]
                vo.originFormatType = vo.formatType
              }
            }
            this.dataList = list
          }
          else {
            showNotify({
              type: 'danger',
              message: res.msg || '获取资质章页码数据异常',
            })
          }
        })
        .catch((err) => {
          showNotify({
            type: 'danger',
            message: err.msg || '获取资质章页码数据异常',
          })
        })
        .finally(() => {
          toast.close()
        })
    },
    setFormatType(i, j, val) {
      const ind = this.columns.findIndex(d => d.value === val)
      this.defaultIndex = ind
      this.editRow = i
      this.editRowItem = j
      this.showPicker = true
    },
    onConfirm({ selectedOptions }) {
      if (this.editRow === -1 || this.editRowItem === -1)
        return
      this.dataList[this.editRow].seals[this.editRowItem].formatType = selectedOptions[0].value
      this.showPicker = false
    },
    async ok() {
      if (this.dataList.length === 0) {
        showNotify({ type: 'warning', message: '没有可以设置的数据' })
        return
      }
      const params = this.dataList.map(d => ({
        ...d,
        reportId: this.reportId,
        select: d.checked ? 'selected' : 'unselected',
        selected: d.checked,
        seals: d.checked
          ? d.seals.map(j => ({
              ...j,
              stampPage: ['10', '20', '50', '60'].includes(j.formatType)
                ? ''
                : j.stampPage,
            }))
          : undefined,
      }))
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest.post(
        '/rest/common-body/report/seal/file',
        params,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ).finally(() => {
        toast.close()
      })

      if (res.code !== 20010) {
        showNotify({ type: 'success', message: '操作成功' })
        this.isSubmit = true
        this.$router.go(-1)
      }
      else {
        showDialog({ message: res.msg || res.message || '操作失败' })
      }
    },
    onCancel() {
      this.$router.go(-1)
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
.page-set-info {
  padding: 5px 4.267vw;
  font-size: 12px;
  color: #999;
}
</style>
