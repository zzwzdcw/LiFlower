import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const name = ref('用户')
  const avatar = ref('')
  const token = ref('')

  const isLoggedIn = computed(() => !!token.value)

  function setToken(newToken) {
    token.value = newToken
  }

  function setName(newName) {
    name.value = newName
  }

  function logout() {
    token.value = ''
    name.value = '用户'
  }

  return {
    name,
    avatar,
    token,
    isLoggedIn,
    setToken,
    setName,
    logout
  }
})
