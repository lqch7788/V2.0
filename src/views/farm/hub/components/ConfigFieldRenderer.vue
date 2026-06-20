<!--
  农场 Hub 配置字段渲染器
  对标 V1.1 src/components/farm/hub/components/ConfigFieldRenderer.tsx
-->
<template>
  <el-form :model="config" label-width="120px">
    <el-form-item v-for="field in fields" :key="field.key" :label="field.label">
      <el-input v-if="field.type === 'text'" v-model="config[field.key]" :placeholder="field.placeholder" />
      <el-input-number v-else-if="field.type === 'number'" v-model="config[field.key]" :min="0" :precision="field.precision" />
      <el-select v-else-if="field.type === 'select'" v-model="config[field.key]" :placeholder="field.placeholder" class="w-full">
        <el-option v-for="opt in field.options" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
      <el-switch v-else-if="field.type === 'switch'" v-model="config[field.key]" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="$emit('save', config)">保存</el-button>
      <el-button @click="$emit('cancel')">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
defineProps({
  config: { type: Object, required: true },
  fields: { type: Array, default: () => [] },
})

defineEmits(['save', 'cancel'])
</script>