<template>
  <div class="md:h-[calc(100vh-130px)] p-4 border-rd-3xl">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-full md:grid-rows-2">
      <RouterLink
        v-for="(tile, index) in tiles"
        :key="index"
        :to="tile.link"
        class="bg-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden group border-rd-md h-300px md:h-inherit"
      >
        <!-- Parallax Layer -->
        <img
          :src="tile.image"
          :alt="tile.title"
          class="absolute inset-0 rounded-lg h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110 group-hover:translate-y-[-5%]"
        />

        <span
          class="absolute top-0 left-0 w-full h-full bg-gradient-to-bl from-transparent to-black opacity-05"
        ></span>
        <div
          class="absolute bottom-0 left-0 w-full py-4 px-6 text-5xl border-rd-md text-white flex justify-between items-center font-bold text-shadow-color-black"
        >
          <h1>{{ tile.title }}</h1>
          <ChevronRight class="h-10 w-10" />
        </div>
        <component
          :is="tile.icon"
          class="absolute top-2 right-2 p-2 bg-white bg-opacity-50 rounded-md backdrop-blur-2xl text-white h-20 w-20 transition-transform duration-500 ease-in-out"
        />
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronRight,
  RollerCoaster,
  Map,
  Users,
  MessageCircle,
} from 'lucide-vue-next'

// Example data for the tiles
const tiles = [
  {
    title: 'Trips',
    link: '/admin/trips',
    image:
      'https://images.unsplash.com/photo-1521336575822-6da63fb45455?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    icon: RollerCoaster,
  },
  {
    title: 'Activities',
    link: '/admin/activities',
    image:
      'https://images.unsplash.com/photo-1534777367038-9404f45b869a?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    icon: Map,
  },

  {
    title: 'Users',
    link: '/admin/clients',
    image:
      'https://images.unsplash.com/photo-1494583882007-bfd2321fb8e2?q=80&w=3504&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    icon: Users,
  },
  {
    title: 'Chat',
    link: '/admin/activities',
    image:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    icon: MessageCircle,
  },
]
</script>
