<html lang="zh-CN" vid="0"><head vid="1">
    <meta charset="UTF-8" vid="2">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" vid="3">
    <title vid="4">Truth Seeker | AI vs Human</title>
    <script src="https://cdn.tailwindcss.com" vid="5"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com" vid="6">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" vid="7">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;500;700&amp;family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&amp;family=Noto+Serif+SC:wght@400;600;700&amp;display=swap" rel="stylesheet" vid="8">
    <script src="https://unpkg.com/lucide@latest" vid="9"></script>
    <style vid="10">
        

        :root {
            --bg-cream: #F9F6F0;
            --text-dark: #2A2222;
            --primary-burgundy: #591C2E;
            --accent-rose: #E68D9F;
            --accent-rose-light: #FCEEF1;
            --accent-gold: #D4AF37;
            --ui-gray: #E5E0D8;
        }

        body {
            background-color: var(--bg-cream);
            color: var(--text-dark);
            font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
        }

        .font-serif-display {
            font-family: 'Playfair Display', 'Noto Serif SC', serif;
        }

        
        .arch-container {
            border-radius: 12rem 12rem 0 0;
            overflow: hidden;
            position: relative;
        }

        
        .ribbon-tag {
            position: relative;
            background: var(--primary-burgundy);
            color: white;
            clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%);
        }

        
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        
        .game-card {
            transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s;
            transform-origin: bottom center;
            box-shadow: 0 20px 40px -10px rgba(89, 28, 46, 0.15);
        }
        
        
        .particle {
            position: absolute;
            background: var(--accent-rose);
            opacity: 0.2;
            border-radius: 50%;
            filter: blur(8px);
        }

        
        .nav-item.active {
            color: var(--primary-burgundy);
        }
        .nav-item.active::after {
            content: '';
            display: block;
            width: 4px;
            height: 4px;
            background: var(--primary-burgundy);
            border-radius: 50%;
            margin: 4px auto 0;
        }
    </style>
