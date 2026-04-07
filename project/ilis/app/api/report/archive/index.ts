import type { BatchSubmit } from './type'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

export function batchSubmit(data: BatchSubmit) {
  return IlisApiHelper.postForm('/archiveController/batchSubmit', data)
}
