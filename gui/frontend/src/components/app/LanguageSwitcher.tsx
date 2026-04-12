import { MouseEvent, useMemo, useState } from "react";
import {
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    SvgIcon,
    Tooltip,
    Typography,
} from "@mui/material";
import { Locale, TranslationKey, useI18n } from "@/i18n";

interface LocaleOption {
    value: Locale;
    labelKey: TranslationKey;
    shortLabel: string;
}

const localeOptions: readonly LocaleOption[] = [
    { value: "en", labelKey: "locale.en", shortLabel: "EN" },
    { value: "zh-CN", labelKey: "locale.zh-CN", shortLabel: "中" },
    { value: "ja", labelKey: "locale.ja", shortLabel: "日" },
];

function LanguageIcon() {
    return (
        <SvgIcon fontSize="small">
            <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm6.92 6h-2.95a15.5 15.5 0 0 0-1.38-3.56A8.02 8.02 0 0 1 18.92 8ZM12 4.04c.83 1.2 1.48 2.52 1.95 3.96h-3.9A13.54 13.54 0 0 1 12 4.04ZM4.26 14A8.04 8.04 0 0 1 4 12c0-.69.09-1.36.26-2h3.35a16.5 16.5 0 0 0 0 4H4.26Zm.82 2h2.95c.34 1.25.81 2.44 1.38 3.56A8.02 8.02 0 0 1 5.08 16ZM8.03 8H5.08a8.02 8.02 0 0 1 4.33-3.56A15.5 15.5 0 0 0 8.03 8Zm3.97 11.96A13.56 13.56 0 0 1 10.05 16h3.9A13.56 13.56 0 0 1 12 19.96ZM14.39 14H9.61a14.37 14.37 0 0 1 0-4h4.78a14.37 14.37 0 0 1 0 4Zm.2 5.56c.57-1.12 1.04-2.31 1.38-3.56h2.95a8.02 8.02 0 0 1-4.33 3.56ZM16.39 14a16.5 16.5 0 0 0 0-4h3.35c.17.64.26 1.31.26 2 0 .69-.09 1.36-.26 2h-3.35Z" />
        </SvgIcon>
    );
}

export function LanguageSwitcher() {
    const { t, locale, setLocale } = useI18n();
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    const menuOpen = Boolean(menuAnchor);

    const currentLocaleName = useMemo(() => {
        const option = localeOptions.find((item) => item.value === locale);
        if (!option) {
            return t("locale.en");
        }
        return t(option.labelKey);
    }, [locale, t]);

    const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
        setMenuAnchor(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
    };

    const handleLocaleChange = (nextLocale: Locale) => {
        setLocale(nextLocale);
        setMenuAnchor(null);
    };

    return (
        <>
            <Tooltip
                title={t("locale.current", {
                    locale: currentLocaleName,
                })}
            >
                <IconButton
                    id="app-language-button"
                    size="small"
                    color="primary"
                    aria-label={t("locale.switch")}
                    aria-controls={menuOpen ? "locale-menu" : undefined}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen ? "true" : undefined}
                    onClick={handleOpenMenu}
                >
                    <LanguageIcon />
                </IconButton>
            </Tooltip>
            <Menu
                id="locale-menu"
                anchorEl={menuAnchor}
                open={menuOpen}
                onClose={handleCloseMenu}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                {localeOptions.map((option) => (
                    <MenuItem
                        key={option.value}
                        selected={locale === option.value}
                        onClick={() => handleLocaleChange(option.value)}
                    >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                            <Typography variant="caption" fontWeight={700}>
                                {option.shortLabel}
                            </Typography>
                        </ListItemIcon>
                        <Typography variant="body2">{t(option.labelKey)}</Typography>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
