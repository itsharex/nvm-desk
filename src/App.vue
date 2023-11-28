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
    <div class="row content-row pad15">
      <div>
        <span class="title">NVM</span>
        <span class="space"></span>
        <span class="sub-title">desk</span>
      </div>

      <span class="sub-title">v0.0.1</span>
    </div>

    <hr/>

    <div class="row content-row pad15">
      <span class="sub-title">Current Version</span>
      <span class="sub-title current-version">v18.0.0</span>
    </div>

    <hr/>

<!--    <div style="margin-bottom:10px">-->
<!--      <div style="margin-bottom:10px">-->
<!--        <button @click="onInstallNVM"-->
<!--                style="background-color: #1dd5ff85">-->
<!--          NVM 설치-->
<!--        </button>-->
<!--      </div>-->
<!--    </div>-->

    <div class="row">
      <NodeList v-model:loader="isLoading"/>
    </div>

    <div class="main-footer">
      <div>
        MIT License
      </div>
      <div>
        Copyright © 2023 Dev.DY
      </div>
    </div>
  </div>
</template>
