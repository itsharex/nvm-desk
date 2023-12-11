<script setup lang="ts">
import { computed, onBeforeMount, ref, watch, type Ref } from 'vue'

import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification'
import { Command } from '@tauri-apps/api/shell'
import { info } from 'tauri-plugin-log-api'

import type { Column, Data } from '../types'

import TableLoader from './TableLoader.vue'

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
const rows: Data = ref({
  installedData: [],
  archiveData: []
})
const progressUseBtn: Ref<boolean []> = ref([])
const progressUninstallBtn: Ref<boolean []> = ref([])
const progressInstallBtn: Ref<boolean []> = ref([])
const isDisableBtn: Ref<boolean> = ref(false)
const isLoader: Ref<boolean> = ref(false)

const isInstalledTab = computed(() => props.tab === 'installed')

const filterData = computed(() => {
  const dataList = isInstalledTab.value ? rows.value.installedData : rows.value.archiveData

  return dataList.filter(row => row.ver.includes(props.searchKeyword))
})

watch(() => props.tab, () => {
  rows.value.installedData = []
  rows.value.archiveData = []

  if (isInstalledTab.value) {
    columns.value = installedCols
    getInstalledData()
  } else {
    columns.value = archiveCols
    getArchiveData()
  }
})

onBeforeMount(async () => {
  columns.value = installedCols

  await getArchiveData()
  await getInstalledData()
})

function onLoad() {
  isLoader.value = !isLoader.value
}

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

function getReleaseDate (version: string) {
  const matchData =  rows.value.archiveData.filter(data => data.ver.includes(version))

  return matchData[0].release_date
}

async function getInstalledData() {
  onLoad()

  const command = await runCommand('nvm-ls', ['ls'])

  command.stdout.on('data', async (line: string) => {
    if (line.trim() !== '') {
      const version = line.match(/\d+(\.\d+)+/g)?.join('')

      rows.value.installedData.push({
        ver: version as string,
        release_date: getReleaseDate(version),
        use: line.includes('*') ? 1 : 0,
        uninstall: 1,
        type: 1
      })

      if (line.indexOf('*') > -1) {
        if (await permissionGranted()) {
          sendNotification({
            title: 'Node.js 현재 버전',
            body: `${ line.trim() }`
          })
        }
      }

      progressUseBtn.value.push(false)
      progressUninstallBtn.value.push(false)
    }
  })

  command.on('close', (data: string) => {
    info(data)
    onLoad()
  })
}

async function getArchiveData() {
  const {json} = await fetch('https://nodejs.org/dist/index.json')
  const nodeList = await json()

  rows.value = nodeList.map(node => {
    return {
      ver: node.version,
      release_date: node.date,
      install: 1,
      type: 2
    }
  })
}

async function onApply(col: string, row: any, idx: number) {
  const version = row.ver

  if (col === 'use') {
    isDisableBtn.value = true
    progressUseBtn.value[idx] = true

    const command = await runCommand('nvm-apply', ['use', version.trim()])

    command.on('close', (line: string) => {
      isDisableBtn.value = false
      progressUseBtn.value[idx] = false
      info(line)

      if (permissionGranted()) {
        sendNotification({
          title: 'node.js 버전',
          body: `${ version.trim() }`
        })
      }

      getInstalledData()
    })
  }

  if (col === 'uninstall') {
    progressUninstallBtn.value[idx] = true
  }

  if (col === 'install') {
    isDisableBtn.value = true
    progressInstallBtn.value[idx] = true

    const command = await runCommand('nvm-apply', ['install', version.trim()])

    command.stdout.on('data', async (line: string) => {
      console.log(line)
    })

    command.stderr.on('data', async (line: string) => {
      console.log(line)
    })

    command.on('close', (line: string) => {
      isDisableBtn.value = false
      progressInstallBtn.value[idx] = false
      console.log(line)
    })
  }
}

function isLoading(col: string, idx: number) {
  if (col === 'use') {
    return progressUseBtn.value[idx]
  }

  if (col === 'uninstall') {
    return progressUninstallBtn.value[idx]
  }

  if (col === 'install') {
    return progressInstallBtn.value[idx]
  }
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
    bordered
    flat
    :loading="isLoader"
    class="sticky-table"
  >
    <template #loading>
      <table-loader />
    </template>

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
            :disable="isDisable(col.field, props.pageIndex) || props.row.use === 1"
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
