-- 测试数据插入脚本
-- Content 表结构说明

-- 表名: content
-- 字段说明:
-- id: 主键，UUID格式字符串 (36字符)
-- type: 内容类型 ('text', 'image', 'video')
-- url: 图片/视频URL (可为空，用于image和video类型)
-- text: 文本内容 (可为空，用于text类型)
-- title: 标题 (必填)
-- is_bot: 是否为AI生成 (true=AI, false=人类)
-- modelTag: 模型标签 (如 'GPT-4', 'Claude', 'Human')
-- provider: 提供者 (如 'OpenAI', 'Anthropic', 'User')
-- deceptionRate: 欺骗率 (0-1之间的浮点数，表示有多少人判断错误)
-- explanation: 解释说明
-- createdAt: 创建时间 (自动生成)
-- updatedAt: 更新时间 (自动生成)

-- ==================== 文本内容测试数据 ====================

-- 测试1: AI生成的文本
INSERT INTO content (id, type, url, text, title, is_bot, modelTag, provider, deceptionRate, explanation, createdAt, updatedAt)
VALUES (
  'test-text-ai-001',
  'text',
  NULL,
  '你感受这个世界的波长与你周围的人不同步。与同龄人相比，你的思考早已寻常的深刻。你能够看穿人类生活的复杂，拥有阅历丰富的灵魂。而与此同时，你又保有孩童般的理想主义和对世界的好奇。',
  'AI生成的哲学思考',
  true,
  'GPT-4',
  'OpenAI',
  0.72,
  '这段文字使用了典型的AI写作模式：对称的句式结构、抽象的概念堆砌、以及过于完美的语言组织。真人写作通常会有更多的口语化表达和不完美的地方。',
  NOW(),
  NOW()
);

-- 测试2: 真人写的文本
INSERT INTO content (id, type, url, text, title, is_bot, modelTag, provider, deceptionRate, explanation, createdAt, updatedAt)
VALUES (
  'test-text-human-001',
  'text',
  NULL,
  '今天早上起来发现下雨了，本来想去跑步的计划泡汤了。算了，在家躺着刷手机也挺好的，反正最近也没啥事。对了，昨天那个电视剧看到一半就睡着了，也不知道后面剧情咋样了。',
  '真人的日常碎碎念',
  false,
  'Human',
  'User',
  0.35,
  '这段文字具有明显的真人特征：随意的思维跳跃、口语化的表达、不完整的句子结构，以及日常生活的琐碎细节。AI通常不会写出这种"不完美"的文字。',
  NOW(),
  NOW()
);

-- 测试3: AI生成的诗歌
INSERT INTO content (id, type, url, text, title, is_bot, modelTag, provider, deceptionRate, explanation, createdAt, updatedAt)
VALUES (
  'test-text-ai-002',
  'text',
  NULL,
  '月光如水洒窗前，思绪万千入梦眠。往事如烟随风去，唯有真情永相连。',
  'AI创作的现代诗',
  true,
  'Claude',
  'Anthropic',
  0.68,
  '这首诗虽然押韵工整，但缺乏真实的情感深度和独特的意象。AI生成的诗歌往往过于工整和程式化，缺少人类诗歌中的不规则美感和深层情感。',
  NOW(),
  NOW()
);

-- ==================== 图片内容测试数据 ====================

-- 测试4: AI生成的图片
INSERT INTO content (id, type, url, text, title, is_bot, modelTag, provider, deceptionRate, explanation, createdAt, updatedAt)
VALUES (
  'test-image-ai-001',
  'image',
  'https://picsum.photos/400/600?random=1',
  NULL,
  'AI生成的风景画',
  true,
  'Midjourney',
  'Midjourney',
  0.81,
  'AI生成的图片通常具有过于完美的构图、不自然的光影效果，以及细节处理上的微妙瑕疵。仔细观察边缘和纹理可以发现AI的痕迹。',
  NOW(),
  NOW()
);

-- 测试5: 真人拍摄的照片
INSERT INTO content (id, type, url, text, title, is_bot, modelTag, provider, deceptionRate, explanation, createdAt, updatedAt)
VALUES (
  'test-image-human-001',
  'image',
  'https://picsum.photos/400/600?random=2',
  NULL,
  '真人拍摄的街景',
  false,
  'Human',
  'User',
  0.42,
  '真人拍摄的照片通常包含更多的随机元素、自然的光线变化，以及不完美的构图。照片中的细节更加真实和连贯。',
  NOW(),
  NOW()
);

