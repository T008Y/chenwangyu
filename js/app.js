// ===== Gao Teli Portfolio App =====

var currentData = null;
var editingId = null;

document.addEventListener('DOMContentLoaded', function() {
  currentData = Storage.load();
  renderAll(currentData);
  initAnimations();
  initReadModeAnimations();
  initEditMode();
  initContactAddForm();
  initNavbar();
});

// ===== Render All =====
function renderAll(data) {
  renderHero(data);
  renderAbout(data);
  renderContact(data);
  renderEducation(data);
  renderCampus(data);
  renderSkills(data);
  renderWorks(data);
  renderLife(data);
  updateCounts(data);
}

// ===== Hero Section =====
function renderHero(data) {
  var name = data.profile.name || '陈旺雨';
  document.getElementById('hero-name').textContent = name;
  document.getElementById('nav-name').textContent = name;
  document.getElementById('hero-tagline').textContent = data.profile.heroTagline || '记录生活，分享热爱。';
  document.getElementById('hero-eyebrow-text').textContent = data.profile.title || '个人主页';
}

// ===== About Section =====
function renderAbout(data) {
  document.getElementById('about-name').textContent = data.profile.name || '陈旺雨';
  document.getElementById('about-title').textContent = data.profile.title || '待填写';
  document.getElementById('about-bio').textContent = data.profile.bio || '点击编辑，写下你的个人简介...';

  var avatarImg = document.getElementById('avatar-img');
  var navAvatar = document.getElementById('nav-avatar');
  if (data.profile.avatar) {
    avatarImg.src = data.profile.avatar;
    if (navAvatar) navAvatar.src = data.profile.avatar;
  } else {
    avatarImg.src = 'assets/default-avatar.svg';
    if (navAvatar) navAvatar.src = 'assets/default-avatar.svg';
  }

  var metaHtml = '';
  var metaContacts = [
    { key: 'email', label: '邮箱', icon: 'mail' },
    { key: 'phone', label: '手机', icon: 'phone' },
    { key: 'qq', label: 'QQ', icon: 'message-circle' },
    { key: 'wechat', label: '微信', icon: 'smartphone' }
  ];

  metaContacts.forEach(function(c) {
    var info = data.contact[c.key];
    if (info && info.value) {
      metaHtml += '<span class="meta-item"><i data-lucide="' + c.icon + '" class="meta-icon"></i> ' + escapeHtml(info.value) + '</span>';
    }
  });

  var customs = data.contact.custom || [];
  customs.forEach(function(item) {
    if (item.value) {
      metaHtml += '<span class="meta-item"><i data-lucide="' + (item.icon || 'link') + '" class="meta-icon"></i> ' + escapeHtml(item.value) + '</span>';
    }
  });

  document.getElementById('about-meta').innerHTML = metaHtml;
  lucide.createIcons();
}

// ===== Contact Section =====
var CONTACT_TYPES = {
  qq:        { label: 'QQ',        icon: 'message-circle' },
  phone:     { label: '手机',      icon: 'phone' },
  email:     { label: '邮箱',      icon: 'mail' },
  wechat:    { label: '微信',      icon: 'smartphone' },
  github:    { label: 'GitHub',    icon: 'github' },
  bilibili:  { label: 'Bilibili',  icon: 'video' },
  weibo:     { label: '微博',      icon: 'at-sign' },
  instagram: { label: 'Instagram', icon: 'camera' }
};

function renderContact(data) {
  var grid = document.getElementById('contact-grid');
  var fixedKeys = ['qq', 'phone', 'email', 'wechat'];
  var html = '';
  var isEdit = document.body.classList.contains('edit-mode');

  fixedKeys.forEach(function(key) {
    var info = data.contact[key] || { value: '' };
    if (!isEdit && !info.value) return;
    html += buildContactCard(key, CONTACT_TYPES[key].label, CONTACT_TYPES[key].icon, info.value, isEdit, 'fixed');
  });

  var customs = data.contact.custom || [];
  customs.forEach(function(item) {
    var typeInfo = CONTACT_TYPES[item.type];
    if (!typeInfo && item.type !== 'custom') return;
    var label = item.label || (typeInfo ? typeInfo.label : '自定义');
    var icon = item.icon || (typeInfo ? typeInfo.icon : 'link');
    if (!isEdit && !item.value) return;
    html += buildContactCard(item.id, label, icon, item.value, isEdit, 'custom');
  });

  grid.innerHTML = html;
  lucide.createIcons();

  grid.querySelectorAll('.contact-value[contenteditable]').forEach(function(el) {
    el.addEventListener('blur', function() {
      var key = el.dataset.editableContact;
      if (!key) return;
      if (key.indexOf('cc_') === 0) {
        var customs = currentData.contact.custom || [];
        var found = customs.find(function(c) { return c.id === key; });
        if (found) { found.value = el.textContent.trim(); Storage.save(currentData); }
      } else {
        currentData = Storage.set('contact.' + key + '.value', el.textContent.trim());
      }
      renderAbout(currentData);
    });
  });

  grid.querySelectorAll('.contact-card-delete').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var card = btn.closest('.contact-card');
      var kind = card.dataset.cardKind;
      var key = card.dataset.cardKey;
      if (kind === 'fixed') {
        currentData = Storage.set('contact.' + key + '.value', '');
      } else {
        currentData.contact.custom = (currentData.contact.custom || []).filter(function(c) { return c.id !== key; });
        Storage.save(currentData);
      }
      renderContact(currentData);
      renderAbout(currentData);
    });
  });
}

function buildContactCard(key, label, icon, value, isEdit, kind) {
  var html = '<div class="contact-card" data-card-kind="' + kind + '" data-card-key="' + key + '">';
  if (isEdit) html += '<button class="contact-card-delete" title="删除">&times;</button>';
  html += '<div class="contact-card-icon"><i data-lucide="' + icon + '"></i></div>';
  html += '<div class="contact-card-content">';
  html += '<span class="contact-label">' + escapeHtml(label) + '</span>';
  if (isEdit) {
    html += '<span class="contact-value" data-editable-contact="' + key + '" contenteditable="true">' + escapeHtml(value) + '</span>';
  } else {
    html += '<span class="contact-value">' + escapeHtml(value) + '</span>';
  }
  html += '</div></div>';
  return html;
}

function initContactAddForm() {
  var form = document.getElementById('add-contact-form');
  var typeSelect = document.getElementById('new-contact-type');
  var valueInput = document.getElementById('new-contact-value');
  var labelInput = document.getElementById('new-contact-label');

  document.getElementById('btn-add-contact').addEventListener('click', function() {
    form.classList.toggle('hidden');
    typeSelect.value = ''; valueInput.value = ''; labelInput.value = '';
    labelInput.classList.add('hidden');
  });

  typeSelect.addEventListener('change', function() {
    if (this.value === 'custom') { labelInput.classList.remove('hidden'); }
    else { labelInput.classList.add('hidden'); }
  });

  document.getElementById('btn-cancel-contact').addEventListener('click', function() { form.classList.add('hidden'); });

  document.getElementById('btn-save-contact').addEventListener('click', function() {
    var type = typeSelect.value;
    var value = valueInput.value.trim();
    if (!type) { showToast('请选择类型', 'warning'); return; }
    if (!value) { showToast('请填写内容', 'warning'); return; }
    var fixedKeys = ['qq', 'phone', 'email', 'wechat'];
    if (fixedKeys.indexOf(type) !== -1) {
      currentData = Storage.set('contact.' + type + '.value', value);
      renderContact(currentData);
    } else {
      var typeInfo = CONTACT_TYPES[type];
      var label = type === 'custom' ? (labelInput.value.trim() || '自定义') : typeInfo.label;
      var icon = typeInfo ? typeInfo.icon : 'link';
      var entry = { id: 'cc_' + Date.now(), type: type, label: label, icon: icon, value: value };
      if (!currentData.contact.custom) currentData.contact.custom = [];
      currentData.contact.custom.push(entry);
      Storage.save(currentData);
      renderContact(currentData);
    }
    form.classList.add('hidden');
    showToast('联系方式已添加', 'success');
  });
}

// ===== Education Section =====
function renderEducation(data) {
  var timeline = document.getElementById('edu-timeline');
  var arr = data.education || [];
  if (arr.length === 0) {
    timeline.innerHTML = '<div class="empty-state edit-only"><i data-lucide="graduation-cap"></i><p>添加你的教育经历</p></div>';
    lucide.createIcons(); return;
  }
  var html = '';
  arr.forEach(function(item) {
    html += '<div class="timeline-item" data-id="' + item.id + '">';
    html += '<div class="timeline-dot"></div><div class="timeline-content">';
    html += '<div class="timeline-header"><div>';
    html += '<h3 class="edu-school">' + escapeHtml(item.school) + '</h3>';
    html += '<p class="edu-detail">' + escapeHtml(item.major || '') + ' · ' + escapeHtml(item.degree || '') + '</p></div>';
    html += '<div class="timeline-meta"><span class="edu-period">' + escapeHtml(item.period || '') + '</span>';
    html += '<div class="timeline-actions edit-only">';
    html += '<button class="btn-icon" data-action="edit-edu" data-id="' + item.id + '"><i data-lucide="edit-2"></i></button>';
    html += '<button class="btn-icon danger" data-action="delete-edu" data-id="' + item.id + '"><i data-lucide="trash-2"></i></button>';
    html += '</div></div></div>';
    if (item.description) html += '<p class="edu-description">' + escapeHtml(item.description) + '</p>';
    html += '</div></div>';
  });
  timeline.innerHTML = html;
  lucide.createIcons();
}

