import { ReactNode } from "react";
import {
    Alert,
    FormLabel,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { BaseFieldProps } from "@/types";

interface FieldShellProps extends BaseFieldProps {
    children: ReactNode;
    inlineActions?: ReactNode;
    localError?: string | null;
    inputId?: string;
}

export function FieldShell({
    label,
    description,
    required = false,
    disabled = false,
    className,
    error,
    localError,
    inlineActions,
    inputId,
    children,
}: FieldShellProps) {
    const finalError = localError ?? error;

    return (
        <Paper
            className={className}
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "background.paper",
                opacity: disabled ? 0.85 : 1,
            }}
        >
            <Stack spacing={1.25}>
                <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    gap={1}
                    flexWrap="wrap"
                >
                    <FormLabel
                        htmlFor={inputId}
                        required={required}
                        sx={{
                            color: "text.primary",
                            fontWeight: 600,
                            fontSize: 13,
                        }}
                    >
                        {label}
                    </FormLabel>
                    {inlineActions ? (
                        <Stack direction="row" gap={1} flexWrap="wrap">
                            {inlineActions}
                        </Stack>
                    ) : null}
                </Stack>

                {description ? (
                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>
                ) : null}

                <Stack spacing={1}>{children}</Stack>

                {finalError ? (
                    <Alert severity="error" sx={{ py: 0 }}>
                        {finalError}
                    </Alert>
                ) : null}
            </Stack>
        </Paper>
    );
}
