<template>
  <!-- 物料筛选器组件 - 对应V1.1 MaterialFilters.tsx -->
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      <!-- 物料编号 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">物料编号</label>
        <input
          v-model="localFilters.code"
          type="text"
          placeholder="搜索编号"
          class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm"
          @input="handleInputChange('code', localFilters.code)"
        />
      </div>

      <!-- 物料名称 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">物料名称</label>
        <input
          v-model="localFilters.name"
          type="text"
          placeholder="搜索名称"
          class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm"
          @input="handleInputChange('name', localFilters.name)"
        />
      </div>

      <!-- 供应商 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
        <input
          v-model="localFilters.supplier"
          type="text"
          placeholder="搜索供应商"
          class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm"
          @input="handleInputChange('supplier', localFilters.supplier)"
        />
      </div>

      <!-- 存放位置 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">存放位置</label>
        <input
          v-model="localFilters.location"
          type="text"
          placeholder="搜索位置"
          class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm"
          @input="handleInputChange('location', localFilters.location)"
        />
      </div>

      <!-- 大类 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">大类</label>
        <select
          v-model="localFilters.searchBigCategory"
          class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"
          @change="handleChange('searchBigCategory', localFilters.searchBigCategory)"
        >
          <option value="">全部</option>
          <option
            v-for="cat in getSearchBigCategories()"
            :key="cat.code"
            :value="cat.code"
          >{{ cat.code }} - {{ cat.name }}</option>
        </select>
      </div>

      <!-- 中类 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">中类</label>
        <select
          v-model="localFilters.searchMidCategory"
          class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"
          :disabled="!localFilters.searchBigCategory"
          @change="handleChange('searchMidCategory', localFilters.searchMidCategory)"
        >
          <option value="">全部</option>
          <option
            v-for="cat in getSearchMidCategories()"
            :key="cat.code"
            :value="cat.code"
          >{{ cat.code }} - {{ cat.name }}</option>
        </select>
      </div>

      <!-- 小类 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">小类</label>
        <select
          v-model="localFilters.searchSubCategory"
          class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"
          :disabled="!localFilters.searchMidCategory"
          @change="handleChange('searchSubCategory', localFilters.searchSubCategory)"
        >
          <option value="">全部</option>
          <option
            v-for="cat in getSearchSubCategories()"
            :key="cat.code"
            :value="cat.code"
          >{{ cat.code }} - {{ cat.name }}</option>
        </select>
      </div>

      <!-- 重置按钮 -->
      <div class="flex items-end gap-2">
        <button class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1 bg-amber-500 text-white hover:bg-amber-600" @click="handleReset">
          <RotateCcw class="w-3.5 h-3.5" />重置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { RotateCcw } from 'lucide-vue-next'

/**
 * 物料筛选器组件
 * 提供编号、名称、供应商、位置、分类层级的筛选功能
 */

// 物料分类配置树形结构
const bigCategories = [
  { code: 'SP', name: '生产投入类' },
  { code: 'EQ', name: '设施与装备类' },
  { code: 'OP', name: '作业支持类' },
  { code: 'PH', name: '采后处理与流通类' },
  { code: 'IT', name: '数字化与管理类' },
  { code: 'EC', name: '能源与通用耗材' },
  { code: 'OT', name: '其他类' },
]

