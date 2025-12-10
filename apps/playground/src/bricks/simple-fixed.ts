import { BrickBuilder } from "@content-workers/core/builders";

const SimpleFixedBrick = new BrickBuilder("simple-fixed").addText("heading", {
	config: {
		useTranslations: false,
	},
});

export default SimpleFixedBrick;
