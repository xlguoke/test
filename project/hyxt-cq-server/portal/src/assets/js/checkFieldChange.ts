import type {
  dataItemType,
  samplesType,
  CheckFieldsType,
  CheckSampleType,
  CheckResultType
} from "@/type/api/report.api"
import { sampleFieldsName, dataItemFieldsName } from "@/assets/js/reportFields"

const contrastSample = (
  oldSample: samplesType | null,
  newSample: samplesType | null
): CheckSampleType => {
  if (!oldSample && newSample) {
    // 新增
    return {
      name: newSample.name,
      type: "新增",
      details: newSample
    }
  } else if (oldSample && !newSample) {
    // 删除
    return {
      name: oldSample.name,
      type: "删除",
      details: oldSample
    }
  } else {
    // 变更
    let details: Array<CheckFieldsType> = []
    newSample = newSample as samplesType
    oldSample = oldSample as samplesType
    for (let key in sampleFieldsName) {
      const newVal = newSample[key]
      const oldVal = oldSample[key]
      if (newVal === oldVal) continue
      details.push({
        field: key,
        fieldName: sampleFieldsName[key],
        beforeChange: oldVal,
        afterChange: newVal
      })
    }
    return {
      name: `${newSample.name}${newSample.sn ? `(${newSample.sn})` : ""}`,
      type: details.length > 0 ? "更正" : "",
      details
    }
  }
}

const contrastFields = (oldFields: dataItemType, newFields: dataItemType): CheckResultType => {
  let result: CheckResultType = {
    isChange: false,
    baseInfo: [],
    samples: []
  }
  for (let key in dataItemFieldsName) {
    let newVal = newFields[key]
    let oldVal = oldFields[key]
    if (key === "samples") {
      let oldSampleMap = {}
      newVal = newVal ? newVal : []
      oldVal = oldVal ? oldVal : []
      for (let j = 0; j < oldVal.length; j++) {
        const sample = oldVal[j]
        oldSampleMap[sample.id as string] = sample
      }
      for (let i = 0; i < newVal.length; i++) {
        const newSample = newVal[i]
        if (!newSample.id || !oldSampleMap[newSample.id]) {
          // 新增的样品
          result.isChange = true
          result.samples.push(contrastSample(null, newSample))
        } else {
          // 变更的样品
          const item = contrastSample(oldSampleMap[newSample.id], newSample)
          if (item.type) {
            result.isChange = true
            result.samples.push(item)
          }
          delete oldSampleMap[newSample.id]
        }
      }
      // 删除的样品
      if (JSON.stringify(oldSampleMap) !== "{}") {
        result.isChange = true
        for (const key in oldSampleMap) {
          result.samples.push(contrastSample(oldSampleMap[key], null))
        }
      }
    } else if (key === "attachments") {
      newVal = newVal ? newVal : []
      oldVal = oldVal ? oldVal : []
      if (
        (oldVal.length === 0 && newVal.length !== 0) ||
        (oldVal.length && oldVal[0].url !== newVal[0].url)
      ) {
        result.baseInfo.push({
          field: key,
          fieldName: dataItemFieldsName[key],
          beforeChange: oldVal,
          afterChange: newVal
        })
        result.isChange = true
      }
    } else {
      if (newVal === oldVal) continue
      if ((oldVal === "" || oldVal === null) && (newVal === "" || newVal === null)) continue
      result.baseInfo.push({
        field: key,
        fieldName: dataItemFieldsName[key],
        beforeChange: oldVal,
        afterChange: newVal
      })
      result.isChange = true
    }
  }
  return result
}

export type { CheckResultType }
export default contrastFields