// ===== Campus Section =====
function renderCampus(data) {
  var timeline = document.getElementById('campus-timeline');
  var arr = data.campusLife || [];
  if (arr.length === 0) {
    timeline.innerHTML = '<div class="empty-state edit-only"><i data-lucide="briefcase"></i><p>添加你的在校经历（比赛/志愿/兼职/社团）</p></div>';
    lucide.createIcons(); return;
  }
  var typeLabels = { competition: '比赛', volunteer: '志愿', parttime: '兼职', club: '社团', other: '其他' };
  var html = '';
  arr.forEach(function(item) {
    html += '<div class="timeline-item" data-id="' + item.id + '">';
    html += '<div class="timeline-dot"></div><div class="timeline-content">';
    html += '<div class="timeline-header"><div>';
    html += '<span class="campus-type-badge type-' + (item.type || 'other') + '">' + (typeLabels[item.type] || '其他') + '</span>';
    html += '<h3 class="edu-school" style="margin-top:6px">' + escapeHtml(item.title || '') + '</h3></div>';
    html += '<div class="timeline-meta"><span class="edu-period">' + escapeHtml(item.date || '') + '</span>';
    html += '<div class="timeline-actions edit-only">';
    html += '<button class="btn-icon" data-action="edit-campus" data-id="' + item.id + '"><i data-lucide="edit-2"></i></button>';
    html += '<button class="btn-icon danger" data-action="delete-campus" data-id="' + item.id + '"><i data-lucide="trash-2"></i></button>';
    html += '</div></div></div>';
    if (item.description) html += '<p class="edu-description">' + escapeHtml(item.description) + '</p>';
    if (item.image) html += '<img class="campus-card-image" src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">';
    html += '</div></div>';
  });
  timeline.innerHTML = html;
  lucide.createIcons();
}

// ===== Skills Section =====
var SKILL_LEVELS = { expert: { label: '精通' }, proficient: { label: '熟练' }, skilled: { label: '掌握' }, beginner: { label: '了解' } };

function renderSkills(data) {
  var container = document.getElementById('skills-categories');
  var arr = data.skills || [];
  if (arr.length === 0) {
    container.innerHTML = '<div class="empty-state edit-only"><i data-lucide="sparkles"></i><p>添加你的技能标签</p></div>';
    lucide.createIcons(); return;
  }
  var categories = { design: [], dev: [], tool: [], other: [] };
  arr.forEach(function(skill) { var cat = skill.category || 'other'; if (!categories[cat]) categories[cat] = []; categories[cat].push(skill); });
  var catLabels = { design: '设计', dev: '开发', tool: '工具', other: '其他' };
  var html = '';
  Object.keys(categories).forEach(function(cat) {
    var skills = categories[cat];
    if (skills.length === 0) return;
    html += '<div class="skill-category"><h4 class="skill-cat-label">' + catLabels[cat] + '</h4><div class="skill-cards">';
    skills.forEach(function(skill) {
      var levelInfo = SKILL_LEVELS[skill.level] || SKILL_LEVELS.beginner;
      html += '<div class="skill-card category-' + cat + '" data-skill-id="' + skill.id + '">';
      html += '<div class="skill-card-header"><span class="skill-card-level">' + levelInfo.label + '</span>';
      html += '<button class="skill-card-delete edit-only" data-skill-id="' + skill.id + '">&times;</button></div>';
      html += '<h3 class="skill-card-name">' + escapeHtml(skill.name) + '</h3>';
      if (skill.years || skill.tools) {
        html += '<div class="skill-card-meta">';
        if (skill.years) html += '<span class="skill-card-meta-item"><i data-lucide="clock"></i> ' + escapeHtml(skill.years) + '</span>';
        if (skill.tools) html += '<span class="skill-card-meta-item"><i data-lucide="wrench"></i> ' + escapeHtml(skill.tools) + '</span>';
        html += '</div>';
      }
      if (skill.description) html += '<p class="skill-card-desc">' + escapeHtml(skill.description) + '</p>';
      if (skill.projects) { html += '<span class="skill-card-projects-label">代表项目 / 成果</span>'; html += '<p class="skill-card-projects">' + escapeHtml(skill.projects) + '</p>'; }
      html += '</div>';
    });
    html += '</div></div>';
  });
  container.innerHTML = html;
  lucide.createIcons();

  container.querySelectorAll('.skill-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (e.target.classList.contains('skill-card-delete')) return;
      if (!document.body.classList.contains('edit-mode')) return;
      var id = this.dataset.skillId;
      var item = findById(currentData.skills, id);
      if (item) openSkillModal(item);
    });
  });

  container.querySelectorAll('.skill-card-delete').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var id = this.dataset.skillId;
      var skill = findById(currentData.skills, id);
      if (!skill) return;
      showConfirm('确定删除技能 "' + skill.name + '"？', function() {
        currentData.skills = currentData.skills.filter(function(s) { return s.id !== id; });
        Storage.save(currentData);
        renderSkills(currentData);
      });
    });
  });
}

// ===== Skill Modal =====
function openSkillModal(item) {
  var isNew = !item;
  editingId = item ? item.id : null;
  document.getElementById('skill-modal-title').textContent = isNew ? '添加技能' : '编辑技能';
  document.getElementById('skill-name-input').value = item ? item.name || '' : '';
  document.getElementById('skill-category-input').value = item ? item.category || 'design' : 'design';
  document.getElementById('skill-level-input').value = item ? item.level || 'skilled' : 'skilled';
  document.getElementById('skill-years-input').value = item ? item.years || '' : '';
  document.getElementById('skill-tools-input').value = item ? item.tools || '' : '';
  document.getElementById('skill-desc-input').value = item ? item.description || '' : '';
  document.getElementById('skill-projects-input').value = item ? item.projects || '' : '';
  document.getElementById('skill-modal').classList.remove('hidden');
}

document.getElementById('btn-add-skill').addEventListener('click', function() { openSkillModal(null); });
document.getElementById('skill-modal-cancel').addEventListener('click', function() { document.getElementById('skill-modal').classList.add('hidden'); });
document.getElementById('skill-modal-save').addEventListener('click', function() {
  var name = document.getElementById('skill-name-input').value.trim();
  if (!name) { showToast('请填写技能名称', 'warning'); return; }
  var entry = {
    id: editingId || 'skill_' + Date.now(), name: name,
    category: document.getElementById('skill-category-input').value,
    level: document.getElementById('skill-level-input').value,
    years: document.getElementById('skill-years-input').value.trim(),
    tools: document.getElementById('skill-tools-input').value.trim(),
    description: document.getElementById('skill-desc-input').value.trim(),
    projects: document.getElementById('skill-projects-input').value.trim()
  };
  if (editingId) { currentData.skills = currentData.skills.map(function(s) { return s.id === editingId ? entry : s; }); }
  else { currentData.skills.push(entry); }
  Storage.save(currentData);
  renderSkills(currentData);
  document.getElementById('skill-modal').classList.add('hidden');
  showToast(editingId ? '技能已更新' : '技能已添加', 'success');
  editingId = null;
});

