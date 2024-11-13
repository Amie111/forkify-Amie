import View from './view';
import icons from 'url:../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  // 监听点击翻页按钮事件，获取按钮对应页码
  addHandlerPagination(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      // 通过dataset获得按钮对应的页码
      const gotoPage = +btn.dataset.goto;
      // 将页码当作参数传递给回调函数
      handler(gotoPage);
    });
  }

  // 根据当前页码生成前后翻页按钮
  _generateMarkup() {
    // this._data = model.state.search;
    //默认当前页是search中的page
    const curPage = this._data.page;
    // 先用searh的结果长度计算总页数
    const numPage = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    // Add current page display markup
    const currentPageMarkup = `
       <div class="pagination__current">Page ${curPage}</div>
     `;

    // 1）First page with more pages（当前页是第一页，且页数大于1时：只显示下一页按钮）
    if (curPage === 1 && numPage > 1) {
      return `<div class="pagination__container">
          <div></div>
          ${currentPageMarkup}
      <button  data-goto = "${
        curPage + 1
      }" class="btn--inline pagination__btn--next">
            <span>Page ${curPage + 1}</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </button>
          </div>`;
    }

    // 2） Last page（当前页是最后一页，且页数大于1时：只显示上一页按钮）
    if (curPage === numPage && numPage > 1) {
      return `
      <div class="pagination__container">
      <button data-goto = "${
        curPage - 1
      }" class="btn--inline  pagination__btn--prev">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${curPage - 1}</span>
          </button>
          ${currentPageMarkup}
           <div></div>
        </div>`;
    }
    // 3）Middle page（当前页是中间页时，同时显示上一页和下一页按钮）
    if (curPage < numPage) {
      return `
      <div class="pagination__container">
      <button data-goto = "${
        curPage - 1
      }" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${curPage - 1}</span>
          </button>
          ${currentPageMarkup}
         <button data-goto = "${
           curPage + 1
         }" class="btn--inline pagination__btn--next">
            <span>Page ${curPage + 1}</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </button> 
          </div>`;
    }
    // 4）Only one page（只有1页时，只显示当前页码）
    return `
    <div class="pagination__container">
    <div></div>
    ${currentPageMarkup}
    <div></div>
  </div>`;
  }
}

export default new PaginationView();
