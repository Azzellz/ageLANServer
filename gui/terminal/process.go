package terminal

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"sync"
	"time"
)

type StartConfig struct {
	ExecutablePath string
	Flags          []string
	WorkingDir     string
	Environment    []string
	EmitData       func(data string)
}

type Process struct {
	mode    string
	pid     int
	command string

	writeFn     func(data []byte) (int, error)
	resizeFn    func(cols int, rows int) error
	interruptFn func() error
	killFn      func() error
	closeFn     func() error
	waitFn      func() (int, error)

	done chan struct{}

	stopOnce sync.Once
	stopErr  error
}

func (p *Process) Mode() string {
	if p == nil {
		return ""
	}
	return p.mode
}

func (p *Process) Pid() int {
	if p == nil {
		return 0
	}
	return p.pid
}

func (p *Process) Command() string {
	if p == nil {
		return ""
	}
	return p.command
}

func (p *Process) Done() <-chan struct{} {
	if p == nil {
		return nil
	}
	return p.done
}

func (p *Process) Write(data []byte) (int, error) {
	if p == nil || p.writeFn == nil {
		return 0, errors.New("terminal input is not available")
	}
	return p.writeFn(data)
}

func (p *Process) Resize(cols int, rows int) error {
	if p == nil || p.resizeFn == nil {
		return nil
	}
	return p.resizeFn(cols, rows)
}

func (p *Process) Wait() (int, error) {
	if p == nil || p.waitFn == nil {
		return 0, nil
	}
	defer close(p.done)
	return p.waitFn()
}

func (p *Process) Close() error {
	if p == nil || p.closeFn == nil {
		return nil
	}
	return p.closeFn()
}

func (p *Process) Stop(timeout time.Duration) error {
	if p == nil {
		return nil
	}

	p.stopOnce.Do(func() {
		if p.interruptFn != nil {
			if err := p.interruptFn(); err != nil && !IsProcessDoneError(err) {
				p.stopErr = err
			}
		}

		select {
		case <-p.done:
			return
		case <-time.After(timeout):
		}

		if p.killFn != nil {
			if err := p.killFn(); err != nil && !IsProcessDoneError(err) {
				if p.stopErr == nil {
					p.stopErr = err
				}
			}
		}
	})

	return p.stopErr
}

type streamWriter struct {
	emit func(data string)
}

func (w streamWriter) Write(data []byte) (int, error) {
	if len(data) == 0 {
		return 0, nil
	}
	if w.emit != nil {
		w.emit(string(data))
	}
	return len(data), nil
}

func startPipeSession(config StartConfig) (*Process, error) {
	cmd := exec.Command(config.ExecutablePath, config.Flags...)
	cmd.Dir = config.WorkingDir
	cmd.Env = append([]string(nil), config.Environment...)

	writer := streamWriter{emit: config.EmitData}
	cmd.Stdout = writer
	cmd.Stderr = writer

	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("create stdin pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		_ = stdin.Close()
		return nil, fmt.Errorf("start command: %w", err)
	}

	process := &Process{
		mode:    "pipe",
		command: formatCommand(config.ExecutablePath, config.Flags),
		writeFn: stdin.Write,
		resizeFn: func(cols int, rows int) error {
			return nil
		},
		interruptFn: func() error {
			if cmd.Process == nil {
				return nil
			}
			return cmd.Process.Signal(os.Interrupt)
		},
		killFn: func() error {
			if cmd.Process == nil {
				return nil
			}
			return cmd.Process.Kill()
		},
		closeFn: func() error {
			return stdin.Close()
		},
		waitFn: func() (int, error) {
			waitErr := cmd.Wait()
			exitCode := 0
			if cmd.ProcessState != nil {
				exitCode = cmd.ProcessState.ExitCode()
			}

			if waitErr == nil {
				return exitCode, nil
			}
			var exitErr *exec.ExitError
			if errors.As(waitErr, &exitErr) {
				return exitCode, nil
			}
			return exitCode, waitErr
		},
		done: make(chan struct{}),
	}
	if cmd.Process != nil {
		process.pid = cmd.Process.Pid
	}

	return process, nil
}

func formatCommand(executablePath string, flags []string) string {
	tokens := make([]string, 0, len(flags)+1)
	tokens = append(tokens, quoteCommandToken(executablePath))
	for _, flag := range flags {
		tokens = append(tokens, quoteCommandToken(flag))
	}
	return strings.Join(tokens, " ")
}

func quoteCommandToken(token string) string {
	if token == "" {
		return `""`
	}
	if strings.ContainsAny(token, " \t\n\r\"'") {
		return strconv.Quote(token)
	}
	return token
}

func IsProcessDoneError(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, os.ErrProcessDone) {
		return true
	}

	lowerMessage := strings.ToLower(err.Error())
	return strings.Contains(lowerMessage, "already finished") ||
		strings.Contains(lowerMessage, "process done") ||
		strings.Contains(lowerMessage, "invalid handle") ||
		strings.Contains(lowerMessage, "already closed")
}
