"use strict";

const B_NODE_ORDER = 2;

const B_NODE_MIN_SIZE = B_NODE_ORDER - 1;
const B_NODE_MAX_SIZE = 2 * B_NODE_ORDER - 1;

const B_NODE_MIN_CHILD = B_NODE_MIN_SIZE + 1;

const LEFT_DIR = false;
const RIGHT_DIR = true;

type Direction = boolean;

interface BNode<T, BKeyType> {
    keys: Array<BKeyType>;
    keyNum: number;
    isLeaf: boolean;

    leaf(): boolean;

    getNum(): number;
    setNum(n: number);
    getKey(i: number): BKeyType;
    setKey(i: number, key: BKeyType);

    getIndex(key: BKeyType): number;

    removeKey(index: number, cindex: number);
    split(parent: BNode<T, BKeyType>, cindex: number);
    merge(parent: BNode<T, BKeyType>, child: BNode<T, BKeyType>, index: number);
    clear();

    // left : true, right : false
    moveFrom(neighbour: BNode<T, BKeyType>, parent: BNode<T, BKeyType>, index: number, dir: Direction);
    getCIndex(key: BKeyType, index: number): number;
}

class BLeafNode<T, TBKeyType> implements BNode<T, TBKeyType>{
    keys: Array<TBKeyType>;
    keyNum: number;
    isLeaf: boolean;

    values: Array<T>;
    leftSibling: BLeafNode<T, TBKeyType>;
    rightSibling: BLeafNode<T, TBKeyType>;

    constructor() {
        this.isLeaf = true;
        this.leftSibling = null;
        this.rightSibling = null;
        this.keys = [];
        this.values = [];
        this.keyNum = 0;
    }

    leaf(): boolean { return true; }

    getNum(): number { return this.keyNum; }
    setNum(num: number) {
        this.keyNum = num;
        this.keys.length = num;
        this.values.length = num;
    }

    setLeftSib(sib: BLeafNode<T, TBKeyType>) { this.leftSibling = sib; }
    getLeftSib(): BLeafNode<T, TBKeyType> { return this.leftSibling; }

    setRightSib(sib: BLeafNode<T, TBKeyType>) { this.rightSibling = sib; }
    getRightSib(): BLeafNode<T, TBKeyType> { return this.rightSibling; }

    getKey(i: number): TBKeyType { return this.keys[i]; }
    setKey(i: number, key: TBKeyType) {
        this.keys[i] = key;
    }

    getIndex(key: TBKeyType): number {
        let left = 0;
        let right = this.getNum() - 1;
        let current = 0;
        while (left !== right) {
            current = (left + right) / 2;
            let currentKey = this.getKey(current);
            if (currentKey < key) left = current + 1;
            else right = current;
        }
        return left;
    }

    getValue(i: number): T { return this.values[i]; }
    setValue(i: number, value: T) { this.values[i] = value; }

    removeKey(index: number, cindex: number) {
        for (let i = index; i < this.keyNum - 1; i++) {
            this.setKey(i, this.getKey(i + 1));
            this.setValue(i, this.getValue(i + 1));
        }
        this.setNum(this.getNum() - 1);
    }

    insert(key: TBKeyType, value: T) {
        let i: number;

        for (i = this.keyNum; i >= 1 && this.keys[i - 1] > key; i--) {
            this.setKey(i, this.keys[i - 1]);
            this.setValue(i, this.values[i - 1]);
        }

        this.setKey(i, key);
        this.setValue(i, value);
        this.setNum(this.keyNum + 1);
    }

    split(parent: BNode<T, TBKeyType>, cindex: number) {
        const newNode: BLeafNode<T, TBKeyType> = new BLeafNode<T, TBKeyType>();

        newNode.setRightSib(this.getRightSib());

        for (let i = 0; i < B_NODE_MIN_SIZE + 1; i++) {
            newNode.setKey(i, this.keys[i + B_NODE_MIN_SIZE]);
            newNode.setValue(i, this.values[i + B_NODE_MIN_SIZE]);
        }
        let temp: TBKeyType = this.keys[B_NODE_MIN_SIZE];
        this.setNum(B_NODE_MIN_SIZE);
        newNode.setNum(B_NODE_MIN_SIZE + 1);
        newNode.setLeftSib(this);
        this.setRightSib(newNode);

        (<BInterNode<T, TBKeyType>>parent).insert(cindex, cindex + 1, temp, newNode);
    }

