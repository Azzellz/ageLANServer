import { ReactNode } from "react";
import { BaseFieldProps } from "@/types";

interface FieldShellProps extends BaseFieldProps {
    children: ReactNode;
    inlineActions?: ReactNode;
    localError?: string | null;
    inputId?: string;
}

const joinClassName = (...names: Array<string | undefined>): string => {
    return names.filter(Boolean).join(" ");
};

export function FieldShell({
    label,
    description,
    required = false,
    className,
    error,
    localError,
    inlineActions,
    inputId,
    children,
}: FieldShellProps) {
    const finalError = localError ?? error;

    return (
        <div className={joinClassName("wired-field", className)}>
            <div className="wired-fieldHeader">
                <label className="wired-label" htmlFor={inputId}>
                    {label}
                    {required ? (
                        <span className="wired-required"> *</span>
                    ) : null}
                </label>
                {inlineActions ? (
                    <div className="wired-inlineActions">{inlineActions}</div>
                ) : null}
            </div>
            {description ? (
                <div className="wired-description">{description}</div>
            ) : null}
            <div className="wired-fieldBody">{children}</div>
            {finalError ? (
                <div className="wired-error">{finalError}</div>
            ) : null}
        </div>
    );
}
