<html lang="zh-CN" vid="0"><head vid="1">
    <meta charset="UTF-8" vid="2">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" vid="3">
    <title vid="4">Digital Truth | 迷雾侦探</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" vid="5">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" vid="6">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;500;700&amp;family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400;1,600&amp;display=swap" rel="stylesheet" vid="7">
    <style vid="8">
        :root {
            
            --bg-cream: #FDFBF7;
            --text-black: #050505;
            --accent-periwinkle: #9CABFF; 
            --accent-blue: #4FA8FF;       
            --accent-yellow: #E8D95F;     
            --accent-soft-pink: #FFC2C2;
            
            
            --radius-soft: 24px;
            --radius-pill: 999px;
            --font-display: 'Playfair Display', serif;
            --font-body: 'DM Sans', sans-serif;
            --ease-elastic: cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            background-color: var(--bg-cream);
            color: var(--text-black);
            font-family: var(--font-body);
            overflow: hidden;
            height: 100vh;
            width: 100vw;
            display: flex;
            justify-content: center;
        }

        
        .blob-object {
            position: absolute;
            border-radius: 40%;
            filter: blur(0px);
            z-index: 0;
            opacity: 0.9;
            box-shadow: 
                inset 10px 10px 20px rgba(255,255,255,0.6),
                inset -10px -20px 20px rgba(0,0,0,0.1),
                10px 20px 30px rgba(0,0,0,0.1);
        }

        .blob-blue {
            background: radial-gradient(circle at 30% 30%, #8FD3FF, var(--accent-blue));
        }

        .blob-purple {
            background: radial-gradient(circle at 30% 30%, #D4DFFF, var(--accent-periwinkle));
        }

        .blob-yellow {
            background: radial-gradient(circle at 30% 30%, #FFF8B5, var(--accent-yellow));
        }

        
        #app {
            width: 100%;
            height: 100%;
            max-width: 450px;
            position: relative;
            background: var(--bg-cream);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        
        h1, h2, h3 {
            font-family: var(--font-display);
            font-weight: 800;
            line-height: 0.85;
            letter-spacing: -0.03em;
        }

        .display-huge {
            font-size: 4.5rem;
            color: var(--text-black);
            position: relative;
            z-index: 2;
        }
        
        .display-huge em {
            font-weight: 400;
            font-style: italic;
        }

        .label-text {
            font-family: var(--font-body);
            font-weight: 500;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 8px;
            display: block;
        }

        
        .view {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.6s var(--ease-elastic), transform 0.6s var(--ease-elastic);
            transform: scale(0.95);
            padding: 24px;
            display: flex;
            flex-direction: column;
            z-index: 10;
        }

        .view.active {
            opacity: 1;
            pointer-events: auto;
            transform: scale(1);
        }

        
        #view-login {
            justify-content: space-between;
            padding-top: 80px;
            padding-bottom: 40px;
        }

        .login-hero {
            position: relative;
            z-index: 2;
        }

        .login-deco {
            position: absolute;
            width: 200px;
            height: 200px;
            top: 20%;
            right: -40px;
            animation: float 6s ease-in-out infinite;
        }

        .btn-group {
            display: flex;
            flex-direction: column;
            gap: 16px;
            z-index: 2;
        }

        .btn-primary {
            background: var(--text-black);
            color: var(--bg-cream);
            height: 64px;
            border-radius: var(--radius-pill);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-body);
            font-weight: 700;
            font-size: 1.1rem;
            border: none;
            cursor: pointer;
            transition: transform 0.2s;
            position: relative;
            overflow: hidden;
        }

        .btn-primary:active {
            transform: scale(0.96);
        }

        .btn-secondary {
            background: transparent;
            color: var(--text-black);
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-body);
            font-weight: 500;
            font-size: 0.9rem;
            border: 1px solid rgba(0,0,0,0.1);
            border-radius: var(--radius-pill);
            cursor: pointer;
        }

        .legal-text {
            text-align: center;
            font-size: 0.7rem;
            color: rgba(0,0,0,0.4);
            margin-top: 12px;
        }

        
        #view-game {
            padding-top: 60px;
            padding-bottom: 100px;
        }

        .game-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 20px;
        }

        .streak-pill {
            background: #fff;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .card-stack {
            flex: 1;
            position: relative;
            width: 100%;
        }

        .game-card {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #fff;
            border-radius: 32px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            transform-origin: 50% 100%;
            transition: transform 0.4s var(--ease-elastic), opacity 0.3s;
            display: flex;
            flex-direction: column;
        }

        .card-media {
            flex: 1;
            background: #eee;
            position: relative;
            overflow: hidden;
        }

        .card-media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .card-content {
            padding: 24px;
        }

        .card-text {
            font-size: 1.1rem;
            line-height: 1.5;
            color: #333;
        }

        .interaction-zone {
            position: absolute;
            bottom: 24px;
            left: 24px;
            right: 24px;
            display: flex;
            justify-content: space-between;
            z-index: 20;
        }

        
        .vote-btn {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-display);
            font-style: italic;
            font-weight: 700;
            font-size: 1.2rem;
            color: var(--text-black);
            cursor: pointer;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        
        .vote-btn:active {
            transform: scale(0.9);
        }

        .btn-ai {
            background: radial-gradient(circle at 30% 30%, #E0E0E0, #A0A0A0);
            box-shadow: inset 5px 5px 10px rgba(255,255,255,0.8), inset -5px -5px 10px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .btn-human {
            background: radial-gradient(circle at 30% 30%, #FFF5D0, var(--accent-yellow));
            box-shadow: inset 5px 5px 10px rgba(255,255,255,0.8), inset -5px -5px 10px rgba(0,0,0,0.1), 0 10px 20px rgba(232, 217, 95, 0.3);
        }

        
        .result-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(253, 251, 247, 0.95);
            backdrop-filter: blur(10px);
            z-index: 50;
            display: none; 
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px;
            text-align: center;
        }

        .result-verdict {
            font-size: 4rem;
            font-family: var(--font-display);
            font-weight: 800;
            margin-bottom: 10px;
            opacity: 0;
            transform: translateY(20px);
            animation: slideUp 0.6s var(--ease-elastic) forwards;
        }

        .result-stats {
            width: 100%;
            height: 8px;
            background: #eee;
            border-radius: 4px;
            margin: 20px 0;
            overflow: hidden;
            position: relative;
        }
        
        .stat-bar-fill {
            height: 100%;
            background: var(--text-black);
            width: 0%;
            transition: width 1s ease-out;
        }

        .comment-section {
            width: 100%;
            background: #fff;
            padding: 20px;
            border-radius: 20px;
            margin-top: 20px;
            text-align: left;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }

        
        #view-rank {
            padding-top: 70px;
            padding-bottom: 100px;
        }

        .rank-list {
            margin-top: 20px;
            overflow-y: auto;
            padding-bottom: 20px;
        }

        .rank-item {
            display: flex;
            align-items: center;
            background: #fff;
            padding: 16px;
            margin-bottom: 12px;
            border-radius: 16px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.02);
        }

        .rank-num {
            font-family: var(--font-display);
            font-size: 2rem;
            font-weight: 700;
            margin-right: 16px;
            font-style: italic;
            width: 40px;
            text-align: center;
        }

        .rank-avatar {
            width: 48px;
            height: 48px;
            background: #ddd;
            border-radius: 50%;
            margin-right: 12px;
        }

        .rank-info h4 {
            font-size: 1rem;
            font-weight: 700;
        }
        
        .rank-info p {
            font-size: 0.8rem;
            color: #666;
        }

        
        #view-profile {
            padding-top: 60px;
        }

        .profile-header {
            display: flex;
            align-items: center;
            margin-bottom: 40px;
        }

        .profile-pic-large {
            width: 100px;
            height: 100px;
            border-radius: 30%; 
            background: #ccc;
            margin-right: 20px;
            background-image: url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200');
            background-size: cover;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: #fff;
            padding: 20px;
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 140px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 20px rgba(0,0,0,0.03);
        }

        .stat-card.blue { background: #E6F4FF; }
        .stat-card.purple { background: #F0F4FF; }

        .stat-val {
            font-family: var(--font-display);
            font-size: 2.5rem;
            font-weight: 700;
        }

        
        .tab-bar {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255,255,255,0.9);
            backdrop-filter: blur(20px);
            padding: 8px;
            border-radius: 50px;
            display: flex;
            gap: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            z-index: 100;
        }

        .tab-item {
            padding: 12px 24px;
            border-radius: 40px;
            font-size: 0.9rem;
            font-weight: 600;
            color: #999;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .tab-item.active {
            background: var(--text-black);
            color: #fff;
        }

        
        @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(0deg); }
        }

        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        
        .u-mt-4 { margin-top: 16px; }
        .u-flex-center { display: flex; align-items: center; justify-content: center; }
        .tag {
            display: inline-block;
            padding: 4px 12px;
            border: 1px solid #000;
            border-radius: 20px;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 8px;
        }

    </style>
