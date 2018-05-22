export enum BasicType {
    INT,
    FLOAT,
    CHARS
}

export interface IType {
    btype : BasicType;
}

export class IntType implements IType{
    btype = BasicType.INT;
}

export class FloatType implements IType {
    btype = BasicType.FLOAT;
}

export class CharsType implements IType {
    btype = BasicType.CHARS;
    count: number;

    constructor(count: number) {
        this.btype = BasicType.CHARS;
        this.count = count;
    }
}