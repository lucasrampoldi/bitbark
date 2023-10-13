package controller

import (
	"context"
	"encoding/json"
	"github.com/auth0/go-auth0/management"
	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/bitbark/model"
	"github.com/bitbark/util"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "golang.org/x/crypto/chacha20poly1305"
	"net/http"
	"os"
)

func RoutesProfile(controllerRoutes *gin.Engine) {

	api := controllerRoutes.Group("/api")
	db := util.DB
	if err := godotenv.Load(); err != nil {
		util.SentryException(err)
		return
	}
	api.DELETE("/profile", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		subject := claims.RegisteredClaims.Subject
		c.Header("Content-Type", "application/json")
		domain := os.Getenv("AUTH0_DOMAIN")
		clientID := os.Getenv("AUTH0_CLIENT_ID_BACKEND")
		clientSecret := os.Getenv("AUTH0_CLIENT_SECRET_BACKEND")

		//delete data for this subject
		result := db.Where("auth0_subject = ?", subject).Delete(&model.CredentialItem{})
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		result = db.Where("auth0_subject = ?", subject).Delete(&model.StackItem{})
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		result = db.Where("auth0_subject = ?", subject).Delete(&model.ProjectItem{})
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}

		auth0API, err := management.New(
			domain,
			management.WithClientCredentials(context.Background(), clientID, clientSecret),
		)
		if err != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}

		err = auth0API.User.Delete(context.Background(), subject)
		if err != nil {
			util.SentryException(err)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}

		jsonResponse := make(map[string]interface{})
		jsonResponse["content"] = "deleted"
		responseJSON, _ := json.Marshal(jsonResponse)
		c.String(http.StatusOK, string(responseJSON))
	})

}
