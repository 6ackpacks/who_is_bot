#!/bin/bash

# 定义新的背景样式
read -r -d '' NEW_BG << 'EOF'
  background: linear-gradient(180deg, #050B1F 0%, #0D1B2A 50%, #1B263B 100%);
EOF

read -r -d '' NEW_BEFORE << 'EOF'
  background-image:
    radial-gradient(circle at 20% 30%, rgba(0, 180, 216, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
  pointer-events: none;
  animation: pulseGlow 8s ease-in-out infinite;
EOF

# 更新 leaderboard
sed -i 's/background: linear-gradient(180deg, #0A0E27 0%, #1A1F3A 100%);/background: linear-gradient(180deg, #050B1F 0%, #0D1B2A 50%, #1B263B 100%);/g' pages/leaderboard/leaderboard.wxss

# 更新 profile  
sed -i 's/background: linear-gradient(180deg, #0A0E27 0%, #1A1F3A 100%);/background: linear-gradient(180deg, #050B1F 0%, #0D1B2A 50%, #1B263B 100%);/g' pages/profile/profile.wxss

# 更新 history
sed -i 's/background: linear-gradient(180deg, #0A0E27 0%, #1A1F3A 100%);/background: linear-gradient(180deg, #050B1F 0%, #0D1B2A 50%, #1B263B 100%);/g' pages/history/history.wxss

# 更新 detail
sed -i 's/background: linear-gradient(180deg, #0A0E27 0%, #1A1F3A 100%);/background: linear-gradient(180deg, #050B1F 0%, #0D1B2A 50%, #1B263B 100%);/g' pages/detail/detail.wxss

echo "Updated all backgrounds to cyber style"
