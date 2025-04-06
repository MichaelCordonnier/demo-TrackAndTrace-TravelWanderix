<template>
  <footer class="mx-32 mb-4 flex flex-col items-center">
    <p class="text-xs">
      {{ t('created.by') }}
      <a
        class="underline focus:outline-none focus-visible:ring-4 ring-amber-400 rounded-md"
        href="https://mct.be/"
        target="_blank"
        >MC & SP</a
      >
      -
      <!-- {{ new Date().getFullYear() }} -->
      {{ year }}
    </p>
    <p class="text-xs text-neutral-400 mt-1">v{{ version }}</p>
  </footer>
</template>

<script setup lang="ts">
import { version } from '../../../package.json'
const year = new Date().getFullYear()
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<!-- <script lang="ts">
//long way  
import { version } from '../../../package.json'
export default {
    setup() {
        return { version }
    }
}

</script> -->
