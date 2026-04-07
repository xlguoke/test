<template>
  <div class="pb-4">
    <van-sticky>
      <MobileTitleBar
        left-arrow
        @click-left="$router.push({ name: 'inspectList' })"
      />
    </van-sticky>

    <van-collapse v-model="activeNames">
      <van-collapse-item title="基本信息" name="1">
        <div class="p-4">
          <van-cell-group :border="false">
            <FormItemDate
              v-model:value="submitForm.testDate"
              label="检查日期"
              required
              placeholder="请选择日期"
              :rules="[{ required: true, message: '请选择检查日期' }]"
            />

            <FormItemPerson
              v-model:value="checkPersons"
              label="检查人"
              placeholder="请选择检查人"
              required
              enable-multiple
              :rules="[{ required: true, message: '请选择检查人' }]"
              @select="(rows) => {
                submitForm.persons = rows.map((i) => ({
                  userId: i.id,
                  userName: i.name,
                }))
              }"
            />

            <FormItemInput
              v-model:value="submitForm.testObject"
              label="检查对象"
              placeholder="请输入检查对象的描述"
            />

            <!-- 自定义表单 -->
            <template v-for="(item, index) in submitForm.customizeValues" :key="index">
              <FormItemInput
                v-if="item.columnType === 'input'"
                v-model:value="item.columnValue"
                :label="item.columnName"
                placeholder="请输入"
              />

              <FormItemInput
                v-if="item.columnType === 'inputNumber'"
                v-model:value="item.columnValue"
                :label="item.columnName"
                type="digit"
                placeholder="请输入"
              />

              <FormItemDate
                v-if="item.columnType === 'date'"
                v-model:value="item.columnValue"
                :label="item.columnName"
                name="datetimePicker"
                placeholder="点击选择时间"
              />

              <FormItemSelect
                v-if="item.columnType === 'select'"
                v-model:value="item.columnValue"
                :label="item.columnName"
                placeholder="请选择"
                :options="item.option"
              />

              <FormItemInput
                v-if="item.columnType === 'textArea'"
                v-model:value="item.columnValue"
                :label="item.columnName"
                placeholder="请输入"
                rows="1"
                type="textarea"
                autosize
              />

              <FormItemSwitch
                v-if="item.columnType === 'radio'"
                v-model:value="item.columnValue"
                :label="item.columnName"
              />
            </template>

            <FormItemInput
              v-model:value="submitForm.sn"
              label="检查编号"
              placeholder="请填写内容或生成编号"
              required
              center
              :rules="[{ required: true, message: '请输入或生成编号' }]"
            >
              <template #button>
                <van-button size="small" type="primary" @click="generateSn">
                  生成
                </van-button>
              </template>
            </FormItemInput>

            <FormItemInput
              v-model:value="submitForm.remark"
              label="备注"
              placeholder="请输入"
              rows="1"
              type="textarea"
              autosize
            />
          </van-cell-group>
        </div>
      </van-collapse-item>
      <van-collapse-item title="检查内容" name="2">
        <!-- 检查内容 -->
        <div class="p-4">
          <div v-for="(item, index) in renderArr" :key="index" class="bg-[#fff] p-4 border-b">
            <div>{{ item.name }}</div>
            <!-- 要点list -->
            <div
              v-for="citem in item.list"
              :key="citem.id"
              class="flex items-center pt-2"
            >
              <div class="flex-[2]">
                <van-checkbox v-model="citem.inspected">
                  <span style="word-wrap: break-word">{{ citem.keypoint }}</span>
                </van-checkbox>
              </div>

              <div class="flex-1 text-right" @click="openInspectItem(citem)">
                <span v-if="citem.problems.length && citem.problems[0].needReform" style="color: red">
                  <van-badge v-if="!citem.problems[0].reformDescription && citem.problems[0].files && !citem.problems[0].files.length" dot>需整改</van-badge>
                  <span v-else>需整改</span>
                </span>
                <span v-else-if="citem.problems.length && !citem.problems[0].needReform" style="color: green">无需整改</span>
                <van-icon style="vertical-align: middle" name="arrow" />
              </div>
            </div>
          </div>
        </div>

        <div class="text-center">
          <van-icon class="text-[58px]" color="#154bd0" name="add" @click="selectEssentials" />
        </div>
      </van-collapse-item>
    </van-collapse>

    <ActionBar>
      <van-button type="primary" @click="submitFun">
        保存
      </van-button>
    </ActionBar>

    <!-- 选择要点弹窗 -->
    <van-popup
      v-model:show="selPointsPopup"
      position="right"
      :style="{ width: '100%', height: '100%' }"
    >
      <div v-if="selPointsPopup" class="h-full">
        <SelectEssentials
          :category-id="categoryId"
          @close-points-popup="selPointsPopup = false"
          @select-ok="selPointsHandle"
        ></SelectEssentials>
      </div>
    </van-popup>
    <!-- 编辑要点弹窗 -->
    <van-popup
      v-if="keypointPopup"
      v-model:show="keypointPopup"
      position="right"
      :overlay="false"
    >
      <div style="height: 100vh; width: 100vw">
        <KeypointEdit
          :key="keypointPopup"
          :keypoint-item="selKeypointItem"
          @close-call="keypointPopup = false"
          @close-points-popup="keypointPopup = false"
          @save-ok="editKeypointOk"
        ></KeypointEdit>
      </div>
    </van-popup>
  </div>
