var STORAGE_KEY = 'gaoteli_portfolio_data';

var defaultData = {
  profile: {
    name: '陈旺雨',
    title: 'UX 设计师 & 插画师',
    bio: '热爱用设计讲述故事。专注于数字产品设计、品牌插画与用户研究，相信好的设计应该是功能与美学的平衡。工作之余喜欢旅行摄影、手冲咖啡和撸猫。目前就职于某互联网公司设计团队，同时也是一名自由插画师。',
    avatar: null,
    heroTagline: '用设计连接人与世界。'
  },
  contact: {
    qq: { value: '1234567890' },
    phone: { value: '138-0000-1234' },
    email: { value: 'gaoxinyan@example.com' },
    wechat: { value: 'gxy_design2024' },
    custom: [
      { id: 'cc_1', type: 'github', label: 'GitHub', icon: 'github', value: 'github.com/gaoxinyan' },
      { id: 'cc_2', type: 'bilibili', label: 'Bilibili', icon: 'video', value: '陈旺雨的设计频道' },
      { id: 'cc_3', type: 'instagram', label: 'Instagram', icon: 'camera', value: '@gxy_illustration' }
    ]
  },
  education: [
    { id: 'edu_1', school: '中国美术学院', major: '视觉传达设计', degree: '本科', period: '2020.09 - 2024.06', description: '主修视觉传达设计，辅修数字媒体艺术。毕业设计《城市记忆》获校级优秀作品。GPA 3.8/4.0，连续三年获得校级奖学金。' },
    { id: 'edu_2', school: '上海交通大学', major: '设计学', degree: '硕士', period: '2024.09 - 至今', description: '研究方向为人机交互与用户体验设计。参与实验室与企业合作的多个研究项目。' }
  ],
  campusLife: [
    { id: 'campus_1', title: '全国大学生广告艺术大赛', type: 'competition', date: '2023.08', description: '作品《城市脉动》获得平面类全国一等奖。历时三个月，从调研、创意到执行全程参与。' },
    { id: 'campus_2', title: '杭州亚运会志愿者', type: 'volunteer', date: '2023.09 - 2023.10', description: '担任媒体中心视觉引导志愿者，协助国内外媒体记者进行赛事报道。' },
    { id: 'campus_3', title: '设计学院学生会宣传部部长', type: 'club', date: '2021.09 - 2022.06', description: '负责学院各类活动的视觉宣传物料设计，策划并组织了"设计之夜"年度展览。' },
    { id: 'campus_4', title: '某设计工作室实习', type: 'parttime', date: '2023.01 - 2023.06', description: '参与多个商业项目设计，包括品牌VI设计、小程序UI设计、活动主视觉等。' }
  ],
  skills: [
    { id: 'skill_1', name: 'Figma', category: 'design', level: 'expert', years: '4 年', tools: 'Figma, Sketch, Adobe XD', description: '精通组件库搭建、设计系统维护、原型交互设计，能独立完成从0到1的设计系统搭建', projects: '公司内部设计系统 · 3个App设计规范 · 20+项目组件库' },
    { id: 'skill_2', name: 'Adobe Illustrator', category: 'design', level: 'proficient', years: '5 年', tools: 'Illustrator, Affinity Designer', description: '擅长矢量插画、品牌图形设计、图标系统设计', projects: '品牌插画项目 · 图标库设计 · 活动主视觉' },
    { id: 'skill_3', name: 'Adobe Photoshop', category: 'design', level: 'proficient', years: '5 年', tools: 'Photoshop, Procreate', description: '精通图像处理、合成、调色和数字绘画', projects: '海报设计 · UI视觉稿 · 数字插画作品集' },
    { id: 'skill_4', name: 'React', category: 'dev', level: 'skilled', years: '2 年', tools: 'React, Next.js, Tailwind CSS', description: '能用 React 实现设计稿的前端还原，理解组件化开发思想', projects: '个人作品集网站 · 设计系统文档站' },
    { id: 'skill_5', name: 'HTML / CSS', category: 'dev', level: 'proficient', years: '3 年', tools: 'HTML5, CSS3, Sass, Tailwind', description: '能独立完成响应式网页开发，注重语义化和可访问性', projects: '多个品牌官网 · Landing Page开发' },
    { id: 'skill_6', name: 'Blender', category: 'tool', level: 'beginner', years: '1 年', tools: 'Blender, Spline', description: '使用3D工具为设计项目增加立体视觉元素', projects: '3D图标设计 · 产品展示渲染' },
    { id: 'skill_7', name: 'After Effects', category: 'tool', level: 'skilled', years: '2 年', tools: 'After Effects, Lottie', description: '制作UI动效、品牌动画和Lottie动画', projects: 'App启动动画 · 图标微交互 · 品牌宣传视频' },
    { id: 'skill_8', name: '用户研究', category: 'other', level: 'proficient', years: '3 年', tools: 'UserTesting, Maze, Notion', description: '熟悉用户访谈、可用性测试、问卷调查等研究方法', projects: '5个产品的用户研究项目 · 可用性测试报告' }
  ],
  works: [
    { id: 'work_1', title: '「轻食记」App 设计', description: '一款健康饮食记录App的完整设计，包含品牌VI、交互原型和视觉设计。从用户调研到高保真原型，历时4个月完成。', date: '2024.03', tags: ['UI/UX', 'App设计', '品牌VI'], featured: true, cover: null, images: [], link: 'https://figma.com/example', pdf: null },
    { id: 'work_2', title: '「城市记忆」插画系列', description: '以中国城市为主题的系列插画，用温暖的色调和细腻的笔触描绘城市中被人忽略的角落与瞬间。', date: '2023.12', tags: ['插画', '数字绘画', '系列作品'], featured: false, cover: null, images: [], link: '', pdf: null },
    { id: 'work_3', title: '某咖啡品牌视觉升级', description: '为一家独立咖啡品牌进行全新视觉升级，包括Logo重设计、包装设计、店内视觉和社交媒体视觉规范。', date: '2023.08', tags: ['品牌设计', '包装设计', 'VI'], featured: true, cover: null, images: [], link: '', pdf: null },
    { id: 'work_4', title: '「设计系统」组件库', description: '为团队搭建的设计系统，包含50+组件、色彩系统和排版规范，支持多平台复用。配套Figma插件可一键调用。', date: '2023.05', tags: ['设计系统', 'Figma', '组件库'], featured: false, cover: null, images: [], link: 'https://github.com/example/design-system', pdf: null },
    { id: 'work_5', title: '「流浪猫日记」公益小程序', description: '一个记录和分享城市流浪猫信息的公益小程序设计。通过地图标记、社区喂养和领养信息，帮助更多人关注流浪动物。', date: '2023.02', tags: ['小程序', '公益', 'UX设计'], featured: false, cover: null, images: [], link: '', pdf: null },
    { id: 'work_6', title: '2024 个人作品集网站', description: '使用 React + Tailwind CSS 构建的个人作品集网站，包含作品展示、关于我和联系方式。', date: '2024.06', tags: ['前端开发', 'React', '个人网站'], featured: false, cover: null, images: [], link: 'https://example.com', pdf: null }
  ],
  life: [
    { id: 'life_1', date: '2024.06.01', title: '周末咖啡探店 ☕', content: '发现了一家藏在巷子里的宝藏咖啡店。老板是位很有趣的人，聊了很多关于咖啡豆产地和烘焙的知识。点了一杯埃塞俄比亚手冲，果酸明亮，尾韵有茉莉花香。', mood: 'happy', images: [] },
    { id: 'life_2', date: '2024.05.25', title: '终于完成了毕设答辩！🎉', content: '准备了三个月的毕设答辩终于结束了。虽然过程中经历了无数次修改和自我怀疑，但最终呈现的效果超出了预期。感谢导师的耐心指导和朋友们的支持！', mood: 'celebrating', images: [] },
    { id: 'life_3', date: '2024.05.18', title: '第一次尝试陶艺', content: '朋友带我去了陶艺工作室，第一次体验拉坯。看着一团泥在手中慢慢变成杯子的形状，过程超级解压。虽然成品歪歪扭扭，但这就是手工的魅力吧。', mood: 'amazed', images: [] },
    { id: 'life_4', date: '2024.05.10', title: '深夜灵感时刻', content: '凌晨两点的设计稿意外地顺手，可能是安静的氛围让人更专注。一口气完成了三个页面的视觉设计。配上一杯热可可和Lo-Fi歌单，完美的创作之夜。', mood: 'motivated', images: [] },
    { id: 'life_5', date: '2024.04.28', title: '杭州春雨', content: '今天的雨下了一整天，空气里都是湿润的泥土味。适合窝在窗边画画的天气。画了一幅雨中西湖，打算做成明信片寄给远方的朋友。', mood: 'calm', images: [] },
    { id: 'life_6', date: '2024.04.15', title: '读完了《设计的觉醒》', content: '田中一光先生的文字朴实却有力量。他说设计不是装饰，而是发现问题并解决。这句话让我重新审视了自己做设计的初心。推荐给所有设计师朋友。', mood: 'thinking', images: [] },
    { id: 'life_7', date: '2024.03.30', title: '樱花季的植物园 🌸', content: '赶在樱花凋落前去了趟植物园，满开的染井吉野美得让人说不出话。带了相机拍了很久，还在树下野餐了。春天真是最好的季节。', mood: 'loved', images: [] },
    { id: 'life_8', date: '2024.03.12', title: '连续加班的三天', content: '项目deadline临近，连续高强度工作了三天。虽然很累，但看着最终的交付物还是挺有成就感的。今天要好好补一觉，然后去吃顿好的犒劳自己。', mood: 'tired', images: [] }
  ],
  meta: { version: '1.0', lastUpdated: '' }
};

