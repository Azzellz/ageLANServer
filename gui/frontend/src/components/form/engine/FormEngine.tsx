import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import {
    buildCobraFlags,
    buildInitialValues,
    resolveCommandFormSchema,
} from "@/form-engine";
import { useI18n } from "@/i18n";
import {
    ApplyConfigFileValues,
    Execute,
    FindConfigFile,
} from "@/../wailsjs/go/app/App";
import { CommandFlagsForm } from "./CommandFlagsForm";
import { ConfigFileForm } from "./ConfigFileForm";
import {
    FormConfigFileSchema,
    FormSchema,
    StartupFieldCatalog,
    ResolvedFormField,
} from "@/types";

export interface FormEngineProps {
    schema: FormSchema;
    catalog: StartupFieldCatalog;
    className?: string;
    disabled?: boolean;
    headerActions?: ReactNode;
    onFlagsChange?: (flags: string[]) => void;
    onBeforeExecute?: (flags: string[]) => void;
}

interface ConfigValueUpdate {
    keyPath: string;
    value: unknown;
}

interface ConfigFileBinding {
    pathFieldKey: string;
    field: ResolvedFormField | null;
    required: boolean;
    autoDiscover: boolean;
}

const resolveErrorMessage = (
    error: unknown,
    fallbackMessage: string,
): string => {
    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }
    return fallbackMessage;
};

const isConfigScopedField = (field: ResolvedFormField): boolean => {
    const scope = field.catalogField?.scope;
    if (scope) {
        return scope === "config" || scope === "config_only";
    }
    return !field.fieldKey.includes(".cli.");
};

const buildConfigKeyPath = (field: ResolvedFormField): string => {
    const modulePrefix = field.catalogField?.module?.trim();
    if (modulePrefix) {
        const fullPrefix = `${modulePrefix}.`;
        if (!field.fieldKey.startsWith(fullPrefix)) {
            return field.fieldKey;
        }
        return field.fieldKey.slice(fullPrefix.length);
    }

    const firstDotIndex = field.fieldKey.indexOf(".");
    if (firstDotIndex < 0 || firstDotIndex === field.fieldKey.length - 1) {
        return field.fieldKey;
    }
    return field.fieldKey.slice(firstDotIndex + 1);
};

const collectConfigUpdates = (
    values: Record<string, unknown>,
    touchedFieldIds: ReadonlySet<string>,
    fields: ResolvedFormField[],
): ConfigValueUpdate[] => {
    const updates: ConfigValueUpdate[] = [];
    fields.forEach((field) => {
        if (!touchedFieldIds.has(field.id)) {
            return;
        }

        const value =
            values[field.id] !== undefined
                ? values[field.id]
                : field.defaultValue;
        updates.push({
            keyPath: buildConfigKeyPath(field),
            value,
        });
    });
    return updates;
};

const isPathFileField = (
    field: ResolvedFormField | undefined,
): field is ResolvedFormField => {
    return Boolean(field) && field?.valueTypeId === "path_file";
};

const resolveConfigFileBindings = (
    schema: FormSchema,
    resolvedFields: ResolvedFormField[],
): ConfigFileBinding[] => {
    const fieldsByKey = new Map<string, ResolvedFormField>(
        resolvedFields.map((field) => [field.fieldKey, field]),
    );

    const declaredConfigFiles = schema.configFiles ?? [];
    if (declaredConfigFiles.length > 0) {
        return declaredConfigFiles.map((entry: FormConfigFileSchema) => {
            const candidate = fieldsByKey.get(entry.pathFieldKey);
            return {
                pathFieldKey: entry.pathFieldKey,
                field: isPathFileField(candidate) ? candidate : null,
                required: entry.required ?? true,
                autoDiscover: entry.autoDiscover ?? false,
            };
        });
    }

    const legacyPrimaryField = resolvedFields.find(
        (field) =>
            field.valueTypeId === "path_file" &&
            field.fieldKey.endsWith(".cli.--config"),
    );
    if (legacyPrimaryField) {
        return [
            {
                pathFieldKey: legacyPrimaryField.fieldKey,
                field: legacyPrimaryField,
                required: true,
                autoDiscover: true,
            },
        ];
    }

    const legacyFallbackField = resolvedFields.find(
        (field) =>
            field.valueTypeId === "path_file" &&
            field.fieldKey.endsWith(".cli.--gameConfig"),
    );
    if (legacyFallbackField) {
        return [
            {
                pathFieldKey: legacyFallbackField.fieldKey,
                field: legacyFallbackField,
                required: true,
                autoDiscover: true,
            },
        ];
    }

    return [];
};

