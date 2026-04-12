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
	// for wails bindings
	// must be in the first position
	if flag.IsWailsBindings {
		gui.Run(gui.SchemaServer)
		return
	}

	cmd.Version = version
	common.ChdirToExe()

	// emulated terminal for gui
	if _, forcedCLI := os.LookupEnv(terminal.ForceCLIEnvName); forcedCLI {
		if err := cmd.Execute(); err != nil {
			panic(err)
		}
		return
	}

	if flag.IsDoubleClick() {
		gui.Run(gui.SchemaServer)
	} else {
		if err := cmd.Execute(); err != nil {
			panic(err)
		}
	}
}
