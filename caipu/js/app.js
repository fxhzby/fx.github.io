// ==================== SVG图标 ====================
const Icons = {
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2c.5 2.5 2 4.5 2 7a4 4 0 1 1-8 0c0-2.5 2-5 2-7 1 1.5 3 2 4 0z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  heartFill: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
};

// ==================== 收藏管理 ====================
const Favorites = {
  getAll() {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]'); }
    catch { return []; }
  },
  toggle(id) {
    const favs = this.getAll();
    const idx = favs.indexOf(id);
    if (idx >= 0) { favs.splice(idx, 1); } else { favs.push(id); }
    localStorage.setItem('favorites', JSON.stringify(favs));
    return idx < 0;
  },
  has(id) {
    return this.getAll().includes(id);
  }
};

// ==================== 卡片渲染 ====================
function renderCard(recipe) {
  const isFav = Favorites.has(recipe.id);
  const totalTime = parseInt(recipe.prep_time) + parseInt(recipe.cook_time);
  return `
    <article class="recipe-card">
      <button class="card-fav ${isFav ? 'active' : ''}" data-id="${recipe.id}" title="收藏">
        ${isFav ? Icons.heartFill : Icons.heart}
      </button>
      <a href="detail.html?id=${recipe.id}">
        <img class="card-img" src="${recipe.image_url}" alt="${recipe.title}" loading="lazy"
             onerror="this.style.background='linear-gradient(135deg,#FFE5D9,#FFF1E6)';this.src=''">
        <div class="card-body">
          <h3 class="card-title">${recipe.title}</h3>
          <div class="card-meta">
            <span class="card-meta-item">${Icons.clock} ${totalTime}分钟</span>
            <span class="card-meta-item">${Icons.star} ${recipe.rating}</span>
            <span class="card-meta-item">${Icons.flame} ${recipe.difficulty}</span>
          </div>
          <div class="card-tags">
            ${recipe.tags.slice(0, 3).map(t => `<span class="card-tag">${t}</span>`).join('')}
          </div>
        </div>
      </a>
    </article>
  `;
}

// ==================== 首页逻辑 ====================
(async function() {
  await RecipeData.load();

  const grid = document.getElementById('recipeGrid');
  const categoryBar = document.getElementById('categoryBar');
  const heroSearchInput = document.getElementById('heroSearchInput');
  const navSearchInput = document.getElementById('navSearchInput');
  const heroTags = document.getElementById('heroTags');

  let currentCategory = '全部';

  function renderRecipes() {
    const recipes = RecipeData.getByCategory(currentCategory);
    grid.innerHTML = recipes.map(r => renderCard(r)).join('');
    bindFavButtons();
  }

  function bindFavButtons() {
    grid.querySelectorAll('.card-fav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.id;
        const isFav = Favorites.toggle(id);
        btn.classList.toggle('active', isFav);
        btn.innerHTML = isFav ? Icons.heartFill : Icons.heart;
        btn.classList.add('animate');
        setTimeout(() => btn.classList.remove('animate'), 400);
      });
    });
  }

  // 分类筛选
  categoryBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.category-btn');
    if (!btn) return;
    categoryBar.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.cat;
    renderRecipes();
  });

  // 搜索跳转
  function doSearch(query) {
    if (!query.trim()) return;
    window.location.href = `search.html?q=${encodeURIComponent(query.trim())}`;
  }

  heroSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch(heroSearchInput.value);
  });
  navSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch(navSearchInput.value);
  });

  // 热门标签点击
  heroTags.addEventListener('click', (e) => {
    if (e.target.tagName === 'SPAN') {
      doSearch(e.target.textContent);
    }
  });

  // 汉堡菜单
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => navLinks.classList.toggle('show'));

  // 上传弹窗
  const btnUpload = document.getElementById('btnUpload');
  const uploadModal = document.getElementById('uploadModal');
  const btnCancelUpload = document.getElementById('btnCancelUpload');
  const uploadForm = document.getElementById('uploadForm');

  btnUpload.addEventListener('click', () => uploadModal.classList.add('show'));
  btnCancelUpload.addEventListener('click', () => uploadModal.classList.remove('show'));
  uploadModal.addEventListener('click', (e) => {
    if (e.target === uploadModal) uploadModal.classList.remove('show');
  });

  uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(uploadForm);
    alert('菜谱提交成功！（演示模式，数据未持久化）');
    uploadModal.classList.remove('show');
    uploadForm.reset();
  });

  renderRecipes();
})();
