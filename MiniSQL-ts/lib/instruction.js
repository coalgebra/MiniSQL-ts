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
var CreateTable = /** @class */ (function (_super) {
    __extends(CreateTable, _super);
    function CreateTable(tableName, indices, types) {
        var _this = _super.call(this, InstType.CREATE_TABLE) || this;
        _this.tableName = tableName;
        _this.indices = indices;
        _this.types = types;
        return _this;
    }
    return CreateTable;
}(Instruction));
exports.CreateTable = CreateTable;
var Select = /** @class */ (function (_super) {
    __extends(Select, _super);
    function Select() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Select;
}(Instruction));
exports.Select = Select;
function select() {
}
exports.select = select;
//# sourceMappingURL=instruction.js.map