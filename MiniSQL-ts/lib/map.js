"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Node {
    constructor(key, value, size, left, rigth, parent) {
        this.key = key;
        this.value = value;
        this.size = size;
        this.left = left;
        this.rigth = rigth;
        this.parent = parent;
    }
    update() {
        this.size = (this.left ? this.left.size : 0) + (this.rigth ? this.rigth.size : 0) + 1;
    }
    getSuccessor() {
        if (!this.rigth) {
            if (!this.parent)
                return null;
            if (!this.parent.parent)
                return null;
            if (this.parent.left === this)
                return this.parent;
            let cur = this.parent;
            while (cur.parent && cur.parent.rigth === cur) {
                cur = cur.parent;
            }
            // cur.parent.left === cur
            return cur.parent;
        }
        else {
            let cur = this.rigth;
            while (cur.left)
                cur = cur.left;
            return cur;
        }
    }
}
function createSingleton(key, value) {
    return new Node(key, value, 1, null, null, null);
}
class Map {
    constructor() {
        this.root = null;
    }
    insertNode(cur, insNode) {
        if (insNode.key < cur.key) {
            if (!cur.left) {
                return insNode.parent = cur, cur.left = insNode;
            }
            else {
                return this.insertNode(cur.left, insNode);
            }
        }
        else {
            if (!cur.rigth) {
                return insNode.parent = cur, cur.rigth = insNode;
            }
            else {
                return this.insertNode(cur.rigth, insNode);
            }
        }
    }
    eraseNode(cur, key) {
        if (cur.key === key) {
            if (!cur.left || !cur.rigth) {
                let temp = cur.left ? cur.left : cur.rigth;
                if (cur.parent) {
                    const parent = cur.parent;
                    if (cur === parent.left) {
                        parent.left = temp;
                        parent.update();
                    }
                    else {
                        parent.rigth = temp;
                        parent.update();
                    }
                }
                else {
                    this.root = temp;
                }
                return;
            }
            else {
                let node = cur.getSuccessor();
                [node.key, cur.key] = [cur.key, node.key];
                [node.value, cur.value] = [cur.value, node.value];
                return this.eraseNode(node, key);
            }
        }
    }
    findNode(cur, key) {
        if (!cur)
            return null;
        if (cur.key === key)
            return cur;
        if (cur.key < key)
            return this.findNode(cur.rigth, key);
        return this.findNode(cur.left, key);
    }
    insert(key, value) {
        if (!this.root) {
            return this.root = createSingleton(key, value);
        }
        else {
            return this.insertNode(this.root, createSingleton(key, value));
        }
    }
    erase(key) {
        if (!this.root)
            return;
        return this.eraseNode(this.root, key);
    }
    find(key) {
        let res = this.findNode(this.root, key);
        return res ? res.value : null;
    }
    visitNode(func, cur) {
        if (!cur)
            return;
        this.visitNode(func, cur.left);
        func(cur.key, cur.value);
        this.visitNode(func, cur.rigth);
    }
    visit(func) {
        this.visitNode(func, this.root);
    }
    toList() {
        let res = [];
        this.visit((a, b) => {
            res.push(b);
        });
        return res;
    }
    toString() {
        return this.toList().map(x => x.toString()).join(" ");
    }
}
exports.Map = Map;
//# sourceMappingURL=map.js.map