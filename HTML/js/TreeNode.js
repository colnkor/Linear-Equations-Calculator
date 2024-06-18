class TreeNode {
    constructor(value = '') {
      this.value = value;
      this.children = {};
      this.isEndOfString = false;
    }
  }
  
class StringTree {
    constructor(initialStrings = []) {
      this.root = new TreeNode();
      this.addStrings(initialStrings);
    }
  
    // Метод для добавления строк
    addStrings(strArray) {
      for (let str of strArray) {
        this._addStringHelper(this.root, str);
      }
    }
  
    _addStringHelper(node, str) {
      for (let char of str) {
        if (!node.children[char]) {
          node.children[char] = new TreeNode(char);
        }
        node = node.children[char];
      }
      node.isEndOfString = true;
    }
  
    // Метод для проверки наличия строки
    contains(str) {
      return this._containsHelper(this.root, str);
    }
  
    _containsHelper(node, str) {
      for (let char of str) {
        if (!node.children[char]) {
          return false;
        }
        node = node.children[char];
      }
      return node.isEndOfString;
    }
}
