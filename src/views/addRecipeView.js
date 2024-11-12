import View from './view';
import PreviewView from './previewView';

class AddRecipeView extends View {
  _parentElement = document.querySelector('.upload');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');
  _overlay = document.querySelector('.overlay');
  _window = document.querySelector('.add-recipe-window');
  _message = 'Recipe was Successfully uploaded :>';
  //  在自己的构造函数中直接调用显示和关闭窗口的函数就行，因为不存在数据传递
  constructor() {
    super();
    this.addHandlerShowWindow();
    this.addHandlerCloseWindow();
  }

  // 添加或者删除覆盖层和window的hidden类
  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }
  //   当点击导航栏的“添加按钮”时，打开window和覆盖层（此时要将toggleWindow函数的this关键词用bind指向“添加按钮”）
  addHandlerShowWindow() {
    this._btnOpen.addEventListener('click', this.toggleWindow.bind(this));
  }

  //   当点击window上的“关闭按钮”和“遮盖层”时，关闭window和覆盖层（此时要将toggleWindow函数的this关键词用bind指向“关闭按钮”和“遮盖层”）
  addHandlerCloseWindow() {
    this._btnClose.addEventListener('click', this.toggleWindow.bind(this));
    this._overlay.addEventListener('click', this.toggleWindow.bind(this));
  }

  //  提交upload组件时，提取form中的数据并放在一个叫做data的对象中，然后传递给handler函数
  addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      const dataForm = [...new FormData(this)]; //提取form里面的数据，并将其合并放在一个数组中
      const data = Object.fromEntries(dataForm); //将数组中的每组数据转换成对象数据，并放在一个大的对象里
      handler(data); //将转换好的data传递给handler函数
    });
  }

  _generateMarkup() {}
}

export default new AddRecipeView();
