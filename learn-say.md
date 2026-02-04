<html lang="zh-CN" vid="0"><head vid="1">
    <meta charset="UTF-8" vid="2">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" vid="3">
    <title vid="4">Truth Seeker AI</title>
    <style vid="5">
        

        :root {
            --bg-mint: #E3F1F0;
            --bg-peach: #FFF5F2;
            --surface-white: #FFFFFF;
            --accent-coral: #EE5D49;
            --accent-coral-dim: #FFDCD6;
            --text-primary: #1D1D1F;
            --text-secondary: #86868B;
            --line-dashed: #C8D1D0;
            --safe-area-bottom: env(safe-area-inset-bottom);
        }

        * {
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: 'PingFang SC', 'Helvetica Neue', 'Inter', sans-serif;
            background-color: var(--bg-mint);
            color: var(--text-primary);
            overflow-x: hidden;
            height: 100vh;
        }

        
        .scallop-mask {
            clip-path: path("M150,0 C170,0 185,15 190,35 C195,55 215,65 235,60 C255,55 275,70 280,90 C285,110 300,125 300,150 C300,175 285,190 280,210 C275,230 255,245 235,240 C215,235 195,245 190,265 C185,285 170,300 150,300 C130,300 115,285 110,265 C105,245 85,235 65,240 C45,245 25,230 20,210 C15,190 0,175 0,150 C0,125 15,110 20,90 C25,70 45,55 65,60 C85,65 105,55 110,35 C115,15 130,0 150,0 Z");
            
        }
        
        
        
        .wavy-box {
            --wavy-radius: 20px;
            background: var(--surface-white);
            mask-image: paint(smooth-corners); 
            border-radius: 32px;
            position: relative;
        }

        .pill-btn {
            background-color: var(--accent-coral);
            color: white;
            border-radius: 999px;
            border: none;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.1s;
        }
        
        .pill-btn:active {
            transform: scale(0.96);
        }

        .dashed-circle {
            border: 2px dashed var(--accent-coral);
            border-radius: 50%;
        }

        
        .screen {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
            background: var(--bg-mint);
        }

        .screen.hidden {
            transform: translateX(100%);
            pointer-events: none;
        }

        .screen.hidden-left {
            transform: translateX(-100%);
            pointer-events: none;
        }

        
        #login-screen {
            justify-content: center;
            align-items: center;
            padding: 32px;
            text-align: center;
            z-index: 2;
        }

        .brand-container {
            width: 240px;
            height: 240px;
            background: var(--bg-peach);
            position: relative;
            margin-bottom: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            -webkit-mask: radial-gradient(32px at 32px 32px, #0000 98%, #000) -32px -32px;
            mask: radial-gradient(32px at 32px 32px, #0000 98%, #000) -32px -32px;
            
            border-radius: 48px; 
            box-shadow: 0 0 0 8px var(--surface-white); 
        }
        
        
        .flower-shape {
            border-radius: 45% 55% 50% 50% / 50% 50% 55% 45%;
            animation: morph 6s ease-in-out infinite;
        }

        @keyframes morph {
            0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
            50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
            100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }

        .logo-mark {
            font-size: 64px;
            color: var(--accent-coral);
        }

        h1 {
            font-size: 28px;
            margin-bottom: 12px;
            letter-spacing: -0.5px;
            color: var(--text-primary);
        }

        .slogan {
            color: var(--text-secondary);
            font-size: 16px;
            margin-bottom: 60px;
            line-height: 1.5;
        }

        .btn-wechat {
            width: 100%;
            height: 56px;
            font-size: 16px;
            margin-bottom: 16px;
            background-color: #07C160; 
            
            background-color: var(--text-primary); 
            color: var(--surface-white);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .btn-guest {
            width: 100%;
            height: 56px;
            font-size: 16px;
            background-color: transparent;
            color: var(--text-secondary);
            border: 2px solid rgba(0,0,0,0.05);
        }

        
        #result-screen {
            overflow-y: scroll;
            padding-bottom: 100px; 
        }

        .nav-header {
            padding: 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            background: rgba(227, 241, 240, 0.95);
            backdrop-filter: blur(10px);
            z-index: 10;
        }

        .nav-back {
            width: 40px;
            height: 40px;
            background: var(--surface-white);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        
        .content-card {
            margin: 0 16px 24px 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .judgment-visual {
            width: 280px;
            height: 280px;
            position: relative;
            margin-bottom: 24px;
        }

        .content-image-container {
            width: 100%;
            height: 100%;
            background-color: var(--bg-peach);
            
            clip-path: polygon(50% 0%, 83% 12%, 100% 43%, 94% 78%, 68% 100%, 32% 100%, 6% 78%, 0% 43%, 17% 12%);
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .content-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .scan-overlay {
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            border: 2px dashed var(--accent-coral);
            border-radius: 50%; 
            opacity: 0.6;
            animation: spin 20s linear infinite;
            clip-path: polygon(50% 0%, 83% 12%, 100% 43%, 94% 78%, 68% 100%, 32% 100%, 6% 78%, 0% 43%, 17% 12%);
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }

        .tag-pill {
            position: absolute;
            bottom: 20px;
            background: var(--surface-white);
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            color: var(--text-primary);
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .result-header {
            text-align: center;
            margin-bottom: 24px;
        }

        .status-badge {
            display: inline-block;
            background: var(--accent-coral);
            color: white;
            padding: 8px 16px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
        }

        .stats-container {
            width: 100%;
            background: var(--surface-white);
            border-radius: 24px;
            padding: 20px;
            margin-bottom: 16px;
        }

        .stat-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 600;
        }

        .progress-track {
            height: 12px;
            background: var(--bg-mint);
            border-radius: 6px;
            overflow: hidden;
            position: relative;
        }

        .progress-fill {
            height: 100%;
            background: var(--accent-coral);
            width: 82%; 
            border-radius: 6px;
        }

        
        .analysis-card {
            background: var(--bg-peach);
            border-radius: 24px;
            padding: 20px;
            margin: 0 16px 32px 16px;
        }

        .analysis-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            color: var(--accent-coral);
            font-weight: 700;
        }

        .analysis-content {
            font-size: 14px;
            line-height: 1.6;
            color: #5A4A48;
        }

        
        .comments-section {
            padding: 0 16px;
        }

        .section-title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 18px;
            font-weight: 700;
        }

        .sort-toggle {
            font-size: 13px;
            color: var(--text-secondary);
            display: flex;
            gap: 12px;
        }

        .sort-active {
            color: var(--text-primary);
            font-weight: 600;
        }

        .comment-item {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
        }

        .avatar {
            width: 40px;
            height: 40px;
            
            border-radius: 12px; 
            background: #ddd;
            flex-shrink: 0;
            overflow: hidden;
        }

        .avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .comment-body {
            flex: 1;
        }

        .comment-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
        }

        .username {
            font-size: 14px;
            font-weight: 600;
        }

        .pin-badge {
            background: var(--bg-mint);
            color: var(--text-secondary);
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
            margin-left: 6px;
            text-transform: uppercase;
        }

        .comment-text {
            font-size: 14px;
            line-height: 1.5;
            color: #444;
            margin-bottom: 8px;
        }

        .comment-actions {
            display: flex;
            gap: 16px;
            font-size: 12px;
            color: var(--text-secondary);
        }

        .action-btn {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        
        .bottom-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: var(--surface-white);
            padding: 12px 16px calc(12px + var(--safe-area-bottom)) 16px;
            display: flex;
            gap: 12px;
            align-items: center;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.04);
            z-index: 100;
        }

        .input-field {
            flex: 1;
            background: var(--bg-mint);
            border: none;
            height: 44px;
            border-radius: 22px;
            padding: 0 16px;
            font-size: 14px;
            outline: none;
        }

        .send-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: var(--accent-coral);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
        }

        
        .fab-next {
            position: fixed;
            bottom: 100px;
            right: 16px;
            background: var(--text-primary);
            color: white;
            padding: 12px 20px;
            border-radius: 999px;
            font-weight: 600;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            z-index: 90;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        }

        
        .icon {
            width: 20px;
            height: 20px;
            fill: currentColor;
        }

        .icon-sm {
            width: 16px;
            height: 16px;
            fill: currentColor;
        }

    </style>
