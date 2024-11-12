import View from './view.js';

class SearchView extends View {
  _parentElement = document.querySelector('.search');

  _clearInput() {
    this._parentElement.querySelector('.search__field').value = '';
  }

  // publisher
  addHandlerSearch(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }

  // 通过DOM获得输入框的query值,之后清空输入框并返回获得的值
  getQuery() {
    const query = this._parentElement.querySelector('.search__field').value;
    this._clearInput();
    return query;
  }
}
// 导出实例对象
export default new SearchView();
