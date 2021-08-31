"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs = require("dayjs");
// Check if date in the past
function isStale(dateString, minutesAgo = 30) {
    let now = dayjs();
    let date = dayjs(dateString);
    let diff = now.diff(date, "minute");
    return diff > minutesAgo;
}
exports.default = isStale;
