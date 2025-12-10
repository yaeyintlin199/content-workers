import SQLiteAdapter from "@content-workers/sqlite-adapter";
import { CollectionBuilder } from "@content-workers/core/builders";
import Database from "better-sqlite3";
import testingConstants from "../../../constants/testing-constants.js";
import { nodeAdapter, defineConfig } from "@content-workers/node-adapter";

export const adapter = nodeAdapter();

const collection = new CollectionBuilder("page", {
	mode: "multiple",
	details: {
		name: "Pages",
		singularName: "Page",
	},
})
	.addText("title")
	.addText("title");

export default defineConfig((env) => ({
	host: "http://localhost:6543",
	logger: {
		level: "silent",
	},
	db: new SQLiteAdapter({
		database: async () => new Database(":memory:"),
	}),
	keys: {
		encryptionKey: testingConstants.key,
		cookieSecret: testingConstants.key,
		refreshTokenSecret: testingConstants.key,
		accessTokenSecret: testingConstants.key,
	},
	collections: [collection],
	plugins: [],
}));
