<template>
  <li>
    <RouterLink
      :to="to"
      :class="[
        'flex gap-4 mb-2 hover:bg-white transition-all duration-200 border-rd-md p-3 hover:drop-shadow-md hover:font-bold  relative ',
        collapsed ? '' : 'flex-row items-start ',
        isActive ? 'bg-white drop-shadow-md font-bold' : '',
      ]"
    >
      <component
        :is="icon"
        :class="[
          'icon transition-all absolute ease-in ',
          collapsed ? 'absolute left-1/2 transform -translate-x-1/2' : 'left-3',
        ]"
      />
      <span
        :class="[
          'overflow-hidden transition-all transition-duration-200 p-l-10',
          collapsed ? 'max-w-0 opacity-0' : 'max-w-[100%] opacity-100',
        ]"
        >{{ text }}</span
      >
    </RouterLink>
  </li>
</template>
<script setup lang="ts">
import { computed, defineProps } from 'vue'
import { useRoute } from 'vue-router'

// Define the props for the component
const props = defineProps<{
  to: string
  text: string
  icon: any
  active?: boolean
  collapsed: boolean
}>()

const route = useRoute()
const isActive = computed(() => route.path === props.to)
</script>
