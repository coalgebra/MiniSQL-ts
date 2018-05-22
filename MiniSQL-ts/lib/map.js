"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Node = /** @class */ (function () {
    function Node(key, value, size, left, rigth, parent) {
        this.key = key;
        this.value = value;
        this.size = size;
        this.left = left;
        this.rigth = rigth;
        this.parent = parent;
    }
    Node.prototype.update = function () {
        this.size = (this.left ? this.left.size : 0) + (this.rigth ? this.rigth.size : 0) + 1;
    };
    Node.prototype.getSuccessor = function () {
        if (!this.rigth) {
            if (!this.parent)
                return null;
            if (!this.parent.parent)
                return null;
            if (this.parent.left === this)
                return this.parent;
            var cur = this.parent;
            while (cur.parent && cur.parent.rigth === cur) {
                cur = cur.parent;
            }
            // cur.parent.left === cur
            return cur.parent;
        }
        else {
            var cur = this.rigth;
            while (cur.left)
                cur = cur.left;
            return cur;
        }
    };
    return Node;
}());
function createSingleton(key, value) {
    return new Node(key, value, 1, null, null, null);
}
var Map = /** @class */ (function () {
    function Map() {
        this.root = null;
    }
    Map.prototype.insertNode = function (cur, insNode) {
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
    };
    Map.prototype.eraseNode = function (cur, key) {
        if (cur.key === key) {
            if (!cur.left || !cur.rigth) {
                var temp = cur.left ? cur.left : cur.rigth;
                if (cur.parent) {
                    var parent = cur.parent;
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
                var node = cur.getSuccessor();
                _a = [cur.key, node.key], node.key = _a[0], cur.key = _a[1];
                _b = [cur.value, node.value], node.value = _b[0], cur.value = _b[1];
                return this.eraseNode(node, key);
            }
        }
        var _a, _b;
    };
    Map.prototype.findNode = function (cur, key) {
        if (!cur)
            return null;
        if (cur.key === key)
            return cur;
        if (cur.key < key)
            return this.findNode(cur.rigth, key);
        return this.findNode(cur.left, key);
    };
    Map.prototype.insert = function (key, value) {
        if (!this.root) {
            return this.root = createSingleton(key, value);
        }
        else {
            return this.insertNode(this.root, createSingleton(key, value));
        }
    };
    Map.prototype.erase = function (key) {
        if (!this.root)
            return;
        return this.eraseNode(this.root, key);
    };
    Map.prototype.find = function (key) {
        var res = this.findNode(this.root, key);
        return res ? res.value : null;
    };
    Map.prototype.visitNode = function (func, cur) {
        if (!cur)
            return;
        this.visitNode(func, cur.left);
        func(cur.key, cur.value);
        this.visitNode(func, cur.rigth);
    };
    Map.prototype.visit = function (func) {
        this.visitNode(func, this.root);
    };
    Map.prototype.toList = function () {
        var res = [];
        this.visit(function (a, b) {
            res.push(b);
        });
        return res;
    };
    Map.prototype.toString = function () {
        return this.toList().map(function (x) { return x.toString(); }).join(" ");
    };
    return Map;
}());
exports.Map = Map;
//# sourceMappingURL=map.js.map