"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const datasyncManager = __importStar(require("data-sync-manager"));
let obj = {
    _content_type_uid: "test",
    uid: "dd",
    locale: "us",
    action: "44"
};
datasyncManager.push(obj);
