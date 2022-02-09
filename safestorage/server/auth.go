package server

import (
	"SafeModeStorage/config"
	"fmt"
	"github.com/gofiber/fiber/v2"
	jwtware "github.com/gofiber/jwt/v3"
	"github.com/golang-jwt/jwt/v4"
)

func CtxIsValidUser(c *fiber.Ctx) (bool, config.SUser) {
	coo := c.Cookies("perm", "")
	if len(coo) <= 100 || len(coo) >= 140 {
		return false, config.SUser{}
	}

	token, err := jwt.Parse(coo, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return false, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(config.Config.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		fmt.Println(err.Error())
		return false, config.SUser{}
	}

	ok, usr := validateToken(token.Claims.(jwt.MapClaims))
	return ok, usr
}

func protectRoute() fiber.Handler {
	return jwtware.New(jwtware.Config{
		SigningKey:  []byte(config.Config.JWTSecret),
		TokenLookup: "cookie:perm",
		SuccessHandler: func(ctx *fiber.Ctx) error {
			user := ctx.Locals("user").(*jwt.Token)
			claims := user.Claims.(jwt.MapClaims)
			exists, usr := validateToken(claims)
			if !exists {
				ctx.ClearCookie("perm")
				return ctx.Status(fiber.StatusUnauthorized).Redirect("/login")
			}
			ctx.Locals("user", usr)
			return ctx.Next()
		},
		ErrorHandler: func(ctx *fiber.Ctx, err error) error {
			return ctx.Status(fiber.StatusForbidden).Redirect("/login")
		},
	})
}

func validateToken(claims jwt.MapClaims) (bool, config.SUser) {
	login, lEx := claims["login"].(string)
	pass, pEx := claims["pass"].(string)
	user, exists := config.Config.Users[login]
	if !exists || !lEx || !pEx {
		return false, config.SUser{}
	}
	return user.Pass == pass, user
}

func loginPage(ctx *fiber.Ctx) error {
	if ok, _ := CtxIsValidUser(ctx); ok {
		return ctx.Status(fiber.StatusOK).Redirect("/")
	}
	return ctx.Render("unauthed", fiber.Map{}, "layouts/unauthed")
}

func loginPost(ctx *fiber.Ctx) error {

	var (
		login    string
		password string
	)
	login = ctx.FormValue("_user", "")
	password = ctx.FormValue("_pass", "")

	if u, ok := config.Config.Users[login]; !ok || u.Pass != password {
		return ctx.Render("unauthed", fiber.Map{}, "layouts/unauthed")
	}

	claims := jwt.MapClaims{
		"login": login,
		"pass":  password,
	}

	tk := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	token, err := tk.SignedString([]byte(config.Config.JWTSecret))
	if err != nil {
		return ctx.Render("unauthed", fiber.Map{}, "layouts/unauthed")
	}

	ctx.Cookie(&fiber.Cookie{
		Name:  "perm",
		Value: token,
	})

	return ctx.Status(200).Redirect("/")

}