</head>
<body class="h-screen w-screen relative overflow-hidden flex flex-col" vid="11">

    
    <div id="splash-screen" class="fixed inset-0 z-50 bg-[#F9F6F0] flex flex-col items-center justify-between p-6 transition-opacity duration-700" vid="12">
        
        <div class="particle w-64 h-64 -top-20 -left-20" vid="13"></div>
        <div class="particle w-48 h-48 bottom-40 -right-10 bg-[#D4AF37]" vid="14"></div>

        <div class="mt-20 text-center z-10" vid="15">
            <h1 class="font-serif-display text-6xl mb-2 text-[#591C2E]" vid="16">truth<span class="italic font-light" vid="17">seek</span></h1>
            <p class="font-serif-display text-lg text-gray-500 tracking-wide mt-4" vid="18">在数字迷雾中，<br vid="19">寻找唯一的真相</p>
        </div>

        
        <div class="w-full max-w-xs flex-1 my-8 relative" vid="20">
            <div class="arch-container w-full h-full bg-white shadow-2xl relative" vid="21">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&amp;w=1000&amp;auto=format&amp;fit=crop" class="w-full h-full object-cover opacity-90" alt="Mystery" vid="22">
                <div class="absolute inset-0 bg-gradient-to-b from-transparent to-[#591C2E]/30" vid="23"></div>
            </div>
            
            <div class="absolute -bottom-4 -right-4 w-24 h-32 bg-[#F9F6F0] border border-[#E5E0D8] rounded-lg shadow-lg rotate-12 p-1 flex items-center justify-center animate-float" style="animation-delay: 1s;" vid="24">
                <div class="w-full h-full border border-[#E5E0D8] flex items-center justify-center" vid="25">
                    <i data-lucide="eye" class="text-[#591C2E] w-8 h-8" vid="26"></i>
                </div>
            </div>
        </div>

        <div class="w-full max-w-xs mb-10 space-y-4 z-10" vid="27">
            <button onclick="enterApp()" class="w-full bg-[#591C2E] text-[#F9F6F0] py-4 rounded-xl font-medium text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2" vid="28">
                <i data-lucide="message-circle" class="w-5 h-5" vid="29"></i> 微信号一键登录
            </button>
            <button onclick="enterApp()" class="w-full bg-transparent border border-[#591C2E]/20 text-[#591C2E] py-4 rounded-xl font-medium text-lg active:bg-[#591C2E]/5 transition-colors" vid="30">
                暂不登录，先体验
            </button>
            <p class="text-xs text-center text-gray-400 mt-4" vid="31">登录即代表同意 <span class="underline" vid="32">用户协议</span> 与 <span class="underline" vid="33">隐私条款</span></p>
        </div>
    </div>

    
    <main id="app-container" class="flex-1 relative overflow-hidden hidden opacity-0 transition-opacity duration-700" vid="34">
        
        
        <header class="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center bg-gradient-to-b from-[#F9F6F0] via-[#F9F6F0]/90 to-transparent" vid="35">
            <div class="flex items-center gap-2" vid="36">
                <div class="w-8 h-8 rounded-full bg-[#591C2E] text-white flex items-center justify-center font-serif-display font-bold" vid="37">T</div>
                <span class="font-serif-display font-bold text-xl text-[#591C2E]" vid="38">truthseek</span>
            </div>
            <div class="flex items-center gap-3" vid="39">
                <div class="bg-white px-3 py-1 rounded-full border border-gray-200 flex items-center gap-2 shadow-sm" vid="40">
                    <i data-lucide="flame" class="w-4 h-4 text-[#E68D9F]" vid="41"></i>
                    <span class="text-xs font-bold text-[#591C2E]" vid="42">12</span>
                </div>
            </div>
        </header>

        
        <section id="view-game" class="absolute inset-0 pt-20 pb-24 px-4 flex flex-col items-center justify-center" vid="43">
            
            
            <div class="relative w-full max-w-md h-[65vh] perspective-1000" vid="44">
                
                
                <div class="absolute top-4 left-0 right-0 h-full bg-[#E5E0D8] rounded-[3rem] scale-95 opacity-50 -z-10" vid="45"></div>

                
                <div id="active-card" class="game-card w-full h-full bg-white rounded-[3rem] border border-white shadow-xl overflow-hidden relative cursor-grab active:cursor-grabbing" vid="46">
                    
                    
                    <div class="h-full w-full relative" vid="47">
                        
                        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&amp;w=1000&amp;auto=format&amp;fit=crop" class="w-full h-full object-cover pointer-events-none" alt="Subject" vid="48">
                        
                        
                        <div class="absolute inset-0 bg-gradient-to-t from-[#2A2222]/90 via-transparent to-transparent pointer-events-none" vid="49"></div>

                        
                        <div class="absolute bottom-0 left-0 right-0 p-8 pointer-events-none" vid="50">
                            <div class="flex items-center gap-2 mb-2" vid="51">
                                <span class="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white uppercase tracking-widest font-bold" vid="52">Unknown Source</span>
                            </div>
                            <p class="text-white font-serif-display text-2xl leading-tight" vid="53">
                                "这幅画作展现了完美的落日光影，每一处笔触都充满了情感。"
                            </p>
                        </div>

                        
                        <div id="result-overlay" class="absolute inset-0 bg-[#F9F6F0] z-20 transform translate-y-full transition-transform duration-500 flex flex-col p-6" vid="54">
                            <div class="flex-1 flex flex-col items-center justify-center text-center" vid="55">
                                <div class="w-20 h-20 bg-[#E68D9F]/20 rounded-full flex items-center justify-center mb-4 text-[#591C2E]" vid="56">
                                    <i data-lucide="bot" class="w-10 h-10" vid="57"></i>
                                </div>
                                <h2 class="font-serif-display text-3xl text-[#591C2E] mb-2" vid="58">是 AI 生成的！</h2>
                                <p class="text-gray-500 mb-6" vid="59">Midjourney v6 • 提示词解析</p>
                                
                                
                                <div class="w-full bg-gray-100 rounded-full h-12 flex relative overflow-hidden mb-6" vid="60">
                                    <div class="bg-[#591C2E] h-full flex items-center justify-start px-4 text-white text-xs font-bold w-[82%]" vid="61">
                                        82% 认为是AI
                                    </div>
                                    <div class="absolute right-4 top-0 bottom-0 flex items-center text-gray-400 text-xs" vid="62">
                                        18% 误判
                                    </div>
                                </div>

                                <div class="w-full bg-white border border-gray-100 p-4 rounded-xl text-left shadow-sm mb-6" vid="63">
                                    <p class="text-sm text-gray-600 leading-relaxed" vid="64">
                                        <span class="font-bold text-[#591C2E]" vid="65">侦探笔记：</span> 光影虽然逼真，但请注意左下角的手指关节结构不自然，且背景中的建筑物透视存在微小扭曲。
                                    </p>
                                </div>
                            </div>
                            
                            <button onclick="resetCard()" class="w-full bg-[#591C2E] text-white py-4 rounded-xl font-medium shadow-lg hover:bg-[#451422] transition-colors" vid="66">
                                继续挑战
                            </button>
                        </div>
                    </div>

                    
                    <div id="indicator-ai" class="absolute top-10 right-10 opacity-0 transform rotate-12 border-4 border-[#E68D9F] text-[#E68D9F] px-4 py-2 rounded-lg font-bold text-xl uppercase tracking-widest bg-white/10 backdrop-blur pointer-events-none" vid="67">
                        AI 伪造
                    </div>
                    <div id="indicator-human" class="absolute top-10 left-10 opacity-0 transform -rotate-12 border-4 border-[#D4AF37] text-[#D4AF37] px-4 py-2 rounded-lg font-bold text-xl uppercase tracking-widest bg-white/10 backdrop-blur pointer-events-none" vid="68">
                        真人创作
                    </div>
                </div>
            </div>

            
            <div class="w-full max-w-md flex justify-between gap-4 mt-8 px-4" vid="69">
                <button onclick="simulateSwipe('left')" class="flex-1 bg-white border border-[#E68D9F]/30 text-[#E68D9F] py-4 rounded-2xl shadow-sm hover:bg-[#E68D9F] hover:text-white transition-all flex flex-col items-center gap-1 group" vid="70">
                    <i data-lucide="cpu" class="w-6 h-6 transition-transform group-hover:scale-110" vid="71"></i>
                    <span class="text-xs font-bold tracking-widest" vid="72">该是人机！</span>
                </button>
                <button onclick="simulateSwipe('right')" class="flex-1 bg-white border border-[#D4AF37]/30 text-[#D4AF37] py-4 rounded-2xl shadow-sm hover:bg-[#D4AF37] hover:text-white transition-all flex flex-col items-center gap-1 group" vid="73">
                    <i data-lucide="fingerprint" class="w-6 h-6 transition-transform group-hover:scale-110" vid="74"></i>
                    <span class="text-xs font-bold tracking-widest" vid="75">包真人的！</span>
                </button>
            </div>
        </section>

        
        <section id="view-leaderboard" class="absolute inset-0 pt-24 pb-24 px-6 overflow-y-auto hidden no-scrollbar" vid="76">
            <h2 class="font-serif-display text-4xl text-[#591C2E] mb-6" vid="77">赛博侦探榜</h2>
            
            
            <div class="flex justify-center items-end gap-4 mb-10 h-48" vid="78">
                
                <div class="w-1/3 flex flex-col items-center" vid="79">
                    <div class="w-16 h-16 rounded-full border-2 border-[#E5E0D8] p-0.5 mb-2 overflow-hidden bg-white" vid="80">
                        <img src="https://i.pravatar.cc/150?img=32" class="w-full h-full rounded-full object-cover" vid="81">
                    </div>
                    <div class="text-center" vid="82">
                        <div class="font-bold text-sm" vid="83">PixelHunter</div>
                        <div class="text-xs text-gray-400" vid="84">Lv.28</div>
                    </div>
                    <div class="w-full bg-[#E5E0D8] h-24 mt-2 rounded-t-lg relative" vid="85">
                        <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 text-xl font-serif-display font-bold text-gray-400" vid="86">2</div>
                    </div>
                </div>
                
                <div class="w-1/3 flex flex-col items-center z-10" vid="87">
                    <div class="absolute -mt-8 text-[#D4AF37]" vid="88"><i data-lucide="crown" class="w-6 h-6 fill-current" vid="89"></i></div>
                    <div class="w-20 h-20 rounded-full border-2 border-[#D4AF37] p-0.5 mb-2 overflow-hidden bg-white shadow-lg" vid="90">
                        <img src="https://i.pravatar.cc/150?img=12" class="w-full h-full rounded-full object-cover" vid="91">
                    </div>
                    <div class="text-center" vid="92">
                        <div class="font-bold text-sm text-[#591C2E]" vid="93">NeoTruth</div>
                        <div class="text-xs text-[#D4AF37] font-bold" vid="94">Lv.42</div>
                    </div>
                    <div class="w-full bg-gradient-to-b from-[#D4AF37] to-[#B59223] h-32 mt-2 rounded-t-lg shadow-lg relative flex items-center justify-center" vid="95">
                        <span class="text-4xl font-serif-display font-bold text-white" vid="96">1</span>
                    </div>
                </div>
                
                <div class="w-1/3 flex flex-col items-center" vid="97">
                    <div class="w-16 h-16 rounded-full border-2 border-[#C88A66] p-0.5 mb-2 overflow-hidden bg-white" vid="98">
                        <img src="https://i.pravatar.cc/150?img=44" class="w-full h-full rounded-full object-cover" vid="99">
                    </div>
                    <div class="text-center" vid="100">
                        <div class="font-bold text-sm" vid="101">Glitch00</div>
                        <div class="text-xs text-gray-400" vid="102">Lv.25</div>
                    </div>
                    <div class="w-full bg-[#C88A66] h-20 mt-2 rounded-t-lg relative" vid="103">
                        <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 text-xl font-serif-display font-bold text-white/80" vid="104">3</div>
                    </div>
                </div>
            </div>

            
            <div class="space-y-3" vid="105">
                <div class="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100" vid="106">
                    <span class="font-serif-display font-bold text-gray-300 w-6" vid="107">04</span>
                    <img src="https://i.pravatar.cc/150?img=5" class="w-10 h-10 rounded-full bg-gray-200" vid="108">
                    <div class="flex-1" vid="109">
                        <div class="font-bold text-sm" vid="110">VoidWalker</div>
                        <div class="text-xs text-gray-400" vid="111">准确率 92%</div>
                    </div>
                    <div class="text-right" vid="112">
                        <div class="text-xs font-bold text-[#591C2E]" vid="113">2,401</div>
                        <div class="text-[10px] text-gray-400" vid="114">题数</div>
                    </div>
                </div>
                <div class="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100" vid="115">
                    <span class="font-serif-display font-bold text-gray-300 w-6" vid="116">05</span>
                    <img src="https://i.pravatar.cc/150?img=9" class="w-10 h-10 rounded-full bg-gray-200" vid="117">
                    <div class="flex-1" vid="118">
                        <div class="font-bold text-sm" vid="119">Satoshi_AI</div>
                        <div class="text-xs text-gray-400" vid="120">准确率 89%</div>
                    </div>
                    <div class="text-right" vid="121">
                        <div class="text-xs font-bold text-[#591C2E]" vid="122">1,982</div>
                        <div class="text-[10px] text-gray-400" vid="123">题数</div>
                    </div>
                </div>
                 <div class="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100" vid="124">
                    <span class="font-serif-display font-bold text-gray-300 w-6" vid="125">06</span>
                    <img src="https://i.pravatar.cc/150?img=11" class="w-10 h-10 rounded-full bg-gray-200" vid="126">
                    <div class="flex-1" vid="127">
                        <div class="font-bold text-sm" vid="128">BladeRunner</div>
                        <div class="text-xs text-gray-400" vid="129">准确率 88%</div>
                    </div>
                    <div class="text-right" vid="130">
                        <div class="text-xs font-bold text-[#591C2E]" vid="131">1,850</div>
                        <div class="text-[10px] text-gray-400" vid="132">题数</div>
                    </div>
                </div>
            </div>
        </section>

        
        <section id="view-profile" class="absolute inset-0 pt-24 pb-24 px-6 overflow-y-auto hidden no-scrollbar" vid="133">
            
            
            <div class="flex flex-col items-center mb-8" vid="134">
                <div class="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 relative" vid="135">
                    <img src="https://i.pravatar.cc/150?img=68" class="w-full h-full object-cover" vid="136">
                    <div class="absolute bottom-0 left-0 right-0 bg-[#591C2E] text-white text-[10px] text-center py-0.5" vid="137">LV. 12</div>
                </div>
                <h2 class="font-serif-display text-2xl text-[#591C2E]" vid="138">Detect_X</h2>
                <div class="w-48 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden" vid="139">
                    <div class="bg-[#D4AF37] h-full w-2/3" vid="140"></div>
                </div>
                <p class="text-xs text-gray-400 mt-1" vid="141">距下一级还需 340 EXP</p>
            </div>

            
            <div class="grid grid-cols-3 gap-3 mb-8" vid="142">
                <div class="bg-white p-4 rounded-2xl shadow-sm text-center border border-gray-50" vid="143">
                    <div class="text-2xl font-serif-display font-bold text-[#591C2E]" vid="144">412</div>
                    <div class="text-[10px] text-gray-400 uppercase tracking-wide" vid="145">总判定</div>
                </div>
                <div class="bg-white p-4 rounded-2xl shadow-sm text-center border border-gray-50" vid="146">
                    <div class="text-2xl font-serif-display font-bold text-[#D4AF37]" vid="147">94%</div>
                    <div class="text-[10px] text-gray-400 uppercase tracking-wide" vid="148">准确率</div>
                </div>
                <div class="bg-white p-4 rounded-2xl shadow-sm text-center border border-gray-50" vid="149">
                    <div class="text-2xl font-serif-display font-bold text-[#E68D9F]" vid="150">8</div>
                    <div class="text-[10px] text-gray-400 uppercase tracking-wide" vid="151">连胜</div>
                </div>
            </div>

            
            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-2 mb-6" vid="152">
                <div class="grid grid-cols-4 gap-2" vid="153">
                    <button class="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-gray-50 transition-colors" vid="154">
                        <div class="w-10 h-10 rounded-full bg-[#F9F6F0] flex items-center justify-center text-[#591C2E]" vid="155">
                            <i data-lucide="award" class="w-5 h-5" vid="156"></i>
                        </div>
                        <span class="text-[10px] font-bold text-gray-500" vid="157">成就</span>
                    </button>
                    <button class="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-gray-50 transition-colors" vid="158">
                        <div class="w-10 h-10 rounded-full bg-[#F9F6F0] flex items-center justify-center text-[#591C2E]" vid="159">
                            <i data-lucide="bar-chart-2" class="w-5 h-5" vid="160"></i>
                        </div>
                        <span class="text-[10px] font-bold text-gray-500" vid="161">数据</span>
                    </button>
                    <button class="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-gray-50 transition-colors" vid="162">
                        <div class="w-10 h-10 rounded-full bg-[#F9F6F0] flex items-center justify-center text-[#591C2E]" vid="163">
                            <i data-lucide="id-card" class="w-5 h-5" vid="164"></i>
                        </div>
                        <span class="text-[10px] font-bold text-gray-500" vid="165">名片</span>
                    </button>
                    <button class="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-gray-50 transition-colors" vid="166">
                        <div class="w-10 h-10 rounded-full bg-[#F9F6F0] flex items-center justify-center text-[#591C2E]" vid="167">
                            <i data-lucide="settings" class="w-5 h-5" vid="168"></i>
                        </div>
                        <span class="text-[10px] font-bold text-gray-500" vid="169">设置</span>
                    </button>
                </div>
            </div>

            
            <h3 class="font-serif-display text-lg mb-4 pl-1" vid="170">近期判定</h3>
            <div class="space-y-3 pb-8" vid="171">
                <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100" vid="172">
                    <div class="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden" vid="173">
                        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&amp;w=100" class="w-full h-full object-cover" vid="174">
                    </div>
                    <div class="flex-1" vid="175">
                        <div class="text-sm font-bold text-gray-800" vid="176">迷雾中的少女</div>
                        <div class="text-[10px] text-gray-400" vid="177">2分钟前 • 图片</div>
                    </div>
                    <div class="flex flex-col items-end" vid="178">
                        <i data-lucide="check-circle-2" class="w-5 h-5 text-green-500 mb-1" vid="179"></i>
                        <span class="text-[10px] font-bold text-gray-400" vid="180">成功</span>
                    </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 opacity-70" vid="181">
                    <div class="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden" vid="182">
                        <img src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&amp;w=100" class="w-full h-full object-cover" vid="183">
                    </div>
                    <div class="flex-1" vid="184">
                        <div class="text-sm font-bold text-gray-800" vid="185">赛博朋克街道</div>
                        <div class="text-[10px] text-gray-400" vid="186">15分钟前 • 视频</div>
                    </div>
                    <div class="flex flex-col items-end" vid="187">
                        <i data-lucide="x-circle" class="w-5 h-5 text-red-400 mb-1" vid="188"></i>
                        <span class="text-[10px] font-bold text-gray-400" vid="189">失败</span>
                    </div>
                </div>
            </div>
        </section>

        
        <nav class="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 pb-8 pt-4 px-8 flex justify-between items-end z-40 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.03)]" vid="190">
            <button onclick="switchTab('game')" id="nav-game" class="nav-item active flex-1 flex flex-col items-center gap-1 text-gray-400 transition-colors" vid="191">
                <i data-lucide="eye" class="w-6 h-6" vid="192"></i>
                <span class="text-[10px] font-medium tracking-wide" vid="193">判定</span>
            </button>
            <button onclick="switchTab('leaderboard')" id="nav-leaderboard" class="nav-item flex-1 flex flex-col items-center gap-1 text-gray-400 transition-colors" vid="194">
                <i data-lucide="bar-chart-big" class="w-6 h-6" vid="195"></i>
                <span class="text-[10px] font-medium tracking-wide" vid="196">榜单</span>
            </button>
            <button onclick="switchTab('profile')" id="nav-profile" class="nav-item flex-1 flex flex-col items-center gap-1 text-gray-400 transition-colors" vid="197">
                <i data-lucide="user" class="w-6 h-6" vid="198"></i>
                <span class="text-[10px] font-medium tracking-wide" vid="199">我的</span>
            </button>
        </nav>
    </main>

    <script vid="200">
        lucide.createIcons();

        
        function switchTab(tabId) {
            
            ['game', 'leaderboard', 'profile'].forEach(id => {
                document.getElementById(`view-${id}`).classList.add('hidden');
                document.getElementById(`nav-${id}`).classList.remove('active', 'text-[#591C2E]');
                document.getElementById(`nav-${id}`).classList.add('text-gray-400');
            });

            
            document.getElementById(`view-${tabId}`).classList.remove('hidden');
            
            
            const activeNav = document.getElementById(`nav-${tabId}`);
            activeNav.classList.add('active', 'text-[#591C2E]');
            activeNav.classList.remove('text-gray-400');
            
            
            lucide.createIcons();
        }

        
        function enterApp() {
            const splash = document.getElementById('splash-screen');
            const app = document.getElementById('app-container');
            
            splash.style.opacity = '0';
            splash.style.pointerEvents = 'none';
            
            app.classList.remove('hidden');
            
            setTimeout(() => {
                app.style.opacity = '1';
                
                document.getElementById('active-card').classList.add('animate-fade-in');
            }, 50);
        }

        
        function simulateSwipe(direction) {
            const card = document.getElementById('active-card');
            const indicatorAi = document.getElementById('indicator-ai');
            const indicatorHuman = document.getElementById('indicator-human');
            const result = document.getElementById('result-overlay');

            let rotation = direction === 'left' ? -10 : 10;
            let xMove = direction === 'left' ? -50 : 50;

            
            card.style.transform = `translateX(${xMove}px) rotate(${rotation}deg)`;
            
            if (direction === 'left') indicatorAi.style.opacity = 1;
            else indicatorHuman.style.opacity = 1;

            
            setTimeout(() => {
                
                card.style.transform = `translateX(0px) rotate(0deg)`;
                indicatorAi.style.opacity = 0;
                indicatorHuman.style.opacity = 0;

                
                result.classList.remove('translate-y-full');
            }, 400);
        }

        function resetCard() {
            const result = document.getElementById('result-overlay');
            const card = document.getElementById('active-card');
            
            
            result.classList.add('translate-y-full');
            
            
            setTimeout(() => {
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 200);
            }, 300);
        }
    </script>

</body></html>

这一份文件里，我们学习模仿他的配色、榜单页面、我的页面