"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const B_NODE_ORDER = 2;
const B_NODE_MIN_SIZE = B_NODE_ORDER - 1;
const B_NODE_MAX_SIZE = 2 * B_NODE_ORDER - 1;
const B_NODE_MIN_CHILD = B_NODE_MIN_SIZE + 1;
const LEFT_DIR = false;
const RIGHT_DIR = true;
class BLeafNode {
    constructor() {
        this.isLeaf = true;
        this.leftSibling = null;
        this.rightSibling = null;
        this.keys = [];
        this.values = [];
        this.keyNum = 0;
    }
    leaf() { return true; }
    getNum() { return this.keyNum; }
    setNum(num) {
        this.keyNum = num;
        this.keys.length = num;
        this.values.length = num;
    }
    setLeftSib(sib) { this.leftSibling = sib; }
    getLeftSib() { return this.leftSibling; }
    setRightSib(sib) { this.rightSibling = sib; }
    getRightSib() { return this.rightSibling; }
    getKey(i) { return this.keys[i]; }
    setKey(i, key) {
        this.keys[i] = key;
    }
    getIndex(key) {
        let left = 0;
        let right = this.getNum() - 1;
        let current = 0;
        while (left !== right) {
            current = (left + right) / 2;
            let currentKey = this.getKey(current);
            if (currentKey < key)
                left = current + 1;
            else
                right = current;
        }
        return left;
    }
    getValue(i) { return this.values[i]; }
    setValue(i, value) { this.values[i] = value; }
    removeKey(index, cindex) {
        for (let i = index; i < this.keyNum - 1; i++) {
            this.setKey(i, this.getKey(i + 1));
            this.setValue(i, this.getValue(i + 1));
        }
        this.setNum(this.getNum() - 1);
    }
    insert(key, value) {
        let i;
        for (i = this.keyNum; i >= 1 && this.keys[i - 1] > key; i--) {
            this.setKey(i, this.keys[i - 1]);
            this.setValue(i, this.values[i - 1]);
        }
        this.setKey(i, key);
        this.setValue(i, value);
        this.setNum(this.keyNum + 1);
    }
    split(parent, cindex) {
        const newNode = new BLeafNode();
        newNode.setRightSib(this.getRightSib());
        for (let i = 0; i < B_NODE_MIN_SIZE + 1; i++) {
            newNode.setKey(i, this.keys[i + B_NODE_MIN_SIZE]);
            newNode.setValue(i, this.values[i + B_NODE_MIN_SIZE]);
        }
        let temp = this.keys[B_NODE_MIN_SIZE];
        this.setNum(B_NODE_MIN_SIZE);
        newNode.setNum(B_NODE_MIN_SIZE + 1);
        newNode.setLeftSib(this);
        this.setRightSib(newNode);
        parent.insert(cindex, cindex + 1, temp, newNode);
    }
    merge(parent, child, index) {
        for (let i = 0; i < child.getNum(); i++) {
            this.insert(child.getKey(i), child.getValue(i));
        }
        this.setRightSib(child.getRightSib());
        parent.removeKey(index + 1, index + 1);
    }
    clear() {
        for (let i = 0; i < this.getNum(); i++) {
            this.keys[i] = null;
            this.values[i] = null;
        }
    }
    moveFrom(sibling, parent, index, dir) {
        if (dir === LEFT_DIR) {
            this.insert(sibling.getKey(sibling.getNum() - 1), sibling.getValue(sibling.getNum() - 1));
            sibling.removeKey(sibling.getNum() - 1, sibling.getNum() - 1);
            parent.setKey(index, this.getKey(0));
        }
        else {
            this.insert(sibling.getKey(0), sibling.getValue(0));
            sibling.removeKey(0, 0);
            parent.setKey(index, sibling.getKey(0));
        }
    }
    getCIndex(key, index) {
        return index;
    }
}
exports.BLeafNode = BLeafNode;
class BInterNode {
    constructor() {
        this.isLeaf = false;
        this.children = [];
        this.keys = [];
        this.keyNum = 0;
    }
    leaf() { return false; }
    getNum() { return this.keyNum; }
    setNum(num) {
        this.keyNum = num;
        this.keys.length = num;
        this.children.length = num + 1;
    }
    setChild(i, child) {
        this.children[i] = child;
    }
    getChild(i) {
        return this.children[i];
    }
    getKey(i) { return this.keys[i]; }
    setKey(i, key) {
        this.keys[i] = key;
    }
    getIndex(key) {
        let left = 0;
        let right = this.keyNum - 1;
        let current = 0;
        while (left !== right) {
            current = Math.floor((left + right) / 2);
            let currentKey = this.getKey(current);
            if (currentKey < key)
                left = current + 1;
            else
                right = current;
        }
        return left;
    }
    removeKey(index, cindex) {
        for (let i = 0; i < this.getNum() - index - 1; i++) {
            this.setKey(index + i, this.getKey(index + i + 1));
            this.setChild(cindex + i, this.getChild(cindex + i + 1));
        }
        this.setNum(this.getNum() - 1);
    }
    insert(index, cindex, key, child) {
        let i;
        let n = this.getNum();
        this.setNum(this.keyNum + 1);
        for (i = n; i > index; i--) {
            this.setChild(i + 1, this.children[i]);
            this.setKey(i, this.keys[i - 1]);
        }
        if (i === cindex) {
            this.setChild(i + 1, this.children[i]);
        }
        this.setChild(cindex, child);
        this.setKey(index, key);
    }
    split(parent, cindex) {
        let newNode = new BInterNode(); // the new node on the right side
        newNode.setNum(B_NODE_MIN_SIZE);
        for (let i = 0; i < B_NODE_MIN_SIZE; i++) {
            newNode.setKey(i, this.keys[i + B_NODE_MIN_CHILD]);
        }
        for (let i = 0; i < B_NODE_MIN_CHILD; i++) {
            newNode.setChild(i, this.children[i + B_NODE_MIN_CHILD]);
        }
        let temp2 = this.keys[B_NODE_MIN_SIZE];
        this.setNum(B_NODE_MIN_SIZE);
        let temp = parent;
        temp.insert(cindex, cindex + 1, temp2, newNode);
    }
    merge(parent, child, index) {
        this.insert(B_NODE_MIN_SIZE, B_NODE_MIN_SIZE + 1, parent.getKey(index), child.getChild(0));
        for (let i = 1; i <= child.getNum(); i++) {
            this.insert(B_NODE_MIN_SIZE + i, B_NODE_MIN_SIZE + i + 1, child.getKey(i - 1), child.getChild(i));
        }
        parent.removeKey(index, index + 1);
    }
    clear() {
        for (let i = 0; i < this.keyNum; i++) {
            this.children[i].clear();
            this.children[i] = null;
        }
    }
    moveFrom(sibling, parent, index, dir) {
        if (dir === LEFT_DIR) {
            let interSibling = sibling;
            this.insert(0, 0, parent.getKey(index), interSibling.getChild(sibling.getNum()));
            parent.setKey(index, sibling.getKey(sibling.getNum() - 1));
        }
        else {
            let interSibling = sibling;
            this.insert(this.getNum(), this.getNum() + 1, parent.getKey(index), interSibling.getChild(0));
            parent.setKey(index, sibling.getKey(0));
            sibling.removeKey(0, 0);
        }
    }
    getCIndex(key, index) {
        if (key !== this.getKey(index)) {
            return index + 1;
        }
        return index;
    }
}
class BTree {
    constructor() {
        this.root = null;
        this.headNode = null;
    }
    insert(key, value) {
        if (this.search(key)) {
            return false;
        }
        if (this.root === null) {
            this.headNode = new BLeafNode();
            this.root = this.headNode;
            this.maxKey = key;
        }
        else if (this.root.getNum() >= B_NODE_MAX_SIZE) {
            const newNode = new BInterNode();
            newNode.setChild(0, this.root);
            this.root.split(newNode, 0);
            this.root = newNode;
        }
        if (key > this.maxKey) {
            this.maxKey = key;
        }
        this.insertNode(this.root, key, value);
        return true;
    }
    remove(key) {
        if (!this.search(key)) {
            return false;
        }
        if (this.root.getNum() === 1) {
            if (this.root.isLeaf) {
                this.clear();
                return true;
            }
            else {
                let child0 = this.root.getChild(0);
                let child1 = this.root.getChild(1);
                if (child0.getNum() === B_NODE_MIN_SIZE && child1.getNum() === B_NODE_MIN_SIZE) {
                    child0.merge(this.root, child1, 0);
                    this.root = child0;
                }
            }
        }
        this.removeNode(this.root, key);
        return true;
    }
    /**
     update(key : BKeyType, value : T) : boolean {

    }

     select(key : BKeyType, comp : (key1 : BKeyType, key2 : BKeyType) => boolean) : Array<T>{

    }

     range(smallKey : BKeyType, bigKey : BKeyType) : Array<T> {

    }
     */
    search(key) {
        return this.searchNode(this.root, key);
    }
    clear() {
        if (this.root !== null) {
            this.root.clear();
            this.root = null;
            this.headNode = null;
        }
    }
    print() {
        let res = { result: "" };
        this.printLn(this.root, 10, res);
        return res.result;
    }
    insertNode(current, key, value) {
        if (current.isLeaf) {
            let leafCur = current;
            leafCur.insert(key, value);
        }
        else {
            let interCur = current;
            let index = current.getIndex(key);
            let cindex = current.getCIndex(key, index);
            let child = interCur.getChild(cindex);
            this.insertNode(child, key, value);
        }
    }
    removeNode(current, key) {
        if (!current)
            return;
        while (true) {
            let index = current.getIndex(key);
            let cindex = current.getCIndex(key, index);
            if (current.isLeaf) {
                if (key === this.maxKey && index > 0) {
                    this.maxKey = current.getKey(index - 1);
                }
                current.removeKey(index, cindex);
                if (cindex === 0 && !this.root.isLeaf && current !== this.headNode) {
                    this.changeKey(this.root, key, current.getKey(0));
                }
                return;
            }
            else {
                let child = current.getChild(cindex);
                if (child.getNum() == B_NODE_MIN_SIZE) {
                    let left = cindex > 0 ? current.getChild(cindex - 1) : null;
                    let right = cindex < current.getNum()
                        ? current.getChild(cindex + 1)
                        : null;
                    if (left !== null && left.getNum() > B_NODE_MIN_SIZE) {
                        child.moveFrom(left, current, index - 1, LEFT_DIR);
                    }
                    else if (right !== null && right.getNum() > B_NODE_MIN_SIZE) {
                        child.moveFrom(right, current, cindex, RIGHT_DIR);
                    }
                    else if (left !== null) {
                        left.merge(current, child, cindex - 1);
                        child = left;
                    }
                    else if (right !== null) {
                        right.merge(current, child, cindex);
                        child = right;
                    }
                }
                current = child;
            }
        }
    }
    printLn(current, counter, result) {
        if (current !== null) {
            let i, j;
            for (i = 0; i < current.getNum(); i++) {
                if (!current.isLeaf) {
                    this.printLn(current.getChild(i), counter - 2, result);
                }
                for (j = counter; j >= 0; j--) {
                    result.result += "-";
                }
                result.result += current.getKey(i).toString() + "\n";
            }
            if (!current.isLeaf) {
                this.printLn(current.getChild(i), counter - 2, result);
            }
        }
    }
    searchNode(current, key) {
        if (current === null) {
            return false;
        }
        else {
            let index = current.getIndex(key);
            let cindex = current.getCIndex(key, index);
            if (index < current.getNum() && key === current.getKey(index)) {
                return true;
            }
            else {
                if (current.isLeaf) {
                    return false;
                }
                else {
                    return this.searchNode(current.getChild(cindex), key);
                }
            }
        }
    }
    changeKey(current, oldKey, newKey) {
        if (current !== null && !current.isLeaf) {
            let index = current.getIndex(oldKey);
            if (index < current.getNum() && oldKey === current.getKey(index)) {
                current.setKey(index, newKey);
            }
            else {
                this.changeKey(current.getChild(index), oldKey, newKey);
            }
        }
    }
    popNode(current, key) {
        let index = current.getIndex(key);
        let cindex = current.getCIndex(key, index);
        if (current.isLeaf) {
            if (key === this.maxKey && index > 0) {
                this.maxKey = current.getKey(index - 1);
            }
            let res = current.getValue(index);
            current.removeKey(index, cindex);
            if (cindex === 0 && !this.root.isLeaf && current !== this.headNode) {
                this.changeKey(this.root, key, current.getKey(0));
            }
            return res;
        }
        else {
            let child = current.getChild(cindex);
            if (child.getNum() == B_NODE_MIN_SIZE) {
                let left = cindex > 0 ? current.getChild(cindex - 1) : null;
                let right = cindex < current.getNum() ? current.getChild(cindex + 1) : null;
                if (left !== null && left.getNum() > B_NODE_MIN_SIZE) {
                    child.moveFrom(left, current, index - 1, LEFT_DIR);
                }
                else if (right !== null && right.getNum() > B_NODE_MIN_SIZE) {
                    child.moveFrom(right, current, cindex, RIGHT_DIR);
                }
                else if (left !== null) {
                    left.merge(current, child, cindex - 1);
                    child = left;
                }
                else if (right !== null) {
                    right.merge(current, child, cindex);
                    child = right;
                }
            }
            return this.popNode(child, key);
        }
    }
    pop(key) {
        if (!this.search(key)) {
            return null;
        }
        else {
            if (this.root.getNum() === 1) {
                if (this.root.isLeaf) {
                    let temp = this.root.getValue(0);
                    this.clear();
                    return temp;
                }
                else {
                    let child0 = this.root.getChild(0);
                    let child1 = this.root.getChild(1);
                    if (child0.getNum() === B_NODE_MIN_SIZE && child1.getNum() === B_NODE_MIN_SIZE) {
                        child0.merge(this.root, child1, 0);
                        this.root = child0;
                    }
                }
            }
            return this.popNode(this.root, key);
        }
    }
    dump() {
        if (this.headNode !== null) {
            let res = [];
            let cur = this.headNode;
            while (cur !== null) {
                for (let i = 0; i < cur.getNum(); i++) {
                    res.push(cur.getValue(i));
                }
                cur = cur.getRightSib();
            }
            return res;
        }
        return [];
    }
}
exports.BTree = BTree;
class IndexManager {
    constructor(bufferManager) {
        this.bufferManager = bufferManager;
    }
    createIndex(index, table) { }
    dropIndex(indexName, table) { }
    getIndex(indexName, table) { }
    closeIndex(indexName, table) { }
}
exports.IndexManager = IndexManager;
//# sourceMappingURL=indices.js.map