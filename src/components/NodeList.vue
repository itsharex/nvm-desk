<script setup lang="ts">
import type {Ref} from 'vue'
import {ref} from 'vue'
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

async function getNodeList() {
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
</script>

<template>
  <div v-for="node in nodeList"
       class="row marT10">
    <button @clikc="onApplyNode(node)"
            :class="['node', {current: getCurrent(node)}]">
      {{ node }}
    </button>
  </div>
</template>
