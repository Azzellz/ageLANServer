import { translate } from "../i18n";

export type ValidationError = string | null;

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const HOSTNAME_LABEL_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

export const isValidIPv4 = (value: string): boolean => {
    const input = value.trim();
    const segments = input.split(".");
    if (segments.length !== 4) {
        return false;
    }

    return segments.every((segment) => {
        if (!/^\d+$/.test(segment)) {
            return false;
        }
        if (segment.length > 1 && segment.startsWith("0")) {
            return false;
        }
        const number = Number(segment);
        return Number.isInteger(number) && number >= 0 && number <= 255;
    });
};

export const isPossibleIPv6 = (value: string): boolean => {
    return value.includes(":");
};

export const isValidHostname = (value: string): boolean => {
    const input = value.trim();
    if (!input || input.length > 253) {
        return false;
    }

    const normalized = input.endsWith(".") ? input.slice(0, -1) : input;
    const labels = normalized.split(".");
    if (labels.length === 0) {
        return false;
    }

    return labels.every((label) => HOSTNAME_LABEL_REGEX.test(label));
};

export const isValidHostOrIPv4 = (value: string): boolean => {
    const input = value.trim();
    if (!input || isPossibleIPv6(input)) {
        return false;
    }
    return isValidIPv4(input) || isValidHostname(input);
};

export const isValidIPv4Multicast = (value: string): boolean => {
    if (!isValidIPv4(value)) {
        return false;
    }

    const firstOctet = Number(value.trim().split(".")[0]);
    return firstOctet >= 224 && firstOctet <= 239;
};

export const validateUUID = (value: string): ValidationError => {
    const input = value.trim();
    if (!input) {
        return translate("validation.uuid.required");
    }
    if (!UUID_REGEX.test(input)) {
        return translate("validation.uuid.invalid");
    }
    return null;
};

export const validatePort = (value: number): ValidationError => {
    if (!Number.isInteger(value) || value < 1 || value > 65535) {
        return translate("validation.port.range");
    }
    return null;
};

export const validatePortOrAuto = (value: number): ValidationError => {
    if (!Number.isInteger(value) || value < 0 || value > 65535) {
        return translate("validation.portOrAuto.range");
    }
    return null;
};

export const parseCommandTokens = (
    command: string,
): { tokens: string[]; error: ValidationError } => {
    const tokens: string[] = [];
    let quote: "'" | '"' | null = null;
    let escaping = false;
    let current = "";

    for (let i = 0; i < command.length; i += 1) {
        const char = command[i];

        if (escaping) {
            current += char;
            escaping = false;
            continue;
        }

        if (char === "\\") {
            escaping = true;
            continue;
        }

        if ((char === "'" || char === '"') && !quote) {
            quote = char;
            continue;
        }

        if (quote && char === quote) {
            quote = null;
            continue;
        }

        if (/\s/.test(char) && !quote) {
            if (current) {
                tokens.push(current);
                current = "";
            }
            continue;
        }

        current += char;
    }

    if (escaping) {
        current += "\\";
    }

    if (quote) {
        return { tokens: [], error: translate("validation.token.unclosedQuote") };
    }

    if (current) {
        tokens.push(current);
    }

    return { tokens, error: null };
};

export const collectDuplicateIndexes = <T>(
    values: T[],
    normalizer: (value: T) => string,
): Set<number> => {
    const dictionary = new Map<string, number[]>();
    values.forEach((item, index) => {
        const key = normalizer(item);
        const bucket = dictionary.get(key) ?? [];
        bucket.push(index);
        dictionary.set(key, bucket);
    });

    const duplicateIndexes = new Set<number>();
    dictionary.forEach((indexes) => {
        if (indexes.length < 2) {
            return;
        }
        indexes.forEach((index) => duplicateIndexes.add(index));
    });
    return duplicateIndexes;
};
