import { useEffect, useMemo } from "react";
import { Alert, Box, Paper, Stack, Typography } from "@mui/material";
import { buildCobraFlags } from "@/form-engine";
import { useI18n } from "@/i18n";
import { startupFieldComponentRegistry } from "../input";
import { CollapsibleSection } from "./CollapsibleSection";
import {
    GameId,
    ResolvedFormField,
    ResolvedFormSchema,
    SelectOption,
} from "@/types";

export interface CommandFlagsFormProps {
    schema: ResolvedFormSchema;
    values: Record<string, unknown>;
    fieldErrors?: Record<string, string>;
    disabled?: boolean;
    hiddenFieldIds?: ReadonlySet<string>;
    onValueChange: (fieldId: string, next: unknown) => void;
    onFlagsChange?: (flags: string[]) => void;
}

const quoteToken = (token: string): string => {
    if (/[\s"]/u.test(token)) {
        return JSON.stringify(token);
    }
    return token;
};

const buildComponentProps = (
    field: ResolvedFormField,
): Record<string, unknown> => {
    const props: Record<string, unknown> = {
        ...field.componentProps,
    };

    if (field.valueTypeId === "enum_single") {
        const options: SelectOption<string>[] = (field.allowedValues ?? []).map(
            (value) => {
                const normalized = String(value);
                return {
                    value: normalized,
                    label: normalized,
                };
            },
        );
        props.options = options;
    }

    if (
        field.valueTypeId === "game_single" ||
        field.valueTypeId === "game_multi"
    ) {
        props.allowedGames = (field.allowedValues ?? []) as GameId[];
    }

    return props;
};

export function CommandFlagsForm({
    schema,
    values,
    fieldErrors,
    disabled = false,
    hiddenFieldIds,
    onValueChange,
    onFlagsChange,
}: CommandFlagsFormProps) {
    const { t } = useI18n();

    const flags = useMemo(
        () => buildCobraFlags(schema, values),
        [schema, values],
    );

    useEffect(() => {
        onFlagsChange?.(flags);
    }, [flags, onFlagsChange]);

    const previewValue =
        flags.length > 0
            ? flags.map((token) => quoteToken(token)).join(" ")
            : t("engine.preview.empty");

    return (
        <Stack spacing={2}>
            <Stack spacing={2}>
                {schema.sections.map((section) => {
                    const visibleFields = section.fields.filter(
                        (field) => !hiddenFieldIds?.has(field.id),
                    );

                    if (visibleFields.length === 0) {
                        return null;
                    }

                    return (
                        <CollapsibleSection
                            key={section.id}
                            sectionId={`section-${section.id}`}
                            title={section.title}
                            description={section.description}
                        >
                            <Box
                                sx={{
                                    display: "grid",
                                    gap: 1.5,
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        md: `repeat(${Math.max(
                                            section.columns,
                                            1,
                                        )}, minmax(0, 1fr))`,
                                    },
                                }}
                            >
                                {visibleFields.map((field) => {
                                    const Component = (
                                        startupFieldComponentRegistry as any
                                    )[field.valueTypeId];
                                    if (!Component) {
                                        return (
                                            <Paper
                                                key={field.id}
                                                variant="outlined"
                                                sx={{ p: 2 }}
                                            >
                                                <Alert severity="error">
                                                    {t(
                                                        "engine.field.unsupported",
                                                        {
                                                            valueTypeId:
                                                                field.valueTypeId,
                                                        },
                                                    )}
                                                </Alert>
                                            </Paper>
                                        );
                                    }

                                    const value =
                                        values[field.id] ?? field.defaultValue;
                                    return (
                                        <Component
                                            key={field.id}
                                            label={field.label}
                                            description={field.description}
                                            required={field.required}
                                            disabled={disabled}
                                            error={fieldErrors?.[field.id]}
                                            value={value}
                                            onChange={(next: unknown) =>
                                                onValueChange(field.id, next)
                                            }
                                            {...buildComponentProps(field)}
                                        />
                                    );
                                })}
                            </Box>
                        </CollapsibleSection>
                    );
                })}
            </Stack>

            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        {schema.previewLabel ?? t("engine.preview.title")}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            m: 0,
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                            fontFamily:
                                '"Space Mono", "Consolas", "Courier New", monospace',
                        }}
                    >
                        {previewValue}
                    </Typography>
                </Stack>
            </Paper>
        </Stack>
    );
}
