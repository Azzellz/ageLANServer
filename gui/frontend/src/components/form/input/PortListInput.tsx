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
import { collectDuplicateIndexes, validatePort } from "@/utils/validators";

interface PortListInputProps extends PrimitiveFieldProps<number[]> {}

export function PortListInput({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
}: PortListInputProps) {
    const { t } = useI18n();
    const [draft, setDraft] = useState("");
    const [draftError, setDraftError] = useState<string | null>(null);

    const duplicateIndexes = useMemo(
        () => collectDuplicateIndexes(value, (port) => String(port)),
        [value],
    );

    const requiredError =
        required && value.length === 0
            ? t("validation.portList.required")
            : null;
    const localError = draftError ?? requiredError;

    const addPort = () => {
        const next = Number(draft);
        if (!Number.isInteger(next)) {
            setDraftError(t("validation.port.integer"));
            return;
        }
        const validationError = validatePort(next);
        if (validationError) {
            setDraftError(validationError);
            return;
        }
        onChange([...value, next]);
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
                    type="number"
                    value={draft}
                    inputProps={{ min: 1, max: 65535 }}
                    disabled={disabled}
                    placeholder={t("placeholder.portInput")}
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
                    onClick={addPort}
                >
                    {t("common.action.add")}
                </Button>
            </Stack>

            <Stack spacing={1}>
                {value.map((port, index) => {
                    const itemError =
                        validatePort(port) ??
                        (duplicateIndexes.has(index)
                            ? t("validation.port.duplicate")
                            : null);
                    return (
                        <Paper
                            key={`${port}-${index}`}
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
                                <Typography variant="body2">{port}</Typography>
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
