import { describe, expect, it } from 'vitest'
import { FormField, getFormFieldConfigObj, getFormFieldList } from '~/anyThing/decorator/FormField'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

class TestClass {
  @FormField({
    formType: EFormItemType.INPUT,
    label: 'test',
    required: true,
  })
  test?: string

  @FormField({
    formType: EFormItemType.CHECKBOX,
    label: 'test2',
    required: true,
  })
  test2?: string

  test3?: string
}
describe('formField', () => {
  it('getFormFieldList', () => {
    expect(getFormFieldList(new TestClass())).toEqual(['test', 'test2'])
  })

  it('getFormFieldConfigObj', () => {
    expect(getFormFieldConfigObj(new TestClass())).toEqual({
      test: {
        formType: EFormItemType.INPUT,
        label: 'test',
        required: true,
      },
      test2: {
        formType: EFormItemType.CHECKBOX,
        label: 'test2',
        required: true,
      },
    })
  })
})
