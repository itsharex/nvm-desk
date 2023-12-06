<script setup lang="ts">
import { ref, type Ref } from 'vue'

import LayoutHeader from './LayoutHeader.vue'
import NodeList from '../NodeList.vue'
import LayoutConfig from './LayoutConfig.vue'

const tab: Ref<string> = ref('installed')
const isConfigOpen: Ref<boolean> = ref(false)
const searchKeyword: Ref<string> = ref('')

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
      <node-list
        :tab="tab"
        :search-keyword="searchKeyword"
      />
    </q-page-container>
  </q-layout>
</template>
