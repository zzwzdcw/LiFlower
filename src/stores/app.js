import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const theme = ref('light')
  const language = ref('zh-CN')

  function setTheme(newTheme) {
    theme.value = newTheme
  }

  function setLanguage(newLanguage) {
    language.value = newLanguage
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    theme,
    language,
    setTheme,
    setLanguage,
    toggleTheme
  }
})