</head>
<body vid="9">

<div id="app" vid="10">
    
    
    <div id="view-login" class="view active" vid="11">
        <div class="blob-object blob-purple login-deco" vid="12"></div>
        
        <div class="login-hero" vid="13">
            <span class="label-text" vid="14">Digital Truth Finder</span>
            <h1 class="display-huge" vid="15">Truth<br vid="16"><em vid="17">or</em><br vid="18">Machine?</h1>
            <p style="margin-top: 20px; font-size: 1.1rem; line-height: 1.5; color: #555;" vid="19">
                在数字迷雾中，<br vid="20">寻找唯一的真相。
            </p>
        </div>

        <div class="btn-group" vid="21">
            <button class="btn-primary" onclick="navigateTo('game')" vid="22">
                <span style="margin-right:8px" vid="23">●</span> 微信一键登录
            </button>
            <button class="btn-secondary" onclick="navigateTo('game')" vid="24">暂不登录，先体验</button>
            <div class="legal-text" vid="25">登录即代表同意《用户协议》与《隐私政策》</div>
        </div>
    </div>

    
    <div id="view-game" class="view" vid="26">
        <div class="blob-object blob-blue" style="top: -50px; left: -50px; width: 150px; height: 150px;" vid="27"></div>

        <div class="game-header" vid="28">
            <div class="u-flex-center" vid="29">
                <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800;" vid="30">判定</div>
            </div>
            <div class="streak-pill" vid="31">🔥 连胜: 12</div>
        </div>

        <div class="card-stack" vid="32">
            
            <div class="game-card" style="transform: scale(0.95) translateY(20px); z-index: 1;" vid="33">
                <div class="card-media" style="background: #e0e0e0;" vid="34"></div>
            </div>

            
            <div class="game-card" id="active-card" style="z-index: 2;" vid="35">
                <div class="card-media" vid="36">
                    <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&amp;fit=crop&amp;q=80&amp;w=800" alt="Content" vid="37">
                    <div style="position: absolute; top: 16px; left: 16px;" vid="38">
                        <span class="tag" style="background: white;" vid="39">Short Video</span>
                    </div>
                </div>
                <div class="card-content" vid="40">
                    <p class="card-text" vid="41">"凌晨三点的上海，街道空无一人，只有路灯在低语。这张照片是用胶片相机拍的，没有任何后期处理。"</p>
                </div>
            </div>
        </div>

        <div class="interaction-zone" vid="42">
            <button class="vote-btn btn-ai" onclick="submitVote('AI')" vid="43">AI</button>
            <button class="vote-btn btn-human" onclick="submitVote('Human')" vid="44">真人</button>
        </div>

        
        <div class="result-overlay" id="result-overlay" vid="45">
            <div class="blob-object blob-yellow" style="top: 20%; right: -20px; width: 120px; height: 120px;" vid="46"></div>
            <span class="label-text" vid="47">System Analysis</span>
            <div class="result-verdict" id="verdict-text" vid="48">AI 生成</div>
            <div style="font-size: 1.2rem; font-weight: 500;" vid="49">全网判定比例</div>
            
            <div class="result-stats" vid="50">
                <div class="stat-bar-fill" id="stat-bar" style="background: var(--accent-blue);" vid="51"></div>
            </div>
            <div style="display: flex; justify-content: space-between; width: 100%; font-size: 0.8rem; font-weight: 700;" vid="52">
                <span vid="53">AI: 84%</span>
                <span vid="54">Human: 16%</span>
            </div>

            <div class="comment-section" vid="55">
                <div style="font-weight: 700; margin-bottom: 8px;" vid="56">解析说明</div>
                <p style="font-size: 0.9rem; color: #555; line-height: 1.5;" vid="57">光源逻辑存在明显错误，路灯倒影与实际光源位置不符。典型的 Diffusion 模型伪影。</p>
            </div>

            <button class="btn-primary u-mt-4" style="width: 100%" onclick="resetCard()" vid="58">继续挑战</button>
        </div>
    </div>

    
    <div id="view-rank" class="view" vid="59">
        <h2 style="font-size: 2.5rem; margin-bottom: 20px;" vid="60">赛博侦探<br vid="61"><em vid="62">排行榜</em></h2>
        
        <div class="rank-list" vid="63">
            
            <div class="rank-item" style="border: 2px solid var(--text-black);" vid="64">
                <div class="rank-num" vid="65">1</div>
                <div class="rank-avatar" style="background: var(--accent-yellow)" vid="66"></div>
                <div class="rank-info" vid="67">
                    <h4 vid="68">Cyber_Monk</h4>
                    <p vid="69">准确率 98% • Lv.42</p>
                </div>
            </div>
            
            <div class="rank-item" vid="70">
                <div class="rank-num" vid="71">2</div>
                <div class="rank-avatar" style="background: var(--accent-periwinkle)" vid="72"></div>
                <div class="rank-info" vid="73">
                    <h4 vid="74">Pixel_Hunter</h4>
                    <p vid="75">准确率 96% • Lv.39</p>
                </div>
            </div>
             
             <div class="rank-item" vid="76">
                <div class="rank-num" vid="77">3</div>
                <div class="rank-avatar" style="background: var(--accent-blue)" vid="78"></div>
                <div class="rank-info" vid="79">
                    <h4 vid="80">Neo_Matrix</h4>
                    <p vid="81">准确率 94% • Lv.35</p>
                </div>
            </div>
             
             <div class="rank-item" vid="82">
                <div class="rank-num" vid="83">4</div>
                <div class="rank-avatar" style="background: #ccc" vid="84"></div>
                <div class="rank-info" vid="85">
                    <h4 vid="86">User_8821</h4>
                    <p vid="87">准确率 91% • Lv.30</p>
                </div>
            </div>
        </div>
    </div>

    
    <div id="view-profile" class="view" vid="88">
        <div class="blob-object blob-yellow" style="top: -60px; right: -60px; width: 200px; height: 200px;" vid="89"></div>

        <div class="profile-header" vid="90">
            <div class="profile-pic-large" vid="91"></div>
            <div vid="92">
                <h2 style="font-size: 2rem;" vid="93">Alex<br vid="94">Chen</h2>
                <span class="tag u-mt-4" vid="95">Level 12 观察者</span>
            </div>
        </div>

        <div class="stats-grid" vid="96">
            <div class="stat-card blue" vid="97">
                <span class="label-text" vid="98">总判定</span>
                <span class="stat-val" vid="99">1,204</span>
                <div style="font-size: 2rem; position: absolute; bottom: 10px; right: 10px;" vid="100">👁️</div>
            </div>
            <div class="stat-card purple" vid="101">
                <span class="label-text" vid="102">准确率</span>
                <span class="stat-val" vid="103">87%</span>
                <div style="font-size: 2rem; position: absolute; bottom: 10px; right: 10px;" vid="104">🎯</div>
            </div>
        </div>

        <h3 style="margin-bottom: 16px;" vid="105">功能入口</h3>
        <div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px;" vid="106">
            <div style="min-width: 100px; height: 100px; background: #fff; border-radius: 20px; display: flex; align-items: center; justify-content: center; flex-direction: column; font-weight: 600; font-size: 0.9rem;" vid="107">
                <span style="font-size: 1.5rem; margin-bottom: 8px;" vid="108">🏆</span>
                我的成就
            </div>
            <div style="min-width: 100px; height: 100px; background: #fff; border-radius: 20px; display: flex; align-items: center; justify-content: center; flex-direction: column; font-weight: 600; font-size: 0.9rem;" vid="109">
                <span style="font-size: 1.5rem; margin-bottom: 8px;" vid="110">📜</span>
                判定历史
            </div>
            <div style="min-width: 100px; height: 100px; background: #fff; border-radius: 20px; display: flex; align-items: center; justify-content: center; flex-direction: column; font-weight: 600; font-size: 0.9rem;" vid="111">
                <span style="font-size: 1.5rem; margin-bottom: 8px;" vid="112">⚙️</span>
                设置
            </div>
        </div>
    </div>

    
    <div class="tab-bar" id="tab-bar" style="display: none;" vid="113">
        <div class="tab-item active" onclick="switchTab('game', this)" vid="114">判定</div>
        <div class="tab-item" onclick="switchTab('rank', this)" vid="115">榜单</div>
        <div class="tab-item" onclick="switchTab('profile', this)" vid="116">我的</div>
    </div>

