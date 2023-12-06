<script setup lang="ts">
import { ref, toRefs, watch, type Ref } from 'vue'

const props = defineProps<{
  isShow: boolean
}>()

defineEmits<{
  'update:is-show': [value: boolean]
}>()

const {isShow} = toRefs(props)
const isOpen: Ref<boolean> = ref(false)

watch(isShow, (v) => {
  isOpen.value = v
})
</script>

<template>
  <q-drawer
    v-model="isOpen"
    side="right"
    overlay
    no-swipe-open
    no-swipe-close
    no-swipe-backdrop
    elevated
    @update:model-value="$emit('update:is-show', isOpen)"
  >
    <div class="row">
      <div class="col">
        BI
      </div>

      <div>
        <q-btn>X</q-btn>
      </div>
    </div>

    <div class="row">
      <div class="col">
        BI
      </div>

      <div>
        <q-btn>X</q-btn>
      </div>
    </div>
  </q-drawer>
</template>
