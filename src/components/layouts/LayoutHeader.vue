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
</script>

<template>
  <q-header
    bordered
    class="row bg-white text-black"
  >
    <q-toolbar class="top-tools col top-tools">
      <div class="window-btn">
        <q-btn
          round
          dense
          unelevated
          size="xs"
          icon="close"
          class="close-btn"
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
        >
          <tool-tip text="Minimize" />
        </q-btn>
      </div>

      <q-tabs
        v-model="menuTab"
        dense
        inline-label
        active-color="red"
        indicator-color="red"
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

    <q-toolbar class="top-tools col justify-center">
      <div>
        <q-img src="src/assets/img/icon.png" />
      </div>
    </q-toolbar>

    <q-toolbar class="top-tools col justify-between">
      <q-input
        v-model="searchText"
        rounded
        outlined
        dense
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
