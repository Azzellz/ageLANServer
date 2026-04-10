import { ReactNode, useState } from "react";
import { useI18n } from "@/i18n";

export interface CollapsibleSectionProps {
    sectionId: string;
    title: string;
    description?: string;
    defaultExpanded?: boolean;
    children: ReactNode;
}

export function CollapsibleSection({
    sectionId,
    title,
    description,
    defaultExpanded = true,
    children,
}: CollapsibleSectionProps) {
    const { t } = useI18n();
    const [expanded, setExpanded] = useState(defaultExpanded);
    const bodyId = `${sectionId}-body`;

    return (
        <section className="wired-section">
            <div className="wired-sectionTop">
                <div className="wired-sectionHeader">
                    <div className="wired-sectionTitle">{title}</div>
                    {description ? (
                        <div className="wired-description">{description}</div>
                    ) : null}
                </div>
                <button
                    type="button"
                    className="wired-sectionToggle"
                    aria-controls={bodyId}
                    aria-expanded={expanded}
                    onClick={() => setExpanded((current) => !current)}
                >
                    {expanded
                        ? t("common.action.collapse")
                        : t("common.action.expand")}
                </button>
            </div>
            {expanded ? (
                <div className="wired-sectionBody" id={bodyId}>
                    {children}
                </div>
            ) : null}
        </section>
    );
}
