import { defineConfig } from "@content-workers/core";
import { nodeAdapter } from "@content-workers/node-adapter";
import { postgresAdapter } from "@content-workers/postgres-adapter";
import { nodemailerPlugin } from "@content-workers/plugin-nodemailer";
import { redisPlugin } from "@content-workers/plugin-redis";
import { s3Plugin } from "@content-workers/plugin-s3";
import { pagesPlugin } from "@content-workers/plugin-pages";
import { testPlugin } from "./plugins/test-plugin.js";

export default defineConfig({
	adapter: nodeAdapter(),
	db: postgresAdapter({
		connectionString: process.env.DATABASE_URL!,
	}),
	email: {
		adapter: nodemailerPlugin({
			host: process.env.EMAIL_HOST!,
			port: Number(process.env.EMAIL_PORT || 587),
			secure: false,
			auth: {
				user: process.env.EMAIL_USER!,
				pass: process.env.EMAIL_PASS!,
			},
		}),
		from: {
			name: "Lucid CMS",
			email: "noreply@example.com",
		},
	},
	kv: redisPlugin({
		url: process.env.REDIS_URL!,
	}),
	media: s3Plugin({
		region: process.env.AWS_REGION!,
		bucket: process.env.AWS_BUCKET!,
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	}),
	collections: [
		{
			key: "pages",
			name: {
				en: "Pages",
			},
			singularName: {
				en: "Page",
			},
			mode: "pageBuilder",
			config: {
				useRevisions: true,
				useTranslations: true,
				environments: [
					{
						key: "latest",
						name: {
							en: "Latest",
						},
					},
				],
			},
		},
	],
	plugins: [
		pagesPlugin({
			collections: [
				{
					collectionKey: "pages",
					useTranslations: true,
				},
			],
		}),
		testPlugin({
			name: "Test Admin Plugin",
			description: "A test plugin to demonstrate the admin plugin runtime system",
		}),
	],
});