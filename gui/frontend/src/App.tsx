import { useMemo, useState } from "react";
import "./App.css";
import { CommandFormEngine } from "./components";
import {
    CommandFormSchema,
    CommandFormSubmitPayload,
    StartupFieldCatalog,
} from "./form-engine";
import startupFieldCatalogJson from "./form-engine/data/startupFieldCatalog.json";
import serverExecuteFormJson from "./form-engine/schemas/server.execute.form.json";
import { executeCobraFlags } from "./wailsBridge";

function App() {
    const [latestFlags, setLatestFlags] = useState<string[]>([]);
    const [executionMessage, setExecutionMessage] = useState("");
    const [executionError, setExecutionError] = useState("");

    const startupFieldCatalog = startupFieldCatalogJson as StartupFieldCatalog;
    const formSchema = serverExecuteFormJson as CommandFormSchema;

    const latestPreview = useMemo(
        () =>
            latestFlags.length > 0
                ? latestFlags.join(" ")
                : "(No command generated yet)",
        [latestFlags],
    );

    const handleSubmit = async (payload: CommandFormSubmitPayload) => {
        setExecutionError("");
        setExecutionMessage("Executing command...");
        await executeCobraFlags(payload.flags);
        setExecutionMessage("Execute finished successfully.");
    };

    return (
        <div id="app-shell">
            <div className="app-main">
                <CommandFormEngine
                    schema={formSchema}
                    catalog={startupFieldCatalog}
                    onSubmit={async (payload) => {
                        try {
                            await handleSubmit(payload);
                        } catch (error) {
                            const message =
                                error instanceof Error
                                    ? error.message
                                    : "Execute failed.";
                            setExecutionError(message);
                            setExecutionMessage("");
                            throw error;
                        }
                    }}
                    onFlagsChange={setLatestFlags}
                />
            </div>

            <div className="app-side">
                <div className="wired-field">
                    <div className="wired-label">Engine Output</div>
                    <div className="wired-helper">
                        Prepared cobra args count: {latestFlags.length}
                    </div>
                    <pre className="wired-previewCode">{latestPreview}</pre>
                </div>

                {executionMessage ? (
                    <div className="wired-field">
                        <div className="wired-label">Execution Status</div>
                        <div className="wired-helper">{executionMessage}</div>
                    </div>
                ) : null}

                {executionError ? (
                    <div className="wired-field">
                        <div className="wired-label">Execution Error</div>
                        <div className="wired-error">{executionError}</div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default App;
