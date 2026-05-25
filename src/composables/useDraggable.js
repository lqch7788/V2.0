/**
 * 弹窗拖拽/缩放 Composable
 * 用法：在弹窗组件中调用，拖拽标题栏移动，拖拽边框缩放
 */
import { ref, onUnmounted } from 'vue'

/**
 * @param {Object} options - 配置选项
 * @param {number} options.initialWidth - 初始宽度，默认500
 * @param {number} options.initialHeight - 初始高度，默认460
 * @param {number} options.minWidth - 最小宽度，默认400
 * @param {number} options.minHeight - 最小高度，默认300
 */
export function useDraggable(options = {}) {
  const {
    initialWidth = 500,
    initialHeight = 460,
    minWidth = 400,
    minHeight = 300
  } = options

  // 位置状态（偏移量）
  const position = ref({ x: 0, y: 0 })
  // 尺寸状态
  const size = ref({ width: initialWidth, height: initialHeight })

  // 拖拽状态
  let dragState = null
  // 缩放状态
  let resizeState = null

  /**
   * 开始拖拽移动
   * @param {MouseEvent} e - 鼠标事件
   */
  const startDrag = (e) => {
    e.preventDefault()
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.value.x,
      startPosY: position.value.y
    }

    const onMove = (ev) => {
      if (!dragState) return
      const dx = ev.clientX - dragState.startX
      const dy = ev.clientY - dragState.startY
      position.value = {
        x: dragState.startPosX + dx,
        y: dragState.startPosY + dy
      }
    }

    const onUp = () => {
      dragState = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  /**
   * 开始缩放
   * @param {string} dir - 缩放方向：nw, ne, sw, se, n, s, e, w
   * @returns {Function} - 缩放处理函数
   */
  const startResize = (dir) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    resizeState = {
      dir,
      startX: e.clientX,
      startY: e.clientY,
      startW: size.value.width,
      startH: size.value.height,
      startPosX: position.value.x,
      startPosY: position.value.y
    }

    const onMove = (ev) => {
      if (!resizeState) return
      const { dir: d, startX, startY, startW, startH, startPosX, startPosY } = resizeState
      let dw = 0, dh = 0, dx = 0, dy = 0
      const mx = ev.clientX - startX
      const my = ev.clientY - startY

      if (d.includes('e')) { dw = mx }
      if (d.includes('w')) { dw = -mx; dx = mx }
      if (d.includes('s')) { dh = my }
      if (d.includes('n')) { dh = -my; dy = my }

      const newW = Math.max(minWidth, startW + dw)
      const newH = Math.max(minHeight, startH + dh)
      // 修正位移（当宽度/高度被 min 限制时）
      const actualDw = newW - startW
      const actualDh = newH - startH
      if (d.includes('w')) dx = -actualDw
      if (d.includes('n')) dy = -actualDh

      size.value = { width: newW, height: newH }
      position.value = { x: startPosX + dx, y: startPosY + dy }
    }

    const onUp = () => {
      resizeState = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  /**
   * 重置弹窗位置和尺寸
   */
  const resetPosition = () => {
    position.value = { x: 0, y: 0 }
    size.value = { width: initialWidth, height: initialHeight }
  }

  /**
   * 获取缩放把手样式
   * 返回一个数组，包含8个把手的配置
   */
  const getResizeHandles = () => {
    const handles = [
      { dir: 'nw', style: 'absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-10' },
      { dir: 'ne', style: 'absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-10' },
      { dir: 'sw', style: 'absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-10' },
      { dir: 'se', style: 'absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-10' },
      { dir: 'n', style: 'absolute top-0 left-3 right-3 h-1.5 cursor-n-resize z-10' },
      { dir: 's', style: 'absolute bottom-0 left-3 right-3 h-1.5 cursor-s-resize z-10' },
      { dir: 'w', style: 'absolute left-0 top-3 bottom-3 w-1.5 cursor-w-resize z-10' },
      { dir: 'e', style: 'absolute right-0 top-3 bottom-3 w-1.5 cursor-e-resize z-10' }
    ]
    return handles.map(h => ({
      ...h,
      onMouseDown: startResize(h.dir)
    }))
  }

  return {
    position,
    size,
    startDrag,
    resetPosition,
    getResizeHandles
  }
}
