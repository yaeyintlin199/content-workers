import type { OnUpdate } from "@content-workers/core/types";

const formatOnUpdate = (value: OnUpdate | undefined): OnUpdate => {
	return (value?.toLowerCase() as OnUpdate | undefined) ?? "no action";
};

export default formatOnUpdate;