export function FormEngine({
    schema,
    catalog,
    className,
    disabled = false,
    headerActions,
    onFlagsChange,
    onBeforeExecute,
}: FormEngineProps) {
    const { t } = useI18n();

    const resolvedSchema = useMemo(
        () => resolveCommandFormSchema(schema, catalog),
        [schema, catalog],
    );

    const resolvedFields = useMemo(
        () => resolvedSchema.sections.flatMap((section) => section.fields),
        [resolvedSchema],
    );

    const configFileBindings = useMemo(
        () => resolveConfigFileBindings(schema, resolvedFields),
        [schema, resolvedFields],
    );

    const missingConfigPathFieldKeys = useMemo(
        () =>
            configFileBindings
                .filter((binding) => !binding.field)
                .map((binding) => binding.pathFieldKey),
        [configFileBindings],
    );

    const configPathBindings = useMemo(
        () =>
            configFileBindings.filter(
                (
                    binding,
                ): binding is ConfigFileBinding & { field: ResolvedFormField } =>
                    Boolean(binding.field),
            ),
        [configFileBindings],
    );

    const configPathFieldIds = useMemo(
        () => new Set(configPathBindings.map((binding) => binding.field.id)),
        [configPathBindings],
    );

    const autoDiscoverConfigPathFieldIds = useMemo(
        () =>
            configPathBindings
                .filter((binding) => binding.autoDiscover)
                .map((binding) => binding.field.id),
        [configPathBindings],
    );

    const configScopedFields = useMemo(
        () =>
            resolvedFields.filter(
                (field) =>
                    isConfigScopedField(field) &&
                    !configPathFieldIds.has(field.id),
            ),
        [resolvedFields, configPathFieldIds],
    );

    const hiddenFieldIds = useMemo(() => {
        const hidden = new Set<string>();
        configPathBindings.forEach((binding) => {
            hidden.add(binding.field.id);
        });
        return hidden;
    }, [configPathBindings]);

    const [values, setValues] = useState<Record<string, unknown>>(() =>
        buildInitialValues(resolvedSchema),
    );
    const [touchedFieldIds, setTouchedFieldIds] = useState<Set<string>>(
        () => new Set(),
    );
    const [latestFlags, setLatestFlags] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [configPathErrors, setConfigPathErrors] = useState<
        Record<string, string>
    >({});
    const [findingConfigPath, setFindingConfigPath] = useState(false);
    const [findConfigPathError, setFindConfigPathError] = useState<
        string | null
    >(null);

    const configPathItems = useMemo(
        () =>
            configPathBindings.map((binding) => ({
                field: binding.field,
                value: String(values[binding.field.id] ?? ""),
                required: binding.required,
                error: configPathErrors[binding.field.id] ?? null,
            })),
        [configPathBindings, values, configPathErrors],
    );

    const defaultValues = useMemo(
        () => buildInitialValues(resolvedSchema),
        [resolvedSchema],
    );

    useEffect(() => {
        setValues(defaultValues);
        setTouchedFieldIds(new Set());
        setLatestFlags([]);
        setSubmitting(false);
        setSubmitError(null);
        setConfigPathErrors({});
        setFindConfigPathError(null);
    }, [defaultValues]);

    useEffect(() => {
        if (autoDiscoverConfigPathFieldIds.length === 0) {
            setFindingConfigPath(false);
            return;
        }

        let active = true;
        setFindingConfigPath(true);
        setFindConfigPathError(null);

        const findConfigPath = async () => {
            try {
                const foundPath = await FindConfigFile();
                if (!active) {
                    return;
                }
                const normalizedPath = foundPath.trim();
                if (!normalizedPath) {
                    return;
                }

                setValues((current) => {
                    let hasChanges = false;
                    const next = { ...current };
                    autoDiscoverConfigPathFieldIds.forEach((fieldId) => {
                        const currentValue = String(current[fieldId] ?? "").trim();
                        if (currentValue) {
                            return;
                        }
                        next[fieldId] = normalizedPath;
                        hasChanges = true;
                    });
                    if (!hasChanges) {
                        return current;
                    }
                    return next;
                });
            } catch (error) {
                if (!active) {
                    return;
                }
                setFindConfigPathError(
                    resolveErrorMessage(
                        error,
                        t("engine.config.lookupFailedUnknown"),
                    ),
                );
            } finally {
                if (active) {
                    setFindingConfigPath(false);
                }
            }
        };

        void findConfigPath();

        return () => {
            active = false;
        };
    }, [autoDiscoverConfigPathFieldIds, t]);

    const setFieldValue = (
        fieldId: string,
        next: unknown,
        markTouched: boolean,
    ) => {
        setValues((current) => ({
            ...current,
            [fieldId]: next,
        }));
        if (!markTouched) {
            return;
        }
        setTouchedFieldIds((current) => {
            const nextTouched = new Set(current);
            nextTouched.add(fieldId);
            return nextTouched;
        });
    };

    const runConfigFileForm = async (configPaths: string[]) => {
        const updates = collectConfigUpdates(
            values,
            touchedFieldIds,
            configScopedFields,
        );
        const uniqueConfigPaths = Array.from(
            new Set(
                configPaths
                    .map((path) => path.trim())
                    .filter((path) => path.length > 0),
            ),
        );
        for (const configPath of uniqueConfigPaths) {
            await ApplyConfigFileValues(configPath, updates);
        }
    };

    const runCommandLineFlagsForm = async (flags: string[]) => {
        await Execute(flags);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitError(null);
        setConfigPathErrors({});

        if (configFileBindings.length === 0) {
            setSubmitError(t("engine.config.pathFieldMissing"));
            return;
        }

        if (missingConfigPathFieldKeys.length > 0) {
            setSubmitError(
                t("engine.config.pathFieldMissingDeclared", {
                    fields: missingConfigPathFieldKeys.join(", "),
                }),
            );
            return;
        }

        if (configPathBindings.length === 0) {
            setSubmitError(t("engine.config.pathFieldMissing"));
            return;
        }

        const nextPathErrors: Record<string, string> = {};
        const configPaths: string[] = [];

        configPathBindings.forEach((binding) => {
            const configPath = String(values[binding.field.id] ?? "").trim();
            if (!configPath) {
                if (binding.required) {
                    nextPathErrors[binding.field.id] = t(
                        "engine.config.pathRequired",
                    );
                }
                return;
            }
            configPaths.push(configPath);
        });

        if (Object.keys(nextPathErrors).length > 0) {
            setConfigPathErrors(nextPathErrors);
            return;
        }

        setSubmitting(true);
        try {
            const fallbackFlags = buildCobraFlags(resolvedSchema, values);
            const executeFlags =
                latestFlags.length > 0 ? latestFlags : fallbackFlags;
            onBeforeExecute?.(executeFlags);
            await runConfigFileForm(configPaths);
            await runCommandLineFlagsForm(executeFlags);
        } catch (error) {
            setSubmitError(
                resolveErrorMessage(error, t("engine.submit.failed")),
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setValues(defaultValues);
        setTouchedFieldIds(new Set());
        setLatestFlags([]);
        setSubmitError(null);
        setConfigPathErrors({});
        setFindConfigPathError(null);
    };

    return (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Box
                component="form"
                className={className}
                onSubmit={handleSubmit}
                noValidate
            >
                <Stack spacing={2}>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "flex-start" }}
                        spacing={1.25}
                    >
                        <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="h6" fontWeight={700}>
                                {resolvedSchema.title}
                            </Typography>
                            {resolvedSchema.description ? (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {resolvedSchema.description}
                                </Typography>
                            ) : null}
                        </Stack>
                        {headerActions ? (
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="flex-end"
                                sx={{
                                    width: { xs: "100%", sm: "auto" },
                                }}
                            >
                                {headerActions}
                            </Stack>
                        ) : null}
                    </Stack>

                    <ConfigFileForm
                        pathItems={configPathItems}
                        missingPathFieldKeys={missingConfigPathFieldKeys}
                        disabled={disabled || submitting}
                        findingConfigPath={findingConfigPath}
                        findConfigPathError={findConfigPathError}
                        configFieldCount={configScopedFields.length}
                        onPathChange={(fieldId, next) => {
                            setConfigPathErrors((current) => {
                                if (!current[fieldId]) {
                                    return current;
                                }
                                const nextErrors = { ...current };
                                delete nextErrors[fieldId];
                                return nextErrors;
                            });
                            setFieldValue(fieldId, next, true);
                        }}
                    />

                    <CommandFlagsForm
                        schema={resolvedSchema}
                        values={values}
                        disabled={disabled || submitting}
                        hiddenFieldIds={hiddenFieldIds}
                        onValueChange={(fieldId, next) => {
                            setFieldValue(fieldId, next, true);
                        }}
                        onFlagsChange={(flags) => {
                            setLatestFlags(flags);
                            onFlagsChange?.(flags);
                        }}
                    />

                    <Divider />

                    <Stack spacing={1.25}>
                        <Stack
                            direction="row"
                            spacing={1.25}
                            sx={{ flexWrap: "wrap" }}
                        >
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={disabled || submitting}
                            >
                                {submitting
                                    ? t("engine.action.submitting")
                                    : (resolvedSchema.submitLabel ??
                                      t("engine.action.submit"))}
                            </Button>
                            <Button
                                type="button"
                                variant="outlined"
                                disabled={disabled || submitting}
                                onClick={handleReset}
                            >
                                {t("common.action.reset")}
                            </Button>
                        </Stack>
                        {submitError ? (
                            <Alert severity="error">{submitError}</Alert>
                        ) : null}
                    </Stack>
                </Stack>
            </Box>
        </Paper>
    );
}