var Storage = {
  load: function() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(defaultData));
      var data = JSON.parse(raw);
      return deepMerge(JSON.parse(JSON.stringify(defaultData)), data);
    } catch (e) {
      console.warn('Storage load failed, using defaults:', e);
      return JSON.parse(JSON.stringify(defaultData));
    }
  },

  save: function(data) {
    try {
      data.meta.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Storage save failed:', e);
    }
  },

  get: function(path) {
    var data = this.load();
    var keys = path.split('.');
    var value = data;
    for (var i = 0; i < keys.length; i++) {
      if (value == null) return undefined;
      value = value[keys[i]];
    }
    return value;
  },

  set: function(path, value) {
    var data = this.load();
    var keys = path.split('.');
    var obj = data;
    for (var i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    this.save(data);
    return data;
  },

  reset: function() {
    localStorage.removeItem(STORAGE_KEY);
  },

  export: function() {
    return JSON.stringify(this.load(), null, 2);
  },

  import: function(jsonString) {
    var data = JSON.parse(jsonString);
    if (!data.meta || !data.meta.version) {
      throw new Error('Invalid data format: missing meta.version');
    }
    this.save(deepMerge(JSON.parse(JSON.stringify(defaultData)), data));
  }
};

function deepMerge(target, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

window.Storage = Storage;