// ===== Works Section =====
function renderWorks(data) {
  var grid = document.getElementById('works-grid');
  var empty = document.getElementById('works-empty');
  var arr = data.works || [];
  if (arr.length === 0) { grid.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  var sorted = arr.slice().sort(function(a, b) { if (a.featured && !b.featured) return -1; if (!a.featured && b.featured) return 1; return 0; });
  var html = '';
  sorted.forEach(function(item) {
    var featuredClass = item.featured ? ' featured' : '';
    html += '<div class="work-card' + featuredClass + '" data-id="' + item.id + '">';
    html += '<div class="work-cover">';
    html += '<img src="' + (item.cover || 'assets/default-cover.svg') + '" alt="' + escapeHtml(item.title) + '" loading="lazy">';
    html += '<div class="work-cover-overlay"><div class="work-actions edit-only">';
    html += '<button class="btn-icon" data-action="edit-work" data-id="' + item.id + '"><i data-lucide="edit-2"></i></button>';
    html += '<button class="btn-icon danger" data-action="delete-work" data-id="' + item.id + '"><i data-lucide="trash-2"></i></button></div>';
    if (item.link) html += '<a class="work-link-btn" href="' + escapeHtml(item.link) + '" target="_blank" rel="noopener"><i data-lucide="external-link"></i></a>';
    html += '</div>';
    var totalImages = 1 + (item.images ? item.images.length : 0);
    if (totalImages > 1) html += '<span class="work-img-count"><i data-lucide="image"></i> ' + totalImages + '</span>';
    if (item.pdf) html += '<span class="work-pdf-badge" title="含 PDF 附件"><i data-lucide="file-text"></i></span>';
    html += '</div><div class="work-info">';
    if (item.tags && item.tags.length > 0) { html += '<div class="work-tags">'; item.tags.forEach(function(tag) { html += '<span class="work-tag">' + escapeHtml(tag) + '</span>'; }); html += '</div>'; }
    html += '<h3 class="work-title">' + escapeHtml(item.title) + '</h3>';
    if (item.description) html += '<p class="work-desc">' + escapeHtml(item.description) + '</p>';
    html += '<span class="work-date">' + escapeHtml(item.date || '') + '</span>';
    html += '</div></div>';
  });
  grid.innerHTML = html;
  lucide.createIcons();
}

// ===== Life Section =====
function renderLife(data) {
  var timeline = document.getElementById('life-timeline');
  var arr = data.life || [];
  if (arr.length === 0) { timeline.innerHTML = '<div class="empty-state edit-only"><i data-lucide="camera"></i><p>记录你的生活片段</p></div>'; lucide.createIcons(); return; }
  var sorted = arr.slice().sort(function(a, b) { if (a.date > b.date) return -1; if (a.date < b.date) return 1; return 0; });
  var moodIcons = { happy: '😊', excited: '🥳', loved: '🥰', cool: '😎', motivated: '💪', amazed: '🤩', celebrating: '🎉', calm: '😌', thinking: '🤔', relieved: '😅', sad: '😢', frustrated: '😤', tired: '😴', gloomy: '🌧️', nostalgic: '💭', firedUp: '🔥' };
  var html = '';
  sorted.forEach(function(item) {
    var moodEmoji = moodIcons[item.mood] || '';
    html += '<div class="life-item" data-id="' + item.id + '"><div class="life-card">';
    html += '<div class="life-card-header">';
    if (moodEmoji) html += '<span class="life-mood-badge">' + moodEmoji + '</span>';
    html += '<span class="life-date">' + escapeHtml(item.date || '') + '</span>';
    html += '<h3 class="life-title">' + escapeHtml(item.title || '') + '</h3>';
    html += '<div class="life-actions edit-only">';
    html += '<button class="btn-icon" data-action="edit-life" data-id="' + item.id + '"><i data-lucide="edit-2"></i></button>';
    html += '<button class="btn-icon danger" data-action="delete-life" data-id="' + item.id + '"><i data-lucide="trash-2"></i></button>';
    html += '</div></div>';
    html += '<p class="life-content">' + escapeHtml(item.content || '') + '</p>';
    if (item.images && item.images.length > 0) {
      html += '<div class="life-images life-images-' + Math.min(item.images.length, 4) + '">';
      item.images.forEach(function(img) { html += '<img src="' + img + '" alt="生活图片" loading="lazy">'; });
      html += '</div>';
    }
    html += '</div></div>';
  });
  timeline.innerHTML = html;
  lucide.createIcons();
}

// ===== Counts =====
function updateCounts(data) {
  var el = document.getElementById('counts-display');
  if (el) el.textContent = (data.works || []).length + ' 个作品 · ' + (data.education || []).length + ' 段学历 · ' + (data.campusLife || []).length + ' 项经历 · ' + (data.life || []).length + ' 条记录';
}

// ===== Navbar =====
function initNavbar() {
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        navLinks.forEach(function(link) { link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id); });
      }
    });
  }, { rootMargin: '-30% 0px -70% 0px' });
  sections.forEach(function(section) { observer.observe(section); });

  navLinks.forEach(function(link) {
    link.addEventListener('mouseenter', function() {
      gsap.killTweensOf(link);
      gsap.to(link, { scale: 1.05, y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', duration: 0.15, ease: 'power2.out', overwrite: 'auto' });
    });
    link.addEventListener('mouseleave', function() {
      gsap.killTweensOf(link);
      gsap.to(link, { scale: 1, y: 0, boxShadow: 'none', duration: 0.12, ease: 'power2.out', overwrite: 'auto' });
    });
  });

  var menuToggle = document.getElementById('menu-toggle');
  document.getElementById('nav-links').addEventListener('click', function(e) { if (e.target.tagName === 'A') menuToggle.checked = false; });

  var btnTop = document.getElementById('btn-scroll-top');
  window.addEventListener('scroll', function() {
    var scrolled = window.scrollY > 10;
    document.getElementById('navbar').classList.toggle('scrolled', scrolled);
    btnTop.classList.toggle('hidden', !scrolled);
  });
  btnTop.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  initDial();

  var btnExport = document.getElementById('btn-export-json');
  var btnImport = document.getElementById('btn-import-json');
  var btnReset = document.getElementById('btn-reset-data');
  if (btnExport) btnExport.addEventListener('click', function() { Export.toJSON(); });
  if (btnImport) btnImport.addEventListener('click', function() { Export.fromJSON(); });
  if (btnReset) btnReset.addEventListener('click', function() {
    showConfirm('确定要重置所有数据？此操作不可撤销。', function() { Storage.reset(); location.reload(); });
  });

  initBrandCard();

  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') { e.preventDefault(); enterEditMode(); }
  });
}

// ===== Brand Card =====
function initBrandCard() {
  var brand = document.getElementById('nav-brand');
  if (!brand) return;
  var anchor = brand.parentElement;
  var menu = document.getElementById('nav-brand-menu');
  if (!menu) return;
  var dot = brand.querySelector('.nav-dot');
  var items = menu.querySelectorAll('.nav-brand-menu-item, .nav-brand-menu-divider');
  var isExpanded = false;
  var tl = null;
  var pillWidth = brand.offsetWidth;

  function snapAnchor() { pillWidth = brand.offsetWidth; anchor.style.minWidth = pillWidth + 'px'; anchor.style.minHeight = brand.offsetHeight + 'px'; }

  gsap.set(menu, { height: 0, opacity: 0, paddingTop: 0, pointerEvents: 'none' });
  gsap.set(items, { opacity: 0, y: 8 });
  gsap.set(menu, { height: 'auto', paddingTop: 16 });
  var menuHeight = menu.offsetHeight;
  gsap.set(menu, { height: 0, paddingTop: 0 });

  function expand() {
    if (isExpanded) return;
    isExpanded = true;
    if (tl) tl.kill();
    anchor.style.minWidth = ''; anchor.style.minHeight = '';
    gsap.set(brand, { clearProps: 'width,background,borderColor,color,borderRadius,paddingTop,paddingBottom,paddingLeft,paddingRight,position,top,left,right,overflow' });
    brand.classList.remove('expanded');
    var fromBg = gsap.getProperty(brand, 'backgroundColor');
    var fromBorder = gsap.getProperty(brand, 'borderColor');
    var fromColor = gsap.getProperty(brand, 'color');
    var fromDot = dot ? gsap.getProperty(dot, 'color') : null;
    snapAnchor();
    gsap.set(brand, { position: 'absolute', top: 0, right: 0, left: 'auto', overflow: 'visible' });
    brand.classList.add('expanded');
    tl = gsap.timeline();
    tl.fromTo(brand, { background: fromBg, borderColor: fromBorder, color: fromColor }, { background: '#111', borderColor: '#111', color: '#fff', borderRadius: 24, paddingTop: 18, paddingBottom: 18, paddingLeft: 18, paddingRight: 24, width: 200, duration: 0.5, ease: 'power2.inOut' }, 0);
    if (dot && fromDot) tl.fromTo(dot, { color: fromDot }, { color: 'rgba(255,255,255,0.55)', duration: 0.5 }, 0);
    tl.to(menu, { height: menuHeight, paddingTop: 16, pointerEvents: 'auto', duration: 0.4, ease: 'power2.out' }, 0.18);
    tl.to(menu, { opacity: 1, duration: 0.25 }, 0.22);
    tl.to(items, { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' }, 0.32);
  }

  function collapse() {
    if (!isExpanded) return;
    isExpanded = false;
    if (tl) tl.kill();
    var fromBg = gsap.getProperty(brand, 'backgroundColor');
    var fromBorder = gsap.getProperty(brand, 'borderColor');
    var fromColor = gsap.getProperty(brand, 'color');
    var fromDot = dot ? gsap.getProperty(dot, 'color') : null;
    tl = gsap.timeline({
      onComplete: function() {
        brand.classList.remove('expanded');
        gsap.set(brand, { overflow: 'hidden', clearProps: 'width,background,borderColor,color,borderRadius,paddingTop,paddingBottom,paddingLeft,paddingRight,position,top,left,right' });
        if (dot) gsap.set(dot, { clearProps: 'color' });
        anchor.style.minWidth = ''; anchor.style.minHeight = '';
      }
    });
    tl.to(items, { opacity: 0, y: 8, duration: 0.15, stagger: 0.04, ease: 'power2.in' }, 0);
    tl.to(menu, { opacity: 0, paddingTop: 0, height: 0, duration: 0.3, ease: 'power2.in' }, 0.06);
    tl.set(menu, { pointerEvents: 'none' });
    tl.fromTo(brand, { background: fromBg, borderColor: fromBorder, color: fromColor }, { background: '#fff', borderColor: 'rgba(0,0,0,0.08)', color: '#111', borderRadius: 24, paddingTop: 6, paddingBottom: 6, paddingLeft: 6, paddingRight: 18, width: pillWidth, overflow: 'hidden', duration: 0.5, ease: 'power2.inOut' }, 0.08);
    if (dot && fromDot) tl.fromTo(dot, { color: fromDot }, { color: 'rgba(0,0,0,0.35)', duration: 0.4 }, 0.14);
  }

  brand.addEventListener('mouseenter', function() { if (!isExpanded) expand(); });
  items.forEach(function(item) { item.addEventListener('click', function(e) { e.stopPropagation(); if (isExpanded) collapse(); }); });
  brand.addEventListener('mouseleave', function() { if (isExpanded) collapse(); });
}

function updateEditUI() {
  var isEdit = document.body.classList.contains('edit-mode');
  var editToggle = document.getElementById('edit-toggle');
  var dialBtn = document.getElementById('btn-dial');
  if (isEdit) {
    if (dialBtn) dialBtn.classList.add('unlocked');
    if (editToggle) { editToggle.classList.remove('hidden'); setTimeout(function() { if (window.restartEditToggleWaves) window.restartEditToggleWaves(); }, 100); }
    showToast('编辑模式已开启 — 点击任意文字直接修改', 'success', 2500);
  } else {
    if (dialBtn) dialBtn.classList.remove('unlocked');
    if (editToggle) editToggle.classList.add('hidden');
    if (window.stopEditToggleWaves) window.stopEditToggleWaves();
  }
}

// ===== Edit Mode =====
function initEditMode() {
  initInlineEdit();
  initAvatarUpload();
  initModalForms();
  document.addEventListener('click', function(e) {
    if (!document.body.classList.contains('edit-mode')) {
      var editEl = e.target.closest('.edit-only');
      if (editEl) { e.preventDefault(); e.stopPropagation(); showToast('请先解锁编辑模式', 'warning', 2000); }
    }
  }, true);
}

function initInlineEdit() {
  document.addEventListener('click', function(e) {
    if (!document.body.classList.contains('edit-mode')) return;
    var el = e.target.closest('[data-editable]');
    if (!el) return;
    el.contentEditable = 'true';
    el.focus();
    selectAll(el);
  });
  document.addEventListener('blur', function(e) {
    var el = e.target.closest('[data-editable]');
    if (!el) return;
    el.contentEditable = 'false';
    var path = el.dataset.editable;
    if (path) { currentData = Storage.set(path, el.textContent.trim()); syncSharedFields(path); }
  }, true);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { var el = e.target.closest('[data-editable],[data-editable-contact]'); if (el) { e.preventDefault(); el.blur(); } }
    if (e.key === 'Escape') { var el = e.target.closest('[data-editable],[data-editable-contact]'); if (el) el.blur(); }
  });
}

