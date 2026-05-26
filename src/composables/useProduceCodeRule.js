/**
 * 作物编码规则 Composable
 * 对应 V1.1 useProduceCodeRule.ts
 * 全部本地状态，演示模式（无后端API）
 */
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { produceCategories } from '@/data/produceCodeRule'

/** 深拷贝 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export function useProduceCodeRule() {
  // ========== 状态 ==========
  const categories = ref(deepClone(produceCategories))
  const expandedCategory = ref(new Set(produceCategories.map(c => c.code)))
  const expandedType = ref(new Set())
  const expandedSub = ref(new Set())
  const isEditing = ref(false)
  const showSaveConfirm = ref(false)
  const showCodeRuleInfo = ref(false)

  // 编辑状态
  const editingCell = ref(null)
  const editValue = ref('')

  // 添加弹窗状态
  const showAddType = ref(null)
  const showAddSub = ref(null)
  const showAddSubVariety1 = ref(null)
  const showAddCategory = ref(false)

  // 添加表单值
  const newTypeCode = ref('')
  const newTypeName = ref('')
  const newSubCode = ref('')
  const newSubName = ref('')
  const newSubVariety1Code = ref('')
  const newSubVariety1Name = ref('')
  const newCategoryCode = ref('')
  const newCategoryName = ref('')

  // ========== 展开/折叠 ==========
  function toggleCategory(code) {
    const next = new Set(expandedCategory.value)
    if (next.has(code)) next.delete(code)
    else next.add(code)
    expandedCategory.value = next
  }

  function toggleType(categoryCode, typeCode) {
    const key = `${categoryCode}-${typeCode}`
    const next = new Set(expandedType.value)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    expandedType.value = next
  }

  function toggleSub(categoryCode, typeCode, subCode) {
    const key = `${categoryCode}-${typeCode}-${subCode}`
    const next = new Set(expandedSub.value)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    expandedSub.value = next
  }

  // ========== 编辑 ==========
  function startEdit(type, categoryCode, typeCode, subCode, currentName) {
    editingCell.value = { type, categoryCode, typeCode, subCode }
    editValue.value = currentName || ''
  }

  function saveEdit() {
    if (!editingCell.value || !editValue.value.trim()) return
    const cell = editingCell.value

    categories.value = categories.value.map(cat => {
      if (cat.code !== cell.categoryCode) return cat
      if (cell.type === 'category') {
        return { ...cat, name: editValue.value.trim() }
      }
      return {
        ...cat,
        types: cat.types.map(type => {
          if (type.code !== cell.typeCode) return type
          if (cell.type === 'type') {
            return { ...type, name: editValue.value.trim() }
          }
          return {
            ...type,
            subCategories: type.subCategories.map(sub => {
              if (sub.code !== cell.subCode) return sub
              return { ...sub, name: editValue.value.trim() }
            })
          }
        })
      }
    })

    editingCell.value = null
    editValue.value = ''
  }

  function cancelEdit() {
    editingCell.value = null
    editValue.value = ''
  }

  // ========== 添加大类 ==========
  function addCategory() {
    if (!newCategoryCode.value.trim() || !newCategoryName.value.trim()) return
    categories.value = [...categories.value, {
      code: newCategoryCode.value.trim().toUpperCase(),
      name: newCategoryName.value.trim(),
      nameEn: '',
      description: '',
      types: []
    }]
    newCategoryCode.value = ''
    newCategoryName.value = ''
    showAddCategory.value = false
  }

  // ========== 添加类型 ==========
  function addType(categoryCode) {
    if (!newTypeCode.value.trim() || !newTypeName.value.trim()) return
    categories.value = categories.value.map(cat => {
      if (cat.code !== categoryCode) return cat
      return {
        ...cat,
        types: [...cat.types, {
          code: newTypeCode.value.trim(),
          name: newTypeName.value.trim(),
          subCategories: []
        }]
      }
    })
    newTypeCode.value = ''
    newTypeName.value = ''
    showAddType.value = null
  }

  // ========== 添加品种 ==========
  function addSub(categoryCode, typeCode) {
    if (!newSubCode.value.trim() || !newSubName.value.trim()) return
    categories.value = categories.value.map(cat => {
      if (cat.code !== categoryCode) return cat
      return {
        ...cat,
        types: cat.types.map(type => {
          if (type.code !== typeCode) return type
          return {
            ...type,
            subCategories: [...type.subCategories, {
              code: newSubCode.value.trim(),
              name: newSubName.value.trim()
            }]
          }
        })
      }
    })
    newSubCode.value = ''
    newSubName.value = ''
    showAddSub.value = null
  }

  // ========== 添加子品种 ==========
  function addSubVariety1(categoryCode, typeCode, subCode) {
    if (!newSubVariety1Code.value.trim() || !newSubVariety1Name.value.trim()) return
    const code = newSubVariety1Code.value.trim().padStart(3, '0').slice(0, 3)
    categories.value = categories.value.map(cat => {
      if (cat.code !== categoryCode) return cat
      return {
        ...cat,
        types: cat.types.map(type => {
          if (type.code !== typeCode) return type
          return {
            ...type,
            subCategories: type.subCategories.map(sub => {
              if (sub.code !== subCode) return sub
              const existing = sub.subVarieties || []
              if (existing.some(sv => sv.code === code)) {
                ElMessage.warning('该子品种代码已存在！')
                return sub
              }
              return { ...sub, subVarieties: [...existing, { code, name: newSubVariety1Name.value.trim() }] }
            })
          }
        })
      }
    })
    newSubVariety1Code.value = ''
    newSubVariety1Name.value = ''
    showAddSubVariety1.value = null
  }

  // ========== 删除 ==========
  async function deleteType(categoryCode, typeCode) {
    try {
      await ElMessageBox.confirm(`确定要删除类型"${typeCode}"吗？`, '确认删除', {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
      })
      categories.value = categories.value.map(cat => {
        if (cat.code !== categoryCode) return cat
        return { ...cat, types: cat.types.filter(t => t.code !== typeCode) }
      })
    } catch (err) { /* 取消 */ }
  }

  async function deleteSub(categoryCode, typeCode, subCode) {
    try {
      await ElMessageBox.confirm(`确定要删除品种"${subCode}"吗？`, '确认删除', {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
      })
      categories.value = categories.value.map(cat => {
        if (cat.code !== categoryCode) return cat
        return {
          ...cat,
          types: cat.types.map(type => {
            if (type.code !== typeCode) return type
            return { ...type, subCategories: type.subCategories.filter(s => s.code !== subCode) }
          })
        }
      })
    } catch (err) { /* 取消 */ }
  }

  async function deleteSubVariety1(categoryCode, typeCode, subCode, subVariety1Code) {
    try {
      await ElMessageBox.confirm(`确定要删除子品种"${subVariety1Code}"吗？`, '确认删除', {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
      })
      categories.value = categories.value.map(cat => {
        if (cat.code !== categoryCode) return cat
        return {
          ...cat,
          types: cat.types.map(type => {
            if (type.code !== typeCode) return type
            return {
              ...type,
              subCategories: type.subCategories.map(sub => {
                if (sub.code !== subCode) return sub
                return { ...sub, subVarieties: (sub.subVarieties || []).filter(sv => sv.code !== subVariety1Code) }
              })
            }
          })
        }
      })
    } catch (err) { /* 取消 */ }
  }

  // ========== 保存（演示模式） ==========
  function handleSave() {
    ElMessage.success('编码规则已保存！（演示模式）')
  }

  return {
    categories, expandedCategory, expandedType, expandedSub,
    isEditing, showSaveConfirm, showCodeRuleInfo,
    editingCell, editValue,
    showAddType, showAddSub, showAddSubVariety1, showAddCategory,
    newTypeCode, newTypeName, newSubCode, newSubName,
    newSubVariety1Code, newSubVariety1Name, newCategoryCode, newCategoryName,
    toggleCategory, toggleType, toggleSub,
    startEdit, saveEdit, cancelEdit,
    addCategory, addType, addSub, addSubVariety1,
    deleteType, deleteSub, deleteSubVariety1,
    handleSave,
  }
}
