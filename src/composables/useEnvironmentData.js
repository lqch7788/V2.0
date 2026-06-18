/**
 * 环境数据 Composable（V2.0）
 * V1.1 1:1 接口对齐：useEnvironmentData.ts
 * 实现简化：本地生成环境监测数据
 */
import { ref, computed } from 'vue'

export function useEnvironmentData() {
  const todayWeather = ref({
    temperature: 22,
    humidity: 65,
    windSpeed: 3,
    precipitation: 0,
    condition: 'sunny',
    isSuitable: true,
    alertLevel: 'normal',
    forecast: '晴朗微风，适宜农事作业',
  })

  const unacknowledgedAlerts = ref([])
  const criticalAlerts = ref([])

  const envMetrics = ref({
    soilMoisture: 60,
    airTemperature: 22,
    humidity: 65,
    lightIntensity: 25000,
    co2: 400,
  })

  const devices = ref([
    { id: 'D001', name: '1号温室土壤传感器', status: 'online', value: 60, unit: '%' },
    { id: 'D002', name: '1号温室空气温湿度', status: 'online', value: 22, unit: '°C' },
    { id: 'D003', name: '2号温室光照', status: 'online', value: 25000, unit: 'Lux' },
  ])

  const getCurrentWeatherRecommendation = computed(() => {
    return todayWeather.value.isSuitable
      ? '当前天气适宜农事作业'
      : '当前天气不适宜户外作业'
  })

  const generateAlertTriggeredTasks = (alerts) => {
    return (alerts || []).map((a, i) => ({
      id: `alert-task-${i}`,
      type: 'inspection',
      priority: a.level === 'critical' ? 'urgent' : 'high',
      title: `告警处理：${a.message || a.type}`,
      description: a.message,
    }))
  }

  return {
    todayWeather,
    unacknowledgedAlerts,
    criticalAlerts,
    envMetrics,
    devices,
    getCurrentWeatherRecommendation,
    generateAlertTriggeredTasks,
  }
}