-- 测试6: AI生成的人物肖像
INSERT INTO content (id, type, url, text, title, is_bot, modelTag, provider, deceptionRate, explanation, createdAt, updatedAt)
VALUES (
  'test-image-ai-002',
  'image',
  'https://picsum.photos/400/600?random=3',
  NULL,
  'AI生成的动漫角色',
  true,
  'Stable Diffusion',
  'Stability AI',
  0.75,
  'AI生成的动漫角色往往具有过于精致的五官、不自然的手部细节，以及背景与主体的融合问题。这些都是AI生成图片的典型特征。',
  NOW(),
  NOW()
);

-- ==================== 视频内容测试数据 ====================

-- 测试7: AI生成的视频
INSERT INTO content (id, type, url, text, title, is_bot, modelTag, provider, deceptionRate, explanation, createdAt, updatedAt)
VALUES (
  'test-video-ai-001',
  'video',
  'https://cloud-video-example.com/ai-generated-1.mp4',
  NULL,
  'AI生成的动画短片',
  true,
  'Runway Gen-2',
  'Runway',
  0.79,
  'AI生成的视频通常在运动连贯性、物理规律、以及细节一致性上存在问题。仔细观察可以发现不自然的运动轨迹和突然的画面变化。',
  NOW(),
  NOW()
);

-- 测试8: 真人拍摄的视频
INSERT INTO content (id, type, url, text, title, is_bot, modelTag, provider, deceptionRate, explanation, createdAt, updatedAt)
VALUES (
  'test-video-human-001',
  'video',
  'https://cloud-video-example.com/human-recorded-1.mp4',
  NULL,
  '真人拍摄的生活片段',
  false,
  'Human',
  'User',
  0.38,
  '真人拍摄的视频具有自然的镜头晃动、真实的光线变化，以及连贯的物理运动。这些细节是AI目前难以完美模拟的。',
  NOW(),
  NOW()
);

-- ==================== 混合难度测试数据 ====================

-- 测试9: 高难度 - AI模仿真人风格
INSERT INTO content (id, type, url, text, title, is_bot, modelTag, provider, deceptionRate, explanation, createdAt, updatedAt)
VALUES (
  'test-text-ai-hard-001',
  'text',
  NULL,
  '哎呀，今天真的是...怎么说呢，就是那种特别累但又睡不着的感觉。你懂吗？就像脑子里有一万个想法在转，但又说不出个所以然来。算了不想了，明天再说吧。',
  '高难度：AI模仿口语',
  true,
  'GPT-4',
  'OpenAI',
  0.89,
  '这是AI刻意模仿真人口语化表达的例子。虽然看起来很像真人，但仔细分析会发现情感表达过于"完整"，缺少真正的随机性和不连贯性。',
  NOW(),
  NOW()
);

-- 测试10: 高难度 - 真人写的很正式的文字
INSERT INTO content (id, type, url, text, title, is_bot, modelTag, provider, deceptionRate, explanation, createdAt, updatedAt)
VALUES (
  'test-text-human-hard-001',
  'text',
  NULL,
  '在当今数字化时代，人工智能技术的发展为我们带来了前所未有的机遇与挑战。我们需要在技术进步与人文关怀之间找到平衡点，确保科技发展能够真正造福人类社会。',
  '高难度：真人的正式写作',
  false,
  'Human',
  'User',
  0.85,
  '这是真人写的正式文字，但因为过于规范和结构化，很容易被误认为是AI生成的。这说明判断的关键不在于文字是否正式，而在于细微的表达习惯。',
  NOW(),
  NOW()
);

-- ==================== 查询测试数据 ====================

-- 查看所有插入的测试数据
-- SELECT * FROM content WHERE id LIKE 'test-%' ORDER BY createdAt DESC;

-- 按类型查询
-- SELECT * FROM content WHERE type = 'text' AND id LIKE 'test-%';
-- SELECT * FROM content WHERE type = 'image' AND id LIKE 'test-%';
-- SELECT * FROM content WHERE type = 'video' AND id LIKE 'test-%';

-- 查询AI生成的内容
-- SELECT * FROM content WHERE is_bot = true AND id LIKE 'test-%';

-- 查询真人内容
-- SELECT * FROM content WHERE is_bot = false AND id LIKE 'test-%';
