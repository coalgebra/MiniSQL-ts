"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var InstType;
(function (InstType) {
    InstType[InstType["CREATE_INDEX"] = 0] = "CREATE_INDEX";
    InstType[InstType["CREATE_TABLE"] = 1] = "CREATE_TABLE";
    InstType[InstType["SELECT"] = 2] = "SELECT";
    InstType[InstType["DELETE"] = 3] = "DELETE";
    InstType[InstType["DROP_TABLE"] = 4] = "DROP_TABLE";
    InstType[InstType["DROP_INDEX"] = 5] = "DROP_INDEX";
    InstType[InstType["INSERT"] = 6] = "INSERT";
})(InstType = exports.InstType || (exports.InstType = {}));
var Instruction = /** @class */ (function () {
    function Instruction(type) {
        this.itype = type;
    }
    return Instruction;
}());
exports.Instruction = Instruction;
var CreateIndex = /** @class */ (function (_super) {
    __extends(CreateIndex, _super);
    function CreateIndex(indexName, tableName, elementName) {
        var _this = _super.call(this, InstType.CREATE_INDEX) || this;
        _this.indexName = indexName;
        _this.tableName = tableName;
        _this.elementName = elementName;
        return _this;
    }
    return CreateIndex;
}(Instruction));
exports.CreateIndex = CreateIndex;
var TableMember = /** @class */ (function () {
    function TableMember(index, type, unique) {
        this.index = index;
        this.type = type;
        this.unique = unique;
    }
    return TableMember;
}());
exports.TableMember = TableMember;
var CreateTable = /** @class */ (function (_super) {
    __extends(CreateTable, _super);
    function CreateTable(tableName, members, primary) {
        var _this = _super.call(this, InstType.CREATE_TABLE) || this;
        _this.tableName = tableName;
        _this.members = members;
        _this.primary = primary;
        return _this;
    }
    return CreateTable;
}(Instruction));
exports.CreateTable = CreateTable;
var Select = /** @class */ (function (_super) {
    __extends(Select, _super);
    function Select(names, tableName, restriction) {
        var _this = _super.call(this, InstType.SELECT) || this;
        _this.names = names;
        _this.tableName = tableName;
        _this.restriction = restriction;
        return _this;
    }
    return Select;
}(Instruction));
exports.Select = Select;
var Delete = /** @class */ (function (_super) {
    __extends(Delete, _super);
    function Delete(tableName, restriction) {
        var _this = _super.call(this, InstType.DELETE) || this;
        _this.tableName = tableName;
        _this.restriction = restriction;
        return _this;
    }
    return Delete;
}(Instruction));
exports.Delete = Delete;
var DropTable = /** @class */ (function (_super) {
    __extends(DropTable, _super);
    function DropTable(tableName) {
        var _this = _super.call(this, InstType.DROP_TABLE) || this;
        _this.tableName = tableName;
        return _this;
    }
    return DropTable;
}(Instruction));
exports.DropTable = DropTable;
var DropIndex = /** @class */ (function (_super) {
    __extends(DropIndex, _super);
    function DropIndex(tableName, indexName) {
        var _this = _super.call(this, InstType.DROP_INDEX) || this;
        _this.tableName = tableName;
        _this.indexName = indexName;
        return _this;
    }
    return DropIndex;
}(Instruction));
exports.DropIndex = DropIndex;
var Insert = /** @class */ (function (_super) {
    __extends(Insert, _super);
    function Insert(tableName, values) {
        var _this = _super.call(this, InstType.INSERT) || this;
        _this.tableName = tableName;
        _this.values = values;
        return _this;
    }
    return Insert;
}(Instruction));
exports.Insert = Insert;
function select() {
}
exports.select = select;
//# sourceMappingURL=instruction.js.map