// 完整的分类配置（本地默认值，可通过prop覆盖）
const localCategoryConfig = {
  'SP': {
    name: '生产投入类',
    categories: {
      '01': {
        name: '种质资源',
        subCategories: {
          '01': { name: '粮食作物种子', prefix: 'SP0101' },
          '02': { name: '经济作物种子', prefix: 'SP0102' },
          '03': { name: '蔬菜种子', prefix: 'SP0103' },
          '04': { name: '蔬菜种苗', prefix: 'SP0104' },
          '05': { name: '水果苗木种苗', prefix: 'SP0105' },
          '06': { name: '水果苗木种子', prefix: 'SP0106' },
          '07': { name: '花卉与观赏植物', prefix: 'SP0107' },
          '08': { name: '食用菌菌种', prefix: 'SP0108' },
          '99': { name: '其他种质资源', prefix: 'SP0199' },
        }
      },
      '02': {
        name: '肥料与土壤改良剂',
        subCategories: {
          '01': { name: '有机肥', prefix: 'SP0201' },
          '02': { name: '化学肥料', prefix: 'SP0202' },
          '03': { name: '水溶肥', prefix: 'SP0203' },
          '04': { name: '叶面肥', prefix: 'SP0204' },
          '05': { name: '微生物菌剂', prefix: 'SP0205' },
          '06': { name: '土壤调理剂', prefix: 'SP0206' },
          '07': { name: '育苗基质', prefix: 'SP0207' },
          '99': { name: '其他类型', prefix: 'SP0299' },
        }
      },
      '03': {
        name: '农药与植保产品',
        subCategories: {
          '01': { name: '杀虫剂', prefix: 'SP0301' },
          '02': { name: '杀菌剂', prefix: 'SP0302' },
          '03': { name: '杀螨剂', prefix: 'SP0303' },
          '04': { name: '除草剂', prefix: 'SP0304' },
          '05': { name: '植物生长调节剂', prefix: 'SP0305' },
          '06': { name: '物理防控用品', prefix: 'SP0306' },
          '07': { name: '生物农药', prefix: 'SP0307' },
          '99': { name: '其他类型', prefix: 'SP0399' },
        }
      },
    }
  },
  'EQ': {
    name: '设施与装备类',
    categories: {
      '01': {
        name: '农业机械',
        subCategories: {
          '01': { name: '耕作机械', prefix: 'EQ0101' },
          '02': { name: '播种/移栽设备', prefix: 'EQ0102' },
          '03': { name: '植保机械', prefix: 'EQ0103' },
          '04': { name: '收获机械', prefix: 'EQ0104' },
          '05': { name: '初加工设备', prefix: 'EQ0105' },
          '99': { name: '其他相关机械', prefix: 'EQ0199' },
        }
      },
      '02': {
        name: '设施农业系统',
        subCategories: {
          '01': { name: '骨架结构材料', prefix: 'EQ0201' },
          '02': { name: '覆盖材料', prefix: 'EQ0202' },
          '03': { name: '通风降温设备', prefix: 'EQ0203' },
          '04': { name: '加温设备', prefix: 'EQ0204' },
          '05': { name: '补光系统', prefix: 'EQ0205' },
          '06': { name: '自动化控制设备', prefix: 'EQ0206' },
          '99': { name: '其他相关设施设备', prefix: 'EQ0299' },
        }
      },
      '03': {
        name: '灌溉与水肥系统',
        subCategories: {
          '01': { name: '水源与泵站', prefix: 'EQ0301' },
          '02': { name: '水肥一体机', prefix: 'EQ0302' },
          '03': { name: '输水管网', prefix: 'EQ0303' },
          '04': { name: '过滤系统', prefix: 'EQ0304' },
          '05': { name: '施肥装置', prefix: 'EQ0305' },
          '06': { name: '灌溉终端', prefix: 'EQ0306' },
          '99': { name: '其他相关灌溉系统设备', prefix: 'EQ0399' },
        }
      },
    }
  },
  'OP': {
    name: '作业支持类',
    categories: {
      '01': {
        name: '劳保与防护用品',
        subCategories: {
          '01': { name: '手部防护', prefix: 'OP0101' },
          '02': { name: '足部防护', prefix: 'OP0202' },
          '03': { name: '身体防护', prefix: 'OP0303' },
          '04': { name: '呼吸/眼部防护', prefix: 'OP0404' },
          '05': { name: '防晒防暑用品', prefix: 'OP0505' },
          '99': { name: '其他劳保防护类', prefix: 'OP0999' },
        }
      },
      '02': {
        name: '日常劳动工具',
        subCategories: {
          '01': { name: '手动农具', prefix: 'OP0201' },
          '02': { name: '修剪工具', prefix: 'OP0202' },
          '03': { name: '小型电动工具', prefix: 'OP0203' },
          '04': { name: '清洁工具', prefix: 'OP0204' },
          '05': { name: '小型运输车', prefix: 'OP0205' },
          '99': { name: '其他劳动工具', prefix: 'OP0299' },
        }
      },
      '03': {
        name: '标识与记录用品',
        subCategories: {
          '01': { name: '田间标牌/标签', prefix: 'OP0301' },
          '02': { name: '记录本、记号笔', prefix: 'OP0302' },
          '03': { name: '二维码/RFID标签', prefix: 'OP0303' },
          '99': { name: '其他标识记录用品', prefix: 'OP0399' },
        }
      },
    }
  },
  'PH': {
    name: '采后处理与流通类',
    categories: {
      '01': {
        name: '采收容器',
        subCategories: {
          '01': { name: '塑料周转箱', prefix: 'PH0101' },
          '02': { name: '采摘篮/筐', prefix: 'PH0102' },
          '03': { name: '吨袋/编织袋', prefix: 'PH0103' },
          '04': { name: '包装材料', prefix: 'PH0104' },
          '05': { name: '纸箱', prefix: 'PH0105' },
          '06': { name: '泡沫网套/隔板', prefix: 'PH0106' },
          '07': { name: '胶带、封口耗材', prefix: 'PH0107' },
          '08': { name: '商品标签/追溯标签', prefix: 'PH0108' },
          '99': { name: '其他采收材料', prefix: 'PH0199' },
        }
      },
      '02': {
        name: '冷链与仓储设备',
        subCategories: {
          '01': { name: '预冷库/冷藏库', prefix: 'PH0201' },
          '02': { name: '冷藏运输设备', prefix: 'PH0202' },
          '03': { name: '保温箱、冰袋', prefix: 'PH0203' },
          '99': { name: '其他', prefix: 'PH0299' },
        }
      },
    }
  },
  'IT': {
    name: '数字化与管理类',
    categories: {
      '01': {
        name: '监测设备',
        subCategories: {
          '01': { name: '空气/土壤/光照等传感器', prefix: 'IT0101' },
          '02': { name: '手持检测类设备', prefix: 'IT0102' },
          '03': { name: '气象站', prefix: 'IT0103' },
          '04': { name: '虫情测报灯', prefix: 'IT0104' },
          '05': { name: '视频监控设备', prefix: 'IT0105' },
          '99': { name: '其他检测相关设备', prefix: 'IT0199' },
        }
      },
      '02': {
        name: '控制设备',
        subCategories: {
          '01': { name: '环境参数感知设备', prefix: 'IT0201' },
          '02': { name: '执行控制设备', prefix: 'IT0202' },
          '03': { name: '人机交互与本地操作设备', prefix: 'IT0203' },
          '04': { name: '通信与联网设备', prefix: 'IT0204' },
          '05': { name: '电源与辅助控制设备', prefix: 'IT0205' },
          '99': { name: '其他相关控制设备', prefix: 'IT0299' },
        }
      },
      '03': {
        name: '软件与服务',
        subCategories: {
          '01': { name: 'ERP模块许可', prefix: 'IT0301' },
          '02': { name: '温室大棚控制系统web', prefix: 'IT0302' },
          '03': { name: '温室大棚控制系统小程序', prefix: 'IT0303' },
          '04': { name: '数据分析服务', prefix: 'IT0304' },
          '05': { name: '产品检测服务', prefix: 'IT0305' },
          '99': { name: '其他软件与服务', prefix: 'IT0399' },
        }
      },
    }
  },
  'EC': {
    name: '能源与通用耗材',
    categories: {
      '01': {
        name: '能源类',
        subCategories: {
          '01': { name: '柴油/汽油', prefix: 'EC0101' },
          '02': { name: '电力', prefix: 'EC0102' },
          '03': { name: '太阳能板及配件', prefix: 'EC0103' },
          '99': { name: '其他能源类', prefix: 'EC0199' },
        }
      },
      '02': {
        name: '通用耗材',
        subCategories: {
          '01': { name: '电线、电缆', prefix: 'EC0201' },
          '02': { name: '扎带、螺丝、密封胶', prefix: 'EC0202' },
          '03': { name: '电池', prefix: 'EC0203' },
          '04': { name: '润滑油、润滑脂', prefix: 'EC0204' },
          '99': { name: '其他耗材', prefix: 'EC0299' },
        }
      },
    }
  },
  'OT': {
    name: '其他类',
    categories: {
      '01': {
        name: '未分类资材',
        subCategories: {
          '01': { name: '其他未分类资材', prefix: 'OT0101' },
        }
      },
    }
  },
}

