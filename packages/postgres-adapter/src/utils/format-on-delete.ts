import type { OnDelete } from "@content-workers/core/types";

const formatOnDelete = (value: OnDelete | undefined): OnDelete => {
	return (value?.toLowerCase() as OnDelete | undefined) ?? "no action";
};

export default formatOnDelete;
