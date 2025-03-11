export { default as IlisForm } from './IlisForm.vue'
export { default as IlisFormSearch } from './IlisFormSearch.vue'
export { default as IlisTable } from './IlisTable.vue'
export { default as IlisToolBar } from './IlisToolBar.vue'
export { default as IlisInput } from '~/anyThing/components/input/Index.vue'
export { default as IlisContainer } from './IlisContainer.vue'
export { default as IlisUpload } from './IlisUpload.vue'
export { default as IlisCustomPropertiesForm } from './IlisCustomPropertiesForm.vue'
export { default as IlisCustomColumns } from './IlisCustomColumns.vue'
export { default as IlisProcessModal } from '~/components/commonProcess/ProcessModal.vue'
export { default as IlisProcessForm } from '~/components/commonProcess/ProcessForm.vue'
export { default as IlisSelectModal } from './IlisSelectModal.vue'
export { default as IlisSignature } from '~/components/IlisSignature/IlisSignature.vue'
export interface IlisFormExpose<T> {
  getFormData: () => Promise<T>
  checkedFormKeys: string[]
}
