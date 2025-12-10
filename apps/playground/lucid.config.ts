import { z } from "@content-workers/core";
import {
	passthroughQueueAdapter,
	workerQueueAdapter,
} from "@content-workers/core/queue-adapter";
import { fileSystemMediaAdapter } from "@content-workers/core/media-adapter";
import { passthroughEmailAdapter } from "@content-workers/core/email-adapter";
import { passthroughImageProcessor } from "@content-workers/core/image-processor";
import Database from "better-sqlite3";
import { describeRoute } from "hono-openapi";
import transporter from "./src/services/email-transporter.js";
// Adapters
import { defineConfig, nodeAdapter } from "@content-workers/node-adapter";
// import { cloudflareAdapter, defineConfig } from "@content-workers/cloudflare-adapter";
// Plugins
import LibSQLAdapter from "@content-workers/libsql-adapter";
import NodemailerPlugin from "@content-workers/plugin-nodemailer";
import PagesPlugin from "@content-workers/plugin-pages";
import ResendPlugin from "@content-workers/plugin-resend";
import PostgresAdapter from "@content-workers/postgres-adapter";
import SQLiteAdapter from "@content-workers/sqlite-adapter";
// import CloudflareQueuesPlugin from "@content-workers/plugin-cloudflare-queues";
// import RedisPlugin from "@content-workers/plugin-redis";
// import CloudflareKVPlugin from "@content-workers/plugin-cloudflare-kv";
import GitHubAuth from "@content-workers/auth-github";
import GoogleAuth from "@content-workers/auth-google";
import MicrosoftAuth from "@content-workers/auth-microsoft";
// Collections
import PageCollection from "./src/collections/pages.js";
import SettingsCollection from "./src/collections/settings.js";
import SimpleCollection from "./src/collections/simple.js";
import TestCollection from "./src/collections/test.js";
import BlogCollection from "./src/collections/blogs.js";
import MainMenuCollection from "./src/collections/main-menu.js";

export const adapter = nodeAdapter();
// export const adapter = cloudflareAdapter();

export const envSchema = z.object({
	DATABASE_URL: z.string(),
	LUCID_ENCRYPTION_KEY: z.string(),
	LUCID_COOKIE_SECRET: z.string(),
	LUCID_REFRESH_TOKEN_SECRET: z.string(),
	LUCID_ACCESS_TOKEN_SECRET: z.string(),
	LUCID_LOCAL_STORAGE_SECRET_KEY: z.string(),
	LUCID_RESEND_API_KEY: z.string().optional(),
	LUCID_RESEND_WEBHOOK_SECRET: z.string().optional(),
	GITHUB_CLIENT_ID: z.string().optional(),
	GITHUB_CLIENT_SECRET: z.string().optional(),
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),
	MICROSOFT_CLIENT_ID: z.string().optional(),
	MICROSOFT_CLIENT_SECRET: z.string().optional(),
	MICROSOFT_TENANT_ID: z.string().optional(),
	// REDIS_CONNECTION: z.string(),
});

