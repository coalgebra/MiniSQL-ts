import Types = require("./types");
import IType = Types.IType;
import Ast = require("./ast");
import AST = Ast.AST;
import Tables = require("./tables");
import TableMember = Tables.TableMember;
import TableHeader = Tables.TableHeader;

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
    members: TableMember[];
    primary: string;

    constructor( tableName: string, members: TableMember[], primary : string) {
        super(InstType.CREATE_TABLE);
        this.tableName = tableName;
        this.members = members;
        this.primary = primary;
    }

    toTableHeader(): TableHeader {
        return new TableHeader(this.tableName, this.members, this.primary);
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
    values: (number | string)[];

    constructor(tableName: string, values: (number | string)[]) {
        super(InstType.INSERT);
        this.tableName = tableName;
        this.values = values;
    }
}

export function select() {

}