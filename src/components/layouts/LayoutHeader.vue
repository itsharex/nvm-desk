<script setup lang="ts">
import { ref, type Ref } from 'vue'

import ToolTip from '../ToolTip.vue'

defineProps<{
  tab: string
}>()

const emit = defineEmits<{
  'update:tab': [value: string],
  'is-config-show': [value: boolean],
  'input-search': [value: string]
}>()

const menuTab: Ref<string> = ref('installed')
const searchText: Ref<string> = ref('')

function onChangeTab() {
  emit('update:tab', menuTab.value)
}

function onWinClose() {
}

function onWinMinimize() {
}
</script>

<template>
  <q-header
    bordered
    class="row bg-white text-black"
  >
    <q-toolbar
      class="top-tools col-4"
      style="-webkit-app-region: drag;z-index: 1"
    >
      <div class="window-btn">
        <q-btn
          round
          dense
          unelevated
          size="xs"
          icon="close"
          class="close-btn"
          @click="onWinClose"
        >
          <tool-tip text="Close" />
        </q-btn>

        <q-btn
          round
          dense
          unelevated
          size="xs"
          icon="remove"
          class="minimize-btn"
          @click="onWinMinimize"
        >
          <tool-tip text="Minimize" />
        </q-btn>
      </div>

      <q-tabs
        v-model="menuTab"
        dense
        inline-label
        active-color="brand"
        indicator-color="brand"
        @update:model-value="onChangeTab"
      >
        <q-tab
          name="installed"
          label="Installed"
        />
        <q-tab
          name="archive"
          label="Archive"
        />
      </q-tabs>
    </q-toolbar>

    <q-toolbar
      class="top-tools col-4 justify-center"
      style="-webkit-app-region: drag"
    >
      <div>
        <q-img src="@/assets/img/nvm-desk-logo.png" />
      </div>
    </q-toolbar>

    <q-toolbar
      class="top-tools col-4 justify-between"
      style="-webkit-app-region: drag"
    >
      <q-input
        v-model="searchText"
        rounded
        outlined
        dense
        color="brand"
        placeholder="Search..."
        @update:model-value="(val: any) => emit('input-search', val)"
      />

      <q-btn
        dense
        unelevated
        round
        icon="settings"
        size="sm"
        text-color="grey-10"
        @click="$emit('is-config-show', true)"
      >
        <tool-tip text="Settings" />
      </q-btn>
    </q-toolbar>
  </q-header>
</template>