    merge(parent: BNode<T, TBKeyType>, child: BNode<T, TBKeyType>, index: number) {
        for (let i = 0; i < child.getNum(); i++) {
            this.insert(child.getKey(i), (<BLeafNode<T, TBKeyType>>child).getValue(i));
        }
        this.setRightSib((<BLeafNode<T, TBKeyType>>child).getRightSib());
        parent.removeKey(index + 1, index + 1);
    }

    clear() {
        for (let i = 0; i < this.getNum(); i++) {
            this.keys[i] = null;
            this.values[i] = null;
        }
    }

    moveFrom(sibling: BNode<T, TBKeyType>, parent: BNode<T, TBKeyType>, index: number, dir: Direction) {
        if (dir === LEFT_DIR) {
            this.insert(sibling.getKey(sibling.getNum() - 1), (<BLeafNode<T, TBKeyType>>sibling).getValue(sibling.getNum() - 1));
            sibling.removeKey(sibling.getNum() - 1, sibling.getNum() - 1);
            parent.setKey(index, this.getKey(0));
        } else {
            this.insert(sibling.getKey(0), (<BLeafNode<T, TBKeyType>>sibling).getValue(0));
            sibling.removeKey(0, 0);
            parent.setKey(index, sibling.getKey(0));
        }
    }

    getCIndex(key: TBKeyType, index: number): number {
        return index;
    }

}

class BInterNode<T, TBKeyType> implements BNode<T, TBKeyType>{
    keys: Array<TBKeyType>;
    keyNum: number;
    isLeaf: boolean;

    children: Array<BNode<T, TBKeyType>>;

    constructor() {
        this.isLeaf = false;
        this.children = [];
        this.keys = [];
        this.keyNum = 0;
    }

    leaf() { return false; }

    getNum(): number { return this.keyNum; }
    setNum(num: number) {
    this.keyNum = num;
        this.keys.length = num;
        this.children.length = num + 1;
    }

    setChild(i: number, child: BNode<T, TBKeyType>) {
        this.children[i] = child;
    }

    getChild(i: number): BNode<T, TBKeyType> {
        return this.children[i];
    }

    getKey(i: number): TBKeyType { return this.keys[i]; }
    setKey(i: number, key: TBKeyType) {
        this.keys[i] = key;
    }

    getIndex(key: TBKeyType): number {
        let left = 0;
        let right = this.keyNum - 1;
        let current = 0;
        while (left !== right) {
            current = Math.floor((left + right) / 2);
            let currentKey = this.getKey(current);
            if (currentKey < key) left = current + 1;
            else right = current;
        }
        return left;
    }

    removeKey(index: number, cindex: number) {
        for (let i = 0; i < this.getNum() - index - 1; i++) {
            this.setKey(index + i, this.getKey(index + i + 1));
            this.setChild(cindex + i, this.getChild(cindex + i + 1));
        }
        this.setNum(this.getNum() - 1);
    }

