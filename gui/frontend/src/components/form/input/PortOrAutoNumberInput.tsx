import { ChangeEvent, useId } from "react";
import { Button, TextField, Typography } from "@mui/material";
import { useI18n } from "@/i18n";
import { PrimitiveFieldProps } from "@/types";
import { FieldShell } from "./FieldShell";
import { validatePortOrAuto } from "@/utils/validators";

interface PortOrAutoNumberInputProps extends PrimitiveFieldProps<number> {
    autoValue?: number;
}

export function PortOrAutoNumberInput({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
    autoValue = 0,
}: PortOrAutoNumberInputProps) {
    const { t } = useI18n();
    const inputId = useId();
    const normalized = Number.isFinite(value) ? value : autoValue;
    const localError = validatePortOrAuto(normalized);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        if (!raw.trim()) {
            onChange(autoValue);
            return;
        }
        const next = Number(raw);
        onChange(Number.isFinite(next) ? Math.trunc(next) : autoValue);
    };

    return (
        <FieldShell
            label={label}
            description={description}
            required={required}
            className={className}
            error={error}
            localError={localError}
            inputId={inputId}
            inlineActions={
                <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    disabled={disabled}
                    onClick={() => onChange(autoValue)}
                >
                    {t("common.action.auto")}
                </Button>
            }
        >
            <TextField
                id={inputId}
                type="number"
                value={normalized}
                inputProps={{ min: 0, max: 65535 }}
                disabled={disabled}
                onChange={handleChange}
                fullWidth
                size="small"
                error={Boolean(localError ?? error)}
            />
            <Typography variant="caption" color="text.secondary">
                {t("helper.portOrAuto")}
            </Typography>
        </FieldShell>
    );
}
