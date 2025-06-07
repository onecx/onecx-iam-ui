import { SelectItem } from 'primeng/api'

export function limitText(text: string | null | undefined, limit: number): string {
  if (text) {
    return text.length < limit ? text : text.substring(0, limit) + '...'
  } else {
    return ''
  }
}

export function copyToClipboard(text?: string): void {
  if (text) navigator.clipboard.writeText(text)
}

export function sortItemsByLabel(a: any, b: any): number {
  return (a.label ? (a.label as string).toUpperCase() : '').localeCompare(
    b.label ? (b.label as string).toUpperCase() : ''
  )
}
export function sortItemsByName(a: any, b: any): number {
  return (a.name ? (a.name as string).toUpperCase() : '').localeCompare(b.name ? (b.name as string).toUpperCase() : '')
}
export function sortItemsByDisplayName(a: any, b: any): number {
  return (a.displayName ? (a.displayName as string).toUpperCase() : '').localeCompare(
    b.displayName ? (b.displayName as string).toUpperCase() : ''
  )
}

export function dropDownGetLabelByValue(ddArray: SelectItem[], val: string): string | undefined {
  const a: any = ddArray.find((item: SelectItem) => {
    return item?.value == val
  })
  return a.label
}
export function sortByLocale(a: any, b: any): number {
  return a.toUpperCase().localeCompare(b.toUpperCase())
}
