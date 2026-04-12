//go:build !windows

package terminal

func StartPreferredSession(
	config StartConfig,
) (process *Process, fallbackMessage string, err error) {
	process, err = startPipeSession(config)
	return process, "", err
}
