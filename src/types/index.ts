import type { Ref } from 'vue'

export interface Column {
    name: string
    label: string
    field: string
    align?: 'left' | 'right' | 'center'
    sort?: any
    sortable?: boolean
}

interface Row {
    ver: string
    release_date: string
}

interface InstallRow extends Row {
    use: number
    uninstall: number
}

interface ArchiveRow extends Row {
    install: number
}

export type Rows = Ref<(InstallRow | ArchiveRow)[]>
