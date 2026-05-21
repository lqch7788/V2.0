import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGreenhouseStore = defineStore('greenhouse', () => {
  // 状态
  const greenhouses = ref([])

  // 加载温室列表
  const loadGreenhouses = async () => {
    try {
      const storedGreenhouses = localStorage.getItem('greenhouses')
      if (storedGreenhouses) {
        greenhouses.value = JSON.parse(storedGreenhouses)
      } else {
        // 默认数据
        greenhouses.value = [
          { id: 'GH001', name: '1号温室', status: 'active', area: '1000', type: '薄膜温室' },
          { id: 'GH002', name: '2号温室', status: 'active', area: '1000', type: '薄膜温室' },
          { id: 'GH003', name: '3号温室', status: 'active', area: '1500', type: '玻璃温室' },
          { id: 'GH004', name: '4号温室', status: 'inactive', area: '800', type: '薄膜温室' },
          { id: 'GH005', name: '5号温室', status: 'active', area: '1200', type: '玻璃温室' }
        ]
        saveGreenhouses()
      }
    } catch (error) {
      console.error('加载温室数据失败:', error)
      greenhouses.value = []
    }
  }

  // 保存到 localStorage
  const saveGreenhouses = () => {
    localStorage.setItem('greenhouses', JSON.stringify(greenhouses.value))
  }

  return {
    greenhouses,
    loadGreenhouses
  }
})
