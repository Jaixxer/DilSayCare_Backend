"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knex = require("knex"); // eslint-disable-next-line @typescript-eslint/no-var-requires
const knexConfig = require("../knexfile");
const db = knex(knexConfig.development);
exports.default = db;
