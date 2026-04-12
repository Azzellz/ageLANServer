import {
    FormSchema,
    FormFieldSerializeMode,
    ResolvedFormField,
    ResolvedFormSchema,
    ResolvedFormFieldSerialization,
    StartupFieldCatalog,
    StartupFieldCatalogField,
    StartupValueTypeId,
} from "@/types";

const cloneValue = <T>(value: T): T => {
    if (value === null || value === undefined) {
        return value;
    }
    return JSON.parse(JSON.stringify(value)) as T;
};

const inferFlagFromFieldKey = (fieldKey: string): string | undefined => {
    const match = fieldKey.match(/\.cli\.(--[a-zA-Z0-9-]+)$/);
    return match?.[1];
};

const inferLabelFromFieldKey = (fieldKey: string): string => {
    const raw = fieldKey.split(".").slice(-1)[0] ?? fieldKey;
    const withoutPrefix = raw.startsWith("--") ? raw.slice(2) : raw;
    return withoutPrefix
        .replace(/[-_]/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const inferModeFromType = (
    valueTypeId: StartupValueTypeId,
): FormFieldSerializeMode => {
    if (valueTypeId === "boolean") {
        return "auto";
    }
    if (valueTypeId.startsWith("array_") || valueTypeId === "game_multi") {
        return "repeat";
    }
    return "single";
};

const fallbackValueByType = (valueTypeId: StartupValueTypeId): unknown => {
    switch (valueTypeId) {
        case "boolean":
            return false;
        case "port_number":
        case "port_number_or_zero_auto":
            return 0;
        case "array_string_tokens":
        case "array_ports":
        case "array_ipv4_multicast":
        case "array_host_or_ipv4":
        case "game_multi":
        case "array_object_battle_servers":
            return [];
        default:
            return "";
    }
};

const normalizeValueByType = (
    value: unknown,
    valueTypeId: StartupValueTypeId,
): unknown => {
    if (value === null || value === undefined) {
        return fallbackValueByType(valueTypeId);
    }

    switch (valueTypeId) {
        case "boolean":
            return Boolean(value);
        case "port_number":
        case "port_number_or_zero_auto":
            return typeof value === "number" ? value : Number(value) || 0;
        case "array_string_tokens":
        case "array_ports":
        case "array_ipv4_multicast":
        case "array_host_or_ipv4":
        case "game_multi":
        case "array_object_battle_servers":
            return Array.isArray(value) ? value : [];
        default:
            return String(value);
    }
};

const resolveSerialization = (
    fieldKey: string,
    valueTypeId: StartupValueTypeId,
    catalogField?: StartupFieldCatalogField,
    schemaSerialization?:
        | ResolvedFormFieldSerialization
        | {
              enabled?: boolean;
              flag?: string;
              mode?: FormFieldSerializeMode;
              emitWhen?: "always" | "changed" | "non_default" | "non_empty";
              includeIfFalse?: boolean;
          },
): ResolvedFormFieldSerialization => {
    const flag =
        schemaSerialization?.flag ??
        catalogField?.cli_flags?.[0] ??
        inferFlagFromFieldKey(fieldKey);

    return {
        enabled: schemaSerialization?.enabled ?? Boolean(flag),
        flag,
        mode: schemaSerialization?.mode ?? inferModeFromType(valueTypeId),
        emitWhen: schemaSerialization?.emitWhen ?? "non_default",
        includeIfFalse: schemaSerialization?.includeIfFalse ?? false,
    };
};

export const resolveCommandFormSchema = (
    schema: FormSchema,
    catalog: StartupFieldCatalog,
): ResolvedFormSchema => {
    const catalogMap = new Map<string, StartupFieldCatalogField>(
        catalog.fields.map((field) => [field.field_key, field]),
    );

    const sections = schema.sections.map((section) => {
        const fields = section.fields.map<ResolvedFormField>((field) => {
            const catalogField = catalogMap.get(field.fieldKey);
            const valueTypeId =
                field.valueTypeId ?? catalogField?.value_type_id;

            if (!valueTypeId) {
                throw new Error(
                    `Cannot resolve valueTypeId for field "${field.fieldKey}".`,
                );
            }

            const rawDefault =
                field.defaultValue !== undefined
                    ? cloneValue(field.defaultValue)
                    : cloneValue(catalogField?.default);
            const defaultValue = normalizeValueByType(rawDefault, valueTypeId);

            const serialization = resolveSerialization(
                field.fieldKey,
                valueTypeId,
                catalogField,
                field.serialization,
            );

            return {
                id: field.id ?? field.fieldKey,
                fieldKey: field.fieldKey,
                label: field.label ?? inferLabelFromFieldKey(field.fieldKey),
                description: field.description ?? catalogField?.description,
                required: Boolean(field.required),
                valueTypeId,
                defaultValue,
                allowedValues:
                    field.allowedValues ?? catalogField?.allowed_values,
                componentProps: field.componentProps ?? {},
                serialization,
                catalogField,
            };
        });

        return {
            id: section.id,
            title: section.title,
            description: section.description,
            columns: section.columns ?? 2,
            fields,
        };
    });

    return {
        schemaVersion: schema.schemaVersion,
        formId: schema.formId,
        title: schema.title,
        description: schema.description,
        commandPath: schema.commandPath ?? [],
        submitLabel: schema.submitLabel,
        previewLabel: schema.previewLabel,
        sections,
    };
};

export const parseCommandFormJson = (jsonText: string): FormSchema => {
    const parsed = JSON.parse(jsonText) as FormSchema;
    if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid command form JSON payload.");
    }
    if (!Array.isArray(parsed.sections)) {
        throw new Error(
            "Invalid command form JSON payload: sections is required.",
        );
    }
    return parsed;
};

export const buildInitialValues = (
    schema: ResolvedFormSchema,
): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    schema.sections.forEach((section) => {
        section.fields.forEach((field) => {
            result[field.id] = cloneValue(field.defaultValue);
        });
    });
    return result;
};
