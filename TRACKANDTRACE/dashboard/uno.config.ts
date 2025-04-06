import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetIcons()],
  theme: {
    fontFamily: {
      sans: ['Roboto', 'sans-serif'],
    },
    colors: {
      primary: '#EE3B52',
      font: '#030303',
    },
  },
})
