package main

import (
	"gui"
	"gui/flag"
	"gui/terminal"
	"os"

	"github.com/luskaner/ageLANServer/common"
	"github.com/luskaner/ageLANServer/server/internal/cmd"
)

var version = "development"

func main() {
	cmd.Version = version
	common.ChdirToExe()

	if _, forcedCLI := os.LookupEnv(terminal.ForceCLIEnvName); forcedCLI {
		if err := cmd.Execute(); err != nil {
			panic(err)
		}
		return
	}

	// for wails bindings
	if flag.IsWailsBindings {
		gui.Run()
		return
	}

	if flag.IsDoubleClick() {
		gui.Run()
	} else {
		if err := cmd.Execute(); err != nil {
			panic(err)
		}
	}
}
