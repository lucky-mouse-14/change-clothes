<script setup></script>

<template>
  <router-view v-slot="{ Component, route: curRoute }">
    <component :is="Component" :key="curRoute.fullPath" />
  </router-view>
</template>