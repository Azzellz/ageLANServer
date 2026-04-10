import { StartupValueTypeId } from "@/types";

export interface StartupFieldCatalogTypeMapping {
    value_type_id: StartupValueTypeId;
    base_type: string;
    component: string;
    component_description?: string;
}

export interface StartupFieldCatalogField {
    field_key: string;
    module: string;
    scope: string;
    value_type_id: StartupValueTypeId;
    default: unknown;
    allowed_values?: Array<string | number>;
    description?: string;
    cli_flags?: string[];
}

export interface StartupFieldCatalog {
    meta?: Record<string, unknown>;
    value_type_to_component: StartupFieldCatalogTypeMapping[];
    fields: StartupFieldCatalogField[];
}

export type FormFieldSerializeMode =
    | "auto"
    | "single"
    | "repeat"
    | "boolean_presence"
    | "boolean_explicit";

export type FormFieldEmitWhen =
    | "always"
    | "changed"
    | "non_default"
    | "non_empty";

export interface FormFieldSerializationSchema {
    enabled?: boolean;
    flag?: string;
    mode?: FormFieldSerializeMode;
    emitWhen?: FormFieldEmitWhen;
    includeIfFalse?: boolean;
}

export interface CommandFormFieldSchema {
    id?: string;
    fieldKey: string;
    label?: string;
    description?: string;
    required?: boolean;
    valueTypeId?: StartupValueTypeId;
    defaultValue?: unknown;
    allowedValues?: Array<string | number>;
    componentProps?: Record<string, unknown>;
    serialization?: FormFieldSerializationSchema;
}

export interface CommandFormSectionSchema {
    id: string;
    title: string;
    description?: string;
    columns?: number;
    fields: CommandFormFieldSchema[];
}

export interface CommandFormSchema {
    schemaVersion: string;
    formId: string;
    title: string;
    description?: string;
    commandPath?: string[];
    submitLabel?: string;
    previewLabel?: string;
    sections: CommandFormSectionSchema[];
}

export interface ResolvedFormFieldSerialization {
    enabled: boolean;
    flag?: string;
    mode: FormFieldSerializeMode;
    emitWhen: FormFieldEmitWhen;
    includeIfFalse: boolean;
}

export interface ResolvedCommandFormField {
    id: string;
    fieldKey: string;
    label: string;
    description?: string;
    required: boolean;
    valueTypeId: StartupValueTypeId;
    defaultValue: unknown;
    allowedValues?: Array<string | number>;
    componentProps: Record<string, unknown>;
    serialization: ResolvedFormFieldSerialization;
    catalogField?: StartupFieldCatalogField;
}

export interface ResolvedCommandFormSection {
    id: string;
    title: string;
    description?: string;
    columns: number;
    fields: ResolvedCommandFormField[];
}

export interface ResolvedCommandFormSchema {
    schemaVersion: string;
    formId: string;
    title: string;
    description?: string;
    commandPath: string[];
    submitLabel?: string;
    previewLabel?: string;
    sections: ResolvedCommandFormSection[];
}

export interface CommandFormSubmitPayload {
    flags: string[];
    values: Record<string, unknown>;
}
