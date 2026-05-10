// 菜谱数据加载模块
const RecipeData = (() => {
  let recipes = [];

  async function load() {
    if (recipes.length) return recipes;
    const resp = await fetch('data/recipes.json');
    recipes = await resp.json();
    return recipes;
  }

  function getById(id) {
    return recipes.find(r => r.id === id);
  }

  function getByCategory(category) {
    if (!category || category === '全部') return recipes;
    return recipes.filter(r => r.category === category);
  }

  function search(keyword) {
    if (!keyword) return recipes;
    const kw = keyword.toLowerCase();
    return recipes.filter(r =>
      r.title.toLowerCase().includes(kw) ||
      r.tags.some(t => t.includes(kw)) ||
      r.ingredients.some(i => i.name.includes(kw))
    );
  }

  function filterByIngredients(ingredientNames) {
    if (!ingredientNames.length) return recipes;
    return recipes.filter(r =>
      ingredientNames.every(name =>
        r.ingredients.some(i => i.name.includes(name))
      )
    );
  }

  function filter({ keyword, category, difficulty, maxTime, taste, ingredients }) {
    let result = recipes;

    if (category && category !== '全部') {
      result = result.filter(r => r.category === category);
    }
    if (difficulty) {
      result = result.filter(r => r.difficulty === difficulty);
    }
    if (maxTime) {
      result = result.filter(r => {
        const total = parseInt(r.prep_time) + parseInt(r.cook_time);
        return total <= maxTime;
      });
    }
    if (taste) {
      result = result.filter(r => r.tags.includes(taste));
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(kw) ||
        r.tags.some(t => t.includes(kw)) ||
        r.ingredients.some(i => i.name.includes(kw))
      );
    }
    if (ingredients && ingredients.length) {
      result = result.filter(r =>
        ingredients.every(name =>
          r.ingredients.some(i => i.name.includes(name))
        )
      );
    }
    return result;
  }

  function getRelated(recipe, limit = 4) {
    return recipes
      .filter(r => r.id !== recipe.id)
      .map(r => ({
        ...r,
        score: r.tags.filter(t => recipe.tags.includes(t)).length
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  function getRandom(count = 1) {
    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  function getAllTags() {
    const tagSet = new Set();
    recipes.forEach(r => r.tags.forEach(t => tagSet.add(t)));
    return [...tagSet];
  }

  return { load, getById, getByCategory, search, filterByIngredients, filter, getRelated, getRandom, getAllTags };
})();
