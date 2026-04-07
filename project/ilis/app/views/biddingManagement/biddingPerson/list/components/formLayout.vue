<!-- eslint-disable vue/eqeqeq -->
<template>
  <div>
    <a-row :gutter="formLayout ? formLayout.gutter || 0 : 0">
      <a-col
        v-for="item in dataSource"
        :key="item.field"
        :span="formLayout ? formLayout.span || 24 : 24"
      >
        <a-form-item
          :label="item.name"
          :label-col="{ span: formLayout.labelCol }"
          :wrapper-col="{ span: formLayout.wrapperCol }"
          :name="item.field"
          :rules="
            item.rules
              ? [{ required: true, message: `${item.name}为必填项!` }]
              : item?.option?.rules ? item.option.rules : undefined"
        >
          <span v-if="item.type == 'input'">
            <span v-if="item.field == 'identityNumber'">
              <a-input
                v-model:value="_formState[item.field]"
                :placeholder="`请输入${item.name}`"
                :disabled="item.disabled"
                style="width: 100%"
              />
            </span>
            <span v-else-if="item.field == 'yearOfWork'">
              <a-input
                v-model:value="_formState[item.field]"
                :placeholder="`请输入${item.name}`"
                style="width: 100%"
              />
            </span>
            <span v-else-if="item.field == 'socialSecurityCategory'">
              <a-input
                v-model:value="_formState[item.field]"
                placeholder="如五险，五险一金等"
                style="width: 100%"
              />
            </span>
            <span v-else-if="item.field == 'department'">
              <a-flex>
                <a-input
                  v-model:value="_formState[item.field]"
                  placeholder="请选择组织机构"
                  class="flex-1 mr-2"
                  readonly
                  @change="() => {
                    _formState.departId = ''
                  }"
                />
                <a-button @click="onShowProjectOrgSelector">选择</a-button>
              </a-flex>
            </span>
            <span v-else>
              <a-input
                v-model:value="_formState[item.field]"
                :disabled="item.disabled"
                :placeholder="`请输入${item.name}`"
                style="width: 100%"
              />
            </span>
          </span>
          <span v-else-if="item.type == 'select'">
            <a-select
              v-model:value="_formState[item.field]"
              :disabled="item.disabled"
              :placeholder="`请选择${item.name}`"
              style="width: 100%"
            >
              <a-select-option
                v-for="(comItem, index) in item.data"
                :key="index"
                :value="comItem[item.dataField.value]"
              >
                {{ comItem[item.dataField.name] }}
              </a-select-option>
            </a-select>
          </span>
          <span v-else-if="item.type == 'radio'">
            <a-radio-group
              v-model:value="_formState[item.field]"
              :disabled="item.disabled"
              :name="item.field"
            >
              <a-radio
                v-for="(comItem, index) in item.data"
                :key="index"
                :value="comItem[item.dataField.value]"
              >
                {{ comItem[item.dataField.name] }}
              </a-radio>
            </a-radio-group>
          </span>
          <template v-else-if="item.type === 'ilisUpload'">
            <a-button @click="showUpload = true">
              <template #icon>
                <UploadOutlined />
              </template>
              点击上传
            </a-button>
            <AttachmentList
              v-if="fileDatas.length > 0"
              show-del
              :datas="fileDatas"
              class="mt-2"
            />
            <IlisUpload
              v-model:show="showUpload"
              :max="1"
              :size="2"
              force
              :accept="['.jpg', '.png', '.jpeg', '.webp']"
              @success="getUploadFile"
            />
          </template>
          <span v-if="item.type == 'date'">
            <a-date-picker
              v-model:value="_formState[item.field]"
              :disabled="item.disabled"
              :placeholder="`请选择${item.name}`"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </span>
          <span v-if="item.type == 'inputNumber'">
            <a-input-number
              v-model:value="_formState[item.field]"
              :disabled="item.disabled"
              :placeholder="`请输入${item.name}`"
              style="width: 100%"
            />
          </span>
          <span v-if="item.type === 'textArea'">
            <a-textarea
              v-model:value="_formState[item.field]"
              :disabled="item.disabled"
            />
          </span>
        </a-form-item>
      </a-col>
    </a-row>

    <!-- 部门选择器 -->
    <OrgSelector
      v-model:show="showProjectOrgSelector"
      multiple
      :checked-ids="checkedDepartmentIds"
      @confirm="handleProjectOrg($event)"
    />
  </div>
</template>

<script>
import { UploadOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { AttachmentList } from '~/components/attachmentList'

export default {
  components: { UploadOutlined, AttachmentList },
  props: ['dataSource', 'formLayout', 'formState'],
  data() {
    return {
      dayjs,
      showProjectOrgSelector: false,
      checkedDepartmentIds: [],
      showUpload: false,
      fileDatas: [],
    }
  },
  computed: {
    _formState() { return this.formState },
  },
  watch: {
    'formState.tsAttachment': {
      handler(obj) {
        if (!obj) {
          this.fileDatas = []
        }
        else {
          this.fileDatas = [{
            name: obj.attachmenttitle,
            url: obj.realpath,
            id: obj.id,
          }]
          this._formState.photoId = obj.id
        }
      },
      immediate: true,
    },
  },
  methods: {
    onShowProjectOrgSelector() {
      if (this._formState.departId) {
        this.checkedDepartmentIds = this._formState.departId.split(',')
      }
      this.showProjectOrgSelector = true
    },
    handleProjectOrg(rows) {
      this._formState.department = rows.map(item => item.text).join(',')
      this._formState.departId = rows.map(item => item.id).join(',')

      this.showProjectOrgSelector = false
    },
    getUploadFile(files) {
      this.fileDatas = files.map(d => ({
        name: d.attachmenttitle,
        url: d.realpath,
        id: d.id,
      }))
      this._formState.photoId = files[0]?.id
    },
  },
}
</script>
