<template>
  <div class="animate-card-in" style="animation-delay: 0.1s">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
          <el-icon :size="12" class="text-white">
            <LocationInformation />
          </el-icon>
        </div>
        <p class="text-base font-bold text-emerald-700">基地总览图</p>
      </div>
      <el-button text @click="$emit('toggle')">
        <el-icon :size="20" :class="['transition-transform duration-200', expanded ? 'rotate-90' : '']">
          <CaretRight />
        </el-icon>
      </el-button>
    </div>
    <div
      v-if="expanded"
      class="card-map relative w-full h-[26rem] cursor-pointer group"
      @click="$emit('map-click')"
    >
      <!-- 深色科技背景 -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#0f1a0f] to-[#1a2f1a]" />

      <!-- 平面科技风格基地总览图SVG -->
      <svg viewBox="0 0 400 280" class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3b82f6"/>
            <stop offset="100%" stop-color="#1d4ed8"/>
          </linearGradient>
          <linearGradient id="filmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#14b8a6"/>
            <stop offset="100%" stop-color="#0f766e"/>
          </linearGradient>
          <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#d97706"/>
          </linearGradient>
          <linearGradient id="fieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#22c55e"/>
            <stop offset="100%" stop-color="#16a34a"/>
          </linearGradient>
          <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#374151"/>
            <stop offset="50%" stop-color="#4b5563"/>
            <stop offset="100%" stop-color="#374151"/>
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <!-- 道路 -->
        <g>
          <rect x="190" y="10" width="20" height="260" fill="url(#roadGrad)" rx="3"/>
          <line x1="200" y1="15" x2="200" y2="255" stroke="#fbbf24" stroke-width="2" stroke-dasharray="10 6" opacity="0.7"/>
          <rect x="10" y="130" width="380" height="16" fill="url(#roadGrad)" rx="3"/>
          <line x1="15" y1="138" x2="385" y2="138" stroke="#fbbf24" stroke-width="2" stroke-dasharray="10 6" opacity="0.7"/>
          <rect x="10" y="220" width="380" height="12" fill="url(#roadGrad)" rx="3"/>
          <line x1="15" y1="226" x2="385" y2="226" stroke="#fbbf24" stroke-width="2" stroke-dasharray="10 6" opacity="0.7"/>
        </g>

        <!-- 玻璃温室A区 -->
        <g>
          <rect x="20" y="20" width="160" height="100" fill="url(#glassGrad)" rx="6" filter="url(#glow)"/>
          <line x1="20" y1="65" x2="180" y2="65" stroke="#93c5fd" stroke-width="1" opacity="0.4"/>
          <line x1="100" y1="20" x2="100" y2="120" stroke="#93c5fd" stroke-width="1" opacity="0.4"/>
          <rect x="20" y="20" width="160" height="25" fill="#ffffff" opacity="0.15" rx="6"/>
          <rect x="20" y="20" width="160" height="6" fill="#60a5fa" opacity="0.5" rx="6"/>
          <text x="100" y="112" fill="#ffffff" font-size="13" font-family="Arial" font-weight="bold" text-anchor="middle">玻璃温室A区</text>
          <text x="60" y="48" fill="#dbeafe" font-size="9" font-family="Arial" text-anchor="middle">1-4号棚</text>
          <text x="140" y="48" fill="#dbeafe" font-size="9" font-family="Arial" text-anchor="middle">5-8号棚</text>
          <text x="60" y="88" fill="#dbeafe" font-size="9" font-family="Arial" text-anchor="middle">9-12号棚</text>
          <text x="140" y="88" fill="#dbeafe" font-size="9" font-family="Arial" text-anchor="middle">13-16号棚</text>
        </g>

        <!-- 连栋温室B区 -->
        <g>
          <rect x="220" y="20" width="160" height="100" fill="url(#filmGrad)" rx="6" filter="url(#glow)"/>
          <line x1="220" y1="65" x2="380" y2="65" stroke="#5eead4" stroke-width="1" opacity="0.4"/>
          <line x1="300" y1="20" x2="300" y2="120" stroke="#5eead4" stroke-width="1" opacity="0.4"/>
          <rect x="220" y="20" width="160" height="25" fill="#ffffff" opacity="0.15" rx="6"/>
          <rect x="220" y="20" width="160" height="6" fill="#2dd4bf" opacity="0.5" rx="6"/>
          <text x="300" y="112" fill="#ffffff" font-size="13" font-family="Arial" font-weight="bold" text-anchor="middle">连栋温室B区</text>
          <text x="260" y="48" fill="#ccfbf1" font-size="9" font-family="Arial" text-anchor="middle">1-4号棚</text>
          <text x="340" y="48" fill="#ccfbf1" font-size="9" font-family="Arial" text-anchor="middle">5-8号棚</text>
          <text x="260" y="88" fill="#ccfbf1" font-size="9" font-family="Arial" text-anchor="middle">9-12号棚</text>
          <text x="340" y="88" fill="#ccfbf1" font-size="9" font-family="Arial" text-anchor="middle">13-16号棚</text>
        </g>

        <!-- 日光温室C区 -->
        <g>
          <rect x="220" y="150" width="160" height="60" fill="url(#sunGrad)" rx="6" filter="url(#glow)"/>
          <line x1="220" y1="180" x2="380" y2="180" stroke="#fde68a" stroke-width="1" opacity="0.4"/>
          <line x1="300" y1="150" x2="300" y2="210" stroke="#fde68a" stroke-width="1" opacity="0.4"/>
          <rect x="220" y="150" width="160" height="18" fill="#ffffff" opacity="0.15" rx="6"/>
          <rect x="220" y="150" width="160" height="5" fill="#fbbf24" opacity="0.5" rx="6"/>
          <text x="300" y="205" fill="#ffffff" font-size="13" font-family="Arial" font-weight="bold" text-anchor="middle">日光温室C区</text>
          <text x="260" y="168" fill="#fef3c7" font-size="9" font-family="Arial" text-anchor="middle">1-4号棚</text>
          <text x="340" y="168" fill="#fef3c7" font-size="9" font-family="Arial" text-anchor="middle">5-8号棚</text>
        </g>

        <!-- 大田种植区 -->
        <g>
          <rect x="20" y="150" width="160" height="100" fill="url(#fieldGrad)" rx="6" filter="url(#glow)"/>
          <line x1="20" y1="170" x2="180" y2="170" stroke="#bbf7d0" stroke-width="1" opacity="0.3"/>
          <line x1="20" y1="190" x2="180" y2="190" stroke="#bbf7d0" stroke-width="1" opacity="0.3"/>
          <line x1="20" y1="210" x2="180" y2="210" stroke="#bbf7d0" stroke-width="1" opacity="0.3"/>
          <line x1="73" y1="150" x2="73" y2="250" stroke="#bbf7d0" stroke-width="1" opacity="0.3"/>
          <line x1="126" y1="150" x2="126" y2="250" stroke="#bbf7d0" stroke-width="1" opacity="0.3"/>
          <rect x="20" y="150" width="160" height="22" fill="#ffffff" opacity="0.15" rx="6"/>
          <rect x="20" y="150" width="160" height="5" fill="#4ade80" opacity="0.5" rx="6"/>
          <text x="100" y="242" fill="#ffffff" font-size="13" font-family="Arial" font-weight="bold" text-anchor="middle">大田种植区</text>
          <text x="47" y="165" fill="#dcfce7" font-size="10" font-family="Arial" text-anchor="middle">A区</text>
          <text x="100" y="165" fill="#dcfce7" font-size="10" font-family="Arial" text-anchor="middle">B区</text>
          <text x="153" y="165" fill="#dcfce7" font-size="10" font-family="Arial" text-anchor="middle">C区</text>
        </g>

        <!-- 仓库 -->
        <rect x="240" y="235" width="40" height="25" fill="#6b7280" rx="3" opacity="0.8"/>
        <text x="260" y="252" fill="#ffffff" font-size="9" font-family="Arial" font-weight="bold" text-anchor="middle">仓库</text>

        <!-- 中心点 -->
        <circle cx="200" cy="138" r="4" fill="#fbbf24" opacity="0.9"/>
        <circle cx="200" cy="138" r="2" fill="#ffffff"/>

        <!-- 图例 -->
        <g transform="translate(200, 268)">
          <rect x="-160" y="-10" width="320" height="22" fill="#111111" fill-opacity="0.8" rx="4" stroke="#333333" stroke-width="0.5"/>
          <rect x="-150" y="-5" width="12" height="12" fill="url(#glassGrad)" rx="2"/>
          <text x="-135" y="5" fill="#ffffff" font-size="8" font-family="Arial">玻璃温室A区</text>
          <rect x="-55" y="-5" width="12" height="12" fill="url(#filmGrad)" rx="2"/>
          <text x="-40" y="5" fill="#ffffff" font-size="8" font-family="Arial">连栋温室B区</text>
          <rect x="40" y="-5" width="12" height="12" fill="url(#sunGrad)" rx="2"/>
          <text x="55" y="5" fill="#ffffff" font-size="8" font-family="Arial">日光温室C区</text>
          <rect x="115" y="-5" width="12" height="12" fill="url(#fieldGrad)" rx="2"/>
          <text x="130" y="5" fill="#ffffff" font-size="8" font-family="Arial">大田种植区</text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { CaretRight, LocationInformation } from '@element-plus/icons-vue'

defineProps({
  expanded: { type: Boolean, default: false },
  onToggle: { type: Function, default: () => {} },
  onMapClick: { type: Function, default: () => {} }
})

defineEmits(['toggle', 'map-click'])
</script>

<style scoped>
.card-map {
  background: linear-gradient(145deg, #1a1f1a 0%, #0f1410 100%);
  border: 2px solid #2d3a2d;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.05);
}

.card-map:hover {
  border-color: #4ade80;
  box-shadow: 0 6px 30px rgba(74, 222, 128, 0.15), 0 0 20px rgba(74, 222, 128, 0.1);
  transform: translateY(-2px);
}

.animate-card-in {
  animation: cardFadeIn 0.4s ease-out forwards;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
