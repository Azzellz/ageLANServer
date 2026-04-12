import { useMemo, useState } from "react";
import {
    Button,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useI18n } from "@/i18n";
import { PrimitiveFieldProps } from "@/types";
import { FieldShell } from "./FieldShell";
import {
    collectDuplicateIndexes,
    isPossibleIPv6,
    isValidHostOrIPv4,
} from "@/utils/validators";

interface HostOrIPv4ListInputProps extends PrimitiveFieldProps<string[]> {}

export function HostOrIPv4ListInput({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
}: HostOrIPv4ListInputProps) {
    const { t } = useI18n();
    const [draft, setDraft] = useState("");
    const [draftError, setDraftError] = useState<string | null>(null);

    const duplicateIndexes = useMemo(
        () =>
            collectDuplicateIndexes(value, (item) => item.trim().toLowerCase()),
        [value],
    );

    const requiredError =
        required && value.length === 0 ? t("validation.host.required") : null;
    const localError = draftError ?? requiredError;

    const addAddress = () => {
        const input = draft.trim();
        if (!input) {
            setDraftError(t("validation.host.required"));
            return;
        }
        if (isPossibleIPv6(input)) {
            setDraftError(t("validation.ipv6.notSupported"));
            return;
        }
        if (!isValidHostOrIPv4(input)) {
            setDraftError(t("validation.host.invalid"));
            return;
        }
        onChange([...value, input]);
        setDraft("");
        setDraftError(null);
    };

    return (
        <FieldShell
            label={label}
            description={description}
            required={required}
            className={className}
            error={error}
            localError={localError}
            inlineActions={
                <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    disabled={disabled || value.length === 0}
                    onClick={() => onChange([])}
                >
                    {t("common.action.clearAll")}
                </Button>
            }
        >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                    type="text"
                    value={draft}
                    disabled={disabled}
                    placeholder={t("placeholder.hostOrIPv4Input")}
                    onChange={(event) => {
                        setDraft(event.target.value);
                        setDraftError(null);
                    }}
                    fullWidth
                    size="small"
                />
                <Button
                    type="button"
                    variant="contained"
                    disabled={disabled || !draft.trim()}
                    onClick={addAddress}
                >
                    {t("common.action.add")}
                </Button>
            </Stack>

            <Stack spacing={1}>
                {value.map((address, index) => {
                    const itemError =
                        (isPossibleIPv6(address)
                            ? t("validation.ipv6.notSupported")
                            : isValidHostOrIPv4(address)
                              ? null
                              : t("validation.format.invalid")) ??
                        (duplicateIndexes.has(index)
                            ? t("validation.address.duplicate")
                            : null);
                    return (
                        <Paper
                            key={`${address}-${index}`}
                            variant="outlined"
                            sx={{ p: 1.25 }}
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                justifyContent="space-between"
                                flexWrap="wrap"
                            >
                                <Typography variant="body2">
                                    {address}
                                </Typography>
                                {itemError ? (
                                    <Typography
                                        variant="caption"
                                        color="error.main"
                                    >
                                        {itemError}
                                    </Typography>
                                ) : null}
                                <Button
                                    type="button"
                                    variant="text"
                                    size="small"
                                    color="error"
                                    disabled={disabled}
                                    onClick={() =>
                                        onChange(
                                            value.filter(
                                                (_item, itemIndex) =>
                                                    itemIndex !== index,
                                            ),
                                        )
                                    }
                                >
                                    {t("common.action.remove")}
                                </Button>
                            </Stack>
                        </Paper>
                    );
                })}
            </Stack>
        </FieldShell>
    );
}
