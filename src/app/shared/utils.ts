import { SelectItem } from 'primeng/api'

// This object encapsulates functions because ...
//  ...Jasmine has problems to spying direct imported functions
export const Utils = {
  mapping_error_status(status: number): number {
    return [400, 401, 403, 404, 500].includes(status) ? status : 0
  },

  limitText(text: string | null | undefined, limit: number): string {
    if (text) {
      return text.length < limit ? text : text.substring(0, limit) + '...'
    } else {
      return ''
    }
  },

  copyToClipboard(text?: string): void {
    if (text) navigator.clipboard.writeText(text)
  },

  sortItemsByLabel(a: any, b: any): number {
    return (a.label ? (a.label as string).toUpperCase() : '').localeCompare(
      b.label ? (b.label as string).toUpperCase() : ''
    )
  },
  sortItemsByName(a: any, b: any): number {
    return (a.name ? (a.name as string).toUpperCase() : '').localeCompare(
      b.name ? (b.name as string).toUpperCase() : ''
    )
  },
  sortItemsByDisplayName(a: any, b: any): number {
    return (a.displayName ? (a.displayName as string).toUpperCase() : '').localeCompare(
      b.displayName ? (b.displayName as string).toUpperCase() : ''
    )
  },

  dropDownGetLabelByValue(ddArray: SelectItem[], val: string): string | undefined {
    const a: any = ddArray.find((item: SelectItem) => {
      return item?.value == val
    })
    return a.label
  },
  sortByLocale(a: any, b: any): number {
    return a.toUpperCase().localeCompare(b.toUpperCase())
  }
}
