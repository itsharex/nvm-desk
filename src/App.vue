<script setup lang="ts">
import NodeList from "./components/NodeList.vue";
import {Command} from "@tauri-apps/api/shell";
import type {Ref} from "vue";
import {ref} from "vue";

const isLoading: Ref<boolean> = ref(false)

async function onInstallNVM() {
  const command = await new Command('nvm-install')

  await command.execute()
}
</script>

<template>
  <Teleport to="body">
    <div v-show="isLoading"
         class="loader"></div>
  </Teleport>

  <div class="container">
    <h1>NVM-DESK</h1>
    <pre>v0.0.1</pre>

    <div style="margin-bottom:10px">
      <div style="margin-bottom:10px">
        <button @click="onInstallNVM"
                style="background-color: #1dd5ff85">
          NVM 설치
        </button>
      </div>

      <div>
        <button>
        </button>
      </div>
    </div>

    <hr/>

    <NodeList v-model:loader="isLoading"/>

    <div>
      kdydesign
    </div>
  </div>
</template>

<style scoped>
.logo.vite:hover {
  filter: drop-shadow(0 0 2em #747bff);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #249b73);
}
</style>
