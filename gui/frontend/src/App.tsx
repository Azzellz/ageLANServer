import { useState } from "react";
import { FormEngine, TerminalPanel } from "./components";
import { CommandFormSchema, StartupFieldCatalog } from "./types";
import startupFieldCatalogJson from "./form-engine/data/startupFieldCatalog.json";
import serverExecuteFormJson from "./form-engine/schemas/server.execute.form.json";

function App() {
    const startupFieldCatalog = startupFieldCatalogJson as StartupFieldCatalog;
    const formSchema = serverExecuteFormJson as CommandFormSchema;
    const [terminalExpanded, setTerminalExpanded] = useState(false);

    return (
        <div id="app">
            <div id="app-form">
                <FormEngine
                    schema={formSchema}
                    catalog={startupFieldCatalog}
                    onBeforeExecute={() => {
                        setTerminalExpanded(true);
                    }}
                />
            </div>
            <TerminalPanel expanded={terminalExpanded} />
        </div>
    );
}

export default App;