    insert(index: number, cindex: number, key: TBKeyType, child: BNode<T, TBKeyType>) {
        let i: number;
        let n: number = this.getNum();
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

    split(parent: BNode<T, TBKeyType>, cindex: number) {
        let newNode = new BInterNode<T, TBKeyType>(); // the new node on the right side

        newNode.setNum(B_NODE_MIN_SIZE);

        for (let i = 0; i < B_NODE_MIN_SIZE; i++) { // copy the keys
            newNode.setKey(i, this.keys[i + B_NODE_MIN_CHILD]);
        }
        for (let i = 0; i < B_NODE_MIN_CHILD; i++) { // copy the children
            newNode.setChild(i, this.children[i + B_NODE_MIN_CHILD]);
        }

        let temp2: TBKeyType = this.keys[B_NODE_MIN_SIZE];
        this.setNum(B_NODE_MIN_SIZE);
        let temp = <BInterNode<T, TBKeyType>>parent;
        temp.insert(cindex, cindex + 1, temp2, newNode);
    }

    merge(parent: BNode<T, TBKeyType>, child: BNode<T, TBKeyType>, index: number) {
        this.insert(B_NODE_MIN_SIZE,
            B_NODE_MIN_SIZE + 1,
            parent.getKey(index),
            (<BInterNode<T, TBKeyType>>child).getChild(0));
        for (let i = 1; i <= child.getNum(); i++) {
            this.insert(B_NODE_MIN_SIZE + i,
                B_NODE_MIN_SIZE + i + 1,
                child.getKey(i - 1),
                (<BInterNode<T, TBKeyType>>child).getChild(i));
        }
        parent.removeKey(index, index + 1);
    }

    clear() {
        for (let i = 0; i < this.keyNum; i++) {
            this.children[i].clear();
            this.children[i] = null;
        }
    }

    moveFrom(sibling: BNode<T, TBKeyType>, parent: BNode<T, TBKeyType>, index: number, dir: Direction) {
        if (dir === LEFT_DIR) { // left
            let interSibling = <BInterNode<T, TBKeyType>>sibling;
            this.insert(0, 0, parent.getKey(index), interSibling.getChild(sibling.getNum()));
            parent.setKey(index, sibling.getKey(sibling.getNum() - 1));
        } else {
            let interSibling = <BInterNode<T, TBKeyType>>sibling;
            this.insert(this.getNum(), this.getNum() + 1, parent.getKey(index), interSibling.getChild(0));
            parent.setKey(index, sibling.getKey(0));
            sibling.removeKey(0, 0);
        }
    }

    getCIndex(key: TBKeyType, index: number): number {
        if (key !== this.getKey(index)) {
            return index + 1;
        }
        return index;
    }

}

interface IPrintResult {
    result: string;
}

export class BTree<T, TBKeyType> {

    root: BNode<T, TBKeyType>;
    headNode: BLeafNode<T, TBKeyType>;
    maxKey: TBKeyType;

    constructor() {
        this.root = null;
        this.headNode = null;
    }