</div>

<script vid="117">
    
    function navigateTo(viewId) {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        document.getElementById('view-' + viewId).classList.add('active');
        
        if (viewId !== 'login') {
            document.getElementById('tab-bar').style.display = 'flex';
        } else {
            document.getElementById('tab-bar').style.display = 'none';
        }
    }

    function switchTab(viewId, el) {
        
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('view-' + viewId).classList.add('active');
        
        
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
    }

    
    function submitVote(type) {
        const card = document.getElementById('active-card');
        const overlay = document.getElementById('result-overlay');
        const verdict = document.getElementById('verdict-text');
        const bar = document.getElementById('stat-bar');

        
        const rotate = type === 'AI' ? -10 : 10;
        const x = type === 'AI' ? -50 : 50;
        
        
        card.style.transform = `translateX(${x}px) rotate(${rotate}deg)`;
        
        setTimeout(() => {
            
            overlay.style.display = 'flex';
            verdict.innerText = type === 'AI' ? 'Correct!' : 'Wrong!';
            verdict.style.color = type === 'AI' ? 'var(--accent-blue)' : '#FF6B6B';
            
            
            setTimeout(() => {
                bar.style.width = '84%';
            }, 100);
        }, 300);
    }

    function resetCard() {
        const card = document.getElementById('active-card');
        const overlay = document.getElementById('result-overlay');
        const bar = document.getElementById('stat-bar');

        overlay.style.display = 'none';
        bar.style.width = '0%';
        
        
        card.style.transition = 'none';
        card.style.transform = 'scale(0.5) translateY(50px)';
        card.style.opacity = '0';
        
        setTimeout(() => {
            card.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s';
            card.style.transform = 'scale(1) translateY(0)';
            card.style.opacity = '1';
        }, 50);
    }
</script>


</body></html>
我们学习这个界面的判定界面，学习其动画同时请你保持配色和learn-all.md文件中的配色相似，注意这个界面的banner页面和判定的两个按钮出现了重合，请你注意，。banner页也按照learn-all.md文件中的设置来