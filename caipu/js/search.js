// ==================== 搜索页逻辑 ====================
(async function() {
  await RecipeData.load();

  const searchInput = document.getElementById('searchInput');
  const filterCategory = document.getElementById('filterCategory');
  const filterDifficulty = document.getElementById('filterDifficulty');
  const filterTime = document.getElementById('filterTime');
  const filterTaste = document.getElementById('filterTaste');
  const ingredientInput = document.getElementById('ingredientInput');
  const btnSearchIngredient = document.getElementById('btnSearchIngredient');
  const ingredientTagsEl = document.getElementById('ingredientTags');
  const searchGrid = document.getElementById('searchGrid');
  const resultCount = document.getElementById('resultCount');

  let ingredientList = [];

  // 从URL读取初始参数
  const params = new URLSearchParams(window.location.search);
  if (params.get('q')) searchInput.value = params.get('q');
  if (params.get('category')) filterCategory.value = params.get('category');

  function renderIngredientTags() {
    ingredientTagsEl.innerHTML = ingredientList.map(name => `
      <span class="ingredient-tag">
        ${name}
        <button data-name="${name}">&times;</button>
      </span>
    `).join('');

    ingredientTagsEl.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        ingredientList = ingredientList.filter(n => n !== btn.dataset.name);
        renderIngredientTags();
        doSearch();
      });
    });
  }

  function doSearch() {
    const keyword = searchInput.value.trim();
    const category = filterCategory.value;
    const difficulty = filterDifficulty.value;
    const maxTime = filterTime.value ? parseInt(filterTime.value) : null;
    const taste = filterTaste.value;

    const results = RecipeData.filter({
      keyword,
      category,
      difficulty,
      maxTime,
      taste,
      ingredients: ingredientList
    });

    resultCount.textContent = `找到 ${results.length} 个菜谱`;

    if (results.length === 0) {
      searchGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--text-muted)">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 16px"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p style="font-size:16px">没有找到匹配的菜谱</p>
          <p style="font-size:14px;margin-top:8px">试试其他关键词或筛选条件</p>
        </div>
      `;
      return;
    }

    searchGrid.innerHTML = results.map(r => {
      const totalTime = parseInt(r.prep_time) + parseInt(r.cook_time);
      const isFav = Favorites.has(r.id);
      return `
        <article class="recipe-card">
          <button class="card-fav ${isFav ? 'active' : ''}" data-id="${r.id}" title="收藏">
            ${isFav ? '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'}
          </button>
          <a href="detail.html?id=${r.id}">
            <img class="card-img" src="${r.image_url}" alt="${r.title}" loading="lazy"
                 onerror="this.style.background='linear-gradient(135deg,#FFE5D9,#FFF1E6)';this.src=''">
            <div class="card-body">
              <h3 class="card-title">${r.title}</h3>
              <div class="card-meta">
                <span class="card-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${totalTime}分钟</span>
                <span class="card-meta-item"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> ${r.rating}</span>
                <span class="card-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2c.5 2.5 2 4.5 2 7a4 4 0 1 1-8 0c0-2.5 2-5 2-7 1 1.5 3 2 4 0z"/></svg> ${r.difficulty}</span>
              </div>
              <div class="card-tags">
                ${r.tags.slice(0, 3).map(t => `<span class="card-tag">${t}</span>`).join('')}
              </div>
            </div>
          </a>
        </article>
      `;
    }).join('');

    bindFavButtons();
  }

  function bindFavButtons() {
    searchGrid.querySelectorAll('.card-fav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.id;
        const isFav = Favorites.toggle(id);
        btn.classList.toggle('active', isFav);
        btn.innerHTML = isFav
          ? '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
        btn.classList.add('animate');
        setTimeout(() => btn.classList.remove('animate'), 400);
      });
    });
  }

  // 搜索输入（带防抖）
  let debounceTimer;
  function debounceSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(doSearch, 200);
  }

  searchInput.addEventListener('input', debounceSearch);
  filterCategory.addEventListener('change', doSearch);
  filterDifficulty.addEventListener('change', doSearch);
  filterTime.addEventListener('change', doSearch);
  filterTaste.addEventListener('change', doSearch);

  // 食材输入
  ingredientInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const name = ingredientInput.value.trim();
      if (name && !ingredientList.includes(name)) {
        ingredientList.push(name);
        renderIngredientTags();
        doSearch();
      }
      ingredientInput.value = '';
    }
  });

  btnSearchIngredient.addEventListener('click', () => {
    const name = ingredientInput.value.trim();
    if (name && !ingredientList.includes(name)) {
      ingredientList.push(name);
      renderIngredientTags();
      doSearch();
    }
    ingredientInput.value = '';
  });

  // 导航搜索
  const navSearchInput = document.getElementById('navSearchInput');
  navSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && navSearchInput.value.trim()) {
      searchInput.value = navSearchInput.value.trim();
      doSearch();
    }
  });

  // 汉堡菜单
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('show');
  });

  doSearch();
})();
