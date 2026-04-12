import { useEffect, useState } from "react";
import { FormEngine, LanguageSwitcher, TerminalPanel } from "./components";
import { FormSchema, StartupFieldCatalog } from "./types";
import startupFieldCatalogJson from "./form-engine/data/startup_field_catalog.json";
import { GetSchema } from "../wailsjs/go/app/App";
import { SchemaKey } from "./types/schema";
import { getSchemaJSON } from "./utils";

function App() {
    const startupFieldCatalog = startupFieldCatalogJson as StartupFieldCatalog;
    const [schema, setSchema] = useState<FormSchema>();
    const [terminalExpanded, setTerminalExpanded] = useState(false);

    useEffect(() => {
        GetSchema().then((key: string) => {
            setSchema(getSchemaJSON(key as SchemaKey));
        });
    }, []);

    if (!schema) return <div></div>;

    return (
        <div id="app">
            <FormEngine
                schema={schema!}
                catalog={startupFieldCatalog}
                headerActions={<LanguageSwitcher />}
                onBeforeExecute={() => {
                    setTerminalExpanded(true);
                }}
            />
            <TerminalPanel expanded={terminalExpanded} />
        </div>
    );
}

export default App;
