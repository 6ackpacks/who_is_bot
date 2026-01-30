// utils/theme.js - 主题管理工具

const THEME_KEY = 'app_theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

/**
 * 获取当前主题
 * @returns {string} 'dark' 或 'light'
 */
function getTheme() {
  try {
    const theme = wx.getStorageSync(THEME_KEY);
    return theme || THEME_DARK; // 默认暗色主题
  } catch (e) {
    console.error('获取主题失败:', e);
    return THEME_DARK;
  }
}

/**
 * 设置主题
 * @param {string} theme - 'dark' 或 'light'
 */
function setTheme(theme) {
  try {
    wx.setStorageSync(THEME_KEY, theme);
    return true;
  } catch (e) {
    console.error('设置主题失败:', e);
    return false;
  }
}

/**
 * 切换主题
 * @returns {string} 切换后的主题
 */
function toggleTheme() {
  const currentTheme = getTheme();
  const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
  setTheme(newTheme);
  return newTheme;
}

/**
 * 判断是否为暗色主题
 * @returns {boolean}
 */
function isDarkTheme() {
  return getTheme() === THEME_DARK;
}

/**
 * 判断是否为亮色主题
 * @returns {boolean}
 */
function isLightTheme() {
  return getTheme() === THEME_LIGHT;
}

module.exports = {
  THEME_DARK,
  THEME_LIGHT,
  getTheme,
  setTheme,
  toggleTheme,
  isDarkTheme,
  isLightTheme
};
