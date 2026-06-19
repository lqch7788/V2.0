<template>
  <ElModal
    :model-value="show"
    title="供应商信息"
    :width="900"
    :height="600"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >

      <!-- 基本信息区域 - 浅绿背景 -->
      <div class="p-4 bg-emerald-50 border-b border-gray-200 -mx-4 -mt-4">
        <div class="grid grid-cols-4 gap-3">
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">供应商编号</label>
            <input v-model="form.code" :disabled="isEdit" placeholder="手动输入或使用编码生成器" class="w-full h-9 px-3 border border-gray-200 rounded text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">供应商名称 *</label>
            <input v-model="form.name" class="w-full h-9 px-3 border border-gray-200 rounded text-sm bg-white" />
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">供应类型 *</label>
            <select v-model="form.supplierType" class="w-full h-9 px-3 border border-gray-200 rounded text-sm bg-white">
              <option value="">请选择类型</option>
              <option v-for="cat in categoryOptions" :key="cat.code" :value="cat.code">{ getSupplierTypeName(cat.code) }</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">供应商属性 *</label>
            <select v-model="form.supplierAttribute" class="w-full h-9 px-3 border border-gray-200 rounded text-sm bg-white">
              <option value="">请选择属性</option>
              <option v-for="opt in supplierAttributeOptions" :key="opt.code || opt.name" :value="opt.name">{ opt.name }</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">所属组织 *</label>
            <select v-model="form.organization" class="w-full h-9 px-3 border border-gray-200 rounded text-sm bg-white">
              <option value="">请选择组织</option>
              <option value="宁波帮帮忙公司">宁波帮帮忙公司</option>
              <option value="成都帮帮您公司">成都帮帮您公司</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">联系人 *</label>
            <input v-model="form.contact" class="w-full h-9 px-3 border border-gray-200 rounded text-sm bg-white" />
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">移动电话 *</label>
            <input v-model="form.mobilePhone" class="w-full h-9 px-3 border border-gray-200 rounded text-sm bg-white" />
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">状态</label>
            <select v-model="form.status" class="w-full h-9 px-3 border border-gray-200 rounded text-sm bg-white">
              <option value="合作中">合作中</option>
              <option value="暂停">暂停</option>
              <option value="终止">终止</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 详细信息区域 - 白色 -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">工作电话</label>
            <input v-model="form.workPhone" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">传真</label>
            <input v-model="form.fax" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">国家</label>
            <input v-model="form.country" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div class="col-span-3">
            <label class="block text-xs font-medium text-gray-700 mb-1">省/市/区</label>
            <!-- V1.1 Cascader 区域级联 (4级懒加载: 省份→城市→区县) -->
            <Cascader
              :options="regionProvincesOptions"
              :lazy="true"
              :max-level="4"
              :load-children="handleLoadRegionChildren"
              :change="handleRegionChange"
              :value-nodes="regionPathNodes.length > 0 ? regionPathNodes : undefined"
              placeholder="请选择省/市/区"
              class="w-full"
            />
          </div>
          <div class="col-span-3">
            <label class="block text-xs font-medium text-gray-700 mb-1">详细地址</label>
            <input v-model="form.address" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">开户行</label>
            <input v-model="form.bankName" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div class="col-span-2">
            <label class="block text-xs font-medium text-gray-700 mb-1">银行卡号</label>
            <input v-model="form.bankCardNumber" class="w-full h-9 px-3 border border-gray-200 rounded text-sm font-mono" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">创建时间</label>
            <input type="date" v-model="form.createDate" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">最后编辑人</label>
            <input v-model="form.lastEditBy" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">最后编辑时间</label>
            <input v-model="form.lastEditTime" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div class="col-span-3">
            <label class="block text-xs font-medium text-gray-700 mb-1">备注</label>
            <textarea v-model="form.remarks" rows="2" class="w-full px-3 py-2 border border-gray-200 rounded text-sm"></textarea>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button size="small" @click="showFormModal = false; resetForm()">取消</el-button>
          <el-button type="primary" size="small" @click="handleSave">{ isEdit ? '保存' : '提交' }</el-button>
        </div>
      </template>
    
  </ElModal>
</template>

<script setup>
import { ElModal } from '@/components/ui'
defineProps({
  show: { type: Boolean, default: false }
})
defineEmits(['close'])
</script>