export default defineConfig((env) => ({
	host: "http://localhost:6543",
	// host: "https://lucidcms-86.localcan.dev",
	// host: "https://cms.lucidjs.build",
	// cors: {
	// 	origin: [],
	// },
	logger: {
		level: "silent",
	},
	db: new SQLiteAdapter({
		database: async () => new Database("db.sqlite"),
	}),
	// db: new PostgresAdapter(env?.DATABASE_URL as string, {
	// 	max: 5,
	// }),
	// db: new LibSQLAdapter({
	// url: "http://127.0.0.1:8081", //"libsql://lucid-willyallop.turso.io",
	// url: "libsql://lucid-cloudflare-willyallop.aws-eu-west-1.turso.io",
	// authToken: env?.TURSO_AUTH_TOKEN as string,
	// }),
	auth: {
		password: {
			enabled: true,
		},
	},
	keys: {
		encryptionKey: env.LUCID_ENCRYPTION_KEY,
		cookieSecret: env.LUCID_COOKIE_SECRET,
		refreshTokenSecret: env.LUCID_REFRESH_TOKEN_SECRET,
		accessTokenSecret: env.LUCID_ACCESS_TOKEN_SECRET,
	},
	localization: {
		locales: [
			{
				label: "English",
				code: "en",
			},
			{
				label: "French",
				code: "fr",
			},
		],
		defaultLocale: "en",
	},
	disableOpenAPI: false,
	media: {
		// adapter: fileSystemMediaAdapter({
		// 	uploadDir: "uploads",
		// 	secretKey: env.LUCID_LOCAL_STORAGE_SECRET_KEY,
		// }),
		maxFileSize: 200 * 1024 * 1024, // 200MB
		processedImageLimit: 10,
		storeProcessedImages: true,
		onDemandFormats: true,
		fallbackImage: "https://placehold.co/600x400",
		// imageProcessor: passthroughImageProcessor,
		// urlStrategy: (media) => {
		// 	return `https://media.protodigital.co.uk/${media.key}`;
		// },
	},
	// email: {
	// 	adapter: passthroughEmailAdapter,
	// },
	queue: {
		// adapter: passthroughQueueAdapter,
		// adapter: passthroughQueueAdapter({
		// 	bypassImmediateExecution: false,
		// }),
		// adapter: workerQueueAdapter(),
		// adapter: workerQueueAdapter({
		// 	concurrentLimit: 10,
		// 	batchSize: 3,
		// }),
	},
	// hooks: [
	// 	{
	// 		service: "documents",
	// 		event: "beforeUpsert",
	// 		handler: async (context, data) => {
	// 			console.log("collection doc hook", data.meta.collectionKey);
	// 		},
	// 	},
	// ],
	collections: [
		PageCollection,
		BlogCollection,
		MainMenuCollection,
		SettingsCollection,
		TestCollection,
		SimpleCollection,
	],
	plugins: [
		...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
			? [
					GitHubAuth({
						clientId: env.GITHUB_CLIENT_ID,
						clientSecret: env.GITHUB_CLIENT_SECRET,
					}),
				]
			: []),
		...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
			? [
					GoogleAuth({
						clientId: env.GOOGLE_CLIENT_ID,
						clientSecret: env.GOOGLE_CLIENT_SECRET,
					}),
				]
			: []),
		...(env.MICROSOFT_CLIENT_ID &&
		env.MICROSOFT_CLIENT_SECRET &&
		env.MICROSOFT_TENANT_ID
			? [
					MicrosoftAuth({
						clientId: env.MICROSOFT_CLIENT_ID,
						clientSecret: env.MICROSOFT_CLIENT_SECRET,
						tenant: env.MICROSOFT_TENANT_ID,
					}),
				]
			: []),
		PagesPlugin({
			collections: [
				{
					collectionKey: "page",
					useTranslations: true,
					displayFullSlug: true,
				},
				{
					collectionKey: "test",
					useTranslations: true,
					displayFullSlug: true,
				},
			],
		}),
		// RedisPlugin({
		// 	connection: env.REDIS_CONNECTION,
		// }),
		// NodemailerPlugin({
		// 	transporter: transporter,
		// }),
		// ResendPlugin({
		// 	apiKey: env.LUCID_RESEND_API_KEY,
		// 	webhook: {
		// 		enabled: true,
		// 		secret: env.LUCID_RESEND_WEBHOOK_SECRET,
		// 	},
		// }),
		// S3Plugin({
		// 	endpoint: `https://${env?.LUCID_CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		// 	bucket: "headless-cms",
		// 	clientOptions: {
		// 		region: "auto",
		// 		accessKeyId: env?.LUCID_S3_ACCESS_KEY as string,
		// 		secretAccessKey: env?.LUCID_S3_SECRET_KEY as string,
		// 	},
		// }),
	],
	// compilerOptions: {
	// 	paths: {
	// 		outDir: "out",
	// 	},
	// },
}));
