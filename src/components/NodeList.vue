<script setup lang="ts">
import type {Ref} from 'vue'
import {computed, ref} from 'vue'
import {isPermissionGranted, requestPermission, sendNotification} from "@tauri-apps/api/notification";
import {Command} from "@tauri-apps/api/shell";

import {info} from 'tauri-plugin-log-api'

defineProps<{
  loader: boolean;
}>();

const emit = defineEmits<{
  "update:loader": [value: boolean];
}>();

const nodeList: Ref<string []> = ref([]);
const searchVersion: Ref<string> = ref('')

const getNodeListFilter = computed<string []>(() => {
  return nodeList.value.filter(node => node.includes(searchVersion.value))
})

async function getNodeList() {
  // nodeList.value = [
  //   'v20.0.0*',
  //   'v19.0.0',
  //   'v18.0.0',
  //   'v17.0.0',
  //   'v16.0.0',
  //   'v15.0.0',
  //   'v14.0.0',
  //   'v13.0.0'
  // ]

  emit('update:loader', false)
  let permissionGranted = await isPermissionGranted();

  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted'
  }

  nodeList.value = []

  emit('update:loader', true)

  const command: any = await new Command('nvm-ls', ['ls'])
  await command.spawn()

  command.on('close', (data: string): void => {
    info(data)
    emit('update:loader', false)
  })

  command.stdout.on('data', (line: string): void => {
    if (line !== '') {
      nodeList.value.push(line)

      if (line.indexOf('*') > -1) {
        if (permissionGranted) {
          sendNotification({
            title: 'Node.js 현재 버전',
            body: `${line.trim()}`
          })
        }
      }
    }
  })
}

async function onApplyNode(version: string) {
  let permissionGranted = await isPermissionGranted();

  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted'
  }

  const command: any = await new Command('nvm-apply', ['use', version.trim()])
  await command.spawn()

  command.on('close', (line: string): void => {
    info(line)

    if (permissionGranted) {
      sendNotification({
        title: 'node.js 버전',
        body: `${version.trim()}`
      })
    }

    getNodeList()
  })
}

function getCurrent(node: string): boolean {
  return node.indexOf("*") > -1
}

getNodeList()
</script>

<template>
  <div
      class="marT10"
      style="width: 100%;">
    <div style="text-align: left;">Node.js Version List</div>

    <div class="node-container marT10">
      <div class="row">
        <input
            v-model="searchVersion"
            placeholder="search version"
            style="width:100%"/>
      </div>

      <div class="node-box">
        <div
            v-for="node in getNodeListFilter"
            class="row content-row node-pad">
          {{ node }}
          <button
              @click="onApplyNode(node)"
              :class="['node', {current: getCurrent(node)}]">
            use
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
