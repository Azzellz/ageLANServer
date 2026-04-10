package app

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func resolveDefaultDirectory(currentPath string) string {
	normalized := strings.TrimSpace(currentPath)
	if normalized == "" {
		return ""
	}

	fileInfo, err := os.Stat(normalized)
	if err == nil {
		if fileInfo.IsDir() {
			return normalized
		}
		return filepath.Dir(normalized)
	}

	parent := filepath.Dir(normalized)
	if parent == "." || parent == "" {
		return ""
	}

	parentInfo, parentErr := os.Stat(parent)
	if parentErr != nil || !parentInfo.IsDir() {
		return ""
	}

	return parent
}

func resolveDefaultFilename(currentPath string) string {
	normalized := strings.TrimSpace(currentPath)
	if normalized == "" {
		return ""
	}

	fileInfo, err := os.Stat(normalized)
	if err == nil {
		if fileInfo.IsDir() {
			return ""
		}
		return fileInfo.Name()
	}

	base := filepath.Base(normalized)
	if base == "." || base == string(filepath.Separator) {
		return ""
	}
	return base
}

func (a *App) BrowseFilePath(currentPath string) (string, error) {
	options := runtime.OpenDialogOptions{
		DefaultDirectory: resolveDefaultDirectory(currentPath),
		DefaultFilename:  resolveDefaultFilename(currentPath),
	}
	return runtime.OpenFileDialog(a.ctx, options)
}

func (a *App) BrowseDirectoryPath(currentPath string) (string, error) {
	options := runtime.OpenDialogOptions{
		DefaultDirectory: resolveDefaultDirectory(currentPath),
	}
	return runtime.OpenDirectoryDialog(a.ctx, options)
}
