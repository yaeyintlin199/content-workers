import { type Component, createSignal, Show, ErrorBoundary, onMount, onCleanup } from "solid-js";
import type { JSX } from "solid-js";
import { loadPluginStyles, unloadPluginStyles } from "../utils/plugin-manifest";
import { pluginStoreActions } from "../store/pluginStore";

interface PluginBoundaryProps {
    pluginKey: string;
    children: JSX.Element;
}

/**
 * PluginBoundary handles loading/unloading plugin styles and error boundaries
 */
const PluginBoundary: Component<PluginBoundaryProps> = (props) => {
    const [hasError, setHasError] = createSignal(false);
    const [errorMessage, setErrorMessage] = createSignal("");

    // Load plugin styles when component mounts
    onMount(() => {
        if (!hasError()) {
            loadPluginStyles(props.pluginKey);
        }
    });

    // Cleanup plugin styles when component unmounts
    onCleanup(() => {
        if (!hasError()) {
            unloadPluginStyles(props.pluginKey);
        }
    });

    const handleError = (error: Error) => {
        setHasError(true);
        setErrorMessage(error.message);
        pluginStoreActions.setError(`Plugin ${props.pluginKey} error: ${error.message}`);
        
        // Cleanup styles on error
        unloadPluginStyles(props.pluginKey);
    };

    return (
        <ErrorBoundary
            fallback={(error) => {
                handleError(error);
                return (
                    <div class="p-6 bg-red-50 border border-red-200 rounded-lg">
                        <h3 class="text-lg font-semibold text-red-800 mb-2">
                            Plugin Error
                        </h3>
                        <p class="text-red-600 mb-4">
                            Failed to load plugin "{props.pluginKey}":
                        </p>
                        <p class="text-red-700 font-mono text-sm bg-red-100 p-2 rounded">
                            {errorMessage()}
                        </p>
                        <button
                            type="button"
                            class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            onClick={() => {
                                setHasError(false);
                                setErrorMessage("");
                                pluginStoreActions.clearError();
                            }}
                        >
                            Retry
                        </button>
                    </div>
                );
            }}
        >
            <Show when={!hasError()} fallback={<div>Plugin error occurred</div>}>
                {props.children}
            </Show>
        </ErrorBoundary>
    );
};

export default PluginBoundary;