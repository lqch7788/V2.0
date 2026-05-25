/**
 * Dashboard 页面状态和逻辑 Composable
 * 对应 V1.1 src/pages/Dashboard/hooks/useDashboard.ts
 */
import { ref, computed, onMounted } from 'vue'
import { useFarmTaskStore } from '@/stores'
import { useIotStore } from '@/stores/modules/iot'
import { useSummaryStore } from '@/stores'

export function useDashboard() {
  // ==================== Pinia Store 数据 ====================
  const summaryStore = useSummaryStore()
  const farmTaskStore = useFarmTaskStore()
  const iotStore = useIotStore()

  // 组件挂载时获取数据
  onMounted(() => {
    summaryStore.fetchOverview()
    summaryStore.fetchBatchStats({ limit: '100' })
    summaryStore.fetchAlerts()
    if (farmTaskStore.tasks.length === 0) farmTaskStore.fetchTasks()
    if (iotStore.devices.length === 0) iotStore.fetchDevices()
  })

  // ==================== 状态定义 ====================
  const activeTab = ref('overview')
  const greenhousePage = ref(1)
  const greenhousePageSize = ref(10)
  const selectedRegion = ref('')
  const isDetailModalOpen = ref(false)
  const selectedGreenhouse = ref(null)
  const greenhouseTableExpanded = ref(true)
  const overviewExpanded = ref(true)
  const fieldTableExpanded = ref(true)
  const selectedDetail = ref(null)
  const enlargedImageIndex = ref(null)

  // 月度产量统计筛选
  const yieldRegion = ref('')
  const yieldCrop = ref('')

  // 成本构成分析筛选
  const costPeriod = ref('month')
  const costCrop = ref('')
  const costAreaType = ref('')

  // ==================== useMemo 计算 ====================
  // 状态 → 生长阶段映射
  const statusToStage = {
    planning: { stage: 'seedling', stageName: '播种期' },
    planted: { stage: 'vegetative', stageName: '生长期' },
    in_progress: { stage: 'fruiting', stageName: '结果期' },
    completed: { stage: 'harvest', stageName: '采收期' },
    default: { stage: 'seedling', stageName: '播种期' },
  }

  // 将批次数据映射为ActiveBatchesTable需要的格式
  const mappedBatches = computed(() =>
    (summaryStore.batchItems || []).map((item) => {
      const stageInfo = statusToStage[item.status] || statusToStage.default
      return {
        id: String(item.id),
        batchCode: item.batchCode,
        cropName: item.cropName,
        greenhouseName: item.greenhouse || '',
        stage: stageInfo.stage,
        stageName: stageInfo.stageName,
      }
    })
  )

  // 今日任务（未完成的）
  const todayTasks = computed(() =>
    (farmTaskStore.tasks || []).filter(t => t.status !== 'completed')
  )

  // 关键传感器（非正常状态的）
  const criticalSensors = computed(() =>
    (iotStore.devices || []).filter(s => s.status !== 'normal')
  )

  // 按区域筛选传感器
  const filteredSensors = computed(() =>
    selectedRegion.value
      ? (iotStore.devices || []).filter(s => s.greenhouseId === selectedRegion.value)
      : (iotStore.devices || [])
  )

  // 温室下拉列表
  const greenhouseList = computed(() => {
    const ids = [...new Set((iotStore.devices || []).map(s => s.greenhouseId))]
    return ids.map(ghId => {
      const sensor = (iotStore.devices || []).find(s => s.greenhouseId === ghId)
      return { id: ghId, name: sensor?.greenhouseName || '' }
    })
  })

  // 温室环境数据分组
  const greenhouseEnvData = computed(() => {
    const ghIds = [...new Set(filteredSensors.value.map(s => s.greenhouseId))]
    return ghIds.map(ghId => {
      const sensors = filteredSensors.value.filter(s => s.greenhouseId === ghId)
      const airTemp = sensors.find(s => s.type === 'air_temp')
      const airHumidity = sensors.find(s => s.type === 'air_humidity')
      const light = sensors.find(s => s.type === 'light')
      const co2 = sensors.find(s => s.type === 'co2')
      const soilTemp = sensors.find(s => s.type === 'soil_temp')
      const soilMoisture = sensors.find(s => s.type === 'soil_moisture')
      const soilEc = sensors.find(s => s.type === 'soil_ec')
      const soilPh = sensors.find(s => s.type === 'soil_ph')

      return {
        id: ghId,
        name: sensors[0]?.greenhouseName || '',
        lastUpdate: sensors[0]?.lastUpdate || '',
        airTemp: airTemp ? { value: airTemp.value, unit: airTemp.unit, status: airTemp.status } : null,
        airHumidity: airHumidity ? { value: airHumidity.value, unit: airHumidity.unit, status: airHumidity.status } : null,
        light: light ? { value: light.value, unit: light.unit, status: light.status } : null,
        co2: co2 ? { value: co2.value, unit: co2.unit, status: co2.status } : null,
        soilTemp: soilTemp ? { value: soilTemp.value, unit: soilTemp.unit, status: soilTemp.status } : null,
        soilMoisture: soilMoisture ? { value: soilMoisture.value, unit: soilMoisture.unit, status: soilMoisture.status } : null,
        soilEc: soilEc ? { value: soilEc.value, unit: soilEc.unit, status: soilEc.status } : null,
        soilPh: soilPh ? { value: soilPh.value, unit: soilPh.unit, status: soilPh.status } : null,
      }
    })
  })

  // 分页数据
  const totalGreenhousePages = computed(() =>
    Math.ceil(greenhouseEnvData.value.length / greenhousePageSize.value)
  )

  const paginatedGreenhouseData = computed(() => {
    const start = (greenhousePage.value - 1) * greenhousePageSize.value
    return greenhouseEnvData.value.slice(start, start + greenhousePageSize.value)
  })

  // ==================== 处理函数 ====================
  const handleDetailClick = (greenhouseId) => {
    selectedGreenhouse.value = greenhouseId
    isDetailModalOpen.value = true
  }

  // 获取传感器数据
  const getDetailSensorData = (greenhouseId) => {
    return (iotStore.devices || []).filter(s => s.greenhouseId === greenhouseId)
  }

  // 获取作物信息
  const getCropInfo = (greenhouseId) => {
    const sensor = (iotStore.devices || []).find(s => s.greenhouseId === greenhouseId)
    const greenhouseName = sensor?.greenhouseName || ''
    const allBatches = summaryStore.batchItems || []
    return allBatches.find(b => b.greenhouse === greenhouseName && b.status === 'in_progress')
  }

  // 处理详情点击（温室/大田表格）
  const handleDetailClickWrapper = (detail) => {
    selectedDetail.value = detail
  }

  return {
    // 状态
    activeTab,
    greenhousePage,
    greenhousePageSize,
    selectedRegion,
    isDetailModalOpen,
    selectedGreenhouse,
    greenhouseTableExpanded,
    overviewExpanded,
    fieldTableExpanded,
    selectedDetail,
    enlargedImageIndex,
    yieldRegion,
    yieldCrop,
    costPeriod,
    costCrop,
    costAreaType,

    // 计算数据
    todayTasks,
    criticalSensors,
    filteredSensors,
    greenhouseList,
    greenhouseEnvData,
    totalGreenhousePages,
    paginatedGreenhouseData,
    mappedBatches,

    // 函数
    handleDetailClick,
    getDetailSensorData,
    getCropInfo,
    handleDetailClickWrapper,
  }
}
