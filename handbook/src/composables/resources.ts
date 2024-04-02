import {
  basic,
  getDataVersion,
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
import axios from 'axios'

export function useResourceFetch(type: basic.Data['type']) {
  const version = ref<string>()
  const err = ref<Error>()
  const update = ref(false)
  const upgrading = ref(false)

  async function procedure() {
    try {
      const dataVersion = await getDataVersion(type)
      const response = await axios.post(
        'rest/basic/data/is/update',
        [{ type, version: dataVersion?.version }],
        {
          transformResponse(res) {
            res = JSON.parse(res)
            if (res.code && res.code === 20000)
              return res.data
            return res
          },
        },
      )
      update.value = response.data.update
    }
    catch (e) {
      console.error(e)
      err.value = new Error(`查询数据类型为${type}的数据版本失败`)
      update.value = true
    }
  }

  function upgrade() {
    if (!update.value)
      return
    axios.post(
      'rest/basic/data',
      { type, version: version.value },
      {
        transformResponse(res) {
          res = JSON.parse(res)
          if (res.code && res.code === 20000)
            return res.data
          return res
        },
      },
    ).then((res): any => {
      const result = basic.Validator.data.safeParse(res)
      if (result.success) {
        const basicData = result.data
        save(basicData).then(() => {
          version.value = basicData.version
          return saveDataVersion(basicData)
        })
      }
      else {
        console.error(result.error)
        err.value = new Error('基础数据验证失败')
      }
    })
  }

  procedure().catch(e => err.value = e)
  return { version, update, err, upgrade, upgrading }
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
      if (resource.hitekServer.endsWith('/'))
        resource.hitekServer = resource.hitekServer.substring(0, resource.hitekServer.length - 1)
      if (resource.hitekServer.endsWith('/UDR')) {
        console.warn('Hitek center URL before substring', resource.hitekServer)
        resource.hitekServer = resource.hitekServer.substring(0, resource.hitekServer.length - 4)
        console.warn('Hitek center URL after substring', resource.hitekServer)
      }
      return saveTemplates(resource.data, resource.hitekServer)
  }
}
