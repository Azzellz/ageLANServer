import { Alert, Stack, Typography } from "@mui/material";
import { ResolvedFormField } from "@/types";
import { useI18n } from "@/i18n";
import { FilePathInput } from "../input";
import { CollapsibleSection } from "./CollapsibleSection";

export interface ConfigPathInputItem {
    field: ResolvedFormField;
    value: string;
    required?: boolean;
    error?: string | null;
}

export interface ConfigFileFormProps {
    pathItems: ConfigPathInputItem[];
    missingPathFieldKeys?: string[];
    disabled?: boolean;
    findingConfigPath?: boolean;
    findConfigPathError?: string | null;
    configFieldCount?: number;
    onPathChange: (fieldId: string, next: string) => void;
}

export function ConfigFileForm({
    pathItems,
    missingPathFieldKeys = [],
    disabled = false,
    findingConfigPath = false,
    findConfigPathError,
    configFieldCount = 0,
    onPathChange,
}: ConfigFileFormProps) {
    const { t } = useI18n();

    const missingFieldKeysLabel = missingPathFieldKeys.join(", ");

    if (pathItems.length === 0) {
        return (
            <CollapsibleSection
                sectionId="section-config"
                title={t("engine.config.title")}
            >
                {missingPathFieldKeys.length > 0 ? (
                    <Alert severity="error">
                        {t("engine.config.pathFieldMissingDeclared", {
                            fields: missingFieldKeysLabel,
                        })}
                    </Alert>
                ) : (
                    <Alert severity="error">
                        {t("engine.config.pathFieldMissing")}
                    </Alert>
                )}
            </CollapsibleSection>
        );
    }

    return (
        <CollapsibleSection
            sectionId="section-config"
            title={t("engine.config.title")}
            description={t("engine.config.description")}
        >
            {missingPathFieldKeys.length > 0 ? (
                <Alert severity="error">
                    {t("engine.config.pathFieldMissingDeclared", {
                        fields: missingFieldKeysLabel,
                    })}
                </Alert>
            ) : null}

            <Stack spacing={1.5}>
                {pathItems.map((item) => (
                    <FilePathInput
                        key={item.field.id}
                        label={item.field.label}
                        description={item.field.description}
                        required={item.required}
                        disabled={disabled}
                        value={item.value}
                        error={item.error ?? undefined}
                        onChange={(next) => onPathChange(item.field.id, next)}
                    />
                ))}
            </Stack>

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
