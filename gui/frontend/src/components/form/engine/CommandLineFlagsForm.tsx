import { CSSProperties, useEffect, useMemo } from "react";
import {
    buildCobraFlags,
    ResolvedCommandFormField,
    ResolvedCommandFormSchema,
} from "../../../form-engine";
import { useI18n } from "../../../i18n";
import {
    GameId,
    SelectOption,
    startupFieldComponentRegistry,
} from "../input";

export interface CommandLineFlagsFormProps {
    schema: ResolvedCommandFormSchema;
    values: Record<string, unknown>;
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

export function CommandLineFlagsForm({
    schema,
    values,
    disabled = false,
    hiddenFieldIds,
    onValueChange,
    onFlagsChange,
}: CommandLineFlagsFormProps) {
    const { t } = useI18n();

    const flags = useMemo(() => buildCobraFlags(schema, values), [schema, values]);

    useEffect(() => {
        onFlagsChange?.(flags);
    }, [flags, onFlagsChange]);

    const previewValue =
        flags.length > 0
            ? flags.map((token) => quoteToken(token)).join(" ")
            : t("engine.preview.empty");

    return (
        <>
            <div className="wired-engineSections">
                {schema.sections.map((section) => {
                    const visibleFields = section.fields.filter(
                        (field) => !hiddenFieldIds?.has(field.id),
                    );

                    if (visibleFields.length === 0) {
                        return null;
                    }

                    return (
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
                                style={
                                    {
                                        gridTemplateColumns: `repeat(${Math.max(
                                            section.columns,
                                            1,
                                        )}, minmax(0, 1fr))`,
                                    } as CSSProperties
                                }
                            >
                                {visibleFields.map((field) => {
                                    const Component =
                                        startupFieldComponentRegistry[
                                            field.valueTypeId
                                        ];
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

                                    const value =
                                        values[field.id] ?? field.defaultValue;
                                    return (
                                        <Component
                                            key={field.id}
                                            label={field.label}
                                            description={field.description}
                                            required={field.required}
                                            disabled={disabled}
                                            value={value}
                                            onChange={(next: unknown) =>
                                                onValueChange(field.id, next)
                                            }
                                            {...buildComponentProps(field)}
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>

            <div className="wired-preview">
                <div className="wired-label">
                    {schema.previewLabel ?? t("engine.preview.title")}
                </div>
                <pre className="wired-previewCode">{previewValue}</pre>
            </div>
        </>
    );
}
