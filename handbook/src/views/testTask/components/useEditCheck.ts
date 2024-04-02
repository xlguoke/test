import { inject, ref } from 'vue'
import { Modal } from 'ant-design-vue'
import type { TaskParam } from 'custodian'
import type { TaskBaseInfoDTO } from '@/type/testTask'

export function useEditCheck() {
  const formData = ref(inject('formData') as TaskBaseInfoDTO)
  const taskParams = ref<TaskParam[]>(inject('taskParams') || [])
  const isConfirmEdit = ref(inject('isConfirmEdit') as boolean)

  async function editCheck(): Promise<boolean> {
    if (
      isConfirmEdit.value
      || !formData.value.status
      || formData.value.status === 'pending'
    )
      return true

    return new Promise((resolve) => {
      Modal.confirm({
        title: '提示',
        content:
          '由于您修改了模板、样品、参数或规程信息，导致系统将清空已保存的表格数据，请确认是否清空数据？',
        centered: true,
        onOk: () => {
          isConfirmEdit.value = true
          resolve(true)
        },
        onCancel: () => {
          resolve(false)
        },
      })
    })
  }

  return { formData, taskParams, editCheck }
}