</head>
<body vid="6">

    
    <div id="login-screen" class="screen" vid="7">
        <div class="brand-container flower-shape" vid="8">
            <svg viewBox="0 0 24 24" class="logo-mark" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vid="9">
                <path d="M2 12h20M12 2v20M12 12l5-5M12 12l-5 5" vid="10"></path>
                <circle cx="12" cy="12" r="9" stroke-dasharray="4 4" vid="11"></circle>
            </svg>
        </div>
        
        <h1 vid="12">Truth Seeker</h1>
        <p class="slogan" vid="13">在数字迷雾中<br vid="14">寻找唯一的真相</p>
        
        <div style="margin-top: auto; width: 100%;" vid="15">
            <button class="pill-btn btn-wechat" onclick="navigateToResult()" vid="16">
                <svg class="icon" viewBox="0 0 24 24" vid="17">
                    <path d="M12 2C6.48 2 2 5.58 2 10c0 2.42 1.34 4.58 3.41 6.02C5.24 17.5 5 19.5 5 19.5c0 0 2.2 0 3.6-1.2.78.26 1.6.42 2.4.42 5.52 0 10-3.58 10-8s-4.48-8-10-8zm0 14c-4.41 0-8-2.69-8-6s3.59-6 8-6 8 2.69 8 6-3.59 6-8 6z" vid="18"></path>
                </svg>
                微信号一键登录
            </button>
            <button class="pill-btn btn-guest" onclick="navigateToResult()" vid="19">
                暂不登录，先体验
            </button>
        </div>
    </div>

    
    <div id="result-screen" class="screen hidden" vid="20">
        <div class="nav-header" vid="21">
            <div class="nav-back" onclick="navigateToLogin()" vid="22">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" vid="23">
                    <path d="M15 18l-6-6 6-6" vid="24"></path>
                </svg>
            </div>
            <div style="font-weight:600; font-size: 16px;" vid="25">判定 #8392</div>
            <div style="width: 40px;" vid="26"></div>
        </div>

        
        <div class="content-card" vid="27">
            <div class="judgment-visual" vid="28">
                <div class="scan-overlay" vid="29"></div>
                <div class="content-image-container" vid="30">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=600&amp;q=80" class="content-image" alt="Analyzed Face" vid="31">
                </div>
                <div class="tag-pill" vid="32">
                    <span style="color:var(--accent-coral)" vid="33">●</span> 来源: Stable Diffusion v2
                </div>
            </div>

            <div class="result-header" vid="34">
                <div class="status-badge" vid="35">判定正确</div>
                <h2 style="margin: 0; font-size: 24px;" vid="36">AI 生成内容</h2>
                <p style="color: var(--text-secondary); margin-top: 8px;" vid="37">你的直觉很准，但这确实是算法的产物。</p>
            </div>

            
            <div class="stats-container" vid="38">
                <div class="stat-row" vid="39">
                    <span vid="40">全网判断为 AI</span>
                    <span style="color: var(--accent-coral)" vid="41">82%</span>
                </div>
                <div class="progress-track" vid="42">
                    <div class="progress-fill" vid="43"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: var(--text-secondary);" vid="44">
                    <span vid="45">共 12,403 人参与</span>
                    <span vid="46">18% 认为是真人</span>
                </div>
            </div>
        </div>

        
        <div class="analysis-card" vid="47">
            <div class="analysis-header" onclick="toggleAnalysis(this)" vid="48">
                <span vid="49">⚡ 官方解析</span>
                <svg class="icon-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" vid="50">
                    <path d="M19 9l-7 7-7-7" vid="51"></path>
                </svg>
            </div>
            <div class="analysis-content" vid="52">
                注意观察人物瞳孔的反光形状，以及发丝与背景交界处的模糊处理。在 Stable Diffusion v2 早期模型中，耳环的对称性也是一个典型的鉴定点...
            </div>
        </div>

        
        <div class="comments-section" vid="53">
            <div class="section-title-row" vid="54">
                <div class="section-title" vid="55">讨论 (128)</div>
                <div class="sort-toggle" vid="56">
                    <span class="sort-active" vid="57">最热</span>
                    <span vid="58">|</span>
                    <span vid="59">最新</span>
                </div>
            </div>

            
            <div class="comment-item" vid="60">
                <div class="avatar" vid="61">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&amp;fit=crop&amp;w=100&amp;q=80" vid="62">
                </div>
                <div class="comment-body" vid="63">
                    <div class="comment-meta" vid="64">
                        <span class="username" vid="65">CyberHunter <span class="pin-badge" vid="66">精选</span></span>
                        <span style="color:var(--text-secondary); font-size: 12px;" vid="67">2小时前</span>
                    </div>
                    <div class="comment-text" vid="68">
                        如果是真人，这个光影逻辑完全不对，左边的轮廓光太硬了，完全没有漫反射。
                    </div>
                    <div class="comment-actions" vid="69">
                        <div class="action-btn" vid="70">
                            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" vid="71"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" vid="72"></path></svg>
                            243
                        </div>
                        <div class="action-btn" vid="73">回复</div>
                    </div>
                </div>
            </div>

            
            <div class="comment-item" vid="74">
                <div class="avatar" vid="75">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&amp;fit=crop&amp;w=100&amp;q=80" vid="76">
                </div>
                <div class="comment-body" vid="77">
                    <div class="comment-meta" vid="78">
                        <span class="username" vid="79">Momo</span>
                        <span style="color:var(--text-secondary); font-size: 12px;" vid="80">5分钟前</span>
                    </div>
                    <div class="comment-text" vid="81">
                        我真的没看出来！现在的模型太强了，感觉以后真的分不清了😭
                    </div>
                    <div class="comment-actions" vid="82">
                        <div class="action-btn" vid="83">
                            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" vid="84"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" vid="85"></path></svg>
                            45
                        </div>
                        <div class="action-btn" vid="86">回复</div>
                    </div>
                </div>
            </div>
            
             
            <div class="comment-item" vid="87">
                <div class="avatar" vid="88">
                    <img src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&amp;fit=crop&amp;w=100&amp;q=80" vid="89">
                </div>
                <div class="comment-body" vid="90">
                    <div class="comment-meta" vid="91">
                        <span class="username" vid="92">AI_Whisperer</span>
                        <span style="color:var(--text-secondary); font-size: 12px;" vid="93">12分钟前</span>
                    </div>
                    <div class="comment-text" vid="94">
                        看眼睛！眼神光是不对的。
                    </div>
                    <div class="comment-actions" vid="95">
                        <div class="action-btn" vid="96">
                            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" vid="97"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" vid="98"></path></svg>
                            12
                        </div>
                        <div class="action-btn" vid="99">回复</div>
                    </div>
                </div>
            </div>
        </div>

        
        <div class="fab-next" vid="100">
            继续挑战
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" vid="101">
                <path d="M5 12h14M12 5l7 7-7 7" vid="102"></path>
            </svg>
        </div>

        
        <div class="bottom-bar" vid="103">
            <input type="text" class="input-field" placeholder="发表你的观点..." vid="104">
            <button class="send-btn" vid="105">
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" vid="106">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" vid="107"></path>
                </svg>
            </button>
        </div>

    </div>

    <script vid="108">
        function navigateToResult() {
            const login = document.getElementById('login-screen');
            const result = document.getElementById('result-screen');
            
            login.classList.add('hidden-left');
            result.classList.remove('hidden');
        }

        function navigateToLogin() {
            const login = document.getElementById('login-screen');
            const result = document.getElementById('result-screen');
            
            login.classList.remove('hidden-left');
            result.classList.add('hidden');
        }

        function toggleAnalysis(header) {
            
            const content = header.nextElementSibling;
            if (content.style.display === 'none') {
                content.style.display = 'block';
                header.querySelector('svg').style.transform = 'rotate(0deg)';
            } else {
                content.style.display = 'none';
                header.querySelector('svg').style.transform = 'rotate(-90deg)';
            }
        }
    </script>

</body></html>

这一段代码，请你模仿复刻其在评论页面的代码，我们也希望可以实现这样的评论页面。用户判定后会跳转到这一页，同时请你保持配色和learn-all.md文件中的配色相似，底部banner也按照learn-all.md文件中的设置来