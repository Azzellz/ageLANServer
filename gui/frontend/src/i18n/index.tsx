import {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
} from "react";
import { en, TranslationKey } from "./en";
import { zhCN } from "./zh-CN";
import { ja } from "./ja";

type Locale = "en" | "zh-CN" | "ja";

type TranslationParams = Record<string, string | number | boolean | null | undefined>;

interface I18nContextValue {
    locale: Locale;
    setLocale: (next: Locale) => void;
    t: (key: TranslationKey, params?: TranslationParams) => string;
}

const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
    en,
    "zh-CN": zhCN,
    ja,
};

export const supportedLocales: readonly Locale[] = ["en", "zh-CN", "ja"];

const localeStorageKey = "agelan.gui.locale";

const isLocale = (value: string | null): value is Locale => {
    if (value === null) {
        return false;
    }
    return supportedLocales.includes(value as Locale);
};

const detectLocale = (): Locale => {
    if (typeof window === "undefined") {
        return "en";
    }

    const stored = window.localStorage.getItem(localeStorageKey);
    if (isLocale(stored)) {
        return stored;
    }

    const browserLocale = window.navigator.language.toLowerCase();
    if (browserLocale.startsWith("zh")) {
        return "zh-CN";
    }
    if (browserLocale.startsWith("ja")) {
        return "ja";
    }
    return "en";
};

let globalLocale: Locale = detectLocale();

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
    locale: globalLocale,
    setLocale: () => undefined,
    t: (key, params) => translate(key, params),
});

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>(globalLocale);

    const value = useMemo<I18nContextValue>(
        () => ({
            locale,
            setLocale: (next) => {
                globalLocale = next;
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(localeStorageKey, next);
                }
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
