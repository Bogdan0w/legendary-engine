package config

import (
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
)

var (
	Config = conf{
		ServerHost: ":80",
		JWTSecret:  "dwafawf",
		Users: map[string]SUser{
			"Admin": {
				Pass:    "Admin",
				Prefix:  "/",
				Limit:   1024,
				IsAdmin: true,
				Name:    "Safe",
			},
		},
	}
)

type SUser struct {
	Pass    string `yaml:"pass"`
	Prefix  string `yaml:"prefix"`
	Limit   uint32 `yaml:"limit"`
	IsAdmin bool   `yaml:"isAdmin"`
	Name    string `yaml:"name"`
}

type conf struct {
	ServerHost string           `yaml:"server-host"`
	JWTSecret  string           `yaml:"jwt-secret"`
	Users      map[string]SUser `yaml:"users"`
}

func SaveConfig() {
	cont, err := yaml.Marshal(&Config)
	if err != nil {
		log.Fatalln(err)
	}
	if err := ioutil.WriteFile("config.yml", cont, 0777); err != nil {
		log.Fatalln(err)
	}
}

func LoadConfig() {
	file, err := os.OpenFile("config.yml", os.O_CREATE, 0777)
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			log.Fatalln(err)
		}
	}(file)
	cbytes, err := ioutil.ReadAll(file)
	if err != nil {
		log.Fatalln(err)
	}
	if len(cbytes) < 10 {
		SaveConfig()
	}
	var cfg conf
	err = yaml.UnmarshalStrict(cbytes, &cfg)
	if err != nil {
		log.Fatalln(err)
	}
	Config = cfg
}

func DirSize(path string) (int64, error) {
	var size int64
	err := filepath.Walk(path, func(_ string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			size += info.Size()
		}
		return err
	})
	return size, err
}

const (
	byte     = 1.0
	kilobyte = 1024.0 * byte
	megabyte = 1024.0 * kilobyte
	gigabyte = 1024.0 * megabyte
	terabyte = 1024.0 * gigabyte
)

func outputStatsSizes(bytes int64) (float64, string) {
	var value float64
	var unit string

	switch {
	case bytes >= terabyte:
		unit = "TB"
		value = float64(bytes) / terabyte
	case bytes >= gigabyte:
		unit = "GB"
		value = float64(bytes) / gigabyte
	case bytes >= megabyte:
		unit = "MB"
		value = float64(bytes) / megabyte
	case bytes >= kilobyte:
		unit = "KB"
		value = float64(bytes) / kilobyte
	default:
		unit = "Bytes"
		value = float64(bytes)
	}

	return value, unit
}
