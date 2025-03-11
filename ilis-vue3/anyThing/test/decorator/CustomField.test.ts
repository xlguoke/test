import { describe, expect, it } from 'vitest'
import { CustomField, getCustomFieldDictionaryArray, getCustomFieldName } from '~/anyThing/decorator/CustomField'
import { AnyBaseModel } from '~/anyThing/model/AnyBaseModel'

describe('customField', () => {
  enum TestEnum {
    test = 'test',
  }

  const TestEnumDict = AnyDictionaryHelper.createDictionaryArray([
    {
      key: TestEnum.test,
      label: 'test',
      description: 'test',
    },
  ])

  it('getCustomFieldName', () => {
    class TestClass extends AnyBaseModel {
      @CustomField('test', TestEnumDict)
  test: string = ''
    }
    expect(getCustomFieldName(TestClass, 'test')).toBe('test')
  })

  it('getCustomFieldName not exist', () => {
    class TestClass extends AnyBaseModel {
      test: string = ''
    }
    expect(getCustomFieldName(TestClass, 'test')).toBeUndefined()
  })

  it('getCustomFieldDictionaryArray', () => {
    class TestClass extends AnyBaseModel {
      @CustomField('test', TestEnumDict)
  test: string = ''
    }
    expect(getCustomFieldDictionaryArray(TestClass, 'test')).toEqual(TestEnumDict)
  })

  it('getCustomFieldDictionaryArray not exist', () => {
    class TestClass extends AnyBaseModel {
      @CustomField('test')
  test: string = ''
    }
    expect(getCustomFieldDictionaryArray(TestClass, 'test')).toBeUndefined()
  })
})
