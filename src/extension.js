"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.activate = void 0;
var vscode = require("vscode");
var tokenTypes = new Map();
var tokenModifiers = new Map();
var legend = (function () {
    var tokenTypesLegend = [
        'block-height', 'burn-block-height', 'contract-caller', 'false', 'is-in-regtest', 'none', 'stx-liquid-supply',
        'true', 'tx-sender' //, 'class', 'interface', 'enum', 'typeParameter', 'function',
        //'method', 'macro', 'variable', 'parameter', 'property', 'label'
    ];
    tokenTypesLegend.forEach(function (tokenType, index) { return tokenTypes.set(tokenType, index); });
    var tokenModifiersLegend = [
    //'declaration', 'documentation', 'readonly', 'static', 'abstract', 'deprecated',
    //'modification', 'async'
    ];
    tokenModifiersLegend.forEach(function (tokenModifier, index) { return tokenModifiers.set(tokenModifier, index); });
    return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();
function activate(context) {
    context.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider({ language: 'clarity' }, new DocumentSemanticTokensProvider(), legend));
}
exports.activate = activate;
var DocumentSemanticTokensProvider = /** @class */ (function () {
    function DocumentSemanticTokensProvider() {
    }
    DocumentSemanticTokensProvider.prototype.provideDocumentSemanticTokens = function (document, token) {
        return __awaiter(this, void 0, void 0, function () {
            var allTokens, builder;
            var _this = this;
            return __generator(this, function (_a) {
                allTokens = this._parseText(document.getText());
                builder = new vscode.SemanticTokensBuilder();
                allTokens.forEach(function (token) {
                    builder.push(token.line, token.startCharacter, token.length, _this._encodeTokenType(token.tokenType), _this._encodeTokenModifiers(token.tokenModifiers));
                });
                return [2 /*return*/, builder.build()];
            });
        });
    };
    DocumentSemanticTokensProvider.prototype._encodeTokenType = function (tokenType) {
        if (tokenTypes.has(tokenType)) {
            return tokenTypes.get(tokenType);
        }
        else if (tokenType === 'notInLegend') {
            return tokenTypes.size + 2;
        }
        return 0;
    };
    DocumentSemanticTokensProvider.prototype._encodeTokenModifiers = function (strTokenModifiers) {
        var result = 0;
        for (var i = 0; i < strTokenModifiers.length; i++) {
            var tokenModifier = strTokenModifiers[i];
            if (tokenModifiers.has(tokenModifier)) {
                result = result | (1 << tokenModifiers.get(tokenModifier));
            }
            else if (tokenModifier === 'notInLegend') {
                result = result | (1 << tokenModifiers.size + 2);
            }
        }
        return result;
    };
    DocumentSemanticTokensProvider.prototype._parseText = function (text) {
        var r = [];
        var lines = text.split(/\r\n|\r|\n/);
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var currentOffset = 0;
            do {
                var openOffset = line.indexOf('[', currentOffset);
                if (openOffset === -1) {
                    break;
                }
                var closeOffset = line.indexOf(']', openOffset);
                if (closeOffset === -1) {
                    break;
                }
                var tokenData = this._parseTextToken(line.substring(openOffset + 1, closeOffset));
                r.push({
                    line: i,
                    startCharacter: openOffset + 1,
                    length: closeOffset - openOffset - 1,
                    tokenType: tokenData.tokenType,
                    tokenModifiers: tokenData.tokenModifiers
                });
                currentOffset = closeOffset;
            } while (true);
        }
        return r;
    };
    DocumentSemanticTokensProvider.prototype._parseTextToken = function (text) {
        var parts = text.split('.');
        return {
            tokenType: parts[0],
            tokenModifiers: parts.slice(1)
        };
    };
    return DocumentSemanticTokensProvider;
}());
