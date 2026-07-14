/**
 * 日期工具函数
 * 用本地日期避免 UTC 时区差问题（中国时区早上 0:00-8:00 UTC 还是昨天）
 */

/** 格式：YYYYMMDD（无分隔符，用于 ID 拼接） */
export function formatLocalDateYYYYMMDD(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/** 格式：YYYY-MM-DD（用于 SQL 日期字段） */
export function formatLocalDateISO(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}