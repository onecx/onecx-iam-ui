import { SelectItem } from 'primeng/api'

import { Utils } from './utils'

describe('utils', () => {
  describe('mapping_error_status', () => {
    it('should map known status', () => {
      const status = Utils.mapping_error_status(404)

      expect(status).toEqual(404)
    })

    it('should map unknown status', () => {
      const status = Utils.mapping_error_status(405)

      expect(status).toEqual(0)
    })
  })

  describe('limitText', () => {
    it('should truncate text that exceeds the specified limit', () => {
      const result = Utils.limitText('hello', 4)

      expect(result).toEqual('hell...')
    })

    it('should return the original text if it does not exceed the limit', () => {
      const result = Utils.limitText('hello', 6)

      expect(result).toEqual('hello')
    })

    it('should return an empty string for undefined input', () => {
      const str: any = undefined
      const result = Utils.limitText(str, 5)

      expect(result).toEqual('')
    })

    it('should handle zero length text', () => {
      const result = Utils.limitText(null, 4)
      expect(result).toEqual('')
    })
  })

  describe('copyToClipboard', () => {
    let writeTextSpy: jasmine.Spy

    beforeEach(() => {
      writeTextSpy = spyOn(navigator.clipboard, 'writeText')
    })

    it('should copy text to clipboard', () => {
      Utils.copyToClipboard('text')

      expect(writeTextSpy).toHaveBeenCalledWith('text')
    })
  })

  describe('sortItemsByLabel', () => {
    it('should correctly sort items by label', () => {
      const items: any[] = [
        { label: 'label2', value: 2 },
        { label: 'label1', value: 1 }
      ]

      const sortedItems = items.sort(Utils.sortItemsByLabel)

      expect(sortedItems[0].label).toEqual('label1')
    })
    it("should treat falsy values for SelectItem.label as ''", () => {
      const items: SelectItem[] = [
        { label: undefined, value: 1 },
        { label: undefined, value: 2 },
        { label: 'label1', value: 2 }
      ]

      const sortedItems = items.sort(Utils.sortItemsByLabel)

      expect(sortedItems[0].label).toEqual(undefined)
    })
  })

  describe('sortItemsByName', () => {
    it('should correctly sort items by name', () => {
      const items: any[] = [
        { name: 'label2', value: 2 },
        { name: 'label1', value: 1 }
      ]

      const sortedItems = items.sort(Utils.sortItemsByName)

      expect(sortedItems[0].name).toEqual('label1')
    })
    it("should treat falsy values for name as ''", () => {
      const items: any[] = [
        { name: undefined, value: 1 },
        { name: undefined, value: 2 },
        { name: 'name1', value: 2 }
      ]

      const sortedItems = items.sort(Utils.sortItemsByName)

      expect(sortedItems[0].name).toEqual(undefined)
    })
  })

  describe('sortItemsByDisplayName', () => {
    it('should correctly sort items by name', () => {
      const items: any[] = [
        { displayName: 'label2', value: 2 },
        { displayName: 'label1', value: 1 }
      ]

      const sortedItems = items.sort(Utils.sortItemsByDisplayName)

      expect(sortedItems[0].displayName).toEqual('label1')
    })
    it("should treat falsy values for name as ''", () => {
      const items: any[] = [
        { displayName: undefined, value: 1 },
        { displayName: undefined, value: 2 },
        { displayName: 'name1', value: 2 }
      ]

      const sortedItems = items.sort(Utils.sortItemsByDisplayName)

      expect(sortedItems[0].displayName).toEqual(undefined)
    })
  })

  describe('dropDownGetLabelByValue', () => {
    it('should return the label corresponding to the value', () => {
      const items: SelectItem[] = [
        { label: 'label2', value: 2 },
        { label: 'label1', value: 1 }
      ]

      const result = Utils.dropDownGetLabelByValue(items, '1')

      expect(result).toEqual('label1')
    })
  })

  describe('sortByLocale', () => {
    it('should sort strings based on locale', () => {
      const strings: string[] = ['str2', 'str1']

      const sortedStrings = strings.sort(Utils.sortByLocale)

      expect(sortedStrings[0]).toEqual('str1')
    })
  })
})
