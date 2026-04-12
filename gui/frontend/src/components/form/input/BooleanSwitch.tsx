import { Button, FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import { useI18n } from "@/i18n";
import { DefaultableFieldProps } from "@/types";
import { FieldShell } from "./FieldShell";

interface BooleanSwitchProps extends DefaultableFieldProps<boolean> {
    trueText?: string;
    falseText?: string;
}

export function BooleanSwitch({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
    defaultValue,
    onResetDefault,
    trueText,
    falseText,
}: BooleanSwitchProps) {
    const { t } = useI18n();
    const onText = trueText ?? t("common.boolean.true");
    const offText = falseText ?? t("common.boolean.false");
    const canReset = Boolean(defaultValue !== undefined && onResetDefault);

    return (
        <FieldShell
            label={label}
            description={description}
            required={required}
            className={className}
            error={error}
            inlineActions={
                canReset ? (
                    <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        disabled={disabled}
                        onClick={onResetDefault}
                    >
                        {t("common.action.reset")}
                    </Button>
                ) : undefined
            }
        >
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "center" }}
            >
                <FormControlLabel
                    control={
                        <Switch
                            checked={value}
                            disabled={disabled}
                            onChange={(_event, checked) => onChange(checked)}
                        />
                    }
                    label={value ? onText : offText}
                />
                <Typography variant="caption" color="text.secondary">
                    {value
                        ? t("common.boolean.true")
                        : t("common.boolean.false")}
                </Typography>
            </Stack>
        </FieldShell>
    );
}
