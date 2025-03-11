<template>
  <div class="page-wrap">
    <div class="page-title">
      {{ data?.name }}
    </div>
    <!-- 提交结果 -->
    <Result v-if="showResult" :is-success="isSuccess" />
    <!-- 提交表单 -->
    <QuestionForm
      v-else
      :questions="data?.problemList || []"
      @submit="onSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import { showConfirmDialog } from 'vant'
import { EvaluateModelEntity } from '../model/EvaluateModelEntity'
import { QuestionType } from '../model/EvaluateQuestionEntity'
import { EvaluateInvStatus } from '../inv/EvaluateInvEntity'
import QuestionForm from './components/QuestionForm.vue'
import Result from './components/Result.vue'
import { getEvaluateModelDetailPre, saveEvaluateResult, verifyEvaluate } from './api'
import { ILISHTTPError } from '~/types'

interface Props {
  params: {
    /** 模板id */
    modelId: string
    /** 邀请id */
    invId: string
    /** 委托单位id */
    consignUnitId: string
    /** 委托人/邀请人id */
    sampleSenderId: string
    /** 报告id */
    reportId: string
    /** 单位编码 */
    unitCode: string
    /** true表示评价过 false未评价过 */
    status: boolean
  }
}

const props = defineProps<Props>()

const data = ref<EvaluateModelEntity>()

const showResult = ref(false)

const isSuccess = ref(false)

if (props.params.status) {
  showSuccess()
}

if (props.params.invId) {
  verify()
}

/**
 * # 验证问卷是否在有效期内
 */
async function verify() {
  const { params: { unitCode, invId } } = props
  try {
    const { data: { status } } = await verifyEvaluate(invId, unitCode)
    if (status === EvaluateInvStatus.CLOSE) {
      showFail()
    }
  }
  catch (error) {
    showFail()
    throw error
  }
}

async function getData() {
  const { params: { unitCode, modelId } } = props
  const { data: res } = await getEvaluateModelDetailPre(EvaluateModelEntity.fromJSON({ id: modelId }), unitCode)
  data.value = res
}
getData()

function onSubmit(data: any) {
  // console.log('外部', data)
  // 判断问卷是否填写完整
  const isComplete = Object.keys(data).every(key => data[key] && data[key].length > 0)
  // 全部填写
  if (isComplete) {
    handleSubmit(data)
  }
  else {
    showConfirmDialog({
      title: '您还有未作答的问题，确认提交吗？',
      message: '为了让我们更全面地了解您的想法，请您尽量回答完所有的问题。这将对我们改进服务非常有帮助。',
      confirmButtonText: '继续作答',
      confirmButtonColor: '#0066ec',
      cancelButtonText: '提交',
      cancelButtonColor: '#000',
    })
      .then(() => {
        // on cancel
      })
      .catch(() => {
        // on confirm
        handleSubmit(data)
      })
  }
}

async function handleSubmit(_values: any) {
  const { params: { unitCode, modelId, invId, consignUnitId, sampleSenderId, reportId } } = props
  // console.log(_values)
  // console.log(data.value)
  const recordProblemList = data.value?.problemList.map((item) => {
    const itemResult = item.type === QuestionType.SELECT ? item.result?.join(',') : item.result

    return {
      modelProblemId: item.id,
      ...(item.type === QuestionType.RADIO || item.type === QuestionType.SELECT
        ? { modelProblemItemId: itemResult }
        : { content: itemResult }),
    }
  })

  const query = {
    modelId,
    invId,
    consignUnitId,
    sampleSenderId,
    reportId,
    recordProblemList,
  }
  await saveEvaluateResult(query, unitCode).catch((err) => {
    if (err instanceof ILISHTTPError) {
      showFail()
    }
    throw err
  })
  showSuccess()
  // if (res) {
  //   isSuccess.value = true
  //   showResult.value = true
  // }
  // else {
  //   showDialog({
  //     message: '提交失败！评价已结束，感谢您的关注与支持！',
  //   }).then(() => {
  //     isSuccess.value = false
  //     showResult.value = true
  //   })
  // }
}

function showSuccess() {
  isSuccess.value = true
  showResult.value = true
}

function showFail() {
  isSuccess.value = false
  showResult.value = true
}
</script>

<style scoped lang="less">
.page-wrap{
  padding: 20px;
  max-width: 600px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: #fff;
  .page-title{
    word-break: break-all;
    font-weight: bold;
    font-size: 20px;
    line-height: 30px;
    text-align: center;
  }
}
</style>
