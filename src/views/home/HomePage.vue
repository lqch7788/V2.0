<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
    <!-- 顶部导航 -->
    <div class="relative z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-green-100">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/弘智耘LOGO.png" alt="弘智耘" class="h-10 w-auto" />
          <div>
            <h1 class="text-lg font-bold text-gray-900">{{ t.aboutTitle }}</h1>
            <p class="text-xs text-gray-500">Techmation Intelligent Crop Cloud</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500">{{ t.smartAgriculture }}</span>

          <!-- 已登录状态 -->
          <template v-if="isLoggedIn">
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                <div class="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-medium">
                  LQC
                </div>
                <span class="text-sm font-medium text-emerald-700">{{ username }}</span>
                <el-icon><ArrowDown /></el-icon>
              </button>

              <!-- 用户下拉菜单 -->
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
              >
                <div class="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p class="font-bold text-gray-900">{{ username }}</p>
                  <div class="mt-1.5 space-y-0.5">
                    <p class="text-xs text-gray-500">
                      <span class="font-medium text-gray-600">所属公司：</span>宁波帮帮忙公司
                    </p>
                    <p class="text-xs text-gray-500">
                      <span class="font-medium text-gray-600">所属部门：</span>生产部
                    </p>
                    <p class="text-xs text-gray-500">
                      <span class="font-medium text-gray-600">职位：</span>经理
                    </p>
                  </div>
                </div>
                <div class="py-1">
                  <button
                    @click="goToProfile"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full"
                  >
                    <el-icon><User /></el-icon>
                    个人中心
                  </button>
                  <button
                    @click="goToMyTasks"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full"
                  >
                    <el-icon><List /></el-icon>
                    我的任务
                  </button>
                  <button
                    @click="goToMessages"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full"
                  >
                    <el-icon><Bell /></el-icon>
                    消息中心
                  </button>
                  <button
                    @click="goToMyApplications"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full"
                  >
                    <el-icon><Document /></el-icon>
                    我的申请
                  </button>
                  <button
                    @click="goToSettings"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full"
                  >
                    <el-icon><Setting /></el-icon>
                    系统设置
                  </button>
                  <hr class="my-1" />
                  <button
                    @click="showLogoutConfirm = true; showUserMenu = false"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                  >
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- 未登录状态 -->
          <template v-else>
            <el-button type="primary" @click="goToLogin">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              <span class="ml-1">{{ t.login }}</span>
            </el-button>
          </template>

          <!-- 语言选择 -->
          <el-select
            v-model="language"
            size="default"
            style="width: 120px"
          >
            <el-option value="中文简体" label="中文简体" />
            <el-option value="中文繁体" label="中文繁体" />
            <el-option value="English" label="English" />
          </el-select>

          <!-- 关于按钮 -->
          <el-button @click="showAbout = true">
            <el-icon><InfoFilled /></el-icon>
            <span class="ml-1">{{ t.about }}</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 欢迎横幅 -->
    <div class="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-40 h-40 bg-white rounded-full"></div>
        <div class="absolute bottom-10 right-20 w-60 h-60 bg-white rounded-full"></div>
        <div class="absolute top-1/2 left-1/3 w-20 h-20 bg-white rounded-full"></div>
      </div>
      <div class="max-w-7xl mx-auto px-6 py-16 relative">
        <h2 class="text-3xl font-bold text-white mb-2">{{ t.welcome }}</h2>
        <p class="text-white/80 text-lg">{{ t.welcomeSub }}</p>
      </div>
    </div>

    <!-- 模块卡片区域 -->
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- 模块1: 智能环境监测系统 -->
        <div
          @click="!modules[0].disabled && modules[0].onClick()"
          :class="[
            'relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 group',
            modules[0].gradient,
            modules[0].disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-2xl'
          ]"
        >
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          <div class="relative p-6">
            <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">{{ modules[0].title }}</h3>
            <p class="text-white/80 text-sm mb-4">{{ modules[0].description }}</p>
            <div class="flex items-center text-white/60 text-sm group-hover:text-white transition-colors">
              <span>{{ modules[0].actionText }}</span>
            </div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
        </div>

        <!-- 模块2: 智能控制系统 -->
        <div
          @click="!modules[1].disabled && modules[1].onClick()"
          :class="[
            'relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 group',
            modules[1].gradient,
            modules[1].disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-2xl'
          ]"
        >
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          <div class="relative p-6">
            <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">{{ modules[1].title }}</h3>
            <p class="text-white/80 text-sm mb-4">{{ modules[1].description }}</p>
            <div class="flex items-center text-white/60 text-sm group-hover:text-white transition-colors">
              <span>{{ modules[1].actionText }}</span>
            </div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
        </div>

        <!-- 模块3: 种植管理系统 -->
        <div
          @click="!modules[2].disabled && modules[2].onClick()"
          :class="[
            'relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 group',
            modules[2].gradient,
            modules[2].disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-2xl'
          ]"
        >
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          <div class="relative p-6">
            <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">{{ modules[2].title }}</h3>
            <p class="text-white/80 text-sm mb-4">{{ modules[2].description }}</p>
            <div class="flex items-center text-white/60 text-sm group-hover:text-white transition-colors">
              <span>{{ modules[2].actionText }}</span>
              <svg v-if="!modules[2].disabled" class="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
        </div>

        <!-- 模块4: 产品溯源系统 -->
        <div
          @click="!modules[3].disabled && modules[3].onClick()"
          :class="[
            'relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 group',
            modules[3].gradient,
            modules[3].disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-2xl'
          ]"
        >
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          <div class="relative p-6">
            <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-lime-600 to-green-700 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">{{ modules[3].title }}</h3>
            <p class="text-white/80 text-sm mb-4">{{ modules[3].description }}</p>
            <div class="flex items-center text-white/60 text-sm group-hover:text-white transition-colors">
              <span>{{ modules[3].actionText }}</span>
            </div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
        </div>

        <!-- 模块5: 数据分析系统 -->
        <div
          @click="!modules[4].disabled && modules[4].onClick()"
          :class="[
            'relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 group',
            modules[4].gradient,
            modules[4].disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-2xl'
          ]"
        >
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          <div class="relative p-6">
            <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-700 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">{{ modules[4].title }}</h3>
            <p class="text-white/80 text-sm mb-4">{{ modules[4].description }}</p>
            <div class="flex items-center text-white/60 text-sm group-hover:text-white transition-colors">
              <span>{{ modules[4].actionText }}</span>
            </div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
        </div>

        <!-- 模块6: 专家/AI诊断系统 -->
        <div
          @click="!modules[5].disabled && modules[5].onClick()"
          :class="[
            'relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 group',
            modules[5].gradient,
            modules[5].disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-2xl'
          ]"
        >
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          <div class="relative p-6">
            <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">{{ modules[5].title }}</h3>
            <p class="text-white/80 text-sm mb-4">{{ modules[5].description }}</p>
            <div class="flex items-center text-white/60 text-sm group-hover:text-white transition-colors">
              <span>{{ modules[5].actionText }}</span>
            </div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
        </div>

        <!-- 模块7: 经营与成本核算系统 -->
        <div
          @click="!modules[6].disabled && modules[6].onClick()"
          :class="[
            'relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 group',
            modules[6].gradient,
            modules[6].disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-2xl'
          ]"
        >
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          <div class="relative p-6">
            <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">{{ modules[6].title }}</h3>
            <p class="text-white/80 text-sm mb-4">{{ modules[6].description }}</p>
            <div class="flex items-center text-white/60 text-sm group-hover:text-white transition-colors">
              <span>{{ modules[6].actionText }}</span>
            </div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
        </div>

        <!-- 模块8: 市场与销售协同系统 -->
        <div
          @click="!modules[7].disabled && modules[7].onClick()"
          :class="[
            'relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 group',
            modules[7].gradient,
            modules[7].disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-2xl'
          ]"
        >
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          <div class="relative p-6">
            <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-600 to-rose-700 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">{{ modules[7].title }}</h3>
            <p class="text-white/80 text-sm mb-4">{{ modules[7].description }}</p>
            <div class="flex items-center text-white/60 text-sm group-hover:text-white transition-colors">
              <span>{{ modules[7].actionText }}</span>
            </div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
        </div>
      </div>
    </div>

    <!-- 关于弹窗 -->
    <el-dialog
      v-model="showAbout"
      :title="t.aboutTitle"
      width="400px"
      :show-footer="false"
      center
    >
      <div class="text-center">
        <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 20h10"></path>
            <path d="M10 20c5.5-2.5.8-6.4 3-10"></path>
            <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"></path>
            <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-1">{{ t.aboutTitle }}</h3>
        <p class="text-sm text-gray-500 mb-1">{{ t.aboutSubtitle }}</p>
        <p class="text-xs text-gray-400 mb-4">{{ t.aboutShortName }}</p>

        <div class="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-4">
          <p class="text-sm">
            <span class="text-gray-500">{{ t.version }}：</span>
            <span class="font-medium">V3.0.0</span>
          </p>
          <p class="text-sm">
            <span class="text-gray-500">{{ t.copyright }}：</span>
            <span class="font-medium">{{ t.companyName }}</span>
          </p>
          <hr class="my-2" />
          <p class="text-sm font-medium text-gray-700">{{ t.contactInfo }}：</p>
          <p class="text-xs text-gray-500">
            <span class="font-medium">{{ t.address }}：</span>{{ t.addressValue }}
          </p>
          <p class="text-xs text-gray-500">
            <span class="font-medium">{{ t.contact }}：</span>{{ t.contactValue }}
          </p>
          <p class="text-xs text-gray-500">
            <span class="font-medium">{{ t.phone }}：</span>{{ t.phoneValue }}
          </p>
          <p class="text-xs text-gray-500">
            <span class="font-medium">{{ t.fax }}：</span>{{ t.faxValue }}
          </p>
          <p class="text-xs text-gray-500">
            <span class="font-medium">{{ t.email }}：</span>{{ t.emailValue }}
          </p>
        </div>

        <el-button type="primary" class="w-full" @click="showAbout = false">
          {{ t.confirm }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 退出确认弹窗 -->
    <el-dialog
      v-model="showLogoutConfirm"
      width="400px"
      center
    >
      <template #header>
        <span class="text-xl font-bold">确认退出</span>
      </template>
      <div class="text-center py-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </div>
        <p class="text-gray-500 mb-6">确定要退出登录吗？</p>
        <div class="flex gap-3">
          <el-button class="flex-1" @click="showLogoutConfirm = false">取消</el-button>
          <el-button type="danger" class="flex-1" @click="handleLogout">确认退出</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 底部信息 -->
    <div class="bg-white/50 border-t border-green-100 mt-8">
      <div class="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div class="flex items-center gap-2 text-gray-500 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 20h10"></path>
            <path d="M10 20c5.5-2.5.8-6.4 3-10"></path>
            <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"></path>
            <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"></path>
          </svg>
          <span>{{ t.footerBrand }}</span>
        </div>
        <div class="text-gray-400 text-sm">
          {{ t.footerCopyright }}
        </div>
      </div>
    </div>

    <!-- 点击空白处关闭下拉菜单 -->
    <div
      v-if="showUserMenu"
      class="fixed inset-0 z-40"
      @click="showUserMenu = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown, Setting, User, SwitchButton, InfoFilled, List, Bell, Document } from '@element-plus/icons-vue'

const router = useRouter()

// 语言和翻译
const language = ref('中文简体')

// 翻译内容
const translations = {
  '中文简体': {
    smartAgriculture: '智慧农业 · 精准种植',
    envMonitor: '智能环境监测系统',
    envMonitorDesc: '实时监测温度、湿度，光照等环境数据',
    envMonitorStatus: '敬请期待',
    controlSystem: '智能控制系统',
    controlSystemDesc: '远程控制灌溉、通风、遮阳等设备',
    controlSystemStatus: '敬请期待',
    plantingManagement: '种植管理系统',
    plantingManagementDesc: '全面的农业生产管理与作业记录',
    plantingManagementStatus: '进入',
    traceability: '产品溯源系统',
    traceabilityDesc: '全流程溯源追踪与信息查询',
    traceabilityStatus: '敬请期待',
    dataAnalysis: '数据分析系统',
    dataAnalysisDesc: '数据统计分析与可视化报表',
    dataAnalysisStatus: '敬请期待',
    expertAI: '专家/AI诊断系统',
    expertAIDesc: '农业技术方案与专家/AI智能诊断指导',
    expertAIStatus: '敬请期待',
    costAccounting: '经营与成本核算系统',
    costAccountingDesc: '经营数据分析与成本核算管理',
    costAccountingStatus: '敬请期待',
    marketSales: '市场与销售协同系统',
    marketSalesDesc: '市场数据与销售订单协同管理',
    marketSalesStatus: '敬请期待',
    welcome: '欢迎使用弘讯智能种植云平台',
    welcomeSub: '全方位智能农业解决方案，助力现代农业数字化转型',
    footerBrand: '弘讯智能 · 智慧农业',
    footerCopyright: '© 2024 Techmation Intelligent Crop Cloud. All rights reserved.',
    login: '登录',
    about: '关于',
    aboutTitle: '弘讯智能种植云',
    aboutSubtitle: 'Techmation Intelligent Crop Cloud',
    aboutShortName: '简称：弘智耘 tmCropCloud',
    version: '版本',
    copyright: '版权所有',
    companyName: '宁波弘讯软件开发有限公司',
    contactInfo: '联系方式',
    address: '地址',
    contact: '联系人',
    phone: '电话',
    fax: '传真',
    email: '邮箱',
    confirm: '确定',
    addressValue: '北仑区新碶明州西路479号2号厂房-25',
    contactValue: '沈小姐',
    phoneValue: '0574-86987287',
    faxValue: '0574-86829287',
    emailValue: 'assistant@techmation.com.cn',
  },
  '中文繁体': {
    smartAgriculture: '智慧農業 · 精準種植',
    envMonitor: '智慧環境監測系統',
    envMonitorDesc: '即時監測溫度、濕度，光照等環境數據',
    envMonitorStatus: '敬請期待',
    controlSystem: '智慧控制系統',
    controlSystemDesc: '遠程控制灌溉、通風、遮陽等設備',
    controlSystemStatus: '敬請期待',
    plantingManagement: '種植管理系統',
    plantingManagementDesc: '全面的農業生產管理與作業記錄',
    plantingManagementStatus: '進入',
    traceability: '產品溯源系統',
    traceabilityDesc: '全流程溯源追蹤與資訊查詢',
    traceabilityStatus: '敬請期待',
    dataAnalysis: '數據分析系統',
    dataAnalysisDesc: '數據統計分析與視覺化報表',
    dataAnalysisStatus: '敬請期待',
    expertAI: '專家/AI診斷系統',
    expertAIDesc: '農業技術方案與專家/AI智慧診斷指導',
    expertAIStatus: '敬請期待',
    costAccounting: '經營與成本核算系統',
    costAccountingDesc: '經營數據分析與成本核算管理',
    costAccountingStatus: '敬請期待',
    marketSales: '市場與銷售協同系統',
    marketSalesDesc: '市場數據與銷售訂單協同管理',
    marketSalesStatus: '敬請期待',
    welcome: '歡迎使用弘訊智慧種植雲平台',
    welcomeSub: '全方位智慧農業解決方案，助力現代農業數位化轉型',
    footerBrand: '弘訊智慧 · 智慧農業',
    footerCopyright: '© 2024 Techmation Intelligent Crop Cloud. All rights reserved.',
    login: '登入',
    about: '關於',
    aboutTitle: '弘訊智慧種植雲',
    aboutSubtitle: 'Techmation Intelligent Crop Cloud',
    aboutShortName: '簡稱：弘智耘 tmCropCloud',
    version: '版本',
    copyright: '版權所有',
    companyName: '寧波弘訊軟體開發有限公司',
    contactInfo: '聯絡方式',
    address: '地址',
    contact: '聯絡人',
    phone: '電話',
    fax: '傳真',
    email: '郵箱',
    confirm: '確定',
    addressValue: '北侖區新碶明州西路479號2號廠房-25',
    contactValue: '沈小姐',
    phoneValue: '0574-86987287',
    faxValue: '0574-86829287',
    emailValue: 'assistant@techmation.com.cn',
  },
  'English': {
    smartAgriculture: 'Smart Agriculture · Precision Planting',
    envMonitor: 'Smart Environment Monitoring',
    envMonitorDesc: 'Real-time monitoring of temperature, humidity, light and other environmental data',
    envMonitorStatus: 'Coming Soon',
    controlSystem: 'Smart Control System',
    controlSystemDesc: 'Remote control of irrigation, ventilation, shading and other equipment',
    controlSystemStatus: 'Coming Soon',
    plantingManagement: 'Planting Management System',
    plantingManagementDesc: 'Comprehensive agricultural production management and operation records',
    plantingManagementStatus: 'Enter',
    traceability: 'Product Traceability System',
    traceabilityDesc: 'Full-process traceability tracking and information query',
    traceabilityStatus: 'Coming Soon',
    dataAnalysis: 'Data Analysis System',
    dataAnalysisDesc: 'Data statistics analysis and visual reports',
    dataAnalysisStatus: 'Coming Soon',
    expertAI: 'Expert/AI Diagnosis System',
    expertAIDesc: 'Agricultural technical solutions and Expert/AI intelligent diagnosis guidance',
    expertAIStatus: 'Coming Soon',
    costAccounting: 'Business & Cost Accounting System',
    costAccountingDesc: 'Business data analysis and cost accounting management',
    costAccountingStatus: 'Coming Soon',
    marketSales: 'Market & Sales Coordination System',
    marketSalesDesc: 'Market data and sales order collaborative management',
    marketSalesStatus: 'Coming Soon',
    welcome: 'Welcome to Techmation Intelligent Crop Cloud Platform',
    welcomeSub: 'Comprehensive smart agriculture solutions, empowering modern agricultural digital transformation',
    footerBrand: 'Techmation · Smart Agriculture',
    footerCopyright: '© 2024 Techmation Intelligent Crop Cloud. All rights reserved.',
    login: 'Login',
    about: 'About',
    aboutTitle: 'Techmation Intelligent Crop Cloud',
    aboutSubtitle: 'Techmation Intelligent Crop Cloud',
    aboutShortName: 'Short Name: tmCropCloud',
    version: 'Version',
    copyright: 'Copyright',
    companyName: 'Ningbo Techmation Software Development Co., Ltd.',
    contactInfo: 'Contact Information',
    address: 'Address',
    contact: 'Contact',
    phone: 'Phone',
    fax: 'Fax',
    email: 'Email',
    confirm: 'Confirm',
    addressValue: 'No.479, Mingzhou West Road, Xinqi Street, Beilun District, Building 2-25',
    contactValue: 'Ms. Shen',
    phoneValue: '0574-86987287',
    faxValue: '0574-86829287',
    emailValue: 'assistant@techmation.com.cn',
  },
}

const t = computed(() => translations[language.value] || translations['中文简体'])

// 状态
const isLoggedIn = ref(false)
const username = ref('')
const showLogoutConfirm = ref(false)
const showUserMenu = ref(false)
const showAbout = ref(false)

// 模块数据 - 使用固定数据，不依赖不存在的图标
const disabled = false
const modules = computed(() => [
  {
    title: t.value.envMonitor,
    description: t.value.envMonitorDesc,
    gradient: 'bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600',
    actionText: t.value.envMonitorStatus,
    disabled,
    onClick: () => router.push('/environment-monitor')
  },
  {
    title: t.value.controlSystem,
    description: t.value.controlSystemDesc,
    gradient: 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600',
    actionText: t.value.controlSystemStatus,
    disabled,
    onClick: () => router.push('/env-control')
  },
  {
    title: t.value.plantingManagement,
    description: t.value.plantingManagementDesc,
    gradient: 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600',
    actionText: t.value.plantingManagementStatus,
    disabled,
    onClick: () => router.push('/dashboard')
  },
  {
    title: t.value.traceability,
    description: t.value.traceabilityDesc,
    gradient: 'bg-gradient-to-br from-lime-500 via-green-500 to-emerald-600',
    actionText: t.value.traceabilityStatus,
    disabled,
    onClick: () => router.push('/traceability')
  },
  {
    title: t.value.dataAnalysis,
    description: t.value.dataAnalysisDesc,
    gradient: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-600',
    actionText: t.value.dataAnalysisStatus,
    disabled,
    onClick: () => router.push('/summary/overview')
  },
  {
    title: t.value.expertAI,
    description: t.value.expertAIDesc,
    gradient: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500',
    actionText: t.value.expertAIStatus,
    disabled,
    onClick: () => router.push('/tech-solution')
  },
  {
    title: t.value.costAccounting,
    description: t.value.costAccountingDesc,
    gradient: 'bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600',
    actionText: t.value.costAccountingStatus,
    disabled,
    onClick: () => router.push('/device-monitor')
  },
  {
    title: t.value.marketSales,
    description: t.value.marketSalesDesc,
    gradient: 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-600',
    actionText: t.value.marketSalesStatus,
    disabled,
    onClick: () => router.push('/market-sales')
  }
])

// 方法
const goToLogin = () => {
  router.push('/login')
}

const goToProfile = () => {
  showUserMenu.value = false
  router.push('/profile')
}

const goToMyTasks = () => {
  showUserMenu.value = false
  router.push('/my-tasks')
}

const goToMessages = () => {
  showUserMenu.value = false
  router.push('/messages')
}

const goToMyApplications = () => {
  showUserMenu.value = false
  router.push('/my-applications')
}

const goToSettings = () => {
  showUserMenu.value = false
  router.push('/settings')
}

const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('username')
  isLoggedIn.value = false
  username.value = ''
  showLogoutConfirm.value = false
  showUserMenu.value = false
  router.push('/')
}

// 初始化
onMounted(() => {
  const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const user = localStorage.getItem('username') || '陆启闯'
  isLoggedIn.value = loggedIn
  username.value = user
})
</script>

<style scoped>
/* 修复Element Plus图标在动态组件中的颜色问题 */
:deep(.el-icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
