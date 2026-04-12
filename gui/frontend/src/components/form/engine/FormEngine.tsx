import { FormEvent, useEffect, useMemo, useState } from "react";
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
    CommandFormSchema,
    StartupFieldCatalog,
    ResolvedCommandFormField,
} from "@/types";

export interface FormEngineProps {
    schema: CommandFormSchema;
    catalog: StartupFieldCatalog;
    className?: string;
    disabled?: boolean;
    onFlagsChange?: (flags: string[]) => void;
    onBeforeExecute?: (flags: string[]) => void;
}

interface ConfigValueUpdate {
    keyPath: string;
    value: unknown;
}

const joinClassName = (...parts: Array<string | undefined>): string => {
    return parts.filter(Boolean).join(" ");
};

const resolveErrorMessage = (
    error: unknown,
    fallbackMessage: string,
): string => {
    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }
    return fallbackMessage;
};

const isConfigScopedField = (field: ResolvedCommandFormField): boolean => {
    const scope = field.catalogField?.scope;
    if (scope) {
        return scope === "config" || scope === "config_only";
    }
    return !field.fieldKey.includes(".cli.");
};

const buildConfigKeyPath = (field: ResolvedCommandFormField): string => {
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
    fields: ResolvedCommandFormField[],
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

export function FormEngine({
    schema,
    catalog,
    className,
    disabled = false,
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

    const configPathField = useMemo(
        () =>
            resolvedFields.find(
                (field) =>
                    field.valueTypeId === "path_file" &&
                    field.fieldKey.endsWith(".cli.--config"),
            ) ?? null,
        [resolvedFields],
    );

    const configPathFieldId = configPathField?.id ?? null;

    const configScopedFields = useMemo(
        () =>
            resolvedFields.filter(
                (field) =>
                    isConfigScopedField(field) &&
                    field.id !== configPathFieldId,
            ),
        [resolvedFields, configPathFieldId],
    );

    const hiddenFieldIds = useMemo(() => {
        const hidden = new Set<string>();
        if (configPathFieldId) {
            hidden.add(configPathFieldId);
        }
        return hidden;
    }, [configPathFieldId]);

    const [values, setValues] = useState<Record<string, unknown>>(() =>
        buildInitialValues(resolvedSchema),
    );
    const [touchedFieldIds, setTouchedFieldIds] = useState<Set<string>>(
        () => new Set(),
    );
    const [latestFlags, setLatestFlags] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [configPathError, setConfigPathError] = useState<string | null>(null);
    const [findingConfigPath, setFindingConfigPath] = useState(false);
    const [findConfigPathError, setFindConfigPathError] = useState<
        string | null
    >(null);

    useEffect(() => {
        setValues(buildInitialValues(resolvedSchema));
        setTouchedFieldIds(new Set());
        setLatestFlags([]);
        setSubmitting(false);
        setSubmitError(null);
        setConfigPathError(null);
        setFindConfigPathError(null);
    }, [resolvedSchema]);

    useEffect(() => {
        if (!configPathFieldId) {
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
                    const currentValue = String(
                        current[configPathFieldId] ?? "",
                    ).trim();
                    if (currentValue) {
                        return current;
                    }
                    return {
                        ...current,
                        [configPathFieldId]: normalizedPath,
                    };
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
    }, [configPathFieldId, t]);

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

    const runConfigFileForm = async (configPath: string) => {
        const updates = collectConfigUpdates(
            values,
            touchedFieldIds,
            configScopedFields,
        );
        await ApplyConfigFileValues(configPath, updates);
    };

    const runCommandLineFlagsForm = async (flags: string[]) => {
        await Execute(flags);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitError(null);
        setConfigPathError(null);

        if (!configPathFieldId) {
            setSubmitError(t("engine.config.pathFieldMissing"));
            return;
        }

        const configPath = String(values[configPathFieldId] ?? "").trim();
        if (!configPath) {
            setConfigPathError(t("engine.config.pathRequired"));
            return;
        }

        setSubmitting(true);
        try {
            const fallbackFlags = buildCobraFlags(resolvedSchema, values);
            const executeFlags =
                latestFlags.length > 0 ? latestFlags : fallbackFlags;
            onBeforeExecute?.(executeFlags);
            await runConfigFileForm(configPath);
            await runCommandLineFlagsForm(executeFlags);
        } catch (error) {
            setSubmitError(
                resolveErrorMessage(error, t("engine.submit.failed")),
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            className={joinClassName("wired-engine", className)}
            onSubmit={handleSubmit}
        >
            <div className="wired-engineHeader">
                <div className="wired-engineTitle">{resolvedSchema.title}</div>
                {resolvedSchema.description ? (
                    <div className="wired-description">
                        {resolvedSchema.description}
                    </div>
                ) : null}
            </div>

            <ConfigFileForm
                pathField={configPathField}
                pathValue={
                    configPathFieldId
                        ? String(values[configPathFieldId] ?? "")
                        : ""
                }
                disabled={disabled || submitting}
                required
                pathError={configPathError}
                findingConfigPath={findingConfigPath}
                findConfigPathError={findConfigPathError}
                configFieldCount={configScopedFields.length}
                onPathChange={(next) => {
                    if (!configPathFieldId) {
                        return;
                    }
                    setConfigPathError(null);
                    setFieldValue(configPathFieldId, next, true);
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

            <div className="wired-divider" />

            <div className="wired-engineActions">
                <button
                    type="submit"
                    className="wired-button"
                    disabled={disabled || submitting}
                >
                    {submitting
                        ? t("engine.action.submitting")
                        : (resolvedSchema.submitLabel ??
                          t("engine.action.submit"))}
                </button>
                {submitError ? (
                    <div className="wired-error">{submitError}</div>
                ) : null}
            </div>
        </form>
    );
}
