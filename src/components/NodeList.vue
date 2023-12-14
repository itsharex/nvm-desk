<script setup lang="ts">
import { computed, onBeforeMount, ref, watch, type Ref, nextTick } from 'vue'
import type { Column, Data } from '../types'

import TableLoader from './TableLoader.vue'

const props = defineProps<{
  tab: string,
  searchKeyword: string
}>()

// const osRef: Ref<string> = ref('')
const emit = defineEmits<{
  'is-show-log': [value: boolean],
  'update-logs': [value: string],
  'current-version': [value: string]
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

const filterArchiveData = computed(() => rows.value.archiveData.filter(row => row.install === 1))

const filterData = computed(() => {
  const dataList = isInstalledTab.value ? rows.value.installedData : filterArchiveData.value

  return dataList.filter(row => row.ver.includes(props.searchKeyword))
})

watch(() => props.tab, () => {
  // rows.value.installedData = []
  // rows.value.archiveData = []

  if (isInstalledTab.value) {
    columns.value = installedCols
    // getInstalledData()
  } else {
    columns.value = archiveCols
    // getArchiveData()
  }
})

onBeforeMount(async () => {
  onLoad()

  columns.value = installedCols

  await getArchiveData()
  await getInstalledData()
})

async function reLoad() {
  onLoad()

  rows.value.installedData = []
  rows.value.archiveData = []

  await nextTick()

  await getArchiveData()
  await getInstalledData()
}

function onLoad() {
  isLoader.value = !isLoader.value
}

function getReleaseDate(version: string) {
  const matchData = rows.value.archiveData.filter(data => data.ver.includes(version))

  return matchData[0].release_date
}

function dummyData() {
  rows.value.installedData = []

  for (let i = 0; i < 10; i++) {
    rows.value.installedData.push({
      ver: `v21.4.0`,
      release_date: getReleaseDate(`v21.4.0`),
      use: i === 0 ? 1 : 0,
      uninstall: 1,
      type: 1
    })

    updateArchiveData(`v21.4.0`)
  }

  progressUseBtn.value.push(false)
  progressUninstallBtn.value.push(false)

  onLoad()
}


async function getInstalledData() {
  window.electronAPI.send('runCommand', { cmd: 'nvm', args: ['ls'] })
  window.electronAPI.receive('resCommand', (evt, { result, os }) => {
    if (os === 'darwin') {
      dummyData()
      return
    }

    rows.value.installedData = []

    for (let i = 0; i < result.length; i++) {
      const line = result[i]

      if (line.trim() !== '') {
        const version = `v${ line.match(/\d+(\.\d+)+/g)?.join('') }`

        rows.value.installedData.push({
          ver: version,
          release_date: getReleaseDate(version),
          use: line.includes('*') ? 1 : 0,
          uninstall: 1,
          type: 1
        })

        updateArchiveData(version)

        if (line.indexOf('*') > -1) {
          emit('current-version', version)

          window.electronAPI.send('showNotification', {
            title: 'Node.js Current Version',
            body: version
          })
        }

        progressUseBtn.value.push(false)
        progressUninstallBtn.value.push(false)
      }
    }

    onLoad()
  })
}

async function getArchiveData() {
  const res = await fetch('https://nodejs.org/dist/index.json')
  const nodeList: any = await res.json()

  rows.value.archiveData = nodeList.map((node: any) => {
    return {
      ver: node.version,
      release_date: node.date,
      install: 1,
      type: 2
    }
  })
}

function updateArchiveData(version: string) {
  rows.value.archiveData = rows.value.archiveData.map(node => {
    if (node.ver.includes(version)) {
      node = Object.assign(node, {
        install: 2
      })
    }

    return node
  })
}

async function onApply(col: string, row: any, idx: number) {
  const version = row.ver

  if (col === 'use') {
    isDisableBtn.value = true
    progressUseBtn.value[idx] = true

    window.electronAPI.send('runCommand', { cmd: 'nvm', args: ['use', version.trim()] })
    window.electronAPI.receive('resCommand', async () => {
      isDisableBtn.value = false
      progressUseBtn.value[idx] = false

      window.electronAPI.send('showNotification', {
        title: 'node.js Version',
        body: version
      })

      await getInstalledData()
      onLoad()
    })
  }

  if (col === 'uninstall') {
    progressUninstallBtn.value[idx] = true
  }

  if (col === 'install') {
    emit('is-show-log', true)

    isDisableBtn.value = true
    progressInstallBtn.value[idx] = true

    window.electronAPI.send('runCommand', { cmd: 'nvm', args: ['install', version.trim()] })
    window.electronAPI.receive('streamCommand', (evt, data) => {
      emit('update-logs', data)
    })
    window.electronAPI.receive('resCommand', async () => {
      isDisableBtn.value = false
      progressInstallBtn.value[idx] = false

      await reLoad()
      emit('is-show-log', false)
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
    return { icon: 'arrow_circle_up', color: 'light-blue-14' }
  }

  if (col === 'uninstall') {
    return { icon: 'remove_circle_outline', color: 'deep-orange-9' }
  }

  if (col === 'install') {
    return { icon: 'downloading', color: 'yellow-9' }
  }

  return { icon: '', color: '' }
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
