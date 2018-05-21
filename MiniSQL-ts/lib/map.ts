class Node<T1, T2> {
    key: T1;
    value: T2;
    size: number;
    left: Node<T1, T2>;
    rigth: Node<T1, T2>;
    parent: Node<T1, T2>;

    constructor(key: T1, value: T2, size: number, left: Node<T1, T2>, rigth: Node<T1, T2>, parent: Node<T1, T2>) {
        this.key = key;
        this.value = value;
        this.size = size;
        this.left = left;
        this.rigth = rigth;
        this.parent = parent;
    }

    update() : void {
        this.size = (this.left ? this.left.size : 0) + (this.rigth ? this.rigth.size : 0) + 1;
    }

    getSuccessor(): Node<T1, T2> {
        if (!this.rigth) { // search from above
            if (!this.parent) return null;
            if (!this.parent.parent) return null;
            if (this.parent.left === this) return this.parent;
            let cur = this.parent;
            while (cur.parent && cur.parent.rigth === cur) {
                cur = cur.parent;
            }
            // cur.parent.left === cur
            return cur.parent;
        } else {
            let cur = this.rigth;
            while (cur.left) cur = cur.left;
            return cur;
        }
    }

}

function createSingleton<T1, T2>(key: T1, value: T2) : Node<T1, T2> {
    return new Node(key, value, 1, null, null, null);
}

export class Map<T1, T2> {
    root: Node<T1, T2>;
    constructor() {
        this.root = null;
    }

    private insertNode(cur: Node<T1, T2>, insNode : Node<T1, T2>): Node<T1, T2> {
        if (insNode.key < cur.key) { // insert to left
            if (!cur.left) {
                return insNode.parent = cur, cur.left = insNode;
            } else {
                return this.insertNode(cur.left, insNode);
            }
        } else {
            if (!cur.rigth) {
                return insNode.parent = cur, cur.rigth = insNode;
            } else {
                return this.insertNode(cur.rigth, insNode);
            }
        }
    } 

    private eraseNode(cur: Node<T1, T2>, key: T1): void {
        if (cur.key === key) {
            if (!cur.left || !cur.rigth) {
                let temp = cur.left ? cur.left : cur.rigth;
                if (cur.parent) {
                    const parent = cur.parent;
                    if (cur === parent.left) {
                        parent.left = temp;
                        parent.update();
                    } else {
                        parent.rigth = temp;
                        parent.update();
                    }
                } else {
                    this.root = temp;
                }
                return;
            } else {
                let node = cur.getSuccessor();
                [node.key, cur.key] = [cur.key, node.key];
                [node.value, cur.value] = [cur.value, node.value];
                return this.eraseNode(node, key);
            }
        }
    }

    private findNode(cur: Node<T1, T2>, key: T1): Node<T1, T2> {
        if (!cur) return null;
        if (cur.key === key) return cur;
        if (cur.key < key) return this.findNode(cur.rigth, key);
        return this.findNode(cur.left, key);
    }

    insert(key : T1, value : T2) : Node<T1, T2>{
        if (!this.root) { // empty tree
            return this.root = createSingleton(key, value);
        } else {
            return this.insertNode(this.root, createSingleton(key, value));
        }
    }

    erase(key: T1): void {
        if (!this.root) return;
        return this.eraseNode(this.root, key);
    }

    find(key: T1): T2 {
        let res = this.findNode(this.root, key);
        return res ? res.value : null;
    }

    private visitNode(func: (key: T1, value: T2) => void, cur: Node<T1, T2>): void {
        if (!cur) return;
        this.visitNode(func, cur.left);
        func(cur.key, cur.value);
        this.visitNode(func, cur.rigth);
    }

    visit(func: (key : T1, value: T2) => void): void {
        this.visitNode(func, this.root);
    }

    toList(): T2[] {
        let res: T2[] = [];
        this.visit((a, b) => {
            res.push(b);
        });
        return res;
    }

    toString(): string {
        return this.toList().map(x => x.toString()).join(" ");
    }
}