</template>

<script>
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemPerson from '~/views/mobileApp/components/MobileFormItem/FormItemPerson.vue'
import FormItemSelect from '~/views/mobileApp/components/MobileFormItem/FormItemSelect.vue'
import FormItemSwitch from '~/views/mobileApp/components/MobileFormItem/FormItemSwitch.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import KeypointEdit from '../components/keypointEdit.vue'
import selectEssentials from '../components/selectEssentials.vue'

export default {
  components: {
    FormItemSwitch,
    FormItemSelect,
    FormItemInput,
    FormItemPerson,
    ActionBar,
    FormItemDate,
    SelectEssentials: selectEssentials,
    KeypointEdit,
    MobileTitleBar,
  },
  data() {
    return {
      formatDate,
      inspectId: '', // 检查id
      categoryId: '', // 大类id
      remark: '',
      selKeypointItem: {}, // 编辑的要点数据
      testObject: '', // 检查对象
      keypointPopup: false,
      renderArr: [], // 渲染的要点
      selPointsList: [], // 选择的要点集合
      categoryTree: [], // 大类树
      customerForm: [], // 自定义表单
      selPerson: [], // 选择的人员
      activeNames: ['1', '2'],
      selPointsPopup: false,
      testDate: new Date(), // 日期
      sn: '', // 编号
      checkPersons: [],
      submitForm: {
        keypoints: [], // 要点集合
        persons: [], // 检查人
        customizeValues: [], // 自定义表单
        testObject: '', // 检查对象
        sn: '', // 编号
        testDate: '', // 日期开始时间
        testDateEnd: '', // 日期结束时间
        remark: '', // 备注
      }, // 最后提交数据
    }
  },
  watch: {
    // 监控要点的变化以改变分组渲染
    'submitForm.keypoints': {
      handler(newVal) {
        const arr = JSON.parse(JSON.stringify(newVal))
        for (let i = 0; i < arr.length; i++) {
          for (let j = i + 1; j < arr.length; j++) {
            if (arr[i].categoryId === arr[j].categoryId) {
              arr.splice(j, 1)
              j--
            }
          }
        }
        const renderArr = arr.map((item) => {
          return { name: item.category, id: item.categoryId, list: [] }
        })
        newVal.forEach((selItem) => {
          renderArr.forEach((item) => {
            if (selItem.categoryId === item.id) {
              item.list.push(selItem)
            }
          })
        })
        this.renderArr = renderArr
      },
      deep: true, // 监控对象需要启用深度监听
      immediate: true, // 首次值绑定是否需要监控
    },
  },
  mounted() {
    // 编辑
    if (this.$route.query.inspectId) {
      this.inspectId = this.$route.query.inspectId
      this.getInspectionDetail()
    }

    // 新增
    if (this.$route.query.categoryId) {
      this.categoryId = this.$route.query.categoryId
      this.submitForm.testDate = formatDate(new Date())
      mRequest.get(api.setting.getCurrentUser).then((res) => {
        if (res.success) {
          this.submitForm.persons = [
            {
              userId: res.obj.id,
              userName: res.obj.realName,
            },
          ]
        }
      })
      this.getCustomerForm((data) => {
        this.submitForm.customizeValues = data
      })
    }
  },
  methods: {
    getInspectionDetail() {
      return mRequest
        .get(`/rest/app/inspection/${this.inspectId}`)
        .then((res) => {
          if (res.code === 20000) {
            this.categoryId = res.data.categoryId
            res.data.testDate = formatDate(res.data.testDate)
            res.data.testDateEnd = formatDate(res.data.testDateEnd)

            if (res.data.persons) {
              this.checkPersons = res.data.persons.map(i => ({
                id: i.userId,
                name: i.userName,
              }))
            }

            res.data.keypoints.forEach((item) => {
              if (!item.problems || !item.problems.length) {
                item.problems = []
              }
            })

            // 获取合并原始自定义表单值
            this.getCustomerForm((data) => {
              res.data.customizeValues.forEach((item) => {
                if (item.columnType === 'select') {
                  data.forEach((citem) => {
                    if (item.columnId === citem.columnId) {
                      item.option = citem.option
                      item.showPicker = false
                    }
                  })
                }
                else if (item.columnType === 'date') {
                  item.showPicker = false
                }
                else if (item.columnType === 'radio') {
                  item.columnValue = item.columnValue === 'true'
                }
              })

              this.submitForm = res.data
            })
          }
          else {
            showFailToast(res.msg || res.message || '请求失败')
          }
        })
    },
    // 选择要点
    selPointsHandle(selVal) {
      const st = []
      // 设置默认值
      selVal.forEach((item) => {
        item.keypointId = item.id
        delete item.id
        item.files = []
        if (!item.problems) {
          item.problems = []
        }
      })
      // 检查当前是否重复选择
      // eslint-disable-next-line array-callback-return
      const newArr = selVal.filter((item) => {
        let repeat = false
        this.submitForm.keypoints.forEach((citem) => {
          if (item.keypointId === citem.keypointId) {
            st.push(item.keypoint)
            repeat = true
          }
        })
        if (!repeat) {
          return item
        }
      })

      if (st.length) {
        showDialog({
          title: '提示',
          message: `[${st.join(' / ')}],已在当前检查内容中，无法重复添加`,
        }).then(() => {
          // on close
        })
      }

      this.submitForm.keypoints = [...this.submitForm.keypoints, ...newArr]
      this.selPointsPopup = false
    },
    // 保存函数
    submitFun() {
      if (!this.submitForm.sn) {
        showDialog({
          title: '提示',
          message: '请填写或生成检查编号',
        })
        return
      }

      const loading = showLoadingToast({
        duration: 0,
        forbidClick: true,
        message: '保存中...',
      })

      this.saveForm()
        .then((res) => {
          if (res.code === 20000) {
            showSuccessToast('保存成功')
            window.location.href
              = `${window.parent.location.href.split('?')[0]
              }?inspectId=${
                res.data}`
            location.reload()
          }
          else {
            showFailToast(res.msg || res.message || '请求失败')
          }
        })
        .finally(() => {
          loading.close()
        })
    },
    // 数据提交
    async saveForm() {
      // 如果是新增，添加大类id  去掉要点及问题id
      if (this.$route.query.categoryId) {
        this.submitForm.categoryId = this.categoryId
        this.submitForm.keypoints.forEach((item) => {
          delete item.id
          item.problems.forEach((citem) => {
            delete citem.id
          })
        })
      }

      this.submitForm.persons = this.checkPersons.map(i => ({
        userId: i.id,
        userName: i.name,
      }))

      if (!this.submitForm.persons.length) {
        showNotify({ type: 'warning', message: '请选择检查人' })
        return
      }
      else if (!this.submitForm.testDate) {
        showNotify({ type: 'warning', message: '请选择日期' })
        return
      }

      this.submitForm.testDateEnd = this.submitForm.testDate

      //  else if (!this.submitForm.sn) {
      //   showNotify({ type: "warning", message: "请生成或者输入检查编号" });
      //   return;
      // }
      return await mRequest({
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'post',
        url: api.inspectManage.rsaveOrUpdate,
        data: this.submitForm,
      })
    },
    openInspectItem(obj) {
      this.keypointPopup = true
      this.selKeypointItem = obj
    },
    selectEssentials() {
      this.selPointsPopup = true
    },
    // 生成编号
    generateSn() {
      this.saveForm().then((resSave) => {
        mRequest
          .get(`${api.inspectManage.generateSn}?id=${resSave.data}`)
          .then((res) => {
            if (res.code === 20000) {
              showSuccessToast('编号生成成功')
            }
            else {
              showFailToast(res.msg || res.message || '请求失败')
            }

            if (!this.inspectId) {
              window.location.href = `${window.location.href.split('?')[0]}?inspectId=${resSave.data}`
              location.reload()
            }
          })
      })
    },
    // 编辑要点
    editKeypointOk(v) {
      this.keypointPopup = false
      this.submitForm.keypoints.forEach((item, index) => {
        if (item.keypointId === v.keypointId) {
          if (v.situation || v.files.length || v.problems.length) {
            v.inspected = true
          }
          else {
            v.inspected = false
          }
          this.submitForm.keypoints[index] = v
        }
      })
    },
    // 获取自定义表单
    getCustomerForm(callback) {
      mRequest
        .get(
          `/rest/common/custom-properties?customizeType=inspection_type_${this.categoryId}`,
        )
        .then((res) => {
          if (res.code === 20000) {
            res.data.forEach((item) => {
              item.columnId = item.id
              item.id = null
              if (item.columnType === 'date' || item.columnType === 'select') {
                item.showPicker = false
              }
              if (item.columnType === 'select') {
                if (item.columnValue) {
                  item.option = item.columnValue.split(',')
                  item.columnValue = item.option[0]
                }
              }
            })

            callback && callback(res.data)
          }
          else {
            showFailToast(res.msg || res.message || '请求失败')
          }
        })
    },
    // 获取大类树
    async getCategoryTree() {
      const res = await mRequest({
        method: 'get',
        url: api.inspectManage.categoryTree,
        params: {
          inspectionCategoryId: this.categoryId,
        },
      })
      if (res.code === 20000) {
        this.recursionTree(res.data)
        this.categoryTree = res.data
      }
      else {
        showFailToast(res.msg || res.message || '请求失败')
      }
    },
  },
}
</script>
