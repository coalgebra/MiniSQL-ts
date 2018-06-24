"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tables_1 = require("./tables");
var InstType;
(function (InstType) {
    InstType[InstType["CREATE_INDEX"] = 0] = "CREATE_INDEX";
    InstType[InstType["CREATE_TABLE"] = 1] = "CREATE_TABLE";
    InstType[InstType["SELECT"] = 2] = "SELECT";
    InstType[InstType["DELETE"] = 3] = "DELETE";
    InstType[InstType["DROP_TABLE"] = 4] = "DROP_TABLE";
    InstType[InstType["DROP_INDEX"] = 5] = "DROP_INDEX";
    InstType[InstType["INSERT"] = 6] = "INSERT";
    InstType[InstType["EXIT"] = 7] = "EXIT";
    InstType[InstType["LOAD"] = 8] = "LOAD";
    InstType[InstType["SHOW"] = 9] = "SHOW";
})(InstType = exports.InstType || (exports.InstType = {}));
class Instruction {
    constructor(type) {
        this.itype = type;
    }
}
exports.Instruction = Instruction;
class CreateIndex extends Instruction {
    constructor(indexName, tableName, elementName) {
        super(InstType.CREATE_INDEX);
        this.indexName = indexName;
        this.tableName = tableName;
        this.fieldName = elementName;
    }
}
exports.CreateIndex = CreateIndex;
class CreateTable extends Instruction {
    constructor(tableName, members, primary) {
        super(InstType.CREATE_TABLE);
        this.tableName = tableName;
        this.members = members;
        this.primary = primary;
    }
    toTableHeader() {
        return new tables_1.TableHeader(this.tableName, this.members, this.primary);
    }
}
exports.CreateTable = CreateTable;
class Select extends Instruction {
    constructor(names, tableName, restriction) {
        super(InstType.SELECT);
        this.names = names;
        this.tableName = tableName;
        this.restriction = restriction;
    }
}
exports.Select = Select;
class Show extends Instruction {
    constructor(flag) {
        super(InstType.SHOW);
        this.flag = flag;
    }
}
exports.Show = Show;
class Delete extends Instruction {
    constructor(tableName, restriction) {
        super(InstType.DELETE);
        this.tableName = tableName;
        this.restriction = restriction;
    }
}
exports.Delete = Delete;
class DropTable extends Instruction {
    constructor(tableName) {
        super(InstType.DROP_TABLE);
        this.tableName = tableName;
    }
}
exports.DropTable = DropTable;
class DropIndex extends Instruction {
    constructor(tableName, indexName) {
        super(InstType.DROP_INDEX);
        this.tableName = tableName;
        this.indexName = indexName;
    }
}
exports.DropIndex = DropIndex;
class Insert extends Instruction {
    constructor(tableName, values) {
        super(InstType.INSERT);
        this.tableName = tableName;
        this.values = values;
    }
}
exports.Insert = Insert;
class Exit extends Instruction {
    constructor() {
        super(InstType.EXIT);
    }
}
exports.Exit = Exit;
class Load extends Instruction {
    constructor(filename) {
        super(InstType.LOAD);
        this.filename = filename;
    }
}
exports.Load = Load;
function select() {
}
exports.select = select;
//# sourceMappingURL=instruction.js.map