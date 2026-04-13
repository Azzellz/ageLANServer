import { TranslationKey, TranslationParams } from "@/i18n";
import {
    BattleServerItem,
    GAME_IDS,
    ResolvedFormField,
    ResolvedFormSchema,
} from "@/types";
import {
    collectDuplicateIndexes,
    isPossibleIPv6,
    isValidHostOrIPv4,
    isValidIPv4,
    isValidIPv4Multicast,
    validatePort,
    validatePortOrAuto,
    validateUUID,
} from "@/utils/validators";

type Translate = (
    key: TranslationKey,
    params?: TranslationParams,
) => string;

export type FormFieldErrors = Record<string, string>;

export interface BattleServerValidation {
    region?: string;
    name?: string;
    host?: string;
    executablePath?: string;
    bsPort?: string;
    webSocketPort?: string;
    outOfBandPort?: string;
    certFile?: string;
    keyFile?: string;
    duplicate?: string;
}

const BATTLE_SERVER_ERROR_KEYS: ReadonlyArray<keyof BattleServerValidation> = [
    "region",
    "name",
    "host",
    "executablePath",
    "bsPort",
    "webSocketPort",
    "outOfBandPort",
    "certFile",
    "keyFile",
    "duplicate",
];

const normalizeKey = (input: string): string => input.trim().toLowerCase();

const toStringValue = (value: unknown): string => {
    if (typeof value === "string") {
        return value;
    }
    if (value === null || value === undefined) {
        return "";
    }
    return String(value);
};

