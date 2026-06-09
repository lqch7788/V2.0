/**
 * IoT设备认证中间件 — 三层防护
 * 1. API Key 校验 (X-API-Key header)
 * 2. 设备白名单 (iot_devices 表)
 * 3. 速率限制由 express-rate-limit 在路由层处理
 */
import { getDatabase } from '../db/index.js';
import { queryToObjects } from '../utils/queryHelper.js';

/** 验证IoT设备API Key */
export function iotAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const deviceId = req.body?.device_id;

  if (!apiKey) {
    res.status(401).json({ success: false, error: '缺少 X-API-Key 认证头' });
    return;
  }

  if (!deviceId) {
    res.status(400).json({ success: false, error: '缺少 device_id 参数' });
    return;
  }

  try {
    const db = getDatabase();
    const devices = queryToObjects(db,
      `SELECT * FROM iot_devices WHERE device_id = ? AND api_key = ? AND is_active = 1`,
      [deviceId, apiKey]
    );

    if (devices.length === 0) {
      res.status(403).json({ success: false, error: '设备认证失败：API Key无效或设备未授权' });
      return;
    }

    // 将设备信息挂载到请求上下文
    req.iotDevice = devices[0];
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: '设备认证服务异常' });
  }
}
