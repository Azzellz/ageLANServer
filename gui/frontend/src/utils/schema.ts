import { SchemaKey } from "@/types/schema";
import serverExecuteFormJson from "@/form-engine/schemas/server.json";
import launcherExecuteFormJson from "@/form-engine/schemas/launcher.json";
import battleServerManagerStartFormJson from "@/form-engine/schemas/battle-server-manager.json";
import { FormSchema } from "@/types";

const schemaMap: Record<SchemaKey, FormSchema> = {
    server: serverExecuteFormJson as FormSchema,
    launcher: launcherExecuteFormJson as FormSchema,
    "battle-server-manager": battleServerManagerStartFormJson as FormSchema,
};

export const getSchemaJSON = (key: SchemaKey) => {
    return schemaMap[key];
};
