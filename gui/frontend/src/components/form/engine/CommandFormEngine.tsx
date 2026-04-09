import { FormEvent, useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n";
import {
    buildCobraFlags,
    buildInitialValues,
    CommandFormSchema,
    CommandFormSubmitPayload,
    resolveCommandFormSchema,
    ResolvedCommandFormField,
    StartupFieldCatalog,
} from "../../../form-engine";
import {
    GameId,
    SelectOption,
    startupFieldComponentRegistry,
} from "../input";

export interface CommandFormEngineProps {
    schema: CommandFormSchema;
    catalog: StartupFieldCatalog;
    className?: string;
    disabled?: boolean;
    onSubmit?: (payload: CommandFormSubmitPayload) => void | Promise<void>;
    onFlagsChange?: (flags: string[]) => void;
}

const joinClassName = (...parts: Array<string | undefined>): string => {
    return parts.filter(Boolean).join(" ");
};

const quoteToken = (token: string): string => {
    if (/[\s"]/u.test(token)) {
        return JSON.stringify(token);
    }
    return token;
};

const buildComponentProps = (
    field: ResolvedCommandFormField,
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

    if (field.valueTypeId === "game_single" || field.valueTypeId === "game_multi") {
        props.allowedGames = (field.allowedValues ?? []) as GameId[];
    }

    return props;
};

export function CommandFormEngine({
    schema,
    catalog,
    className,
    disabled = false,
    onSubmit,
    onFlagsChange,
}: CommandFormEngineProps) {
    const { t } = useI18n();
    const resolvedSchema = useMemo(
        () => resolveCommandFormSchema(schema, catalog),
        [schema, catalog],
    );
    const [values, setValues] = useState<Record<string, unknown>>(() =>
        buildInitialValues(resolvedSchema),
    );
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        setValues(buildInitialValues(resolvedSchema));
        setSubmitError(null);
    }, [resolvedSchema]);

    const flags = useMemo(
        () => buildCobraFlags(resolvedSchema, values),
        [resolvedSchema, values],
    );

    useEffect(() => {
        onFlagsChange?.(flags);
    }, [flags, onFlagsChange]);

    const previewValue =
        flags.length > 0
            ? flags.map((token) => quoteToken(token)).join(" ")
            : t("engine.preview.empty");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!onSubmit) {
            return;
        }

        setSubmitError(null);
        setSubmitting(true);
        try {
            await onSubmit({
                flags,
                values,
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : t("engine.submit.failed");
            setSubmitError(message);
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

            <div className="wired-engineSections">
                {resolvedSchema.sections.map((section) => (
                    <section className="wired-section" key={section.id}>
                        <div className="wired-sectionHeader">
                            <div className="wired-sectionTitle">{section.title}</div>
                            {section.description ? (
                                <div className="wired-description">
                                    {section.description}
                                </div>
                            ) : null}
                        </div>

                        <div
                            className="wired-sectionGrid"
                            style={{
                                gridTemplateColumns: `repeat(${Math.max(
                                    section.columns,
                                    1,
                                )}, minmax(0, 1fr))`,
                            }}
                        >
                            {section.fields.map((field) => {
                                const Component =
                                    startupFieldComponentRegistry[field.valueTypeId];
                                if (!Component) {
                                    return (
                                        <div className="wired-field" key={field.id}>
                                            <div className="wired-error">
                                                {t("engine.field.unsupported", {
                                                    valueTypeId: field.valueTypeId,
                                                })}
                                            </div>
                                        </div>
                                    );
                                }

                                const value = values[field.id] ?? field.defaultValue;
                                return (
                                    <Component
                                        key={field.id}
                                        label={field.label}
                                        description={field.description}
                                        required={field.required}
                                        disabled={disabled || submitting}
                                        value={value}
                                        onChange={(next: unknown) =>
                                            setValues((current) => ({
                                                ...current,
                                                [field.id]: next,
                                            }))
                                        }
                                        {...buildComponentProps(field)}
                                    />
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>

            <div className="wired-divider" />

            <div className="wired-engineActions">
                <button
                    type="submit"
                    className="wired-button"
                    disabled={disabled || submitting || !onSubmit}
                >
                    {submitting
                        ? t("engine.action.submitting")
                        : resolvedSchema.submitLabel ?? t("engine.action.submit")}
                </button>
                {submitError ? <div className="wired-error">{submitError}</div> : null}
            </div>

            <div className="wired-preview">
                <div className="wired-label">
                    {resolvedSchema.previewLabel ?? t("engine.preview.title")}
                </div>
                <pre className="wired-previewCode">{previewValue}</pre>
            </div>
        </form>
    );
}
