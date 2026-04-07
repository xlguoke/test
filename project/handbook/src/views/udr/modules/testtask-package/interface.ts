export interface TaskPackageDTO {
  id: string
  userId: string
  deviceId: string
  taskId: string
  taskSn: string
  sampleId: string
  sampleName: string
  sampleSn: string
  parentSampleId: string
  children: TaskPackageDTO[]
  status: string
  expand?: boolean
}
