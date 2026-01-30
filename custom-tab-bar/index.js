Component({
  data: {
    selected: 0,
    color: "#8B92A8",
    selectedColor: "#00F2FF",
    list: [
      {
        pagePath: "/pages/feed/feed",
        text: "判定"
      },
      {
        pagePath: "/pages/leaderboard/leaderboard",
        text: "榜单"
      },
      {
        pagePath: "/pages/profile/profile",
        text: "我的"
      }
    ]
  },

  attached() {
    // 获取当前页面路径，设置选中状态
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.route) {
        this.setSelected(currentPage.route);
      }
    }
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      const index = data.index;

      // 立即更新选中状态
      this.setData({
        selected: index
      });

      wx.switchTab({ url });
    },

    setSelected(route) {
      // 安全检查
      if (!route) {
        return;
      }

      // 处理路径格式，确保匹配
      const fullPath = route.startsWith('/') ? route : `/${route}`;

      const selected = this.data.list.findIndex(item => {
        return item.pagePath === fullPath;
      });

      if (selected !== -1) {
        this.setData({
          selected: selected
        });
      }
    }
  }
});