function initAvatarUpload() {
  var uploadBtn = document.getElementById('avatar-upload-btn');
  var fileInput = document.getElementById('avatar-file-input');
  if (!uploadBtn || !fileInput) return;
  uploadBtn.addEventListener('click', function(e) {
    if (!document.body.classList.contains('edit-mode')) { showToast('请先解锁编辑模式', 'warning', 2000); return; }
    e.stopPropagation();
    fileInput.click();
  });
  fileInput.addEventListener('change', function() {
    Upload.image(this, function(base64) {
      currentData = Storage.set('profile.avatar', base64);
      document.getElementById('avatar-img').src = base64;
      var navAvatar = document.getElementById('nav-avatar');
      if (navAvatar) navAvatar.src = base64;
      showToast('头像已更新', 'success');
    });
  });
}

function selectAll(el) { var range = document.createRange(); range.selectNodeContents(el); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range); }

function initModalForms() {
  document.getElementById('btn-add-edu').addEventListener('click', function() { openEduModal(null); });
  document.getElementById('btn-add-campus').addEventListener('click', function() { openCampusModal(null); });
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (!document.body.classList.contains('edit-mode')) { showToast('请先解锁编辑模式', 'warning', 2000); return; }
    var id = btn.dataset.id;
    switch (btn.dataset.action) {
      case 'edit-edu': var item = findById(currentData.education, id); if (item) openEduModal(item); break;
      case 'delete-edu': showConfirm('确定删除这条教育经历？', function() { currentData.education = currentData.education.filter(function(e) { return e.id !== id; }); Storage.save(currentData); renderEducation(currentData); updateCounts(currentData); }); break;
      case 'edit-work': var work = findById(currentData.works, id); if (work) openWorkModal(work); break;
      case 'delete-work': showConfirm('确定删除这个作品？', function() { currentData.works = currentData.works.filter(function(w) { return w.id !== id; }); Storage.save(currentData); renderWorks(currentData); updateCounts(currentData); }); break;
      case 'edit-life': var lifeItem = findById(currentData.life, id); if (lifeItem) openLifeModal(lifeItem); break;
      case 'edit-campus': var campusItem = findById(currentData.campusLife, id); if (campusItem) openCampusModal(campusItem); break;
      case 'delete-campus': showConfirm('确定删除这条在校经历？', function() { currentData.campusLife = currentData.campusLife.filter(function(c) { return c.id !== id; }); Storage.save(currentData); renderCampus(currentData); updateCounts(currentData); }); break;
      case 'delete-life': showConfirm('确定删除这条生活记录？', function() { currentData.life = currentData.life.filter(function(l) { return l.id !== id; }); Storage.save(currentData); renderLife(currentData); updateCounts(currentData); }); break;
    }
  });
}

// ===== Education Modal =====
function openEduModal(item) {
  editingId = item ? item.id : null;
  document.getElementById('edu-modal-title').textContent = item ? '编辑教育经历' : '添加教育经历';
  document.getElementById('edu-school-input').value = item ? item.school || '' : '';
  document.getElementById('edu-major-input').value = item ? item.major || '' : '';
  document.getElementById('edu-degree-input').value = item ? item.degree || '本科' : '本科';
  document.getElementById('edu-period-input').value = item ? item.period || '' : '';
  document.getElementById('edu-desc-input').value = item ? item.description || '' : '';
  document.getElementById('edu-modal').classList.remove('hidden');
}

document.getElementById('edu-modal-cancel').addEventListener('click', function() { document.getElementById('edu-modal').classList.add('hidden'); });
document.getElementById('edu-modal-save').addEventListener('click', function() {
  var school = document.getElementById('edu-school-input').value.trim();
  if (!school) { showToast('请填写学校名称', 'warning'); return; }
  var entry = { id: editingId || 'edu_' + Date.now(), school: school, major: document.getElementById('edu-major-input').value.trim(), degree: document.getElementById('edu-degree-input').value, period: document.getElementById('edu-period-input').value.trim(), description: document.getElementById('edu-desc-input').value.trim() };
  if (editingId) { currentData.education = currentData.education.map(function(e) { return e.id === editingId ? entry : e; }); }
  else { currentData.education.push(entry); }
  Storage.save(currentData); renderEducation(currentData); updateCounts(currentData);
  document.getElementById('edu-modal').classList.add('hidden');
  showToast(editingId ? '教育经历已更新' : '教育经历已添加', 'success');
  editingId = null;
});

// ===== Work Modal =====
var tempWorkCover = null;
var tempWorkImages = [];
var tempWorkPdf = null;
var tempWorkPdfName = '';
var MAX_WORK_IMAGES = 15;

function renderWorkExtraThumbs() {
  var container = document.getElementById('work-extra-images');
  var countEl = document.getElementById('work-extra-count');
  var addBtn = document.getElementById('work-extra-add');
  container.querySelectorAll('.work-extra-thumb').forEach(function(el) { el.remove(); });
  tempWorkImages.forEach(function(src, i) {
    var thumb = document.createElement('div');
    thumb.className = 'work-extra-thumb';
    thumb.innerHTML = '<img src="' + src + '" alt=""><button class="work-extra-thumb-delete" data-idx="' + i + '" title="删除">✕</button>';
    container.insertBefore(thumb, addBtn);
  });
  countEl.textContent = tempWorkImages.length + ' / ' + MAX_WORK_IMAGES;
  addBtn.style.display = tempWorkImages.length >= MAX_WORK_IMAGES ? 'none' : '';
}

document.getElementById('work-extra-images').addEventListener('click', function(e) {
  var btn = e.target.closest('.work-extra-thumb-delete');
  if (!btn) return;
  e.stopPropagation();
  var idx = parseInt(btn.getAttribute('data-idx'));
  if (!isNaN(idx) && idx < tempWorkImages.length) { tempWorkImages.splice(idx, 1); renderWorkExtraThumbs(); }
});

function updateWorkPdfUI() {
  var emptyEl = document.getElementById('work-pdf-empty');
  var infoEl = document.getElementById('work-pdf-info');
  var nameEl = document.getElementById('work-pdf-name');
  if (tempWorkPdf) { emptyEl.classList.add('hidden'); infoEl.classList.remove('hidden'); nameEl.textContent = tempWorkPdfName || 'PDF 文件'; }
  else { emptyEl.classList.remove('hidden'); infoEl.classList.add('hidden'); }
}

function openWorkModal(item) {
  editingId = item ? item.id : null;
  tempWorkCover = item ? item.cover : null;
  tempWorkImages = (item && item.images) ? item.images.slice() : [];
  tempWorkPdf = (item && item.pdf) ? item.pdf : null;
  tempWorkPdfName = (item && item.pdfName) ? item.pdfName : '';
  document.getElementById('work-modal-title').textContent = item ? '编辑作品' : '添加作品';
  document.getElementById('work-title-input').value = item ? item.title || '' : '';
  document.getElementById('work-desc-input').value = item ? item.description || '' : '';
  document.getElementById('work-date-input').value = item ? item.date || '' : '';
  document.getElementById('work-link-input').value = item ? item.link || '' : '';
  document.getElementById('work-tags-input').value = item && item.tags ? item.tags.join(', ') : '';
  document.getElementById('work-featured-input').checked = item ? item.featured || false : false;
  document.getElementById('work-cover-preview').src = (item && item.cover) ? item.cover : 'assets/default-cover.svg';
  renderWorkExtraThumbs();
  updateWorkPdfUI();
  document.getElementById('work-modal').classList.remove('hidden');
}

document.getElementById('btn-add-work').addEventListener('click', function() { openWorkModal(null); });
document.getElementById('work-cover-upload').addEventListener('click', function() { document.getElementById('work-cover-input').click(); });
document.getElementById('work-cover-input').addEventListener('change', function() { Upload.image(this, function(base64) { document.getElementById('work-cover-preview').src = base64; tempWorkCover = base64; }); });
document.getElementById('work-extra-add').addEventListener('click', function() { if (tempWorkImages.length >= MAX_WORK_IMAGES) { showToast('最多上传 ' + MAX_WORK_IMAGES + ' 张图片', 'warning'); return; } document.getElementById('work-extra-input').click(); });
document.getElementById('work-extra-input').addEventListener('change', function() {
  var input = this;
  Upload.image(input, function(base64) { if (tempWorkImages.length >= MAX_WORK_IMAGES) { showToast('最多上传 ' + MAX_WORK_IMAGES + ' 张图片', 'warning'); return; } tempWorkImages.push(base64); renderWorkExtraThumbs(); });
  input.value = '';
});
document.getElementById('work-pdf-upload-area').addEventListener('click', function(e) { if (e.target.closest('#work-pdf-delete')) return; document.getElementById('work-pdf-input').click(); });
document.getElementById('work-pdf-input').addEventListener('change', function() { var input = this; Upload.pdf(input, function(base64, fileName) { tempWorkPdf = base64; tempWorkPdfName = fileName; updateWorkPdfUI(); }); input.value = ''; });
document.getElementById('work-pdf-delete').addEventListener('click', function(e) { e.stopPropagation(); tempWorkPdf = null; tempWorkPdfName = ''; updateWorkPdfUI(); });
document.getElementById('work-modal-cancel').addEventListener('click', function() { document.getElementById('work-modal').classList.add('hidden'); tempWorkCover = null; tempWorkImages = []; tempWorkPdf = null; tempWorkPdfName = ''; });
document.getElementById('work-modal-save').addEventListener('click', function() {
  var title = document.getElementById('work-title-input').value.trim();
  if (!title) { showToast('请填写作品标题', 'warning'); return; }
  var tagsStr = document.getElementById('work-tags-input').value.trim();
  var tags = tagsStr ? tagsStr.split(',').map(function(t) { return t.trim(); }).filter(Boolean) : [];
  var entry = { id: editingId || 'work_' + Date.now(), title: title, description: document.getElementById('work-desc-input').value.trim(), cover: tempWorkCover, coverAlt: title, images: tempWorkImages.slice(), pdf: tempWorkPdf, pdfName: tempWorkPdfName, tags: tags, link: document.getElementById('work-link-input').value.trim(), date: document.getElementById('work-date-input').value.trim(), featured: document.getElementById('work-featured-input').checked };
  if (editingId) { currentData.works = currentData.works.map(function(w) { return w.id === editingId ? entry : w; }); }
  else { currentData.works.push(entry); }
  Storage.save(currentData); renderWorks(currentData); updateCounts(currentData);
  document.getElementById('work-modal').classList.add('hidden');
  showToast(editingId ? '作品已更新' : '作品已添加', 'success');
  editingId = null; tempWorkCover = null; tempWorkImages = []; tempWorkPdf = null; tempWorkPdfName = '';
});

