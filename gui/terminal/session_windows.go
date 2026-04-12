//go:build windows

package terminal

import (
	"context"
	"errors"
	"fmt"
	"io"
	"strings"
	"syscall"

	"github.com/UserExistsError/conpty"
)

func StartPreferredSession(
	config StartConfig,
) (process *Process, fallbackMessage string, err error) {
	process, err = startConPTYSession(config)
	if err == nil {
		return process, "", nil
	}

	pipeProcess, pipeErr := startPipeSession(config)
	if pipeErr != nil {
		return nil, "", fmt.Errorf(
			"start conpty session: %w; fallback pipe session failed: %w",
			err,
			pipeErr,
		)
	}

	return pipeProcess, fmt.Sprintf(
		"[terminal] ConPTY unavailable, fallback to pipe mode: %v\r\n",
		err,
	), nil
}

func startConPTYSession(config StartConfig) (*Process, error) {
	if !conpty.IsConPtyAvailable() {
		return nil, conpty.ErrConPtyUnsupported
	}

	commandLine := buildWindowsCommandLine(config.ExecutablePath, config.Flags)
	cpty, err := conpty.Start(
		commandLine,
		conpty.ConPtyDimensions(120, 30),
		conpty.ConPtyEnv(config.Environment),
		conpty.ConPtyWorkDir(config.WorkingDir),
	)
	if err != nil {
		return nil, err
	}

	go func() {
		_, copyErr := io.Copy(streamWriter{emit: config.EmitData}, cpty)
		if copyErr != nil && !isConPTYReadCloseError(copyErr) {
			config.EmitData(fmt.Sprintf("[terminal] ConPTY output closed: %v\r\n", copyErr))
		}
	}()

	return &Process{
		mode:    "conpty",
		pid:     int(cpty.Pid()),
		command: formatCommand(config.ExecutablePath, config.Flags),
		writeFn: cpty.Write,
		resizeFn: func(cols int, rows int) error {
			return cpty.Resize(cols, rows)
		},
		interruptFn: func() error {
			_, writeErr := cpty.Write([]byte{3})
			return writeErr
		},
		killFn: cpty.Close,
		closeFn: func() error {
			return cpty.Close()
		},
		waitFn: func() (int, error) {
			exitCode, waitErr := cpty.Wait(context.Background())
			if waitErr != nil && errors.Is(waitErr, context.Canceled) {
				return int(exitCode), nil
			}
			return int(exitCode), waitErr
		},
		done: make(chan struct{}),
	}, nil
}

func buildWindowsCommandLine(executablePath string, flags []string) string {
	tokens := make([]string, 0, len(flags)+1)
	tokens = append(tokens, syscall.EscapeArg(executablePath))
	for _, flag := range flags {
		tokens = append(tokens, syscall.EscapeArg(flag))
	}
	return strings.Join(tokens, " ")
}

func isConPTYReadCloseError(err error) bool {
	if err == nil {
		return false
	}

	lowerMessage := strings.ToLower(err.Error())
	return strings.Contains(lowerMessage, "file already closed") ||
		strings.Contains(lowerMessage, "closed pipe")
}
