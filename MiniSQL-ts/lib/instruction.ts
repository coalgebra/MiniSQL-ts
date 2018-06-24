import {TableMember, TableHeader } from "./tables";
import {AST} from "./ast";

export enum InstType {
    CREATE_INDEX,
    CREATE_TABLE,
    SELECT,
    DELETE,
    DROP_TABLE,
    DROP_INDEX,
    INSERT,
    EXIT,
    LOAD,
    SHOW
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
    fieldName: string;

    constructor(indexName: string, tableName: string, elementName: string) {
        super(InstType.CREATE_INDEX);
        this.indexName = indexName;
        this.tableName = tableName;
        this.fieldName = elementName;
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

    constructor(names: string[], tableName: string, restriction: AST) {
        super(InstType.SELECT);
        this.names = names;
        this.tableName = tableName;
        this.restriction = restriction;
    }
}

export class Show extends Instruction {
    flag: string;
    constructor(flag: string) {
        super(InstType.SHOW);
        this.flag = flag;
    }
}

export class Delete extends Instruction {
    tableName: string;
    restriction: AST;

    constructor(tableName: string, restriction: AST) {
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

export class Exit extends Instruction {
    constructor() {
        super(InstType.EXIT);
    }
}

export class Load extends Instruction {

    filename : string;

    constructor(filename : string) {
        super(InstType.LOAD);
        this.filename = filename;
    }
}

export function select() {

}