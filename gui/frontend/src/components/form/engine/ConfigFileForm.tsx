import { ResolvedCommandFormField } from "../../../form-engine";
import { useI18n } from "../../../i18n";
import { FilePathInput } from "../input";

export interface ConfigFileFormProps {
    pathField: ResolvedCommandFormField | null;
    pathValue: string;
    disabled?: boolean;
    required?: boolean;
    pathError?: string | null;
    findingConfigPath?: boolean;
    findConfigPathError?: string | null;
    configFieldCount?: number;
    onPathChange: (next: string) => void;
}

export function ConfigFileForm({
    pathField,
    pathValue,
    disabled = false,
    required = true,
    pathError,
    findingConfigPath = false,
    findConfigPathError,
    configFieldCount = 0,
    onPathChange,
}: ConfigFileFormProps) {
    const { t } = useI18n();

    if (!pathField) {
        return (
            <section className="wired-section">
                <div className="wired-sectionHeader">
                    <div className="wired-sectionTitle">{t("engine.config.title")}</div>
                </div>
                <div className="wired-error">{t("engine.config.pathFieldMissing")}</div>
            </section>
        );
    }

    return (
        <section className="wired-section">
            <div className="wired-sectionHeader">
                <div className="wired-sectionTitle">{t("engine.config.title")}</div>
                <div className="wired-description">
                    {t("engine.config.description")}
                </div>
            </div>

            <FilePathInput
                label={pathField.label}
                description={pathField.description}
                required={required}
                disabled={disabled}
                value={pathValue}
                error={pathError ?? undefined}
                onChange={onPathChange}
            />

            {findingConfigPath ? (
                <div className="wired-helper">{t("engine.config.autoFinding")}</div>
            ) : null}

            {findConfigPathError ? (
                <div className="wired-error">
                    {t("engine.config.lookupFailed", {
                        message: findConfigPathError,
                    })}
                </div>
            ) : null}

            <div className="wired-helper">
                {t("engine.config.trackedFieldCount", { count: configFieldCount })}
            </div>
        </section>
    );
}
