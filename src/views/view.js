import icons from 'url:../img/icons.svg';

export default class View {
  _data;

  /**
   * Render the recieved data to the DOM
   * @param {Object | Object[]} data The data to be rendered(e.g recipe)
   * @param {{boolean} [render = true]} If false,creat markup string instead of rendering to the DOM
   * @returns {undefined | string}
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();
    // 如果render参数设置为fasle，就单纯地返回markup字符串，而不插入HTML中
    if (!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  update(data) {
    //通过参数传递新的数据
    this._data = data;
    // 生成新的对应view的HTML字段
    const newMarkup = this._generateMarkup();

    // 将HTML片段创建成一个新的DOMFragment碎片（不影响本身的DOM）
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    // 选择新的片段所包含的所有组件并转换成数组
    const newElememts = Array.from(newDOM.querySelectorAll('*'));
    // 选择当前HTML片段所包含的所有组件并转换成数组
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));
    // 通过遍历查找新旧两者的差异，并将当前节点值和属性替换成对应的新节点值和属性
    newElememts.forEach((newEl, i) => {
      const curEL = curElements[i];
      //找出新的元件和当前元件节点差异，并将文本对应替换，trim是去掉前后空白值
      if (
        !newEl.isEqualNode(curEL) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        curEL.textContent = newEl.textContent;
      }
      // 找出新的元件和当前元件节点差异，并将属性及属性值对应替换（属性节点不是元素节点的子节点，而是元素节点的一部分）
      if (!newEl.isEqualNode(curEL)) {
        Array.from(newEl.attributes).forEach(attr =>
          curEL.setAttribute(attr.name, attr.value)
        );
      }
    });
  }

  _clear() {
    this._parentElement.innerHTML = '';
  }

  renderSpinner() {
    const markup = `<div class="spinner">
                <svg>
                  <use href="${icons}#icon-loader"></use>
                </svg>
              </div>`;
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderError(message = this._errorMessage) {
    const markup = `
        <div class="error">
                <div>
                  <svg>
                    <use href="${icons}#icon-alert-triangle"></use>
                  </svg>
                </div>
                <p>${message}</p>
              </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderMessage(message = this._message) {
    const markup = `
        <div class="message">
                <div>
                  <svg>
                    <use href="${icons}#icon-smail"></use>
                  </svg>
                </div>
                <p>${message}</p>
              </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
