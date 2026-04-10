import { FormEngine } from "./components";
import { CommandFormSchema, StartupFieldCatalog } from "./types";
import startupFieldCatalogJson from "./form-engine/data/startupFieldCatalog.json";
import serverExecuteFormJson from "./form-engine/schemas/server.execute.form.json";

function App() {
    const startupFieldCatalog = startupFieldCatalogJson as StartupFieldCatalog;
    const formSchema = serverExecuteFormJson as CommandFormSchema;

    return (
        <div id="app">
            <div id="app-form">
                <FormEngine schema={formSchema} catalog={startupFieldCatalog} />
            </div>
        </div>
    );
}

export default App;
