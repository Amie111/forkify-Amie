import { API_URL, KEY, RESULTS_PER_PAGE } from './config.js';
// import { getJSON, setJSON } from './helpers.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RESULTS_PER_PAGE,
    sortOrder: 'desc',
  },
  bookmarks: [],
};

const creatRecipedata = function (loaddata) {
  // 将load出来的recipe全部放进state的recipe对象中
  const { recipe } = loaddata.data;

  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }), //当上传后取得的recipe有key，就将key属性设置为recipe.key
  };
};

// 创建一个函数用来给搜索结果默认按照ingredientsCount降序排序，并返回排序后的结果
export const sortResults = function (
  results = state.search.results,
  order = 'desc'
) {
  const sortResults = [...results].sort((a, b) => {
    return order === 'desc'
      ? b.ingredientsCount - a.ingredientsCount
      : a.ingredientsCount - b.ingredientsCount;
  });
  return sortResults;
};

// 用id获取recipe的数据，并存储到state对象中的recipe里
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

    state.recipe = creatRecipedata(data);
    // 如果用当前id加载的recipe存在于bookmark中，就将这个recipe中的bookmarked设置为true，否则设置为false
    if (state.bookmarks.some(el => el.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (err) {
    throw err;
  }
};

// 用API查询获取query关键字的数据,返回结果存储到state对象中的search里
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    // 如果搜索出来的结果为空，则扔出一个错误一直传导到界面上
    if (!data || data.results === 0) throw new Error();

    // Load full recipe data to get ingredient counts
    const recipesWithIngredients = await Promise.all(
      data.data.recipes.map(async res => {
        try {
          const fullRecipe = await AJAX(`${API_URL}${res.id}?key=${KEY}`);
          return {
            id: res.id,
            image: res.image_url,
            publisher: res.publisher,
            title: res.title,
            ...(res.key && { key: res.key }), //同样，搜索时，如果有上传的recipe也把他的key取下来
            ingredientsCount: fullRecipe.data.recipe.ingredients.length,
          };
        } catch (err) {
          throw err;
        }
      })
    );
    state.search.results = sortResults(recipesWithIngredients, 'desc');
    state.search.page = 1;
    state.search.sortOrder = 'desc';
  } catch (err) {
    throw err;
  }
};

// 显示对应页的搜索结果，默认从第一页开始,同时将当前页存储进model.state.search中
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage; //0，10，20....
  const end = page * state.search.resultsPerPage; //10，20，30....

  return state.search.results.slice(start, end); //slice不包含end的值，比如想取0～9的值：slice（0，10）
};

// 用新的serving数和旧的serving数计算对应的ingredients,并将新的servings存储进state里
export const updateServings = function (newServing) {
  // 更新配料数组中的每一个元素的量
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity / state.recipe.servings) * newServing;
  });
  state.recipe.servings = newServing;
};

// 写一个函数用来将state中的bookmarks存储在本地
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

// 添加书签
export const addBookmark = function (recipe) {
  // 将传递进来的recipe添加进state中的bookmark数组中
  state.bookmarks.push(recipe);
  // 如果该recipe和当前state中的recipe是一个，那就将state中的recipe设置为bookmarked：true
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks();
};

// 删除书签
export const removeBookmark = function (id) {
  // 通过遍历匹配bookmark中的recipe的id和指定的id
  const index = state.bookmarks.findIndex(rec => rec.id === id);
  // 指定该index位的元素被删除
  state.bookmarks.splice(index, 1);
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

// 异步上传：上传从view ——> control接收来的新recipe数据
export const addRecipeUpload = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArray = ing[1].split(',').map(el => el.trim());
        if (ingArray.length !== 3)
          throw new Error(
            'Wrong ingredients format! Please input a correct format :)'
          );
        const [quantity, unit, description] = ingArray;
        return {
          quantity: quantity ? +quantity : null,
          unit,
          description,
        };
      });

    const recipe = {
      cooking_time: +newRecipe.cookingTime,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      servings: +newRecipe.servings,
      source_url: newRecipe.sourceUrl,
      title: newRecipe.title,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = creatRecipedata(data); //此时的recipe没有被加入书签
    addBookmark(state.recipe);
    console.log(state);
  } catch (err) {
    throw err;
  }
};
