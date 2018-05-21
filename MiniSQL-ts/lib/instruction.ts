import Types = require("./types");
import IType = Types.IType;
import Ast = require("./ast");
import AST = Ast.AST;

export enum InstType {
    CREATE_INDEX,
    CREATE_TABLE,
    SELECT,
    DELETE,
    DROP_TABLE,
    DROP_INDEX,
    INSERT
}

export class Instruction {
    itype : InstType;
    constructor(type : InstType) {
        this.itype = type;
    }
}


export class CreateIndex extends Instruction{
    indexName: string;
    tableName: string;
    elementName: string;

    constructor(indexName: string, tableName: string, elementName: string) {
        super(InstType.CREATE_INDEX);
        this.indexName = indexName;
        this.tableName = tableName;
        this.elementName = elementName;
    }
}

export class CreateTable extends Instruction {
    tableName: string;
    indices: string[];
    types: IType[];
    uniqueFlags: boolean[];
    primary: string;

    constructor( tableName: string, indices: string[], types: Types.IType[], primary : string) {
        super(InstType.CREATE_TABLE);
        this.tableName = tableName;
        this.indices = indices;
        this.types = types;
        this.primary = primary;
    }
}

export class Select extends Instruction {
    names: string[];
    tableName: string;
    restriction: AST;

    constructor(names: string[], tableName: string, restriction: Ast.AST) {
        super(InstType.SELECT);
        this.names = names;
        this.tableName = tableName;
        this.restriction = restriction;
    }
}

export class Delete extends Instruction {
    tableName: string;
    restriction: AST;

    constructor(tableName: string, restriction: Ast.AST) {
        super(InstType.DELETE);
        this.tableName = tableName;
        this.restriction = restriction;
    }
}

export class DropTable extends Instruction {
    tableName: string;

    constructor(tableName: string) {
        super(InstType.DROP_TABLE);
        this.tableName = tableName;
    }
}

export class DropIndex extends Instruction {
    tableName: string;
    indexName: string;

    constructor(tableName: string, indexName : string) {
        super(InstType.DROP_INDEX);
        this.tableName = tableName;
        this.indexName = indexName;
    }
}

export class Insert extends Instruction {
    tableName: string;
    values: (number | string | boolean)[];

    constructor(tableName: string, values: (number | string | boolean)[]) {
        super(InstType.INSERT);
        this.tableName = tableName;
        this.values = values;
    }
}

export function select() {

}