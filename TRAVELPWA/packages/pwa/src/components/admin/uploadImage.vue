<template>
  <div>
    <h1 class="container">Image Upload Vue.js</h1>
    <div>
      <div class="file-container">
        <div>
          <form>
            <input
              type="file"
              id="media"
              accept="image/*"
              multiple
              @change="event => handleFileUpload(event)"
            />
            <div>
              <section>
                ☁️

                <p>Upload Your answer here.</p>
                <p>Minimum file size 50MB</p>
              </section>
            </div>
          </form>
        </div>
      </div>
      <div>
        <div class="images">
          <div
            v-for="(src, index) in imageSrc"
            :key="index"
            class="images-lists"
          >
            <div class="image-container">
              <img :src="src" id="output" class="image-style" />
            </div>
            <div class="cross-icon" v-if="imageSrc">
              <button @click="() => removeItem(index)">❌</button>
            </div>

            <p style="width: 150px" class="line-clamp-1 text-center">
              {{ selectedFiles[index].name }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Form {
  media: File | null
}

const form = ref<Form>({
  media: null,
})

const imageSrc = ref<string[]>([])

const selectedFiles = ref<File[]>([])

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files || (e as DragEvent).dataTransfer?.files
  if (!files || !files.length) return

  for (let i = 0; i < files.length; i++) {
    selectedFiles.value.push(files[i])
    const src = URL.createObjectURL(files[i])
    imageSrc.value.push(src)
  }
  console.log(selectedFiles.value, 'selected files')

  form.value.media = files[0]
  console.log(form.value.media, 'file upload')

  console.log('files already uploaded', imageSrc.value)
}

const removeItem = (index: number) => {
  imageSrc.value.splice(index, 1)
}
</script>
