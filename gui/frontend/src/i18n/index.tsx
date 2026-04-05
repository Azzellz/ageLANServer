import {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
} from "react";
import { en, TranslationKey } from "./en";

type Locale = "en";

type TranslationParams = Record<string, string | number | boolean | null | undefined>;

interface I18nContextValue {
    locale: Locale;
    setLocale: (next: Locale) => void;
    t: (key: TranslationKey, params?: TranslationParams) => string;
}

const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
    en,
};

let globalLocale: Locale = "en";

const interpolate = (
    template: string,
    params?: TranslationParams,
): string => {
    if (!params) {
        return template;
    }

    return template.replace(/\{(\w+)\}/g, (_, key: string) => {
        const value = params[key];
        return value === undefined || value === null ? `{${key}}` : String(value);
    });
};

export const translate = (
    key: TranslationKey,
    params?: TranslationParams,
    locale: Locale = globalLocale,
): string => {
    const dictionary = dictionaries[locale];
    const template = dictionary[key] ?? key;
    return interpolate(template, params);
};

const I18nContext = createContext<I18nContextValue>({
    locale: "en",
    setLocale: () => undefined,
    t: (key, params) => translate(key, params),
});

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>("en");

    const value = useMemo<I18nContextValue>(
        () => ({
            locale,
            setLocale: (next) => {
                globalLocale = next;
                setLocale(next);
            },
            t: (key, params) => translate(key, params, locale),
        }),
        [locale],
    );

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    return useContext(I18nContext);
}

export type { Locale, TranslationKey, TranslationParams };
