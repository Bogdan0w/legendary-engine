package server

import (
	"SafeModeStorage/config"
	"encoding/json"
	"errors"
	"fmt"
	securejoin "github.com/cyphar/filepath-securejoin"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cache"
	"mime/multipart"
	"os"
	"strings"
	"time"
)

func initRoutes(app *fiber.App) {
	protector := protectRoute()

	app.Get("/login", loginPage)
	app.Post("/login", loginPost)
	app.Get("/", protector, func(ctx *fiber.Ctx) error {
		return ctx.Render("index", fiber.Map{}, "layouts/main")
	})

	app.Static("/storage/", "./storage", fiber.Static{
		Compress:      true,
		Browse:        true,
		Index:         "wijgilgawhluti3iu2",
		CacheDuration: time.Millisecond * 256,
		Next: func(c *fiber.Ctx) bool {
			ok, u := CtxIsValidUser(c)
			target := c.OriginalURL()[8:]

			if !strings.HasPrefix(target, u.Prefix) {
				return true
			}
			return !ok
		},
	})

	app.Get("/uInfo", cache.New(cache.Config{
		Expiration: 10 * time.Second,
	}), protector, func(ctx *fiber.Ctx) error {
		u := ctx.Locals("user").(config.SUser)
		dirSize, err := config.DirSize("./storage" + u.Prefix)
		if err != nil {
			return err
		}
		rmap := fiber.Map{
			"name":     u.Name,
			"prefix":   u.Prefix,
			"limit":    u.Limit,
			"dir_size": dirSize,
		}
		if u.IsAdmin {
			rmap["admin"] = true
		}
		return ctx.JSON(rmap)
	})

	app.Put("/upload/", protector, func(c *fiber.Ctx) error {
		var (
			dir  string
			file *multipart.FileHeader
		)
		dir = c.Params("dir", "/")
		file, err := c.FormFile("file")
		u := c.Locals("user").(config.SUser)
		dirSize, err := config.DirSize("./storage" + u.Prefix)
		if (int64(u.Limit)*1000*1000-dirSize) <= file.Size && !u.IsAdmin {
			return c.Status(fiber.StatusConflict).SendString(fmt.Sprintf("FileSystem limit(%d/%d)", dirSize, file.Size))
		}
		if err != nil {
			return err
		}
		path, err := securejoin.SecureJoin(
			"./storage"+(c.Locals("user").(config.SUser)).Prefix,
			dir+"/"+file.Filename)
		fmt.Println(dir)
		if err != nil {
			return errors.New("failed to validate path")
		}
		return c.SaveFile(file, path)
	})

	app.Delete("/acts", protector, func(c *fiber.Ctx) error {
		var (
			purl string
		)
		purl = c.FormValue("file", "")
		path, err := securejoin.SecureJoin(
			"./storage"+(c.Locals("user").(config.SUser)).Prefix,
			purl)
		if err != nil {
			return errors.New("failed to validate path")
		}
		err = os.RemoveAll(path)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
		}
		return c.SendStatus(fiber.StatusOK)
	})
	app.Put("/acts", protector, func(c *fiber.Ctx) error {
		var (
			purl string
		)
		purl = c.FormValue("file", "")
		path, err := securejoin.SecureJoin(
			"./storage"+(c.Locals("user").(config.SUser)).Prefix,
			purl)
		if err != nil {
			return errors.New("failed to validate path")
		}
		if _, err := os.Stat(path); os.IsNotExist(err) {
			errc := os.Mkdir(path, 0777)
			return errc
		}
		return c.SendStatus(fiber.StatusOK)
	})
	app.Post("/acts/rename", protector, func(c *fiber.Ctx) error {
		var (
			fn string
			fo string
		)
		fn = c.FormValue("fn")
		fo = c.FormValue("fo")
		pathn, err := securejoin.SecureJoin(
			"./storage"+(c.Locals("user").(config.SUser)).Prefix,
			fn)
		if err != nil {
			return err
		}
		patho, err := securejoin.SecureJoin(
			"./storage"+(c.Locals("user").(config.SUser)).Prefix,
			fo)
		if err != nil {
			return err
		}
		err = os.Rename(patho, pathn)
		if err != nil {
			return err
		}
		return c.SendStatus(fiber.StatusOK)
	})
	app.Patch("/acts/edit", protector, func(c *fiber.Ctx) error {
		var (
			furl    string
			content string
		)
		furl = c.FormValue("furl")
		content = c.FormValue("content")
		path, err := securejoin.SecureJoin(
			"./storage"+(c.Locals("user").(config.SUser)).Prefix,
			furl)
		if err != nil {
			return err
		}
		file, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0777)
		defer func(file *os.File) {
			_ = file.Close()
		}(file)
		_, err = file.WriteAt([]byte(content), 0)
		if err != nil {
			return err
		}
		return c.SendStatus(fiber.StatusOK)
	})

	// Config
	app.Get("/acts/a_edit", cache.New(cache.Config{
		Expiration: 4 * time.Second,
	}), protector, func(c *fiber.Ctx) error {
		u := c.Locals("user").(config.SUser)
		if !u.IsAdmin {
			return c.SendStatus(fiber.StatusForbidden)
		}
		cont, err := json.Marshal(config.Config.Users)
		if err != nil {
			return err
		}
		return c.Send(cont)
	})
	app.Patch("/acts/a_edit", protector, func(c *fiber.Ctx) error {
		u := c.Locals("user").(config.SUser)
		if !u.IsAdmin {
			return c.SendStatus(fiber.StatusForbidden)
		}
		var users map[string]config.SUser
		if err := c.BodyParser(&users); err != nil {
			return err
		}
		config.Config.Users = users
		config.SaveConfig()
		return c.SendStatus(fiber.StatusOK)
		/*cont := c.FormValue("conf")
		file, err := os.OpenFile("./config.yml", os.O_TRUNC|os.O_CREATE, 0777)
		if err != nil {
			return err
		}
		_, err = file.WriteAt([]byte(cont), 0)
		if err != nil {
			return err
		}
		config.LoadConfig()
		return c.SendStatus(fiber.StatusOK)*/
	})
}
