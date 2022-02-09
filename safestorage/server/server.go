package server

import (
	"SafeModeStorage/config"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/helmet/v2"
	"github.com/gofiber/template/handlebars"
	"log"
)

func CreateServer() {
	engine := handlebars.New("./views", ".hbs")

	app := fiber.New(fiber.Config{
		Prefork:      true,
		ServerHeader: "SafeStorage", // 'Server' header
		AppName:      "SafeStorage", // Application name
		Views:        engine,        // Set Handlebars view engine
		ErrorHandler: func(ctx *fiber.Ctx, err error) error {
			fmt.Println(err.Error())
			return nil
		}, // Don't exit program when gotten error
		StreamRequestBody: true,       // Connection In More Packets when input file big that ReadBufferSize
		ReadBufferSize:    1024 * 8,   // 8KB
		WriteBufferSize:   1024 * 8,   // 8KB
		BodyLimit:         512 * 1024, // 512KB
		ReduceMemoryUsage: true,
	})

	engine.Reload(true)

	app.Use(compress.New(compress.Config{
		Level: 2,
	}))

	app.Use(helmet.New())

	staticOpts := fiber.Static{
		//Compress: false,
		Browse: true,
		//MaxAge:        500,
		//CacheDuration: 10 * time.Second * 100,
		ByteRange: true,
	}

	app.Static("/assets/", "./safe-storage/dist/assets", staticOpts)
	//app.Static("/assets/", "./public", staticOpts)
	app.Static("/assets/images/", "./public/images", staticOpts)
	//app.Static("/public/", "./storage/public", staticOpts)
	app.Static("/public/", "./storage/public", staticOpts)
	initRoutes(app)

	log.Fatalln(app.Listen(config.Config.ServerHost))
}
