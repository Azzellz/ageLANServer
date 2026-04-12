import { ReactNode, useState } from "react";
import { Box, Button, Collapse, Paper, Stack, Typography } from "@mui/material";
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
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={1.5}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                >
                    <Stack spacing={0.5}>
                        <Typography variant="subtitle1" fontWeight={600}>
                            {title}
                        </Typography>
                        {description ? (
                            <Typography variant="body2" color="text.secondary">
                                {description}
                            </Typography>
                        ) : null}
                    </Stack>
                    <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        aria-controls={bodyId}
                        aria-expanded={expanded}
                        onClick={() => setExpanded((current) => !current)}
                    >
                        {expanded
                            ? t("common.action.collapse")
                            : t("common.action.expand")}
                    </Button>
                </Stack>
                <Collapse in={expanded} unmountOnExit>
                    <Box id={bodyId}>{children}</Box>
                </Collapse>
            </Stack>
        </Paper>
    );
}
