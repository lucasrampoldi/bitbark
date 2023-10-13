package controller

import (
	"encoding/json"
	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/bitbark/model"
	"github.com/bitbark/util"
	"github.com/gin-gonic/gin"
	_ "golang.org/x/crypto/chacha20poly1305"
	"net/http"
)

func RoutesDashboards(controllerRoutes *gin.Engine) {

	api := controllerRoutes.Group("/api")
	db := util.DB
	err := db.AutoMigrate(&model.DashboardItem{})
	if err != nil {
		util.SentryException(err)
	}

	api.GET("/dashboards", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		c.Header("Content-Type", "application/json")
		subject := claims.RegisteredClaims.Subject
		var projects []model.ProjectItem
		var stacks []model.StackItem
		var credentials []model.CredentialItem
		var dashboardItem model.DashboardItem
		result := db.Where("auth0_subject = ?", subject).Find(&projects)
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		dashboardItem.TotalProjects = len(projects)
		result = db.Where("auth0_subject = ?", subject).Find(&stacks)
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		dashboardItem.TotalStacks = len(stacks)
		result = db.Where("auth0_subject = ?", subject).Find(&credentials)
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		dashboardItem.TotalCredentials = len(credentials)
		jsonResponse := make(map[string]interface{})
		jsonResponse["content"] = dashboardItem
		responseJSON, _ := json.Marshal(jsonResponse)
		c.String(http.StatusOK, string(responseJSON))
	})
}
