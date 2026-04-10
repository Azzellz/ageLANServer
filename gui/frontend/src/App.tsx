import { CommandFormEngine } from "./components";
import {
    CommandFormSchema,
    CommandFormSubmitPayload,
    StartupFieldCatalog,
} from "./form-engine";
import startupFieldCatalogJson from "./form-engine/data/startupFieldCatalog.json";
import serverExecuteFormJson from "./form-engine/schemas/server.execute.form.json";
import { Execute } from "../wailsjs/go/gui/App";

function App() {
    const startupFieldCatalog = startupFieldCatalogJson as StartupFieldCatalog;
    const formSchema = serverExecuteFormJson as CommandFormSchema;

    const handleSubmit = async (payload: CommandFormSubmitPayload) => {
        await Execute(payload.flags);
    };

    return (
        <div id="app">
            <div id="app-form">
                <CommandFormEngine
                    schema={formSchema}
                    catalog={startupFieldCatalog}
                    onSubmit={async (payload) => {
                        try {
                            await handleSubmit(payload);
                        } catch (error) {
                            throw error;
                        }
                    }}
                />
            </div>
        </div>
    );
}

export default App;
