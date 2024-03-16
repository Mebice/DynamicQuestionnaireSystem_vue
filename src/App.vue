<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Header from './components/Header.vue'

</script>

<template>
  <div class="headershow">
    <Header />

  </div>

  <div class="contentshow">

    <!-- <router-view v-slot="{ Component }">
    <keep-alive include="ForestageAnswer">
      <component :is="Component" />
    </keep-alive>
</router-view>  -->

    <RouterView />

  </div>
</template>

<style lang="scss" scoped>
.headershow {
  width: 100vw;
  height: 10vh;
}
</style>
