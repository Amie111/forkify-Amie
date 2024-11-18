import * as model from './model.js';
import RecipeView from '../views/recipeView.js';
import SearchView from '../views/searchView.js';
import ResultsView from '../views/resultsView.js';
import PaginationView from '../views/paginationView.js';
import BookmarksView from '../views/bookmarkView.js';
import AddRecipeView from '../views/addRecipeView.js';
import { RECIPE_WINDOW_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime.js';
//////////////////////////////////////////
// Hot Module Replacement：HMR是webpack提供的最有用的功能之一，它允许在运行时更新各种模块，而无需完全刷新页面

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    // 0)从网址中获得id
    const id = location.hash.slice(1);
    if (!id) return;

    // 1)加载前等待界面
    RecipeView.renderSpinner();
    // 2.1)每次点击recipe（也就是hashchange时）都强调当前recipe栏
    ResultsView.update(model.getSearchResultsPage());
    // 2.2)每次点击recipe（也就是hashchange时）都强调当前bookmark栏
    BookmarksView.update(model.state.bookmarks);
    // 3）异步从API取得recipe的数据
    await model.loadRecipe(id);
    // 4）将当前id取得的数据渲染到用户界面
    RecipeView.render(model.state.recipe);
  } catch (err) {
    RecipeView.renderError();
  }
};

////////////////////////////////////////
const controlSearchResults = async function () {
  try {
    // 1）获得输入的关键字
    const query = SearchView.getQuery();
    if (!query) return;
    // 2）用关键字匹配API链接进行查询，并将返回结果存储进model中的state中
    await model.loadSearchResults(query);
    // 3)显示搜索结果,并将第1页设置为当前页
    // ResultsView.render(model.state.search.results);
    ResultsView.render(model.getSearchResultsPage());
    // 4)分页按钮显示
    PaginationView.render(model.state.search);
  } catch (err) {
    ResultsView.renderError();
  }
};

///////////////////////////////////////
const contorlPagination = function (gotoPage) {
  // 1)显示新的搜索结果
  ResultsView.render(model.getSearchResultsPage(gotoPage));
  // 2)显示新的分页按钮
  PaginationView.render(model.state.search);
};

/////////////////////////////////////////
const controlUpdateServings = function (newServing) {
  // 1）更新state中的servings和ingredients的数量
  model.updateServings(newServing);
  // 2）用新的state更新recipe界面
  RecipeView.update(model.state.recipe);
};

///////////////////////////////////////
const controlAddBookmark = function () {
  // 如果当前recipe的bookmarked为false，则点击按钮时添加书签
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
    // 如果当前recipe的bookmarked为true，则点击按钮时删除书签
  } else {
    model.removeBookmark(model.state.recipe.id);
  }
  //更新bookmark弹窗界面
  BookmarksView.render(model.state.bookmarks);
  // 更新recipeview节点
  RecipeView.update(model.state.recipe);
};

/////////////////////////////////////
// 初始加载时，渲染存储在本地的标签数据
const controlBookmarks = function () {
  BookmarksView.render(model.state.bookmarks);
};

////////////////////////////////////
const controlAddRecipe = async function (recipe) {
  try {
    //接收从AddRecipeView传递过来的data作为recipe，以便后续处理
    await model.addRecipeUpload(recipe);
    // 等在加载
    AddRecipeView.renderSpinner();
    // 渲染上传的recipe数据
    RecipeView.render(model.state.recipe);
    //更新bookmark弹窗界面
    BookmarksView.render(model.state.bookmarks);
    // 显示上传成功的message
    AddRecipeView.renderMessage();
    // 定时关闭输入窗口
    setTimeout(function () {
      AddRecipeView.toggleWindow();
    }, RECIPE_WINDOW_SEC * 2000);
    // 重置网页
    setTimeout(function () {
      location.reload();
    }, RECIPE_WINDOW_SEC * 1000);

    // 让浏览器记住当前上传数据的id
    window.history.pushState('', '', `#${model.state.recipe.id}`);
  } catch (err) {
    AddRecipeView.renderError(err);
  }
};

// subscriber
const init = function () {
  AddRecipeView.addHandlerUpload(controlAddRecipe);
  // controlBookmarks放在前面是因为，controlRecipes中需要update它
  BookmarksView.addHandlerRender(controlBookmarks);
  RecipeView.addHandlerRender(controlRecipes);
  RecipeView.addHandlerUpdateServings(controlUpdateServings);
  RecipeView.addHandlerBookmark(controlAddBookmark);
  SearchView.addHandlerSearch(controlSearchResults);
  PaginationView.addHandlerPagination(contorlPagination);
};
init();
