import View from './view';
import PreviewView from './previewView';

class ResultsView extends View {
  _parentElement = document.querySelector('.results');
  _errorMessage = 'No recipes found for your query. Please try again!';

  // 通过点击sort按钮获取dataset中的sort数据，并传递给handler
  addHandlerSort = function (handler) {
    this._parentElement.parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.sort-btn');
      if (!btn) return;
      console.log(btn);
      handler(btn.dataset.sort);
    });
  };

  // 此时：this._data是从control.js中传递过来的{results:model.state.search,sortOrder:model.state.search.sortOrder}这样一个Object
  _generateMarkup() {
    return `
    <div class = "sort-container">
      <button class ="sort-btn btn--inline" data-sort ="${
        this._data.sortOrder === 'desc' ? 'asc' : 'desc'
      }">
       Ingredients Count ${this._data.sortOrder === 'desc' ? '⬆️' : '⬇️'}
      </button>
    </div>
    <ul class = "results-list">
      ${this._data.results
        .map(result => PreviewView.render(result, false))
        .join('')}
    </ul>
    `;
  }
}

export default new ResultsView();
