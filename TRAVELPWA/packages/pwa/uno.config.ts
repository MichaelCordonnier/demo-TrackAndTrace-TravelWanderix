import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetIcons()],
  theme: {
    colors: {
      text: '#0D0C22',
      textSoft: '#4B4B4B',
      primary: '#FFA102',
      secondary: '#F8C910',
      negative: '#EF4D4D',
      positive: '#4DAA57',
    },
    fontFamily: {
      futura: ['futura-pt', 'sans-serif'],
      'futura-bold': ['futura-pt-bold', 'sans-serif'],
      inter: ['inter', 'sans-serif'],
    },
    shortcuts: [
      {
        'font-inter-normal':
          "font-[font-variation-settings:'slnt'_0,'wght'_400]",
        'font-inter-bold': "font-[font-variation-settings:'slnt'_0,'wght'_700]",
        'font-inter-italic':
          "font-[font-variation-settings:'slnt'_12,'wght'_400]",
      },
    ],
  },
})
