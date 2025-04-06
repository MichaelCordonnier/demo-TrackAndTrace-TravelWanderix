<template>
  <NavBarAdminV2>
    <RouterView></RouterView>
  </NavBarAdminV2>
</template>

<script setup lang="ts">
import NavBarAdminV2 from '@/components/admin/NavBarAdminV2.vue'

import { onMounted } from 'vue'

onMounted(() => {
  //('AdminLayout component has been mounted or reloaded')
})
</script>
