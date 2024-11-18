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
    this._btnClose.addEventListener('click', e => {
      this.toggleWindow();
      location.reload();
    });
    this._overlay.addEventListener('click', e => {
      this.toggleWindow();
      location.reload();
    });
  }

  // 验证ingredients输入格式
  _validateIngredients(formData) {
    // formData:[[title,"pasta"],,,[ingredients1:"1,kg,flour"],,,]
    const ingredients = Array.from(formData)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => ing[1]);

    for (const ing of ingredients) {
      const parts = ing.split(',').map(part => part.trim());
      const [quantity, unit, description] = parts;
      // 验证规则：
      // 1.必须至少添加1个ingredient
      if (parts.length === 0) {
        throw new Error('Please add at least one ingredient');
      }
      // 2.必须包含3个部分
      if (parts.length !== 3) {
        throw new Error(
          'Each ingredient must have 3 parts separated by commas'
        );
      }
      // 3.数量必须是数字或为空
      if (quantity && isNaN(quantity)) {
        throw new Error('Quantity must be a number');
      }
      // 4.描述不能为空
      if (!description) {
        throw new Error('Description cannot be empty');
      }
    }

    return true;
  }

  //  提交upload组件时，提取form中的数据并放在一个叫做data的对象中，然后传递给handler函数
  addHandlerUpload(handler) {
    this._parentElement.addEventListener(
      'submit',
      function (e) {
        e.preventDefault();
        //提取form里面的数据,并将其合并放在一个Array中:[[title,"pasta"],[url:"https://..."],[ingredients1:1,kg,flour],,,],

        const dataForm = [...new FormData(e.target)];

        // 然后将其转换为对象：{title:"pasta",url:"https://...",ingredients1:"1 kg flour",,,}
        const data = Object.fromEntries(dataForm);

        try {
          // 提交之前验证ingredients的格式
          this._validateIngredients(dataForm);
          //将验证好的data传递给handler函数
          handler(data);
        } catch (err) {
          this.renderValidateError(err);
          // 阻止表单提交
          this.return;
          // 如果验证失败，则显示错误消息
        }
      }.bind(this)
    );
  }
}

export default new AddRecipeView();