    insert(key: TBKeyType, value: T): boolean {
        if (this.search(key)) {
            return false;
        }
        if (this.root === null) {
            this.headNode = new BLeafNode();
            this.root = this.headNode;
            this.maxKey = key;
        } else if (this.root.getNum() >= B_NODE_MAX_SIZE) {
            const newNode = new BInterNode<T, TBKeyType>();
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

    remove(key: TBKeyType): boolean {
        if (!this.search(key)) {
            return false;
        }
        if (this.root.getNum() === 1) {
            if (this.root.isLeaf) {
                this.clear();
                return true;
            } else {
                let child0 = (<BInterNode<T, TBKeyType>>this.root).getChild(0);
                let child1 = (<BInterNode<T, TBKeyType>>this.root).getChild(1);
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
    search(key: TBKeyType): boolean {
        return this.searchNode(this.root, key);
    }

    clear() {
        if (this.root !== null) {
            this.root.clear();
            this.root = null;
            this.headNode = null;
        }
    }

    print(): string {
        let res: IPrintResult = { result: "" };
        this.printLn(this.root, 10, res);
        return res.result;
    }

    insertNode(current: BNode<T, TBKeyType>, key: TBKeyType, value: T) {
        if (current.isLeaf) {
            let leafCur = <BLeafNode<T, TBKeyType>>current;
            leafCur.insert(key, value);
        } else {
            let interCur = <BInterNode<T, TBKeyType>>current;

            let index = current.getIndex(key);
            let cindex = current.getCIndex(key, index);
            let child = interCur.getChild(cindex);

            this.insertNode(child, key, value);
        }
    }

    removeNode(current: BNode<T, TBKeyType>, key: TBKeyType) {
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
        } else {
            let child = (<BInterNode<T, TBKeyType>>current).getChild(cindex);
            if (child.getNum() == B_NODE_MIN_SIZE) {
                let left: BNode<T, TBKeyType> = cindex > 0 ? (<BInterNode<T, TBKeyType>>current).getChild(cindex - 1) : null;
                let right: BNode<T, TBKeyType> = cindex < current.getNum() ? (<BInterNode<T, TBKeyType>>current).getChild(cindex + 1) : null;
                if (left !== null && left.getNum() > B_NODE_MIN_SIZE) {
                    child.moveFrom(left, current, index - 1, LEFT_DIR);
                } else if (right !== null && right.getNum() > B_NODE_MIN_SIZE) {
                    child.moveFrom(right, current, cindex, RIGHT_DIR);
                } else if (left !== null) {
                    left.merge(current, child, cindex - 1);
                    child = left;
                } else if (right !== null) {
                    right.merge(current, child, cindex);
                    child = right;
                }
            }
            this.removeNode(child, key);
        }
    }

    printLn(current: BNode<T, TBKeyType>, counter: number, result: IPrintResult) {
        if (current !== null) {
            let i: number, j: number;
            for (i = 0; i < current.getNum(); i++) {
                if (!current.isLeaf) {
                    this.printLn((<BInterNode<T, TBKeyType>>current).getChild(i), counter - 2, result);
                }
                for (j = counter; j >= 0; j--) {
                    result.result += "-";
                }
                result.result += current.getKey(i).toString() + "\n";
            }
            if (!current.isLeaf) {
                this.printLn((<BInterNode<T, TBKeyType>>current).getChild(i), counter - 2, result);
            }
        }
    }

    searchNode(current: BNode<T, TBKeyType>, key: TBKeyType): boolean {
        if (current === null) {
            return false;
        } else {
            let index = current.getIndex(key);
            let cindex = current.getCIndex(key, index);
            if (index < current.getNum() && key === current.getKey(index)) {
                return true;
            } else {
                if (current.isLeaf) {
                    return false;
                } else {
                    return this.searchNode((<BInterNode<T, TBKeyType>>current).getChild(cindex), key);
                }
            }
        }
    }

    changeKey(current: BNode<T, TBKeyType>, oldKey: TBKeyType, newKey: TBKeyType) {
        if (current !== null && !current.isLeaf) {
            let index = current.getIndex(oldKey);
            if (index < current.getNum() && oldKey === current.getKey(index)) {
                current.setKey(index, newKey);
            } else {
                this.changeKey((<BInterNode<T, TBKeyType>>current).getChild(index), oldKey, newKey);
            }
        }
    }

    popNode(current: BNode<T, TBKeyType>, key: TBKeyType): T {
        let index = current.getIndex(key);
        let cindex = current.getCIndex(key, index);
        if (current.isLeaf) {
            if (key === this.maxKey && index > 0) {
                this.maxKey = current.getKey(index - 1);
            }
            let res = (<BLeafNode<T, TBKeyType>>current).getValue(index);
            current.removeKey(index, cindex);
            if (cindex === 0 && !this.root.isLeaf && current !== this.headNode) {
                this.changeKey(this.root, key, current.getKey(0));
            }
            return res;
        } else {
            let child = (<BInterNode<T, TBKeyType>>current).getChild(cindex);
            if (child.getNum() == B_NODE_MIN_SIZE) {
                let left: BNode<T, TBKeyType> = cindex > 0 ? (<BInterNode<T, TBKeyType>>current).getChild(cindex - 1) : null;
                let right: BNode<T, TBKeyType> = cindex < current.getNum() ? (<BInterNode<T, TBKeyType>>current).getChild(cindex + 1) : null;
                if (left !== null && left.getNum() > B_NODE_MIN_SIZE) {
                    child.moveFrom(left, current, index - 1, LEFT_DIR);
                } else if (right !== null && right.getNum() > B_NODE_MIN_SIZE) {
                    child.moveFrom(right, current, cindex, RIGHT_DIR);
                } else if (left !== null) {
                    left.merge(current, child, cindex - 1);
                    child = left;
                } else if (right !== null) {
                    right.merge(current, child, cindex);
                    child = right;
                }
            }
            return this.popNode(child, key);
        }
    }

    pop(key: TBKeyType): T {
        if (!this.search(key)) {
            return null;
        } else {
            if (this.root.getNum() === 1) {
                if (this.root.isLeaf) {
                    let temp = (<BLeafNode<T, TBKeyType>>this.root).getValue(0);
                    this.clear();
                    return temp;
                } else {
                    let child0: BNode<T, TBKeyType> = (<BInterNode<T, TBKeyType>>this.root).getChild(0);
                    let child1: BNode<T, TBKeyType> = (<BInterNode<T, TBKeyType>>this.root).getChild(1);
                    if (child0.getNum() === B_NODE_MIN_SIZE && child1.getNum() === B_NODE_MIN_SIZE) {
                        child0.merge(this.root, child1, 0);
                        this.root = child0;
                    }
                }
            }
            return this.popNode(this.root, key);
        }
    }

    dump(): Array<T> {
        if (this.headNode !== null) {
            let res: Array<T> = [];
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