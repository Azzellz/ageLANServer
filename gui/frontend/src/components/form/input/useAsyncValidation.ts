import { useEffect, useState } from "react";
import { translate } from "../../../i18n";
import { MaybePromise, ValidationError } from "./types";

export type AsyncValidator = (
    value: string,
) => MaybePromise<ValidationError | undefined>;

export function useAsyncValidation(
    value: string,
    validator?: AsyncValidator,
    enabled = true,
) {
    const [error, setError] = useState<ValidationError>(null);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        if (!enabled || !validator) {
            setError(null);
            setChecking(false);
            return;
        }

        let active = true;
        setChecking(true);

        Promise.resolve(validator(value))
            .then((nextError) => {
                if (!active) {
                    return;
                }
                setError(nextError ?? null);
            })
            .catch(() => {
                if (!active) {
                    return;
                }
                setError(translate("validation.async.failed"));
            })
            .finally(() => {
                if (active) {
                    setChecking(false);
                }
            });

        return () => {
            active = false;
        };
    }, [enabled, validator, value]);

    return {
        error,
        checking,
    };
}

