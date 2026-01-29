// utils/time.js - 时间格式化工具

/**
 * 格式化时间为相对时间
 * @param {string|Date} dateString - 时间字符串或Date对象
 * @returns {string} 格式化后的相对时间
 */
function formatRelativeTime(dateString) {
  if (!dateString) return '';

  const now = new Date();
  const date = new Date(dateString);
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    // 超过7天显示具体日期
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  }
}

/**
 * 格式化为完整日期时间
 * @param {string|Date} dateString - 时间字符串或Date对象
 * @returns {string} 格式化后的日期时间
 */
function formatDateTime(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 格式化为日期
 * @param {string|Date} dateString - 时间字符串或Date对象
 * @returns {string} 格式化后的日期
 */
function formatDate(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

module.exports = {
  formatRelativeTime,
  formatDateTime,
  formatDate
};
