package controller

import (
	"encoding/json"
	"errors"
	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/bitbark/model"
	"github.com/bitbark/util"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"sort"
	"strconv"
)

func RoutesProjects(controllerRoutes *gin.Engine) {

	api := controllerRoutes.Group("/api")
	db := util.DB
	err := db.AutoMigrate(&model.ProjectItem{})
	if err != nil {
		util.SentryException(err)
	}

	api.POST("/projects", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		subject := claims.RegisteredClaims.Subject
		c.Header("Content-Type", "application/json")
		var projectItem model.ProjectItem
		if err := c.ShouldBindJSON(&projectItem); err != nil {
			util.SentryException(err)
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}
		projectItem.Auth0Subject = subject
		projectItem.IdByTenant, err = latestIdProjects(db, subject)
		if err != nil {
			util.SentryException(err)
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}
		projectItem.IdByTenant = projectItem.IdByTenant + uint(1)
		result := db.Create(&projectItem)
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		jsonResponse := make(map[string]interface{})
		jsonResponse["content"] = "created"
		responseJSON, _ := json.Marshal(jsonResponse)
		c.String(http.StatusOK, string(responseJSON))
	})

	api.GET("/projects", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		c.Header("Content-Type", "application/json")
		var subject = claims.RegisteredClaims.Subject
		var projectItems []model.ProjectItem
		var projectItemsResponse []model.ProjectItemResponse
		result := db.Select("id_by_tenant", "name", "description", "updated_at", "created_at").Where("auth0_subject = ?", subject).Find(&projectItems)
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		for _, projectItem := range projectItems {
			var projectItemResponse = model.NewProjectItemResponse(projectItem.IdByTenant, projectItem.Name, projectItem.Description, projectItem.CreatedAt, projectItem.UpdatedAt)
			projectItemsResponse = append(projectItemsResponse, *projectItemResponse)
		}
		jsonResponse := make(map[string]interface{})
		jsonResponse["content"] = projectItemsResponse
		responseJSON, _ := json.Marshal(jsonResponse)
		c.String(http.StatusOK, string(responseJSON))
	})

	api.GET("/projects/:id", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		projectId := c.Param("id")
		c.Header("Content-Type", "application/json")
		var subject = claims.RegisteredClaims.Subject
		var projectItems []model.ProjectItem
		var projectItemResponse model.ProjectItemResponse
		result := db.Select("id_by_tenant", "name", "description", "updated_at", "created_at").Where("auth0_subject = ? and id_by_tenant = ?", subject, projectId).Find(&projectItems)
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		if len(projectItems) == 0 {
			util.SentryException(errors.New("Bad request."))
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}
		for _, projectItem := range projectItems {
			projectItemResponse.IdByTenant = projectItem.IdByTenant
			projectItemResponse.Name = projectItem.Name
			projectItemResponse.Description = projectItem.Description
			projectItemResponse.CreatedAt = projectItem.CreatedAt
			projectItemResponse.UpdatedAt = projectItem.UpdatedAt
		}
		jsonResponse := make(map[string]interface{})
		jsonResponse["content"] = projectItemResponse
		responseJSON, _ := json.Marshal(jsonResponse)
		c.String(http.StatusOK, string(responseJSON))
	})

	api.PATCH("/projects/:id", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		projectId := c.Param("id")
		c.Header("Content-Type", "application/json")
		var subject = claims.RegisteredClaims.Subject
		var projectItem model.ProjectItem
		if err := c.ShouldBindJSON(&projectItem); err != nil {
			util.SentryException(errors.New("Bad request."))
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}
		result := db.Model(&model.ProjectItem{}).Where("auth0_subject = ? and id_by_tenant = ?", subject, projectId).Update("description", projectItem.Description)
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		jsonResponse := make(map[string]interface{})
		jsonResponse["content"] = "updated"
		responseJSON, _ := json.Marshal(jsonResponse)
		c.String(http.StatusOK, string(responseJSON))
	})

	api.DELETE("/projects/:id", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		var subject = claims.RegisteredClaims.Subject
		projectId := c.Param("id")
		c.Header("Content-Type", "application/json")
		i, _ := strconv.Atoi(projectId)
		if i == 0 {
			util.SentryException(errors.New("Bad request."))
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}
		var stacks []model.StackItem
		result := db.Where("auth0_subject = ? AND project_id = ?", subject, projectId).Find(&stacks)
		if result.Error != nil || len(stacks) > 0 {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		result = db.Where("auth0_subject = ? AND id_by_tenant = ?", subject, projectId).Delete(&model.ProjectItem{})
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		jsonResponse := make(map[string]interface{})
		jsonResponse["content"] = "deleted"
		responseJSON, _ := json.Marshal(jsonResponse)
		c.String(http.StatusOK, string(responseJSON))
	})

	api.GET("/projects/:id/credentials", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		var subject = claims.RegisteredClaims.Subject
		projectId := c.Param("id")
		c.Header("Content-Type", "application/json")
		var credentialItems []model.CredentialItem
		var credentialItemsResponse []model.CredentialItemResponse
		var projects []model.ProjectItem
		result := db.Where("auth0_subject = ? AND project_id = ?", subject, projectId).Find(&credentialItems)
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		for _, credentialItem := range credentialItems {
			result := db.Where("auth0_subject = ? AND id_by_tenant = ?", subject, credentialItem.ProjectId).Find(&projects)
			if result.Error != nil {
				util.SentryException(result.Error)
				c.String(http.StatusInternalServerError, "Internal server error.")
				return
			} else if len(projects) == 0 || len(projects) > 1 {
				util.SentryException(errors.New("Bad request."))
				c.String(http.StatusBadRequest, "Bad request.")
				return
			}
			var credentialItemResponse = model.NewCredentialItemResponse(credentialItem.IdByTenant, credentialItem.AccessKeyMask, credentialItem.Name, credentialItem.Description, credentialItem.Provider, credentialItem.Account, credentialItem.CreatedAt, credentialItem.UpdatedAt, projects[0].Name)
			credentialItemsResponse = append(credentialItemsResponse, *credentialItemResponse)
		}
		jsonResponse := make(map[string]interface{})
		jsonResponse["content"] = credentialItemsResponse
		responseJSON, _ := json.Marshal(jsonResponse)
		c.String(http.StatusOK, string(responseJSON))
	})
}

func latestIdProjects(db *gorm.DB, s string) (uint, error) {
	var projects []model.ProjectItem
	result := db.Where("auth0_subject = ? AND id_by_tenant != ?", s, 0).Find(&projects)
	if result.Error != nil {
		util.SentryException(result.Error)
		return 0, result.Error
	}
	sort.SliceStable(projects, func(i, j int) bool {
		return projects[i].IdByTenant > projects[j].IdByTenant
	})
	if len(projects) == 0 {
		return 0, nil
	} else {
		return projects[0].IdByTenant, nil
	}
}
