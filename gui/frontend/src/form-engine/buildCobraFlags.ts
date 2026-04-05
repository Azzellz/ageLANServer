import {
    FormFieldEmitWhen,
    ResolvedCommandFormField,
    ResolvedCommandFormSchema,
} from "./types";

const isEmptyValue = (value: unknown): boolean => {
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === "string") {
        return value.trim().length === 0;
    }
    if (Array.isArray(value)) {
        return value.length === 0;
    }
    return false;
};

const isDeepEqual = (left: unknown, right: unknown): boolean => {
    return JSON.stringify(left) === JSON.stringify(right);
};

const shouldEmitByPolicy = (
    emitWhen: FormFieldEmitWhen,
    value: unknown,
    defaultValue: unknown,
): boolean => {
    switch (emitWhen) {
        case "always":
            return true;
        case "non_empty":
            return !isEmptyValue(value);
        case "changed":
        case "non_default":
        default:
            return !isDeepEqual(value, defaultValue);
    }
};

const stringify = (value: unknown): string => {
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    return JSON.stringify(value);
};

const serializeSingleFlag = (
    flag: string,
    value: unknown,
): string[] => {
    if (isEmptyValue(value)) {
        return [];
    }
    return [flag, stringify(value)];
};

const serializeRepeatFlag = (
    flag: string,
    value: unknown,
): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }
    const args: string[] = [];
    value.forEach((item) => {
        if (isEmptyValue(item)) {
            return;
        }
        args.push(flag, stringify(item));
    });
    return args;
};

const serializeBooleanAuto = (
    flag: string,
    value: unknown,
    defaultValue: unknown,
    includeIfFalse: boolean,
): string[] => {
    const current = Boolean(value);
    const initial = Boolean(defaultValue);

    if (current) {
        return [flag];
    }

    if (initial || includeIfFalse) {
        return [`${flag}=false`];
    }

    return [];
};

const serializeField = (
    field: ResolvedCommandFormField,
    value: unknown,
): string[] => {
    const { serialization } = field;
    if (!serialization.enabled || !serialization.flag) {
        return [];
    }

    const shouldEmit = shouldEmitByPolicy(
        serialization.emitWhen,
        value,
        field.defaultValue,
    );
    if (!shouldEmit) {
        return [];
    }

    const flag = serialization.flag;
    switch (serialization.mode) {
        case "boolean_presence":
            return Boolean(value)
                ? [flag]
                : serialization.includeIfFalse
                  ? [`${flag}=false`]
                  : [];
        case "boolean_explicit":
            return [`${flag}=${Boolean(value)}`];
        case "repeat":
            return serializeRepeatFlag(flag, value);
        case "auto":
            if (field.valueTypeId === "boolean") {
                return serializeBooleanAuto(
                    flag,
                    value,
                    field.defaultValue,
                    serialization.includeIfFalse,
                );
            }
            if (
                field.valueTypeId.startsWith("array_") ||
                field.valueTypeId === "game_multi"
            ) {
                return serializeRepeatFlag(flag, value);
            }
            return serializeSingleFlag(flag, value);
        case "single":
        default:
            return serializeSingleFlag(flag, value);
    }
};

export const buildCobraFlags = (
    schema: ResolvedCommandFormSchema,
    values: Record<string, unknown>,
): string[] => {
    const args: string[] = [...schema.commandPath];

    schema.sections.forEach((section) => {
        section.fields.forEach((field) => {
            const value = values[field.id];
            args.push(...serializeField(field, value));
        });
    });

    return args;
};
