import { Alert, Typography } from "@mui/material";
import { ResolvedFormField } from "@/types";
import { useI18n } from "@/i18n";
import { FilePathInput } from "../input";
import { CollapsibleSection } from "./CollapsibleSection";

export interface ConfigFileFormProps {
    pathField: ResolvedFormField | null;
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
            <CollapsibleSection
                sectionId="section-config"
                title={t("engine.config.title")}
            >
                <Alert severity="error">
                    {t("engine.config.pathFieldMissing")}
                </Alert>
            </CollapsibleSection>
        );
    }

    return (
        <CollapsibleSection
            sectionId="section-config"
            title={t("engine.config.title")}
            description={t("engine.config.description")}
        >
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
                <Typography variant="caption" color="text.secondary">
                    {t("engine.config.autoFinding")}
                </Typography>
            ) : null}

            {findConfigPathError ? (
                <Alert severity="error">
                    {t("engine.config.lookupFailed", {
                        message: findConfigPathError,
                    })}
                </Alert>
            ) : null}

            <Typography variant="caption" color="text.secondary">
                {t("engine.config.trackedFieldCount", {
                    count: configFieldCount,
                })}
            </Typography>
        </CollapsibleSection>
    );
}