// ===== Life Modal =====
var tempLifeImages = [];

function openLifeModal(item) {
  editingId = item ? item.id : null;
  tempLifeImages = item ? (item.images || []).slice() : [];
  document.getElementById('life-modal-title').textContent = item ? '编辑生活记录' : '记录生活';
  document.getElementById('life-date-input').value = item ? item.date || '' : '';
  document.getElementById('life-title-input').value = item ? item.title || '' : '';
  document.getElementById('life-content-input').value = item ? item.content || '' : '';
  document.querySelectorAll('#life-modal .mood-btn').forEach(function(btn) { btn.classList.toggle('selected', btn.dataset.mood === (item ? item.mood : 'happy')); });
  renderLifeImagePreviews();
  document.getElementById('life-modal').classList.remove('hidden');
}

document.getElementById('btn-add-life').addEventListener('click', function() { openLifeModal(null); });
document.getElementById('life-image-upload').addEventListener('click', function() { if (tempLifeImages.length >= 4) { showToast('最多上传 4 张图片', 'warning'); return; } document.getElementById('life-image-input').click(); });
document.getElementById('life-image-input').addEventListener('change', function() { Upload.image(this, function(base64) { if (tempLifeImages.length >= 4) { showToast('最多上传 4 张图片', 'warning'); return; } tempLifeImages.push(base64); renderLifeImagePreviews(); }); });

function renderLifeImagePreviews() {
  var container = document.getElementById('life-image-previews');
  var html = '';
  tempLifeImages.forEach(function(img, index) { html += '<div class="life-preview-thumb" data-index="' + index + '"><img src="' + img + '" alt="预览"><button class="life-preview-delete" data-index="' + index + '">&times;</button></div>'; });
  html += '<div class="life-preview-add" id="life-image-upload">+</div>';
  container.innerHTML = html;
  document.getElementById('life-image-upload').addEventListener('click', function() { if (tempLifeImages.length >= 4) { showToast('最多上传 4 张图片', 'warning'); return; } document.getElementById('life-image-input').click(); });
  container.querySelectorAll('.life-preview-delete').forEach(function(btn) { btn.addEventListener('click', function(e) { e.stopPropagation(); var idx = parseInt(this.dataset.index); tempLifeImages.splice(idx, 1); renderLifeImagePreviews(); }); });
}

document.getElementById('life-modal').addEventListener('click', function(e) { var moodBtn = e.target.closest('.mood-btn'); if (moodBtn) { document.querySelectorAll('#life-modal .mood-btn').forEach(function(b) { b.classList.remove('selected'); }); moodBtn.classList.add('selected'); } });
document.getElementById('life-modal-cancel').addEventListener('click', function() { document.getElementById('life-modal').classList.add('hidden'); tempLifeImages = []; });
document.getElementById('life-modal-save').addEventListener('click', function() {
  var title = document.getElementById('life-title-input').value.trim();
  var content = document.getElementById('life-content-input').value.trim();
  if (!title && !content) { showToast('请至少填写标题或内容', 'warning'); return; }
  var selectedMood = document.querySelector('#life-modal .mood-btn.selected');
  var entry = { id: editingId || 'life_' + Date.now(), date: document.getElementById('life-date-input').value.trim(), title: title, content: content, images: tempLifeImages.slice(), mood: selectedMood ? selectedMood.dataset.mood : 'happy' };
  if (editingId) { currentData.life = currentData.life.map(function(l) { return l.id === editingId ? entry : l; }); }
  else { currentData.life.push(entry); }
  Storage.save(currentData); renderLife(currentData); updateCounts(currentData);
  document.getElementById('life-modal').classList.add('hidden');
  showToast(editingId ? '生活记录已更新' : '生活记录已添加', 'success');
  editingId = null; tempLifeImages = [];
});

// ===== Campus Modal =====
var tempCampusImage = null;

function openCampusModal(item) {
  editingId = item ? item.id : null;
  tempCampusImage = item ? item.image : null;
  document.getElementById('campus-modal-title').textContent = item ? '编辑在校经历' : '添加在校经历';
  document.getElementById('campus-title-input').value = item ? item.title || '' : '';
  document.getElementById('campus-type-input').value = item ? item.type || 'competition' : 'competition';
  document.getElementById('campus-date-input').value = item ? item.date || '' : '';
  document.getElementById('campus-desc-input').value = item ? item.description || '' : '';
  var preview = document.getElementById('campus-image-preview');
  var hint = document.getElementById('campus-upload-hint');
  if (tempCampusImage) { preview.src = tempCampusImage; preview.style.display = 'block'; hint.style.display = 'none'; }
  else { preview.style.display = 'none'; hint.style.display = ''; }
  document.getElementById('campus-modal').classList.remove('hidden');
}

document.getElementById('campus-image-upload').addEventListener('click', function() { document.getElementById('campus-image-input').click(); });
document.getElementById('campus-image-input').addEventListener('change', function() { Upload.image(this, function(base64) { var preview = document.getElementById('campus-image-preview'); var hint = document.getElementById('campus-upload-hint'); preview.src = base64; preview.style.display = 'block'; hint.style.display = 'none'; tempCampusImage = base64; }); });
document.getElementById('campus-modal-cancel').addEventListener('click', function() { document.getElementById('campus-modal').classList.add('hidden'); tempCampusImage = null; });
document.getElementById('campus-modal-save').addEventListener('click', function() {
  var title = document.getElementById('campus-title-input').value.trim();
  if (!title) { showToast('请填写活动标题', 'warning'); return; }
  var entry = { id: editingId || 'campus_' + Date.now(), title: title, type: document.getElementById('campus-type-input').value, date: document.getElementById('campus-date-input').value.trim(), description: document.getElementById('campus-desc-input').value.trim(), image: tempCampusImage };
  if (editingId) { currentData.campusLife = currentData.campusLife.map(function(c) { return c.id === editingId ? entry : c; }); }
  else { currentData.campusLife.push(entry); }
  Storage.save(currentData); renderCampus(currentData); updateCounts(currentData);
  document.getElementById('campus-modal').classList.add('hidden');
  showToast(editingId ? '在校经历已更新' : '在校经历已添加', 'success');
  editingId = null; tempCampusImage = null;
});

// ===== Modal Overlay Click-to-Close =====
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    if (!e.target.id) { if (e.target.parentNode) e.target.parentNode.removeChild(e.target); }
    else { e.target.classList.add('hidden'); }
    tempWorkCover = null; tempWorkImages = []; tempWorkPdf = null; tempWorkPdfName = ''; tempLifeImages = []; tempCampusImage = null; editingId = null;
  }
});

// ===== Work Detail Panel =====
var _workDetailImages = [];
var _workDetailIndex = 0;

