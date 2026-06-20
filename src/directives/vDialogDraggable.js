/**
 * el-dialog 拖拽指令
 * 用法：<el-dialog v-dialog-draggable> ... </el-dialog>
 * 拖拽标题栏移动弹窗位置（持久化位置到 sessionStorage）
 *
 * 对标 V1.1 src/pages/authority/useDragResize.tsx 中的 startDrag 实现
 */

const STORAGE_KEY = 'v2-dialog-positions'

function loadPositions() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function savePositions(map) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // 忽略 sessionStorage 写入失败
  }
}

export const vDialogDraggable = {
  mounted(el, binding) {
    const dialogId = binding.value || `dialog-${Math.random().toString(36).slice(2, 9)}`
    el.__dragDialogId = dialogId

    // 等待 el-dialog 渲染完成
    requestAnimationFrame(() => {
      const header = el.querySelector('.el-dialog__header')
      const body = el.querySelector('.el-dialog')
      if (!header || !body) return

      header.style.cursor = 'move'
      header.style.userSelect = 'none'

      // 恢复上次位置
      const positions = loadPositions()
      const saved = positions[dialogId]
      if (saved) {
        body.style.marginTop = `${saved.y}px`
        body.style.marginLeft = `${saved.x}px`
        body.style.transform = 'none'
        body.style.position = 'relative'
      } else {
        // 居中
        body.style.position = 'relative'
      }

      const onMouseDown = (e) => {
        if (e.button !== 0) return
        // 忽略点击关闭按钮
        if (e.target.closest('.el-dialog__close')) return

        const rect = body.getBoundingClientRect()
        const startX = e.clientX
        const startY = e.clientY
        const startLeft = rect.left
        const startTop = rect.top

        const baseLeft = parseFloat(body.style.marginLeft) || startLeft
        const baseTop = parseFloat(body.style.marginTop) || startTop

        const onMouseMove = (ev) => {
          const dx = ev.clientX - startX
          const dy = ev.clientY - startY
          const newLeft = baseLeft + dx
          const newTop = baseTop + dy
          body.style.marginLeft = `${newLeft}px`
          body.style.marginTop = `${newTop}px`
          body.style.transform = 'none'
        }

        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
          // 持久化位置
          const positions = loadPositions()
          positions[dialogId] = {
            x: parseFloat(body.style.marginLeft) || 0,
            y: parseFloat(body.style.marginTop) || 0,
          }
          savePositions(positions)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        e.preventDefault()
      }

      header.addEventListener('mousedown', onMouseDown)
      el.__dragCleanup = () => {
        header.removeEventListener('mousedown', onMouseDown)
      }
    })
  },

  unmounted(el) {
    if (el.__dragCleanup) {
      el.__dragCleanup()
      delete el.__dragCleanup
    }
  },
}

export default vDialogDraggable