const toNumberValue = (value: unknown): number => {
    if (typeof value === "number") {
        return value;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
};

const numberProp = (
    props: Record<string, unknown>,
    key: string,
): number | undefined => {
    const value = props[key];
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return undefined;
};

const stringProp = (
    props: Record<string, unknown>,
    key: string,
): string | undefined => {
    const value = props[key];
    if (typeof value === "string" && value.length > 0) {
        return value;
    }
    return undefined;
};

const normalizeBattleServerItem = (value: unknown): BattleServerItem | null => {
    if (!value || typeof value !== "object") {
        return null;
    }
    const item = value as Record<string, unknown>;
    const ports = item.ports as Record<string, unknown> | undefined;
    const ssl = item.ssl as Record<string, unknown> | undefined;

    const executableExtraArgs = Array.isArray(item.executableExtraArgs)
        ? item.executableExtraArgs.map((token) => toStringValue(token))
        : [];

    return {
        region: toStringValue(item.region),
        name: toStringValue(item.name),
        host: toStringValue(item.host),
        executablePath: toStringValue(item.executablePath),
        executableExtraArgs,
        ports: {
            bs: Math.trunc(toNumberValue(ports?.bs)),
            webSocket: Math.trunc(toNumberValue(ports?.webSocket)),
            outOfBand: Math.trunc(toNumberValue(ports?.outOfBand)),
        },
        ssl: {
            auto: Boolean(ssl?.auto),
            certFile: toStringValue(ssl?.certFile),
            keyFile: toStringValue(ssl?.keyFile),
        },
    };
};

const requiredMessageForField = (
    field: ResolvedFormField,
    t: Translate,
): string => {
    switch (field.valueTypeId) {
        case "path_file":
            return t("validation.filePath.required");
        case "path_dir":
            return t("validation.directoryPath.required");
        case "uuid":
            return t("validation.uuid.required");
        case "host_or_ipv4":
        case "array_host_or_ipv4":
            return t("validation.host.required");
        case "ipv4_multicast":
        case "array_ipv4_multicast":
            return t("validation.multicast.required");
        case "array_ports":
            return t("validation.portList.required");
        case "array_string_tokens":
            return t("validation.token.required");
        case "game_multi":
            return t("validation.game.selectOne");
        case "array_object_battle_servers":
            return t("validation.battleServer.requiredOne");
        default:
            return t("validation.field.required");
    }
};

const validateEnumLikeValue = (
    value: unknown,
    allowedValues: Array<string | number> | undefined,
    t: Translate,
): string | null => {
    const input = toStringValue(value).trim();
    if (!input || !allowedValues?.length) {
        return null;
    }

    const allowedSet = new Set(allowedValues.map((option) => String(option)));
    if (!allowedSet.has(input)) {
        return t("validation.option.invalid", { value: input });
    }
    return null;
};

const validateGameSingleValue = (
    value: unknown,
    allowedValues: Array<string | number> | undefined,
    t: Translate,
): string | null => {
    const input = toStringValue(value).trim();
    if (!input) {
        return null;
    }

    const allowedGameIds = (allowedValues?.length
        ? allowedValues.map((item) => String(item))
        : GAME_IDS) as string[];
    if (!allowedGameIds.includes(input)) {
        return t("validation.option.invalid", { value: input });
    }
    return null;
};

const validateGameMultiValue = (
    value: unknown,
    allowedValues: Array<string | number> | undefined,
    t: Translate,
): string | null => {
    if (!Array.isArray(value)) {
        return t("validation.format.invalid");
    }

    const allowedGameIds = new Set(
        (allowedValues?.length
            ? allowedValues.map((item) => String(item))
            : GAME_IDS) as string[],
    );

    for (const item of value) {
        const gameId = toStringValue(item).trim();
        if (!gameId || !allowedGameIds.has(gameId)) {
            return t("validation.option.invalid", { value: gameId || String(item) });
        }
    }
    return null;
};

const validateStringPlain = (
    field: ResolvedFormField,
    value: unknown,
    t: Translate,
): string | null => {
    const input = toStringValue(value);
    const trimmed = input.trim();

    if (field.required && !trimmed) {
        return t("validation.field.required");
    }

    const minLength = numberProp(field.componentProps, "minLength");
    if (
        minLength !== undefined &&
        input.length > 0 &&
        input.length < minLength
    ) {
        return t("validation.length.min", { min: minLength });
    }

    const maxLength = numberProp(field.componentProps, "maxLength");
    if (maxLength !== undefined && input.length > maxLength) {
        return t("validation.length.max", { max: maxLength });
    }

    return null;
};

const validateStringOrAuto = (
    field: ResolvedFormField,
    value: unknown,
    t: Translate,
): string | null => {
    const input = toStringValue(value);
    const trimmed = input.trim();
    const autoValue = stringProp(field.componentProps, "autoValue") ?? "auto";

    if (field.required && !trimmed) {
        return t("validation.field.required");
    }
    if (!trimmed) {
        return t("validation.stringOrAuto.required", { autoValue });
    }
    if (trimmed === autoValue) {
        return null;
    }
    return null;
};

const validatePathOrAuto = (
    field: ResolvedFormField,
    value: unknown,
    t: Translate,
): string | null => {
    const input = toStringValue(value);
    const trimmed = input.trim();
    const autoValue = stringProp(field.componentProps, "autoValue") ?? "auto";

    if (field.required && !trimmed) {
        return t("validation.field.required");
    }
    if (!trimmed) {
        return t("validation.pathOrAuto.required", { autoValue });
    }
    if (trimmed === autoValue) {
        return null;
    }
    return null;
};

const validatePortNumber = (
    field: ResolvedFormField,
    value: unknown,
    t: Translate,
): string | null => {
    const normalized = Math.trunc(toNumberValue(value));
    const portError = validatePort(normalized);
    if (portError) {
        return portError;
    }

    const min = numberProp(field.componentProps, "min") ?? 1;
    const max = numberProp(field.componentProps, "max") ?? 65535;
    if (normalized < min || normalized > max) {
        return t("validation.port.rangeCustom", { min, max });
    }
    return null;
};

const validateArrayPorts = (
    field: ResolvedFormField,
    value: unknown,
    t: Translate,
): string | null => {
    if (!Array.isArray(value)) {
        return t("validation.format.invalid");
    }
    if (field.required && value.length === 0) {
        return t("validation.portList.required");
    }

    const duplicateIndexes = collectDuplicateIndexes(value, (port) =>
        String(port),
    );
    for (let index = 0; index < value.length; index += 1) {
        const port = Math.trunc(toNumberValue(value[index]));
        const itemError = validatePort(port);
        if (itemError) {
            return itemError;
        }
        if (duplicateIndexes.has(index)) {
            return t("validation.port.duplicate");
        }
    }
    return null;
};

const validateArrayIPv4Multicast = (
    field: ResolvedFormField,
    value: unknown,
    t: Translate,
): string | null => {
    if (!Array.isArray(value)) {
        return t("validation.format.invalid");
    }
    if (field.required && value.length === 0) {
        return t("validation.multicast.required");
    }

    const duplicateIndexes = collectDuplicateIndexes(value, (item) =>
        toStringValue(item).trim().toLowerCase(),
    );

    for (let index = 0; index < value.length; index += 1) {
        const item = toStringValue(value[index]).trim();
        if (!item || !isValidIPv4Multicast(item)) {
            return t("validation.multicast.invalid");
        }
        if (duplicateIndexes.has(index)) {
            return t("validation.address.duplicate");
        }
    }

    return null;
};

const validateArrayHostOrIPv4 = (
    field: ResolvedFormField,
    value: unknown,
    t: Translate,
): string | null => {
    if (!Array.isArray(value)) {
        return t("validation.format.invalid");
    }
    if (field.required && value.length === 0) {
        return t("validation.host.required");
    }

    const duplicateIndexes = collectDuplicateIndexes(value, (item) =>
        toStringValue(item).trim().toLowerCase(),
    );

    for (let index = 0; index < value.length; index += 1) {
        const item = toStringValue(value[index]).trim();
        if (!item) {
            return t("validation.host.required");
        }
        if (isPossibleIPv6(item)) {
            return t("validation.ipv6.notSupported");
        }
        if (!isValidHostOrIPv4(item)) {
            return t("validation.host.invalid");
        }
        if (duplicateIndexes.has(index)) {
            return t("validation.address.duplicate");
        }
    }

    return null;
};

export const validateBattleServerItem = (
    item: BattleServerItem,
    allItems: BattleServerItem[],
    t: Translate,
): BattleServerValidation => {
    const errors: BattleServerValidation = {};

    if (!item.region.trim()) {
        errors.region = t("validation.battleServer.regionRequired");
    }
    if (!item.name.trim()) {
        errors.name = t("validation.battleServer.nameRequired");
    }

    const host = item.host.trim();
    if (!host) {
        errors.host = t("validation.battleServer.hostRequired");
    } else if (host !== "auto") {
        if (isPossibleIPv6(host)) {
            errors.host = t("validation.battleServer.hostOnlyIPv4OrHostname");
        } else if (!isValidHostOrIPv4(host)) {
            errors.host = t("validation.battleServer.hostInvalid");
        }
    }

    if (!item.executablePath.trim()) {
        errors.executablePath = t(
            "validation.battleServer.executablePathRequired",
        );
    }

    errors.bsPort = validatePortOrAuto(item.ports.bs) ?? undefined;
    errors.webSocketPort = validatePortOrAuto(item.ports.webSocket) ?? undefined;
    errors.outOfBandPort = validatePortOrAuto(item.ports.outOfBand) ?? undefined;

    if (!item.ssl.auto && !item.ssl.certFile.trim()) {
        errors.certFile = t("validation.battleServer.certRequired");
    }
    if (!item.ssl.auto && !item.ssl.keyFile.trim()) {
        errors.keyFile = t("validation.battleServer.keyRequired");
    }

    const rowKey = `${normalizeKey(item.region)}::${normalizeKey(item.name)}`;
    const duplicateCount = allItems.filter(
        (row) => `${normalizeKey(row.region)}::${normalizeKey(row.name)}` === rowKey,
    ).length;
    if (item.region.trim() && item.name.trim() && duplicateCount > 1) {
        errors.duplicate = t("validation.battleServer.duplicate");
    }

    return errors;
};

export const getBattleServerValidationMessage = (
    validation: BattleServerValidation,
): string | null => {
    for (const key of BATTLE_SERVER_ERROR_KEYS) {
        const message = validation[key];
        if (message) {
            return message;
        }
    }
    return null;
};

const validateArrayBattleServers = (
    field: ResolvedFormField,
    value: unknown,
    t: Translate,
): string | null => {
    if (!Array.isArray(value)) {
        return t("validation.format.invalid");
    }
    if (field.required && value.length === 0) {
        return t("validation.battleServer.requiredOne");
    }

    const maxItems = numberProp(field.componentProps, "maxItems");
    if (maxItems !== undefined && value.length > maxItems) {
        return t("validation.battleServer.maxItems", { maxItems });
    }

    const normalizedItems: BattleServerItem[] = [];
    for (const item of value) {
        const normalized = normalizeBattleServerItem(item);
        if (!normalized) {
            return t("validation.format.invalid");
        }
        normalizedItems.push(normalized);
    }

    for (const item of normalizedItems) {
        const itemValidation = validateBattleServerItem(item, normalizedItems, t);
        const message = getBattleServerValidationMessage(itemValidation);
        if (message) {
            return message;
        }
    }

    return null;
};

export const validateResolvedFieldValue = (
    field: ResolvedFormField,
    value: unknown,
    t: Translate,
): string | null => {
    switch (field.valueTypeId) {
        case "boolean":
            return null;
        case "enum_single": {
            const input = toStringValue(value).trim();
            if (field.required && !input) {
                return requiredMessageForField(field, t);
            }
            return validateEnumLikeValue(value, field.allowedValues, t);
        }
        case "string_plain":
            return validateStringPlain(field, value, t);
        case "string_or_auto":
            return validateStringOrAuto(field, value, t);
        case "path_file": {
            const input = toStringValue(value).trim();
            if (field.required && !input) {
                return t("validation.filePath.required");
            }
            return null;
        }
        case "path_dir": {
            const input = toStringValue(value).trim();
            if (field.required && !input) {
                return t("validation.directoryPath.required");
            }
            return null;
        }
        case "path_or_auto":
            return validatePathOrAuto(field, value, t);
        case "uuid": {
            const input = toStringValue(value).trim();
            if (!input && !field.required) {
                return null;
            }
            return validateUUID(input);
        }
        case "host_or_ipv4": {
            const input = toStringValue(value).trim();
            if (field.required && !input) {
                return t("validation.host.required");
            }
            if (!input) {
                return null;
            }
            if (isPossibleIPv6(input)) {
                return t("validation.host.onlyIPv4OrHostname");
            }
            if (!isValidHostOrIPv4(input)) {
                return t("validation.host.invalid");
            }
            return null;
        }
        case "ipv4_multicast": {
            const input = toStringValue(value).trim();
            if (field.required && !input) {
                return t("validation.multicast.required");
            }
            if (!input) {
                return null;
            }
            if (!isValidIPv4(input)) {
                return t("validation.ipv4.invalid");
            }
            if (!isValidIPv4Multicast(input)) {
                return t("validation.multicast.range");
            }
            return null;
        }
        case "port_number":
            return validatePortNumber(field, value, t);
        case "port_number_or_zero_auto": {
            const normalized = Math.trunc(toNumberValue(value));
            return validatePortOrAuto(normalized);
        }
        case "array_string_tokens": {
            if (!Array.isArray(value)) {
                return t("validation.format.invalid");
            }
            if (field.required && value.length === 0) {
                return t("validation.token.required");
            }
            if (value.some((token) => !toStringValue(token).trim())) {
                return t("validation.format.invalid");
            }
            return null;
        }
        case "array_ports":
            return validateArrayPorts(field, value, t);
        case "array_ipv4_multicast":
            return validateArrayIPv4Multicast(field, value, t);
        case "array_host_or_ipv4":
            return validateArrayHostOrIPv4(field, value, t);
        case "game_single": {
            const input = toStringValue(value).trim();
            if (field.required && !input) {
                return requiredMessageForField(field, t);
            }
            return validateGameSingleValue(value, field.allowedValues, t);
        }
        case "game_multi": {
            if (!Array.isArray(value)) {
                return t("validation.format.invalid");
            }
            if (field.required && value.length === 0) {
                return t("validation.game.selectOne");
            }
            return validateGameMultiValue(value, field.allowedValues, t);
        }
        case "array_object_battle_servers":
            return validateArrayBattleServers(field, value, t);
        default:
            return null;
    }
};

export const validateResolvedFormValues = (
    schema: ResolvedFormSchema,
    values: Record<string, unknown>,
    options: {
        t: Translate;
        ignoreFieldIds?: ReadonlySet<string>;
    },
): FormFieldErrors => {
    const errors: FormFieldErrors = {};
    schema.sections.forEach((section) => {
        section.fields.forEach((field) => {
            if (options.ignoreFieldIds?.has(field.id)) {
                return;
            }
            const value =
                values[field.id] !== undefined
                    ? values[field.id]
                    : field.defaultValue;
            const error = validateResolvedFieldValue(field, value, options.t);
            if (error) {
                errors[field.id] = error;
            }
        });
    });
    return errors;
};
