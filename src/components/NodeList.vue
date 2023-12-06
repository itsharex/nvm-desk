<script setup lang="ts">
import { computed, onBeforeMount, ref, watch, type Ref } from 'vue'

import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification'
import { Command } from '@tauri-apps/api/shell'
import { info } from 'tauri-plugin-log-api'

import type { Column, Rows } from '../types'

const props = defineProps<{
  tab: string,
  searchKeyword: string
}>()

const installedCols: Column[] = [
  {
    name: 'ver',
    label: 'Version',
    field: 'ver',
    align: 'center',
    sortable: true
  },
  {
    name: 'release_date',
    label: 'Release Date',
    field: 'release_date',
    align: 'center',
    sortable: true
  },
  {
    name: 'use',
    label: 'Use',
    field: 'use',
    align: 'center'
  },
  {
    name: 'uninstall',
    label: 'Uninstall',
    field: 'uninstall',
    align: 'center'
  }
]
const archiveCols: Column[] = [
  {
    name: 'ver',
    label: 'Version',
    field: 'ver',
    align: 'center',
    sort: (a: any, b: any): number => {
      console.log('222')
      return a - b
    },
    sortable: true
  },
  {
    name: 'release_date',
    label: 'Release Date',
    field: 'release_date',
    align: 'center',
    sortable: true
  },
  {
    name: 'install',
    label: 'Install',
    field: 'install',
    align: 'center'
  },
]
const columns: Ref<Column []> = ref([])
const rows: Rows = ref([])
const progressUseBtn: Ref<boolean []> = ref([])
const progressUninstallBtn: Ref<boolean []> = ref([])
const isDisableBtn: Ref<boolean> = ref(false)

const filterData = computed(() => {
  return rows.value.filter(row => row.ver.includes(props.searchKeyword))
})

watch(() => props.tab, () => {
  rows.value = []

  if (props.tab === 'installed') {
    columns.value = installedCols
    getInstalledData()
  } else {
    columns.value = archiveCols
    getArchiveData()
  }
})

onBeforeMount(async () => {
  columns.value = installedCols
  getInstalledData()
})

async function permissionGranted() {
  let permissionGranted = await isPermissionGranted()

  if (!permissionGranted) {
    const permission = await requestPermission()
    permissionGranted = permission === 'granted'
  }

  return permissionGranted
}

async function runCommand(cmd: string, args: string []) {
  const command: any = await new Command(cmd, args)
  await command.spawn()

  return command
}

async function getInstalledData() {
  const command = await runCommand('nvm-ls', ['ls'])

  command.on('close', (data: string): void => {
    info(data)
    // emit('update:loader', false)
  })

  command.stdout.on('data', (line: string): void => {
    if (line !== '') {
      rows.value.push({
        ver: line,
        release_date: '1',
        use: 1,
        uninstall: 1
      })

      if (line.indexOf('*') > -1) {
        if (permissionGranted()) {
          sendNotification({
            title: 'Node.js 현재 버전',
            body: `${ line.trim() }`
          })
        }
      }
    }
  })

  for (let i = 0; i < 10; i++) {
    rows.value.push({
      ver: `1.1.${ i }`,
      release_date: '11' + i,
      use: 1,
      uninstall: 1
    })

    progressUseBtn.value.push(false)
    progressUninstallBtn.value.push(false)
  }
}

function getArchiveData() {
  for (let i = 0; i < 10; i++) {
    rows.value.push({
      ver: `10.1.${ i }`,
      release_date: '11' + i,
      install: 1
    })
  }
}

async function onApply(col: string, row: any, idx: number) {
  const version = row.ver

  if (col === 'use') {
    isDisableBtn.value = true
    progressUseBtn.value[idx] = true

    console.log(version, idx, progressUseBtn)
    // const command = await runCommand('nvm-apply', ['use', version.trim()])
    //
    // command.on('close', (line: string): void => {
    // isDisableBtn.value = false
    // progressUseBtn.value[idx] = false
    //   info(line)
    //
    //   if (permissionGranted()) {
    //     sendNotification({
    //       title: 'node.js 버전',
    //       body: `${ version.trim() }`
    //     })
    //   }
    //
    //   getInstalledData()
    // })
  }

  if (col === 'uninstall') {
    progressUninstallBtn.value[idx] = true
  }

  if (col === 'install') {
    alert('install')
  }
}

function isLoading(col: string, idx: number) {
  return col === 'use' ? progressUseBtn.value[idx] : progressUninstallBtn.value[idx]
}

function isDisable(col: string, idx: number) {
  return isDisableBtn.value && (col === 'use' ? !progressUseBtn.value[idx] : !progressUninstallBtn.value[idx])
}

function getTextField(col: string) {
  return col !== 'use' && col !== 'uninstall' && col !== 'install'
}

function getColWidth(col: string) {
  return getTextField(col) ? 'width: 200px' : 'width: 50px'
}

function getFuncBtnStyle(col: string) {
  if (col === 'use') {
    return {icon: 'arrow_circle_up', color: 'light-blue-14'}
  }

  if (col === 'uninstall') {
    return {icon: 'remove_circle_outline', color: 'deep-orange-9'}
  }

  if (col === 'install') {
    return {icon: 'downloading', color: 'yellow-9'}
  }

  return {icon: '', color: ''}
}
</script>

<template>
  <q-table
    :pagination="{rowsPerPage: 0}"
    virtual-scroll
    hide-bottom
    :rows-per-page-options="[0]"
    :virtual-scroll-sticky-size-start="48"
    row-key="ver"
    :rows="filterData"
    :columns="columns"
    class="sticky-table"
  >
    <template #body="props">
      <q-tr :props="props">
        <q-td
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
          :style="getColWidth(col.field)"
        >
          <span v-if="getTextField(col.field)">
            {{ col.value }}
          </span>

          <q-btn
            v-else
            outline
            rounded
            size="sm"
            :icon="getFuncBtnStyle(col.field).icon"
            :color="getFuncBtnStyle(col.field).color"
            :loading="isLoading(col.field, props.pageIndex)"
            :disable="isDisable(col.field, props.pageIndex)"
            align="around"
            style="width: 110px"
            @click="onApply(col.field, props.row, props.pageIndex)"
          >
            {{ col.label }}
            <template #loading>
              <q-spinner-hourglass
                class="on-left"
                :color="getFuncBtnStyle(col.field).color"
              />
              in progress
            </template>
          </q-btn>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
