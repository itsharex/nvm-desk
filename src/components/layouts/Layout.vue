<script setup lang="ts">
import { computed, ref, type Ref, watch } from 'vue'

import LayoutHeader from './LayoutHeader.vue'
import NodeList from '../NodeList.vue'
import LayoutConfig from './LayoutConfig.vue'

const currentVersion: Ref<string> = ref('')
const tab: Ref<string> = ref('installed')
const isConfigOpen: Ref<boolean> = ref(false)
const searchKeyword: Ref<string> = ref('')
const nvmLog: Ref<string []> = ref([])
const isShowLog: Ref<boolean> = ref(false)

const logs = computed(() => nvmLog.value.join(''))

watch(isShowLog, (isOpen) => {
  if (!isOpen) {
    nvmLog.value = []
  }
})

function onUpdateLogs(val: string) {
  nvmLog.value.push(val)
}

</script>

<template>
  <q-layout view="hHr lpR fFf">
    <!-- layout - header-->
    <layout-header
      v-model:tab="tab"
      @is-config-show="(val: any) => isConfigOpen = val"
      @input-search="(val: string) => searchKeyword = val"
    />

    <!-- layout - config-->
    <layout-config v-model:is-show="isConfigOpen" />

    <!-- layout - body-->
    <q-page-container>
      <div class="col">
        <div class="row justify-end current-text">
          <span>Current Version: </span>
          <span v-if="currentVersion !== ''">{{ currentVersion }}</span>
          <span v-else>
            <q-skeleton
              animation="blink"
              type="text"
              width="60px"
              height="24px"
            />
          </span>
        </div>

        <node-list
          :tab="tab"
          :search-keyword="searchKeyword"
          class="row"
          @is-show-log="val => isShowLog = val"
          @update-logs="onUpdateLogs"
          @current-version="val => currentVersion = val"
        />
      </div>
    </q-page-container>

    <q-footer
      v-model="isShowLog"
      reveal
      elevated
      class="text-white"
    >
      <div>
        <textarea
          v-model="logs"
          readonly
          class="log-area"
        />
      </div>
    </q-footer>
  </q-layout>
</template>
