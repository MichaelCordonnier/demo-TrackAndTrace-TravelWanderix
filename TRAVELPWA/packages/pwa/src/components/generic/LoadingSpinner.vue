<template>
  <div class="spinner"></div>
  <div class="spinner2"></div>
</template>

<script setup lang="ts"></script>

<style scoped>
.spinner {
  width: 35px;
  height: 35px;
  border: 8px solid rgba(0, 0, 0, 0.1);
  position: absolute;
  animation: spin 2.5s ease-in-out infinite;
}

.spinner::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 50%;
  border: 8px solid transparent;
  border-top-color: #fdc611;
  border-top: 8px solid;
  border-image: linear-gradient(to right, #fdc611, #ff8533);
  border-image-slice: 1;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.spinner2 {
  width: 60px;
  height: 60px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  position: relative;
  animation: spin2 2.5s ease-in-out infinite;
}

.spinner2::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  border: 8px solid transparent;
  border-top-color: #fdc611;
  border-top: 8px solid;
  border-image: linear-gradient(to right, #fdc611, #ff8533);
  border-image-slice: 1;
}

@keyframes spin2 {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
