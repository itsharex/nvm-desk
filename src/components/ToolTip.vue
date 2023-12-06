<script setup lang="ts">
const props = defineProps<{
  text: string
}>()
</script>

<template>
  <q-tooltip
    transition-show="scale"
    transition-hide="scale"
    class="bg-red-5"
  >
    {{ props.text }}
  </q-tooltip>
</template>
