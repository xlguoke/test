import type { IAddEditProps } from '~/views/report/issue/listEntity'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { AddEdit } from '~/views/report/issue'
import '~/main.ts'
import 'ant-design-vue/dist/reset.css'

(function () {
  async function showModal(props: IAddEditProps) {
    const res = await AnyDialogHelper.showModel(AddEdit, props)
    if (props.callback)
      props.callback(res)
  }

  window.vm_reportIssueEdit = {
    showModal,
  }
})()