function openWorkDetail(workId) {
  var work = findById(currentData.works || [], workId);
  if (!work) return;
  var images = [];
  if (work.cover) images.push(work.cover);
  if (work.images) images = images.concat(work.images);
  images = images.filter(function(src, i) { return images.indexOf(src) === i; });
  _workDetailImages = images;
  _workDetailIndex = 0;
  renderWorkDetailGallery();
  document.getElementById('work-detail-title').textContent = work.title || '';
  var dateEl = document.getElementById('work-detail-date');
  dateEl.textContent = work.date || '';
  dateEl.style.display = work.date ? '' : 'none';
  var tagsEl = document.getElementById('work-detail-tags');
  if (work.tags && work.tags.length > 0) { tagsEl.innerHTML = work.tags.map(function(tag) { return '<span class="work-tag">' + escapeHtml(tag) + '</span>'; }).join(''); tagsEl.style.display = ''; }
  else { tagsEl.style.display = 'none'; }
  var descEl = document.getElementById('work-detail-desc');
  descEl.textContent = work.description || '';
  descEl.style.display = work.description ? '' : 'none';
  var linkEl = document.getElementById('work-detail-link');
  if (work.link) { linkEl.href = work.link; linkEl.classList.remove('hidden'); } else { linkEl.classList.add('hidden'); }
  var pdfBtn = document.getElementById('work-detail-pdf-btn');
  if (work.pdf) { pdfBtn.classList.remove('hidden'); pdfBtn.onclick = function() { fetch(work.pdf).then(function(res) { return res.blob(); }).then(function(blob) { window.open(URL.createObjectURL(blob), '_blank'); }).catch(function() { window.open(work.pdf, '_blank'); }); }; }
  else { pdfBtn.classList.add('hidden'); }
  document.getElementById('work-detail-panel').classList.add('open');
  document.getElementById('work-detail-backdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.querySelector('.work-detail-panel').scrollTop = 0;
  lucide.createIcons();
}

function renderWorkDetailGallery() {
  var mainImg = document.getElementById('work-detail-main-img');
  var thumbsEl = document.getElementById('work-detail-thumbs');
  var prevBtn = document.getElementById('work-detail-prev');
  var nextBtn = document.getElementById('work-detail-next');
  var counter = document.getElementById('work-detail-img-counter');
  if (_workDetailImages.length === 0) { mainImg.src = 'assets/default-cover.svg'; thumbsEl.innerHTML = ''; prevBtn.classList.add('hidden'); nextBtn.classList.add('hidden'); counter.classList.add('hidden'); return; }
  mainImg.src = _workDetailImages[_workDetailIndex];
  if (_workDetailImages.length <= 1) { prevBtn.classList.add('hidden'); nextBtn.classList.add('hidden'); counter.classList.add('hidden'); }
  else { prevBtn.classList.remove('hidden'); nextBtn.classList.remove('hidden'); counter.classList.remove('hidden'); counter.textContent = (_workDetailIndex + 1) + ' / ' + _workDetailImages.length; }
  if (_workDetailImages.length <= 1) { thumbsEl.innerHTML = ''; }
  else { thumbsEl.innerHTML = _workDetailImages.map(function(src, i) { return '<div class="work-detail-thumb' + (i === _workDetailIndex ? ' active' : '') + '" data-idx="' + i + '"><img src="' + src + '" alt="" loading="lazy"></div>'; }).join(''); }
}

function workDetailGoTo(idx) { if (idx < 0 || idx >= _workDetailImages.length) return; _workDetailIndex = idx; renderWorkDetailGallery(); lucide.createIcons(); }
function workDetailPrev() { if (_workDetailImages.length === 0) return; workDetailGoTo((_workDetailIndex - 1 + _workDetailImages.length) % _workDetailImages.length); }
function workDetailNext() { if (_workDetailImages.length === 0) return; workDetailGoTo((_workDetailIndex + 1) % _workDetailImages.length); }

document.getElementById('work-detail-prev').addEventListener('click', function(e) { e.stopPropagation(); workDetailPrev(); });
document.getElementById('work-detail-next').addEventListener('click', function(e) { e.stopPropagation(); workDetailNext(); });
document.getElementById('work-detail-thumbs').addEventListener('click', function(e) { var thumb = e.target.closest('.work-detail-thumb'); if (!thumb) return; var idx = parseInt(thumb.getAttribute('data-idx')); if (!isNaN(idx)) workDetailGoTo(idx); });

document.addEventListener('keydown', function(e) {
  var panel = document.getElementById('work-detail-panel');
  if (!panel.classList.contains('open')) return;
  if (e.key === 'ArrowLeft') workDetailPrev();
  if (e.key === 'ArrowRight') workDetailNext();
});

function closeWorkDetail() { document.getElementById('work-detail-panel').classList.remove('open'); document.getElementById('work-detail-backdrop').classList.remove('open'); document.body.style.overflow = ''; _workDetailImages = []; _workDetailIndex = 0; }
document.getElementById('work-detail-backdrop').addEventListener('click', function() { closeWorkDetail(); });

// ===== Image Lightbox =====
var _lbScale = 1;
var _lbTranslateX = 0;
var _lbTranslateY = 0;
var _lbDragging = false;
var _lbDragStartX = 0;
var _lbDragStartY = 0;
var _lbStartTX = 0;
var _lbStartTY = 0;

function lbApplyTransform() { var img = document.getElementById('img-lightbox-img'); if (!img) return; img.style.transform = 'translate(' + _lbTranslateX + 'px, ' + _lbTranslateY + 'px) scale(' + _lbScale + ')'; }

function openLightbox(src) {
  _lbScale = 1; _lbTranslateX = 0; _lbTranslateY = 0;
  var img = document.getElementById('img-lightbox-img');
  img.src = src; img.style.transform = '';
  document.getElementById('img-lightbox').classList.remove('hidden');
}

function closeLightbox() { document.getElementById('img-lightbox').classList.add('hidden'); document.getElementById('img-lightbox-img').src = ''; _lbScale = 1; _lbTranslateX = 0; _lbTranslateY = 0; }

document.getElementById('img-lightbox').addEventListener('wheel', function(e) {
  e.preventDefault();
  var delta = e.deltaY > 0 ? -0.15 : 0.15;
  var newScale = Math.max(0.5, Math.min(5, _lbScale + delta));
  var rect = this.getBoundingClientRect();
  var cx = e.clientX - rect.left - rect.width / 2;
  var cy = e.clientY - rect.top - rect.height / 2;
  var scaleRatio = newScale / _lbScale;
  _lbTranslateX = cx + scaleRatio * (_lbTranslateX - cx);
  _lbTranslateY = cy + scaleRatio * (_lbTranslateY - cy);
  _lbScale = newScale;
  lbApplyTransform();
  var hint = document.getElementById('img-lightbox-zoom-hint');
  hint.textContent = Math.round(_lbScale * 100) + '%';
  hint.style.opacity = '1';
  clearTimeout(hint._timeout);
  hint._timeout = setTimeout(function() { hint.style.opacity = '0'; }, 800);
}, { passive: false });

var stage = document.getElementById('img-lightbox-stage');
stage.addEventListener('mousedown', function(e) { if (e.button !== 0) return; _lbDragging = true; stage.classList.add('dragging'); _lbDragStartX = e.clientX; _lbDragStartY = e.clientY; _lbStartTX = _lbTranslateX; _lbStartTY = _lbTranslateY; });
document.addEventListener('mousemove', function(e) { if (!_lbDragging) return; _lbTranslateX = _lbStartTX + (e.clientX - _lbDragStartX); _lbTranslateY = _lbStartTY + (e.clientY - _lbDragStartY); lbApplyTransform(); });
document.addEventListener('mouseup', function() { if (_lbDragging) { _lbDragging = false; stage.classList.remove('dragging'); } });
document.getElementById('img-lightbox').addEventListener('click', function(e) { if (e.target === this) closeLightbox(); });
document.getElementById('work-detail-main-img').addEventListener('click', function() { if (this.src && this.src !== window.location.href) openLightbox(this.src); });
document.getElementById('img-lightbox-close').addEventListener('click', function(e) { e.stopPropagation(); closeLightbox(); });

document.addEventListener('click', function(e) {
  var card = e.target.closest('.work-card');
  if (!card) return;
  if (document.body.classList.contains('edit-mode')) return;
  if (e.target.closest('a, button')) return;
  var id = card.getAttribute('data-id');
  if (id) openWorkDetail(id);
});

document.getElementById('work-detail-close').addEventListener('click', function(e) { e.stopPropagation(); closeWorkDetail(); });

document.addEventListener('keydown', function(e) {
  if (e.key !== 'Escape') return;
  var lb = document.getElementById('img-lightbox');
  if (!lb.classList.contains('hidden')) { closeLightbox(); return; }
  if (document.getElementById('work-detail-panel').classList.contains('open')) { closeWorkDetail(); return; }
  if (dialOpen) { closeDial(); }
});

// ===== Helpers =====
function findById(array, id) { return array.find(function(item) { return item.id === id; }); }

function escapeHtml(str) { if (!str) return ''; return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }

function syncSharedFields(path) {
  var val = currentData;
  var keys = path.split('.');
  for (var i = 0; i < keys.length; i++) { if (val == null) return; val = val[keys[i]]; }
  var text = val || '';
  switch (path) {
    case 'profile.name': document.getElementById('hero-name').textContent = text; document.getElementById('about-name').textContent = text; document.getElementById('nav-name').textContent = text; break;
    case 'profile.title': document.getElementById('hero-eyebrow-text').textContent = text || '个人主页'; document.getElementById('about-title').textContent = text || '待填写'; break;
    case 'profile.bio': document.getElementById('about-bio').textContent = text || '点击编辑，写下你的个人简介...'; break;
    case 'profile.heroTagline': document.getElementById('hero-tagline').textContent = text || '记录生活，分享热爱。'; break;
  }
}

// ===== Toast =====
function showToast(message, type, duration) {
  type = type || 'success'; duration = duration || 3000;
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(function() { toast.classList.add('show'); });
  setTimeout(function() { toast.classList.remove('show'); setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300); }, duration);
}

// ===== Confirm Dialog =====
function showConfirm(message, onConfirm) {
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = '<div class="modal-box modal-sm"><p style="margin-bottom:20px;color:var(--text);text-align:center;">' + escapeHtml(message) + '</p><div class="modal-actions" style="justify-content:center;"><button class="btn ghost modal-cancel">取消</button><button class="btn primary modal-confirm" style="background:#1c1c1c;border-color:#1c1c1c;color:#fff;">确认</button></div></div>';
  document.body.appendChild(overlay);
  overlay.querySelector('.modal-cancel').addEventListener('click', function() { document.body.removeChild(overlay); });
  overlay.querySelector('.modal-confirm').addEventListener('click', function() { document.body.removeChild(overlay); if (onConfirm) onConfirm(); });
}

