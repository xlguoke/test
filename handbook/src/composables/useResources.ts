import {
  basic,
  getDataVersion,
  normalizeHitekCenterUrl,
  saveContractParts,
  saveCriteria,
  saveDataVersion,
  saveParams,
  saveProjects,
  saveRecordset,
  saveSampleParamAndTestItems,
  saveSamples,
  saveSections,
  saveTemplates,
} from 'custodian'
import { ref } from 'vue'
import { z } from 'zod'
import { request } from '@/axios'

import baseData from '@/stores/baseData'
import { translateError } from '@/utils/translateError'

function tenMinute(t: string) {
  return Date.now() - new Date(t).getTime() > 60000 * 10
}

export function useResourceFetch(type: basic.Data['type'], auto?: boolean) {
  const update = ref(false)
  const dataVersion = ref<basic.DataVersion>()

  const version = ref('')
  const { setDataVersionStatus } = baseData()

  function resError(err: any) {
    const error = translateError(err)
    console.error(error)
    setDataVersionStatus(type, 'fail', error.message)
    return error
  }

  async function procedure() {
    try {
      dataVersion.value = await getDataVersion(type)
      version.value = dataVersion.value?.version || ''

      if (!version.value || tenMinute(version.value)) {
        const res = await request({
          url: '/ilis2/rest/basic/data/is/update',
          method: 'post',
          data: {
            type,
            version: dataVersion.value?.version || '',
            localParamVersionId: dataVersion.value?.paramVersionId || '',
          },
          schema: z.object({
            type: z.string(),
            update: z.boolean(),
          }),
        })

        update.value = res.update
      }
    }
    catch (e) {
      const err = resError(e)
      update.value = true
      if (err.type === 'NetworkError')
        return
    }

    if (update.value)
      setDataVersionStatus(type, 'wait', '待更新')
    else setDataVersionStatus(type, 'finish', '已更新')

    if (auto)
      upgrade()
  }

  async function upgrade() {
    if (!update.value)
      return
    setDataVersionStatus(type, 'processing', '正在更新...')
    return request({
      url: '/ilis2/rest/basic/data',
      method: 'post',
      data: {
        type,
        version: dataVersion.value?.version || '',
        localParamVersionId: dataVersion.value?.paramVersionId,
      },
      schema: basic.Validator.data,
    })
      .then((res) => {
        const basicData = res
        if (basicData.data.length === 0)
          return setDataVersionStatus(type, 'finish', '已更新')
        save(basicData)
          .then(async () => {
            try {
              await saveDataVersion(basicData)
              version.value = basicData.version
              setDataVersionStatus(type, 'finish', '已更新')
            }
            catch (err) {
              resError(err)
            }
          })
          .catch((err) => {
            resError(err)
          })
        return res
      })
      .catch((err) => {
        return resError(err)
      })
  }

  procedure()

  return {
    update,
    version,
    upgrade,
  }
}

async function save(resource: basic.Data) {
  switch (resource.type) {
    case 'testSample':
      return saveSamples(resource.data)
    case 'project':
      return saveProjects(resource.data)
    case 'testParam':
      return saveParams(resource.data)
    case 'testSampleParam':
      return saveSampleParamAndTestItems(resource.data)
    case 'synthesisContract':
      return saveContractParts(resource.data)
    case 'synthesisUnitProject':
      return saveSections(resource.data)
    case 'recordSet':
      return saveRecordset(resource.data)
    case 'standard':
      return saveCriteria(resource.data)
    case 'template':
      return saveTemplates(
        resource.data,
        normalizeHitekCenterUrl(resource.hitekServer),
      )
  }
}
