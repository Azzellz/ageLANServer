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

export interface FormConfigFileSchema {
    pathFieldKey: string;
    required?: boolean;
    autoDiscover?: boolean;
}

export interface FormFieldSchema {
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

export interface FormSectionSchema {
    id: string;
    title: string;
    description?: string;
    columns?: number;
    fields: FormFieldSchema[];
}

export interface FormSchema {
    schemaVersion: string;
    formId: string;
    title: string;
    description?: string;
    commandPath?: string[];
    configFiles?: FormConfigFileSchema[];
    submitLabel?: string;
    previewLabel?: string;
    sections: FormSectionSchema[];
}

export interface ResolvedFormFieldSerialization {
    enabled: boolean;
    flag?: string;
    mode: FormFieldSerializeMode;
    emitWhen: FormFieldEmitWhen;
    includeIfFalse: boolean;
}

export interface ResolvedFormField {
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

export interface ResolvedFormSection {
    id: string;
    title: string;
    description?: string;
    columns: number;
    fields: ResolvedFormField[];
}

export interface ResolvedFormSchema {
    schemaVersion: string;
    formId: string;
    title: string;
    description?: string;
    commandPath: string[];
    submitLabel?: string;
    previewLabel?: string;
    sections: ResolvedFormSection[];
}

export interface FormSubmitPayload {
    flags: string[];
    values: Record<string, unknown>;
}
