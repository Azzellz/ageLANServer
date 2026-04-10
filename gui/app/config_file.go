package app

import (
	"errors"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/pelletier/go-toml/v2"
)

const (
	defaultConfigFileName = "config.toml"
	searchDepthLimit      = 3
)

var preferredConfigRelativePaths = []string{
	defaultConfigFileName,
	filepath.Join("resources", "config", defaultConfigFileName),
}

type ConfigValueUpdate struct {
	KeyPath string `json:"keyPath"`
	Value   any    `json:"value"`
}

func (a *App) FindConfigFile() (string, error) {
	executablePath, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("get executable path: %w", err)
	}

	baseDirectory := filepath.Dir(executablePath)
	rootCandidates := collectSearchRoots(baseDirectory, searchDepthLimit)
	visitedCandidates := make(map[string]struct{})

	for _, root := range rootCandidates {
		for _, relative := range preferredConfigRelativePaths {
			candidate := filepath.Clean(filepath.Join(root, relative))
			if _, seen := visitedCandidates[candidate]; seen {
				continue
			}
			visitedCandidates[candidate] = struct{}{}
			if isRegularFile(candidate) {
				return candidate, nil
			}
		}
	}

	for _, root := range rootCandidates {
		found := searchConfigInDirectory(root, searchDepthLimit)
		if found != "" {
			return found, nil
		}
	}

	return "", nil
}

func (a *App) ApplyConfigFileValues(
	configPath string,
	updates []ConfigValueUpdate,
) error {
	normalizedPath := strings.TrimSpace(configPath)
	if normalizedPath == "" {
		return errors.New("config path is required")
	}

	absoluteConfigPath, err := filepath.Abs(normalizedPath)
	if err != nil {
		absoluteConfigPath = filepath.Clean(normalizedPath)
	}

	configMap, fileExists, err := loadTomlConfigMap(absoluteConfigPath)
	if err != nil {
		return err
	}

	for _, update := range updates {
		keyPath := strings.TrimSpace(update.KeyPath)
		if keyPath == "" {
			continue
		}
		segments := splitConfigKeyPath(keyPath)
		if len(segments) == 0 {
			continue
		}
		value := normalizeTomlValue(update.Value)
		if setErr := setNestedConfigValue(configMap, segments, value); setErr != nil {
			return fmt.Errorf("set config key %q: %w", keyPath, setErr)
		}
	}

	if !fileExists && len(updates) == 0 {
		return nil
	}

	marshaled, err := toml.Marshal(configMap)
	if err != nil {
		return fmt.Errorf("marshal config toml: %w", err)
	}

	parentDirectory := filepath.Dir(absoluteConfigPath)
	if mkdirErr := os.MkdirAll(parentDirectory, 0755); mkdirErr != nil {
		return fmt.Errorf("create config directory %q: %w", parentDirectory, mkdirErr)
	}

	if writeErr := os.WriteFile(absoluteConfigPath, marshaled, 0644); writeErr != nil {
		return fmt.Errorf("write config file %q: %w", absoluteConfigPath, writeErr)
	}
	return nil
}

func collectSearchRoots(base string, maxDepth int) []string {
	roots := make([]string, 0, maxDepth+1)
	seen := make(map[string]struct{})
	current := filepath.Clean(base)
	for depth := 0; depth <= maxDepth; depth++ {
		if _, exists := seen[current]; !exists {
			roots = append(roots, current)
			seen[current] = struct{}{}
		}
		parent := filepath.Dir(current)
		if parent == current {
			break
		}
		current = parent
	}
	return roots
}

func searchConfigInDirectory(root string, maxDepth int) string {
	type queueItem struct {
		path  string
		depth int
	}

	queue := []queueItem{{path: root, depth: 0}}
	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		entries, err := os.ReadDir(current.path)
		if err != nil {
			continue
		}

		sort.Slice(entries, func(left, right int) bool {
			return strings.ToLower(entries[left].Name()) < strings.ToLower(entries[right].Name())
		})

		for _, entry := range entries {
			entryPath := filepath.Join(current.path, entry.Name())

			if entry.IsDir() {
				if current.depth < maxDepth {
					queue = append(queue, queueItem{
						path:  entryPath,
						depth: current.depth + 1,
					})
				}
				continue
			}

			if !strings.EqualFold(entry.Name(), defaultConfigFileName) {
				continue
			}

			if isRegularFile(entryPath) {
				return entryPath
			}
		}
	}

	return ""
}

func isRegularFile(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return info.Mode().IsRegular()
}

func loadTomlConfigMap(path string) (map[string]any, bool, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return map[string]any{}, false, nil
		}
		return nil, false, fmt.Errorf("read config file %q: %w", path, err)
	}

	if strings.TrimSpace(string(data)) == "" {
		return map[string]any{}, true, nil
	}

	var configMap map[string]any
	if unmarshalErr := toml.Unmarshal(data, &configMap); unmarshalErr != nil {
		return nil, true, fmt.Errorf("parse config toml %q: %w", path, unmarshalErr)
	}

	if configMap == nil {
		configMap = map[string]any{}
	}
	return configMap, true, nil
}

func splitConfigKeyPath(keyPath string) []string {
	rawSegments := strings.Split(keyPath, ".")
	segments := make([]string, 0, len(rawSegments))
	for _, segment := range rawSegments {
		trimmed := strings.TrimSpace(segment)
		if trimmed == "" {
			continue
		}
		segments = append(segments, trimmed)
	}
	return segments
}

func setNestedConfigValue(root map[string]any, segments []string, value any) error {
	current := root
	for index, segment := range segments {
		isLeaf := index == len(segments)-1
		if isLeaf {
			current[segment] = value
			return nil
		}

		next, exists := current[segment]
		if !exists || next == nil {
			nextMap := map[string]any{}
			current[segment] = nextMap
			current = nextMap
			continue
		}

		nextMap, ok := next.(map[string]any)
		if !ok {
			return fmt.Errorf("path segment %q is not an object", segment)
		}
		current = nextMap
	}

	return nil
}

func normalizeTomlValue(value any) any {
	switch typed := value.(type) {
	case nil:
		return nil
	case bool:
		return typed
	case string:
		return typed
	case int:
		return typed
	case int8:
		return int64(typed)
	case int16:
		return int64(typed)
	case int32:
		return int64(typed)
	case int64:
		return typed
	case uint:
		return uint64(typed)
	case uint8:
		return uint64(typed)
	case uint16:
		return uint64(typed)
	case uint32:
		return uint64(typed)
	case uint64:
		return typed
	case float32:
		return normalizeFloat(float64(typed))
	case float64:
		return normalizeFloat(typed)
	case []any:
		items := make([]any, len(typed))
		for index := range typed {
			items[index] = normalizeTomlValue(typed[index])
		}
		return items
	case map[string]any:
		normalized := make(map[string]any, len(typed))
		for key, item := range typed {
			normalized[key] = normalizeTomlValue(item)
		}
		return normalized
	default:
		return typed
	}
}

func normalizeFloat(value float64) any {
	if math.IsNaN(value) || math.IsInf(value, 0) {
		return value
	}
	if math.Trunc(value) == value {
		return int64(value)
	}
	return value
}