// ===== Animations =====
function initAnimations() {
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.matches) return;
  if (typeof gsap !== 'undefined') {
    gsap.set('.hero-eyebrow', { opacity: 0, y: 20 });
    gsap.set('.hero-title', { opacity: 0, y: 32 });
    gsap.set('.hero-tagline', { opacity: 0, y: 20 });
    gsap.set('.hero-cta .btn', { opacity: 0, y: 16 });
    gsap.set('.hero-scroll-hint', { opacity: 0 });
    gsap.set('.hero-geo', { opacity: 0, scale: 0.85 });
    gsap.set('.hero-ambient-orb', { opacity: 0, scale: 0.6 });

    var tl = gsap.timeline({ delay: 0.3 });
    tl.to('.hero-ambient-orb', { opacity: 0.45, scale: 1, duration: 2, stagger: 0.3, ease: 'power3.out' });
    tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '-=1.2');
    tl.to('.hero-title', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.25');
    tl.to('.hero-tagline', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.25');
    tl.to('.hero-cta .btn', { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out' }, '-=0.2');
    tl.to('.hero-geo', { opacity: 0.4, scale: 1, duration: 1.5, ease: 'power2.out' }, '-=0.8');
    tl.to('.hero-scroll-hint', { opacity: 0.4, duration: 0.6, ease: 'power2.out' }, '-=0.4');
    gsap.from('#navbar', { y: -40, opacity: 0, duration: 0.6, ease: 'power3.out' });
  }
}

function initReadModeAnimations() {
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.matches) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.to('.hero-ambient-orb:nth-child(1)', { scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.8 }, y: -120, x: 60, scale: 1.2 });
  gsap.to('.hero-ambient-orb:nth-child(2)', { scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 }, y: 80, x: -40, scale: 0.85 });
  gsap.to('.hero-ambient-orb:nth-child(3)', { scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }, y: -60, x: -30, scale: 1.1 });
  gsap.to('.hero-geo', { scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.5 }, y: 100, opacity: 0.15 });
  gsap.to('.hero-content', { scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.5 }, y: -60, opacity: 0.5 });

  ['#about', '#education', '#campus', '#skills', '#works', '#life'].forEach(function(selector) {
    var section = document.querySelector(selector);
    if (!section) return;
    gsap.fromTo(section, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 25%', toggleActions: 'play none none reverse' } });
  });

  gsap.utils.toArray('.section-title').forEach(function(title) {
    gsap.from(title, { scrollTrigger: { trigger: title, start: 'top 92%', toggleActions: 'play none none reverse' }, y: 40, opacity: 0, duration: 0.7, ease: 'power3.out' });
  });

  gsap.utils.toArray('.work-card').forEach(function(card, i) {
    gsap.from(card, { scrollTrigger: { trigger: '#works', start: 'top 80%', toggleActions: 'play none none reverse' }, y: 50, scale: 0.94, opacity: 0, duration: 0.55, delay: Math.min(i * 0.07, 0.4), ease: 'power3.out' });
  });

  gsap.utils.toArray('.contact-card').forEach(function(card, i) {
    gsap.from(card, { scrollTrigger: { trigger: '#contact', start: 'top 85%', toggleActions: 'play none none reverse' }, scale: 0.8, opacity: 0, duration: 0.45, delay: Math.min(i * 0.05, 0.3), ease: 'back.out(1.7)' });
  });

  gsap.utils.toArray('.timeline-item').forEach(function(item, i) {
    gsap.from(item, { scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none reverse' }, x: -30, opacity: 0, duration: 0.5, delay: Math.min(i * 0.08, 0.35), ease: 'power3.out' });
  });

  gsap.utils.toArray('.life-item').forEach(function(item, i) {
    gsap.from(item, { scrollTrigger: { trigger: '#life', start: 'top 85%', toggleActions: 'play none none reverse' }, y: 40, scale: 0.92, opacity: 0, duration: 0.5, delay: Math.min(i * 0.06, 0.35), ease: 'power3.out' });
  });

  gsap.utils.toArray('.skill-card').forEach(function(card, i) {
    gsap.from(card, { scrollTrigger: { trigger: card.closest('.skill-category') || card, start: 'top 88%', toggleActions: 'play none none reverse' }, y: 30, x: 20, opacity: 0, duration: 0.4, delay: Math.min(i * 0.05, 0.3), ease: 'power3.out' });
  });

  gsap.from('.about-avatar-col', { scrollTrigger: { trigger: '#about', start: 'top 85%', toggleActions: 'play none none reverse' }, y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' });
  gsap.from('.about-info-col', { scrollTrigger: { trigger: '#about', start: 'top 85%', toggleActions: 'play none none reverse' }, y: 30, opacity: 0, duration: 0.6, delay: 0.1, ease: 'power3.out' });
  gsap.to('.hero-scroll-hint', { scrollTrigger: { trigger: '#hero', start: 'top 50%', end: 'bottom 50%', scrub: 0.5 }, opacity: 0, y: 20 });
}

// ===== Rotary Dial System =====
var dialEntered = '';
var dialOpen = false;
var DIAL_CODE = '0825';
var skipAuth = localStorage.getItem('gaoteli_skip_auth') === 'true';

function initDial() {
  var numbersContainer = document.getElementById('dial-numbers');
  var numCount = 10;
  var radiusPct = 38;

  for (var i = 0; i < numCount; i++) {
    var angle = (i / numCount) * Math.PI * 2 - Math.PI / 2;
    var left = 50 + Math.cos(angle) * radiusPct;
    var top = 50 + Math.sin(angle) * radiusPct;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dial-num-btn';
    btn.textContent = i;
    btn.style.left = left + '%';
    btn.style.top = top + '%';
    btn.setAttribute('data-num', i);
    btn.addEventListener('click', function(e) { e.preventDefault(); onDialNumber(parseInt(this.getAttribute('data-num'))); });
    numbersContainer.appendChild(btn);
  }

  document.getElementById('btn-dial').addEventListener('click', function() {
    if (document.body.classList.contains('edit-mode')) { exitEditMode(); }
    else if (skipAuth) { enterEditMode(); }
    else { openDial(); }
  });
  document.getElementById('dial-close').addEventListener('click', closeDial);
  document.getElementById('dial-backdrop').addEventListener('click', closeDial);
  document.getElementById('dial-clear').addEventListener('click', resetDial);

  initEditToggle();
}

// ===== Edit Toggle =====
function initEditToggle() {
  var toggle = document.getElementById('edit-toggle');
  var btnA = document.getElementById('edit-toggle-btn');
  var activeB = document.getElementById('edit-toggle-active');
  var pill = document.getElementById('edit-toggle-pill');
  var canvas = document.getElementById('edit-toggle-canvas');
  var miniCvs = document.getElementById('edit-toggle-mini-canvas');
  var sweep = document.getElementById('edit-toggle-sweep');
  var label = document.querySelector('.edit-toggle-label');
  var checkbox = document.getElementById('skip-auth-checkbox');
  if (!btnA || !pill || !canvas || !miniCvs) return;

  var ctx = canvas.getContext('2d');
  var miniCtx = miniCvs.getContext('2d');
  var tl = null;
  var pillW = 0;
  var isAnimating = false;
  var isActive = false;
  var bigWaveId = null;
  var miniWaveId = null;
  var autoTimer = null;

  var waves = [
    { color: 'rgba(0,0,0,0.5)',  amp: 0.36, freq: 0.018, phase: 0 },
    { color: 'rgba(255,217,61,0.78)',   amp: 0.30, freq: 0.014, phase: 1.2 },
    { color: 'rgba(107,203,119,0.78)',  amp: 0.33, freq: 0.016, phase: 2.8 },
    { color: 'rgba(77,150,255,0.8)',    amp: 0.28, freq: 0.020, phase: 4.0 },
    { color: 'rgba(255,146,43,0.75)',   amp: 0.32, freq: 0.015, phase: 5.5 },
    { color: 'rgba(162,89,255,0.72)',   amp: 0.26, freq: 0.022, phase: 3.5 }
  ];

  function resizeBig() { var rect = pill.getBoundingClientRect(); var dpr = window.devicePixelRatio || 1; canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr, dpr); }

  function drawBigWaves() {
    resizeBig();
    var w = pill.getBoundingClientRect().width;
    var h = pill.getBoundingClientRect().height;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.beginPath(); ctx.roundRect(0, 0, w, h, h / 2); ctx.clip();
    for (var i = waves.length - 1; i >= 0; i--) {
      var wv = waves[i]; wv.phase += 0.025;
      ctx.beginPath();
      for (var x = 0; x <= w; x += 2) { var y = h / 2 + Math.sin(x * wv.freq + wv.phase) * h * wv.amp; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      ctx.fillStyle = wv.color; ctx.fill();
    }
    ctx.restore();
    bigWaveId = requestAnimationFrame(drawBigWaves);
  }

  function stopBigWaves() { if (bigWaveId) { cancelAnimationFrame(bigWaveId); bigWaveId = null; } resizeBig(); ctx.clearRect(0, 0, canvas.width, canvas.height); }

  function resizeMini() { var rect = activeB.getBoundingClientRect(); var dpr = window.devicePixelRatio || 1; miniCvs.width = rect.width * dpr; miniCvs.height = rect.height * dpr; miniCtx.setTransform(1,0,0,1,0,0); miniCtx.scale(dpr, dpr); }

  function drawMiniWaves() {
    resizeMini();
    var r = activeB.getBoundingClientRect().width;
    miniCtx.clearRect(0, 0, r, r);
    miniCtx.save();
    miniCtx.beginPath(); miniCtx.arc(r/2, r/2, r/2 - 1, 0, Math.PI * 2); miniCtx.clip();
    for (var i = waves.length - 1; i >= 0; i--) {
      var wv = waves[i]; wv.phase += 0.02;
      miniCtx.beginPath();
      for (var x = 0; x <= r; x += 1.5) { var y = r/2 + Math.sin(x * wv.freq * 1.5 + wv.phase) * r * wv.amp * 0.7; if (x === 0) miniCtx.moveTo(x, y); else miniCtx.lineTo(x, y); }
      miniCtx.lineTo(r, r); miniCtx.lineTo(0, r); miniCtx.closePath();
      miniCtx.fillStyle = wv.color; miniCtx.fill();
    }
    miniCtx.restore();
    miniWaveId = requestAnimationFrame(drawMiniWaves);
  }

  function startMiniWaves() { stopMiniWaves(); miniWaveId = requestAnimationFrame(drawMiniWaves); }
  function stopMiniWaves() { if (miniWaveId) { cancelAnimationFrame(miniWaveId); miniWaveId = null; } resizeMini(); miniCtx.clearRect(0, 0, miniCvs.width, miniCvs.height); }

  function enableSkipAuth() { checkbox.checked = true; skipAuth = true; localStorage.setItem('gaoteli_skip_auth', 'true'); }
  function disableSkipAuth() { checkbox.checked = false; skipAuth = false; localStorage.setItem('gaoteli_skip_auth', 'false'); }

  function showCircleState() {
    if (isActive) { gsap.set(btnA, { opacity: 0, scale: 0.6, pointerEvents: 'none' }); gsap.set(activeB, { opacity: 1, scale: 1, pointerEvents: 'auto' }); }
    else { gsap.set(activeB, { opacity: 0, scale: 0.6, pointerEvents: 'none' }); gsap.set(btnA, { opacity: 1, scale: 1, pointerEvents: 'auto' }); }
  }

  function expand(fromActive) {
    if (isAnimating) return;
    isAnimating = true;
    if (tl) tl.kill();
    stopBigWaves(); stopMiniWaves();
    clearTimeout(autoTimer);
    var toActive = !fromActive;
    var fromEl = fromActive ? activeB : btnA;
    gsap.set(pill, { opacity: 0, width: 40, height: 40, padding: 0, borderRadius: 20, pointerEvents: 'auto', background: '#fff', borderColor: 'rgba(0,0,0,0.06)' });
    pill.style.opacity = '0'; pill.style.width = 'auto'; pill.style.padding = '0 20px';
    pillW = pill.getBoundingClientRect().width;
    pill.style.width = '40px'; pill.style.padding = '0'; pill.style.opacity = '';
    tl = gsap.timeline({ onComplete: function() { isAnimating = false; } });
    tl.to(fromEl, { opacity: 0, scale: 0.6, duration: 0.12, ease: 'power2.in' }, 0);
    tl.set(pill, { opacity: 1 }, 0.08);
    tl.to(pill, { width: pillW, paddingLeft: 20, paddingRight: 20, paddingTop: 0, paddingBottom: 0, borderRadius: 20, duration: 0.45, ease: 'back.out(1.3)' }, 0.1);
    var sweepFrom = fromActive ? '100%' : '-60%';
    var sweepTo = fromActive ? '-60%' : '100%';
    tl.set(sweep, { left: sweepFrom, opacity: 1 }, 0.48);
    tl.to(sweep, { left: sweepTo, duration: 0.5, ease: 'power2.inOut' }, 0.48);
    tl.set(sweep, { opacity: 0 }, 0.98);
    tl.to(label, { opacity: 1, duration: 0.3 }, 0.6);
    tl.call(function() { if (toActive) { canvas.style.opacity = '1'; bigWaveId = requestAnimationFrame(drawBigWaves); } }, null, 0.75);
    tl.call(function() { if (toActive) enableSkipAuth(); else disableSkipAuth(); }, null, 0.8);
    tl.call(function() { autoTimer = setTimeout(function() { collapse(toActive); }, 1000); }, null, 0.9);
  }

  function collapse(toActive) {
    clearTimeout(autoTimer);
    if (tl) tl.kill();
    stopBigWaves();
    isActive = toActive;
    tl = gsap.timeline({ onComplete: function() { isAnimating = false; } });
    tl.to(label, { opacity: 0, duration: 0.12 }, 0);
    tl.to(canvas, { opacity: 0, duration: 0.2 }, 0);
    tl.to(pill, { width: 40, paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, borderRadius: 20, duration: 0.35, ease: 'power2.in' }, 0.06);
    if (!toActive) { tl.to(pill, { background: '#111', borderColor: '#111', duration: 0.3 }, 0.06); }
    tl.set(pill, { opacity: 0, pointerEvents: 'none' }, 0.4);
    var toEl = toActive ? activeB : btnA;
    tl.call(function() { showCircleState(); stopBigWaves(); if (toActive) startMiniWaves(); else stopMiniWaves(); }, null, 0.35);
    tl.to(toEl, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.5)' }, 0.38);
  }

  btnA.addEventListener('click', function(e) { e.stopPropagation(); if (!isAnimating) expand(false); });
  activeB.addEventListener('click', function(e) { e.stopPropagation(); if (!isAnimating) expand(true); });

  if (skipAuth) { isActive = true; showCircleState(); } else { showCircleState(); }

  window.stopEditToggleWaves = function() { stopBigWaves(); stopMiniWaves(); clearTimeout(autoTimer); if (tl) tl.kill(); gsap.set(pill, { opacity: 0, pointerEvents: 'none', width: 40, height: 40, padding: 0, borderRadius: 20 }); gsap.set(canvas, { opacity: 0 }); gsap.set(sweep, { opacity: 0 }); gsap.set(label, { opacity: 0 }); isAnimating = false; };
  window.restartEditToggleWaves = function() { stopMiniWaves(); showCircleState(); if (isActive) startMiniWaves(); };
}

function openDial() {
  if (dialOpen) return;
  dialOpen = true;
  resetDial();
  var overlay = document.getElementById('dial-overlay');
  var dialBtn = document.getElementById('btn-dial');
  dialBtn.classList.add('spinning');
  overlay.classList.remove('hidden');
  if (typeof gsap !== 'undefined') {
    gsap.fromTo('#dial-panel', { opacity: 0, scale: 0.7, y: 30, x: 20 }, { opacity: 1, scale: 1, y: 0, x: 0, duration: 0.5, ease: 'back.out(1.3)' });
    gsap.fromTo('.dial-num-btn', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.02, ease: 'back.out(2)', delay: 0.1 });
    gsap.fromTo('.dial-digit-slot', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.05, ease: 'power2.out', delay: 0.08 });
  }
  lucide.createIcons();
}

function closeDial() {
  if (!dialOpen) return;
  dialOpen = false;
  var overlay = document.getElementById('dial-overlay');
  var dialBtn = document.getElementById('btn-dial');
  dialBtn.classList.remove('spinning');
  if (typeof gsap !== 'undefined') { gsap.to('#dial-panel', { opacity: 0, scale: 0.8, y: 20, x: 10, duration: 0.2, ease: 'power2.in', onComplete: function() { overlay.classList.add('hidden'); } }); }
  else { overlay.classList.add('hidden'); }
}

function onDialNumber(num) {
  if (dialEntered.length >= 4) return;
  dialEntered += num;
  var idx = dialEntered.length - 1;
  var slot = document.getElementById('dial-slot-' + idx);
  slot.textContent = num;
  slot.classList.add('filled');
  if (typeof gsap !== 'undefined') { gsap.fromTo(slot, { scale: 1.5, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }); }
  if (dialEntered.length === 4) {
    if (dialEntered === DIAL_CODE) { onDialSuccess(); }
    else { onDialError(); }
  }
}

function onDialSuccess() {
  for (var i = 0; i < 4; i++) { var s = document.getElementById('dial-slot-' + i); s.classList.add('correct'); s.classList.remove('filled'); }
  if (typeof gsap !== 'undefined') {
    var tl = gsap.timeline();
    tl.to('#dial-panel', { scale: 1.05, duration: 0.2, ease: 'power2.out' });
    tl.to('#dial-panel', { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.4)' });
    tl.to('#dial-panel', { scale: 0.7, opacity: 0, y: 20, duration: 0.35, ease: 'power2.in', delay: 0.5, onComplete: function() { document.getElementById('dial-overlay').classList.add('hidden'); dialOpen = false; document.getElementById('btn-dial').classList.remove('spinning'); } });
  } else { setTimeout(function() { document.getElementById('dial-overlay').classList.add('hidden'); dialOpen = false; document.getElementById('btn-dial').classList.remove('spinning'); }, 800); }
  enterEditMode();
}

function onDialError() {
  for (var i = 0; i < 4; i++) { var s = document.getElementById('dial-slot-' + i); s.classList.add('wrong'); s.classList.remove('filled'); }
  if (typeof gsap !== 'undefined') {
    var tl = gsap.timeline();
    tl.to('#dial-panel', { x: -8, duration: 0.05, ease: 'power2.inOut' });
    tl.to('#dial-panel', { x: 8, duration: 0.05, ease: 'power2.inOut' });
    tl.to('#dial-panel', { x: -6, duration: 0.05, ease: 'power2.inOut' });
    tl.to('#dial-panel', { x: 6, duration: 0.05, ease: 'power2.inOut' });
    tl.to('#dial-panel', { x: -2, duration: 0.04, ease: 'power2.inOut' });
    tl.to('#dial-panel', { x: 0, duration: 0.04, ease: 'power2.inOut' });
    tl.call(resetDial, null, '+=0.5');
  } else { setTimeout(resetDial, 800); }
}

function resetDial() {
  dialEntered = '';
  for (var i = 0; i < 4; i++) { var slot = document.getElementById('dial-slot-' + i); slot.textContent = ''; slot.classList.remove('filled', 'correct', 'wrong'); slot.style.color = ''; slot.style.borderColor = ''; }
}

function enterEditMode() {
  if (!document.body.classList.contains('edit-mode')) { document.body.classList.add('edit-mode'); showToast('编辑模式已解锁', 'success', 3000); }
  updateEditUI();
  renderAll(Storage.load());
}

function exitEditMode() {
  document.body.classList.remove('edit-mode');
  showToast('已退出编辑模式', 'success', 2000);
  updateEditUI();
  renderAll(Storage.load());
}
