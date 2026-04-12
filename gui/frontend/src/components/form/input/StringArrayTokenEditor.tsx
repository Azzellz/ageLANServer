import { KeyboardEvent, useState } from "react";
import { Button, Chip, Stack, TextField, Typography } from "@mui/material";
import { useI18n } from "@/i18n";
import { PrimitiveFieldProps } from "@/types";
import { FieldShell } from "./FieldShell";
import { parseCommandTokens } from "@/utils/validators";

interface StringArrayTokenEditorProps extends PrimitiveFieldProps<string[]> {
    inputPlaceholder?: string;
    allowDuplicates?: boolean;
}

export function StringArrayTokenEditor({
    label,
    description,
    required,
    disabled,
    className,
    error,
    value,
    onChange,
    inputPlaceholder,
    allowDuplicates = true,
}: StringArrayTokenEditorProps) {
    const { t } = useI18n();
    const [draft, setDraft] = useState("");
    const [draftError, setDraftError] = useState<string | null>(null);
    const placeholder = inputPlaceholder ?? t("placeholder.tokenInput");

    const requiredError =
        required && value.length === 0 ? t("validation.token.required") : null;
    const localError = draftError ?? requiredError;

    const addDraft = () => {
        const parsed = parseCommandTokens(draft);
        if (parsed.error) {
            setDraftError(parsed.error);
            return;
        }
        if (parsed.tokens.length === 0) {
            setDraftError(t("validation.token.enterAtLeastOne"));
            return;
        }

        const nextTokens = allowDuplicates
            ? parsed.tokens
            : parsed.tokens.filter((token) => !value.includes(token));

        if (nextTokens.length === 0) {
            setDraftError(t("validation.token.duplicateAll"));
            return;
        }

        onChange([...value, ...nextTokens]);
        setDraft("");
        setDraftError(null);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== "Enter") {
            return;
        }
        event.preventDefault();
        addDraft();
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
                    placeholder={placeholder}
                    onChange={(event) => {
                        setDraft(event.target.value);
                        setDraftError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    fullWidth
                    size="small"
                />
                <Button
                    type="button"
                    variant="contained"
                    disabled={disabled || !draft.trim()}
                    onClick={addDraft}
                >
                    {t("common.action.add")}
                </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary">
                {t("helper.token.executionOrder", { count: value.length })}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {value.map((token, index) => (
                    <Chip
                        key={`${token}-${index}`}
                        label={token}
                        onDelete={
                            disabled
                                ? undefined
                                : () =>
                                      onChange(
                                          value.filter(
                                              (_, itemIndex) =>
                                                  itemIndex !== index,
                                          ),
                                      )
                        }
                        variant="outlined"
                    />
                ))}
            </Stack>
        </FieldShell>
    );
}
