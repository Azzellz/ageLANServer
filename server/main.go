package main

import (
	"gui"
	"gui/flag"

	"github.com/luskaner/ageLANServer/common"
	"github.com/luskaner/ageLANServer/server/internal/cmd"
)

var version = "development"

func main() {
	// for wails bindings
	if flag.IsWailsBindings {
		gui.Run(cmd.Execute)
		return
	}

	cmd.Version = version
	common.ChdirToExe()
	if flag.IsDoubleClick() {
		gui.Run(cmd.Execute)
	} else {
		if err := cmd.Execute(); err != nil {
			panic(err)
		}
	}
}
