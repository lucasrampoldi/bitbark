package main

import (
	"fmt"
	"github.com/bitbark/util"
	"net/url"
	"os"
	"strconv"
	"time"

	"github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/bitbark/controller"
	"github.com/getsentry/sentry-go"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	adapter "github.com/gwatts/gin-adapter"
	"github.com/joho/godotenv"
)

var sentryEnable, err = strconv.ParseBool(os.Getenv("SENTRY_ENABLE"))

func main() {
	if err := godotenv.Load(); err != nil {
		util.SentryException(err)
		return
	}

	if sentryEnable {
		if err = sentry.Init(sentry.ClientOptions{
			Dsn: os.Getenv("SENTRY_DSN"),
		}); err != nil {
			fmt.Println("Error initializing Sentry:", err)
			return
		}
	}

	if err := setupDatabaseConnection(); err != nil {
		util.SentryException(err)
		return
	}
	router := setupRouter()
	router.Run()
}

func setupDatabaseConnection() error {
	dsn := os.Getenv("MYSQL_USER") + ":" + os.Getenv("MYSQL_PASSWORD") + "@tcp(" + os.Getenv("MYSQL_URL") + ")/" + os.Getenv("MYSQL_DATABASE") + "?parseTime=true"
	_, err := util.InitDB(dsn)
	if err != nil {
		return err
	}
	return nil
}

func setupRouter() *gin.Engine {
	router := gin.Default()
	router.Use(gin.Recovery())
	issuerURL, _ := url.Parse("https://" + os.Getenv("AUTH0_DOMAIN") + "/")
	audience := os.Getenv("AUTH0_AUDIENCE")
	provider := jwks.NewCachingProvider(issuerURL, time.Duration(5*time.Minute))
	jwtValidator, _ := validator.New(provider.KeyFunc,
		validator.RS256,
		issuerURL.String(),
		[]string{audience},
	)

	router.Use(cors.New(cors.Config{
		AllowOrigins:  []string{"http://localhost:4200"},
		AllowMethods:  []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:  []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		ExposeHeaders: []string{"Content-Length"},
		AllowOriginFunc: func(origin string) bool {
			return origin == "http://localhost:4200"
		},
		MaxAge: 12 * time.Hour,
	}))
	controller.RoutesInitialSetup(router)
	router.Use(adapter.Wrap(jwtmiddleware.New(jwtValidator.ValidateToken).CheckJWT))
	controller.RoutesTemplates(router)
	controller.RoutesProjects(router)
	controller.RoutesStacks(router)
	controller.RoutesCredentials(router)
	controller.RoutesDashboards(router)
	controller.RoutesProfile(router)
	return router
}
