//go:build windows

package flag

import (
	"os"
	"strings"

	ps "github.com/mitchellh/go-ps"
)

func IsDoubleClick() bool {
	p, err := ps.FindProcess(os.Getppid())
	if err != nil || p == nil {
		return false
	}
	name := strings.ToLower(p.Executable())
	return name == "explorer" || name == "explorer.exe"
}