const props = defineProps({
  // 筛选状态
  filters: {
    type: Object,
    required: true
  },
  // 低库存数量
  lowStockCount: {
    type: Number,
    default: 0
  },
  // 分类配置 - 对应V1.1 categoryConfig prop
  categoryConfig: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits([
  'update:filters',
  'filtersChange',
  'lowStockClick'
])

// 本地筛选状态副本
const localFilters = reactive({
  code: props.filters.code || '',
  name: props.filters.name || '',
  category: props.filters.category || '全部',
  supplier: props.filters.supplier || '',
  location: props.filters.location || '',
  searchBigCategory: props.filters.searchBigCategory || '',
  searchMidCategory: props.filters.searchMidCategory || '',
  searchSubCategory: props.filters.searchSubCategory || '',
  showLowStock: props.filters.showLowStock || false
})

// 监听 props.filters 变化
watch(() => props.filters, (newVal) => {
  Object.assign(localFilters, newVal)
}, { deep: true })

// 获取大类列表
const getSearchBigCategories = () => {
  const config = props.categoryConfig && Object.keys(props.categoryConfig).length > 0 ? props.categoryConfig : localCategoryConfig
  return Object.keys(config).map(key => ({
    code: key,
    name: config[key].name
  }))
}

// 获取中类列表
const getSearchMidCategories = () => {
  if (!localFilters.searchBigCategory) return []
  const config = props.categoryConfig && Object.keys(props.categoryConfig).length > 0 ? props.categoryConfig : localCategoryConfig
  const bigCat = config[localFilters.searchBigCategory]
  if (!bigCat) return []
  return Object.entries(bigCat.categories).map(([code, data]) => ({
    code,
    name: data.name
  }))
}

// 获取小类列表
const getSearchSubCategories = () => {
  if (!localFilters.searchBigCategory || !localFilters.searchMidCategory) return []
  const config = props.categoryConfig && Object.keys(props.categoryConfig).length > 0 ? props.categoryConfig : localCategoryConfig
  const bigCat = config[localFilters.searchBigCategory]
  if (!bigCat) return []
  const midCat = bigCat.categories[localFilters.searchMidCategory]
  if (!midCat) return []
  return Object.entries(midCat.subCategories).map(([code, data]) => ({
    code,
    name: data.name
  }))
}

// 输入变化处理（带防抖）
let inputTimeout = null
const handleInputChange = (field, value) => {
  if (inputTimeout) clearTimeout(inputTimeout)
  inputTimeout = setTimeout(() => {
    handleChange(field, value)
  }, 300)
}

// 字段变化处理
const handleChange = (field, value) => {
  if (field === 'searchBigCategory') {
    localFilters.searchMidCategory = ''
    localFilters.searchSubCategory = ''
  } else if (field === 'searchMidCategory') {
    localFilters.searchSubCategory = ''
  }
  emit('filtersChange', { ...localFilters })
}

// 重置筛选
const handleReset = () => {
  localFilters.code = ''
  localFilters.name = ''
  localFilters.category = '全部'
  localFilters.supplier = ''
  localFilters.location = ''
  localFilters.searchBigCategory = ''
  localFilters.searchMidCategory = ''
  localFilters.searchSubCategory = ''
  localFilters.showLowStock = false
  emit('filtersChange', { ...localFilters })
}
</script>
