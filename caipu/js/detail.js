// ==================== 详情页逻辑 ====================
(async function() {
  await RecipeData.load();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const recipe = RecipeData.getById(id);

  if (!recipe) {
    document.querySelector('.detail-container').innerHTML =
      '<div style="text-align:center;padding:80px 0"><h2>菜谱未找到</h2><p style="margin-top:12px;color:var(--text-muted)"><a href="index.html" style="color:var(--primary)">返回首页</a></p></div>';
    return;
  }

  // 更新页面标题
  document.title = `${recipe.title} - 美味厨房`;

  // 头部图片
  const hero = document.getElementById('detailHero');
  hero.src = recipe.image_url;
  hero.alt = recipe.title;
  hero.onerror = function() { this.style.background = 'linear-gradient(135deg,#FFE5D9,#FFF1E6)'; };

  // 标题和作者
  document.getElementById('detailTitle').textContent = recipe.title;
  document.getElementById('detailAuthor').textContent = `by ${recipe.author}`;

  // 评分
  const ratingEl = document.getElementById('detailRating');
  ratingEl.innerHTML = `
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    <span>${recipe.rating}</span>
  `;

  // 信息栏
  const totalTime = parseInt(recipe.prep_time) + parseInt(recipe.cook_time);
  document.getElementById('detailInfoBar').innerHTML = `
    <div class="info-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <div><div class="info-label">准备时间</div><div class="info-value">${recipe.prep_time}</div></div>
    </div>
    <div class="info-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2c.5 2.5 2 4.5 2 7a4 4 0 1 1-8 0c0-2.5 2-5 2-7 1 1.5 3 2 4 0z"/></svg>
      <div><div class="info-label">烹饪时间</div><div class="info-value">${recipe.cook_time}</div></div>
    </div>
    <div class="info-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <div><div class="info-label">总耗时</div><div class="info-value">${totalTime}分钟</div></div>
    </div>
    <div class="info-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      <div><div class="info-label">卡路里</div><div class="info-value">${recipe.calories} kcal</div></div>
    </div>
    <div class="info-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      <div><div class="info-label">难度</div><div class="info-value">${recipe.difficulty}</div></div>
    </div>
  `;

  // 食材清单
  const ingredientKey = `ingredient_${recipe.id}`;
  let checkedIngredients = JSON.parse(localStorage.getItem(ingredientKey) || '[]');

  function renderIngredients() {
    const list = document.getElementById('ingredientList');
    list.innerHTML = recipe.ingredients.map((ing, i) => {
      const checked = checkedIngredients.includes(i);
      return `
        <div class="ingredient-item ${checked ? 'checked' : ''}" data-index="${i}">
          <div class="ingredient-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span class="ingredient-name">${ing.name}</span>
          <span class="ingredient-amount">${ing.amount}</span>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.ingredient-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index);
        const pos = checkedIngredients.indexOf(idx);
        if (pos >= 0) { checkedIngredients.splice(pos, 1); } else { checkedIngredients.push(idx); }
        localStorage.setItem(ingredientKey, JSON.stringify(checkedIngredients));
        item.classList.toggle('checked');
      });
    });
  }
  renderIngredients();

  // 烹饪步骤
  const stepsList = document.getElementById('stepsList');
  stepsList.innerHTML = recipe.steps.map((step, i) => `
    <div class="step-item">
      <div class="step-number">${i + 1}</div>
      <div class="step-text">${step}</div>
    </div>
  `).join('');

  // 收藏按钮
  const favBtn = document.getElementById('detailFavBtn');
  function updateFavBtn() {
    const isFav = Favorites.has(recipe.id);
    favBtn.classList.toggle('active', isFav);
    favBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      ${isFav ? '已收藏' : '收藏菜谱'}
    `;
  }
  updateFavBtn();
  favBtn.addEventListener('click', () => {
    Favorites.toggle(recipe.id);
    updateFavBtn();
    favBtn.classList.add('animate');
    setTimeout(() => favBtn.classList.remove('animate'), 400);
  });

  // 标签云
  const tagCloud = document.getElementById('tagCloud');
  tagCloud.innerHTML = recipe.tags.map(t =>
    `<span onclick="location.href='search.html?q=${encodeURIComponent(t)}'">${t}</span>`
  ).join('');

  // 相关推荐
  const related = RecipeData.getRelated(recipe, 4);
  const relatedList = document.getElementById('relatedList');
  relatedList.innerHTML = related.map(r => `
    <a href="detail.html?id=${r.id}" class="related-item">
      <img class="related-img" src="${r.image_url}" alt="${r.title}" loading="lazy"
           onerror="this.style.background='linear-gradient(135deg,#FFE5D9,#FFF1E6)';this.src=''">
      <div>
        <div class="related-title">${r.title}</div>
        <div class="related-meta">${r.prep_time} + ${r.cook_time} | ${r.difficulty}</div>
      </div>
    </a>
  `).join('');

  // 导航搜索
  const navSearchInput = document.getElementById('navSearchInput');
  navSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && navSearchInput.value.trim()) {
      window.location.href = `search.html?q=${encodeURIComponent(navSearchInput.value.trim())}`;
    }
  });

  // 汉堡菜单
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('show');
  });
})();
