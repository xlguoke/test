import { describe, expect, it } from 'vitest'
import type { IDictionary } from '~/interface/IDictionary'
import { AnyDictionaryArrayModel } from '~/model/DictionaryArrayModel'
import { AnyDictionaryModel } from '~/model/DictionaryModel'

describe('anyDictionaryHelper', () => {
  it('should create a dictionary array model from an array of IDictionary', () => {
    const input: IDictionary[] = [
      { key: 'key1', label: 'Label1', description: 'Description1' },
      { key: 'key2', label: 'Label2', description: 'Description2' },
      // ... more items if needed
    ]

    const result = AnyDictionaryHelper.createDictionaryArray(input)

    expect(result).toBeInstanceOf(AnyDictionaryArrayModel)
    expect(result.length).toBe(input.length)
    for (let i = 0; i < input.length; i++) {
      const item = result[i]
      expect(item).toBeInstanceOf(AnyDictionaryModel)
      expect(item.key).toBe(input[i].key)
      expect(item.label).toBe(input[i].label)
      expect(item.description).toBe(input[i].description)
    }
  })

  it('should create a dictionary array model from an empty array', () => {
    const input: IDictionary[] = []

    const result = AnyDictionaryHelper.createDictionaryArray(input)

    expect(result).toBeInstanceOf(AnyDictionaryArrayModel)
    expect(result.length).toBe(input.length)
  })

  it('getLabelByKey should return the correct label for a given key', () => {
    const dict = AnyDictionaryHelper.createDictionaryArray([
      { key: 'key1', label: 'Label1', description: 'Description1' },
      { key: 'key2', label: 'Label2', description: 'Description2' },
      // ... more items if needed
    ])

    expect(dict.getLabelByKey('key1')).toBe('Label1')
    expect(dict.getLabelByKey('key2')).toBe('Label2')
    expect(dict.getLabelByKey('key3')).toBeUndefined()
  })

  it('getDescriptionByKey should return the correct description for a given key', () => {
    const dict = AnyDictionaryHelper.createDictionaryArray([
      { key: 'key1', label: 'Label1', description: 'Description1' },
      { key: 'key2', label: 'Label2', description: 'Description2' },
      // ... more items if needed
    ])

    expect(dict.getDescriptionByKey('key1')).toBe('Description1')
    expect(dict.getDescriptionByKey('key2')).toBe('Description2')
    expect(dict.getDescriptionByKey('key3')).toBeUndefined()
  })

  it('exclude should remove the specified keys from the dictionary array', () => {
    const dict = AnyDictionaryHelper.createDictionaryArray([
      { key: 'key1', label: 'Label1', description: 'Description1' },
      { key: 'key2', label: 'Label2', description: 'Description2' },
      // ... more items if needed
    ])

    dict.exclude(['key1'])

    expect(dict.exclude(['key1']).length).toBe(1)
    expect(dict.exclude(['key1']).getLabelByKey('key1')).toBeUndefined()
    expect(dict.exclude(['key1']).getDescriptionByKey('key1')).toBeUndefined()
    expect(dict.exclude(['key1']).getLabelByKey('key2')).toBe('Label2')
    expect(dict.exclude(['key1']).getDescriptionByKey('key2')).toBe('Description2')
  })

  it('expose should add the specified keys to the dictionary array', () => {
    const dict = AnyDictionaryHelper.createDictionaryArray([
      { key: 'key1', label: 'Label1', description: 'Description1' },
      { key: 'key2', label: 'Label2', description: 'Description2' },
      // ... more items if needed
    ])

    dict.expose(['key1'])

    expect(dict.expose(['key1']).length).toBe(1)
    expect(dict.expose(['key1']).getLabelByKey('key1')).toBe('Label1')
    expect(dict.expose(['key1']).getDescriptionByKey('key1')).toBe('Description1')
    expect(dict.expose(['key1']).getLabelByKey('key2')).toBeUndefined()
    expect(dict.expose(['key1']).getDescriptionByKey('key2')).toBeUndefined()
  })
})
