class TreeNode {
    constructor(value = null) {
        this.value = value;
        this.children = new Map();
        this.isEnd = false;
    }
  
    getChild(key) {
        return this.children.get(key);
    }

    addChild(key, node) {
        this.children.set(key, node);
    }

    hasChild(key) {
        return this.children.has(key);
    }
}

class StringTree {
    constructor(initialStrings = []) {
        this.root = new TreeNode();
        this.addStrings(initialStrings);
    }

    addStrings(strArray) {
        for (let str of strArray) {
            this._addStringHelper(this.root, str);
        }
    }

    _addStringHelper(node, str) {
        for (let char of str) {
            if (!node.hasChild(char)) {
                node.addChild(char, new TreeNode(char));
            }
            node = node.getChild(char);
        }
        node.isEnd = true;
    }

    contains(str) {
        return this._containsHelper(this.root, str);
    }

    _containsHelper(node, str) {
        for (let char of str) {
            if (!node.hasChild(char)) {
                return false;
            }
            node = node.getChild(char);
        }
        return node.isEnd;
    }
}

class OrderTree {
    constructor(initialOrders = []) {
        this.root = new TreeNode();
        this.addOrders(initialOrders);
    }

    addOrders(orderArray) {
        for (let order of orderArray) {
            this._addOrderHelper(this.root, order);
        }
    }

    _addOrderHelper(node, order) {
        for (let item of order) {
            if (!node.hasChild(item)) {
                node.addChild(item, new TreeNode(item));
            }
            node = node.getChild(item);
        }
        node.isEnd = true;
    }

    hasOrder(order) {
        return this._hasOrderHelper(this.root, order);
    }

    _hasOrderHelper(node, order) {
        for (let item of order) {
            if (!node.hasChild(item)) {
                return false;
            }
            node = node.getChild(item);
        }
        return node.isEnd;
    }
}