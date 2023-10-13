package controller

import (
	"encoding/json"
	"github.com/bitbark/model"
	"github.com/bitbark/util"
	"github.com/gin-gonic/gin"
	_ "golang.org/x/crypto/chacha20poly1305"
	"gorm.io/gorm"
	"net/http"
	"os"
)

type Auth0Subject struct {
	Subject string
}

func RoutesInitialSetup(controllerRoutes *gin.Engine) {

	api := controllerRoutes.Group("/api/initial-setup")
	db := util.DB

	api.POST("/projects/default", validateAPIKey(os.Getenv("AUTH0_ACTION_API_KEY")), func(c *gin.Context) {
		c.Header("Content-Type", "application/json")
		var auth0Subject Auth0Subject
		if err := c.ShouldBindJSON(&auth0Subject); err != nil {
			util.SentryException(err)
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}
		err := createDefaultProject(db, auth0Subject.Subject)
		if err != nil {
			util.SentryException(err)
			c.String(http.StatusBadRequest, "Internal server error.")
			return
		}
		jsonResponse := make(map[string]interface{})
		jsonResponse["content"] = "created"
		responseJSON, _ := json.Marshal(jsonResponse)
		c.String(http.StatusOK, string(responseJSON))
	})

}
func validateAPIKey(apiKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || authHeader != apiKey {
			c.JSON(http.StatusUnauthorized, gin.H{"Content": "unauthorized"})
			c.Abort()
			return
		}
		c.Next()
	}
}
func createDefaultProject(db *gorm.DB, s string) error {
	var projects []model.ProjectItem
	result := db.Where("auth0_subject = ? AND id_by_tenant = ?", s, 0).Find(&projects)
	if result.Error != nil {
		return result.Error
	}
	if len(projects) == 0 {
		var projectItem model.ProjectItem
		projectItem.Auth0Subject = s
		projectItem.IdByTenant = 0
		projectItem.Name = "Default"
		projectItem.Description = "Default"
		result := db.Create(&projectItem)
		if result.Error != nil {
			return result.Error
		}
	}
	return nil
}
