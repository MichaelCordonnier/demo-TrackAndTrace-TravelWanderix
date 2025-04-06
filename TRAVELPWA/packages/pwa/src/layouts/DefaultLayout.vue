<template>
  <div>
    <AppHeader />
    <RouterView></RouterView>
    <AppFooter />
    <ChatBubble />
  </div>
</template>

<script setup lang="ts">
import AppFooter from '@/components/generic/AppFooter.vue'
import AppHeader from '@/components/generic/AppHeader.vue'
import ChatBubble from '@/components/reusable/chatBubble.vue'
import { onMounted } from 'vue'

onMounted(() => {
  //('DefaultLayout component has been mounted or reloaded')
})
</script>
