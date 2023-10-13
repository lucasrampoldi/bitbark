package controller

import (
	"encoding/json"
	"errors"
	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/bitbark/model"
	"github.com/bitbark/util"
	"github.com/gin-gonic/gin"
	_ "golang.org/x/crypto/chacha20poly1305"
	"gorm.io/gorm"
	"net/http"
	"os"
	"sort"
	"strings"
)

func RoutesCredentials(controllerRoutes *gin.Engine) {

	api := controllerRoutes.Group("/api")
	db := util.DB
	err := db.AutoMigrate(&model.CredentialItem{})
	if err != nil {
		util.SentryException(err)
	}

	api.POST("/credentials", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		subject := claims.RegisteredClaims.Subject
		c.Header("Content-Type", "application/json")
		var credentialItem model.CredentialItem
		if err := c.ShouldBindJSON(&credentialItem); err != nil {
			util.SentryException(err)
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}
		credentialItem.Auth0Subject = subject
		credentialItem.Provider = "AWS"
		credentialItem.IdByTenant, err = latestIdCredential(db, subject)
		if err != nil {
			util.SentryException(err)
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}
		credentialItem.IdByTenant = credentialItem.IdByTenant + uint(1)
		credentialItem.AccessKeyMask = util.LastFourCharacters(strings.ToUpper(credentialItem.AccessKey))
		secret := os.Getenv("SECRET_CRYPT")
		ciphertext, err := util.EncryptString(secret, strings.ToUpper(credentialItem.AccessKey))
		if err != nil {
			util.SentryException(err)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		credentialItem.AccessKey = ciphertext
		ciphertext, err = util.EncryptString(secret, credentialItem.SecretKey)
		if err != nil {
			util.SentryException(err)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		credentialItem.SecretKey = ciphertext
		var projects []model.ProjectItem
		result := db.Where("auth0_subject = ? AND id_by_tenant = ?", subject, credentialItem.ProjectId).Find(&projects)
		if result.Error != nil {
			util.SentryException(err)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		} else if len(projects) == 0 {
			util.SentryException(errors.New("Bad request."))
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}
		result = db.Create(&credentialItem)
		if result.Error != nil {
			util.SentryException(err)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}

		jsonResponse := make(map[string]interface{})
		jsonResponse["content"] = "created"
		responseJSON, _ := json.Marshal(jsonResponse)
		c.String(http.StatusOK, string(responseJSON))
	})

	api.GET("/credentials", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		c.Header("Content-Type", "application/json")
		var subject = claims.RegisteredClaims.Subject
		var credentialItems []model.CredentialItem
		var credentialItemsResponse []model.CredentialItemResponse
		var projects []model.ProjectItem

		result := db.Select("id_by_tenant", "access_key_mask", "name", "description", "account", "provider", "project_id", "created_at", "updated_at").Where("auth0_subject = ?", subject).Find(&credentialItems)
		if result.Error != nil {
			util.SentryException(err)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		for _, credentialItem := range credentialItems {
			result := db.Where("auth0_subject = ? AND id_by_tenant = ?", subject, credentialItem.ProjectId).Find(&projects)
			if result.Error != nil {
				util.SentryException(err)
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

	api.GET("/credentials/:id", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		credentialId := c.Param("id")
		c.Header("Content-Type", "application/json")
		var subject = claims.RegisteredClaims.Subject
		var credentialItems []model.CredentialItem
		var credentialItemResponse model.CredentialItemResponse
		var projects []model.ProjectItem

		result := db.Select("id_by_tenant", "access_key_mask", "name", "description", "account", "provider", "project_id", "updated_at", "created_at").Where("auth0_subject = ? and id_by_tenant = ?", subject, credentialId).Find(&credentialItems)
		if result.Error != nil {
			util.SentryException(err)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		if len(credentialItems) == 0 {
			util.SentryException(errors.New("Bad request."))
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}

		for _, credentialItem := range credentialItems {
			result := db.Where("auth0_subject = ? AND id_by_tenant = ?", subject, credentialItem.ProjectId).Find(&projects)
			if result.Error != nil {
				util.SentryException(err)
				c.String(http.StatusInternalServerError, "Internal server error.")
				return
			} else if len(projects) == 0 || len(projects) > 1 {
				util.SentryException(errors.New("Bad request."))
				c.String(http.StatusBadRequest, "Bad request.")
				return
			}
			credentialItemResponse.IdByTenant = credentialItem.IdByTenant
			credentialItemResponse.AccessKeyMask = credentialItem.AccessKeyMask
			credentialItemResponse.Name = credentialItem.Name
			credentialItemResponse.Description = credentialItem.Description
			credentialItemResponse.Account = credentialItem.Account
			credentialItemResponse.Provider = credentialItem.Provider
			credentialItemResponse.CreatedAt = credentialItem.CreatedAt
			credentialItemResponse.UpdatedAt = credentialItem.UpdatedAt
			credentialItemResponse.ProjectName = projects[0].Name
		}
		jsonResponse := make(map[string]interface{})
		jsonResponse["content"] = credentialItemResponse
		responseJSON, _ := json.Marshal(jsonResponse)
		c.String(http.StatusOK, string(responseJSON))
	})

	api.PATCH("/credentials/:id", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		credentialId := c.Param("id")
		c.Header("Content-Type", "application/json")
		var subject = claims.RegisteredClaims.Subject
		var credentialItem model.CredentialItem
		if err := c.ShouldBindJSON(&credentialItem); err != nil {
			util.SentryException(errors.New("Bad request."))
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}
		result := db.Model(&model.CredentialItem{}).Where("auth0_subject = ? and id_by_tenant = ?", subject, credentialId).Update("description", credentialItem.Description)
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

	api.DELETE("/credentials/:id", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		var subject = claims.RegisteredClaims.Subject
		credentialID := c.Param("id")
		c.Header("Content-Type", "application/json")
		credential := model.CredentialItem{}
		credential.Auth0Subject = subject

		result := db.Where("auth0_subject = ? AND id_by_tenant = ?", subject, credentialID).Delete(&model.CredentialItem{})
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
}

func latestIdCredential(db *gorm.DB, s string) (uint, error) {
	var credentials []model.CredentialItem
	result := db.Where("auth0_subject = ?", s).Find(&credentials)
	if result.Error != nil {
		util.SentryException(result.Error)
		return 0, result.Error
	}
	sort.SliceStable(credentials, func(i, j int) bool {
		return credentials[i].IdByTenant > credentials[j].IdByTenant
	})
	if len(credentials) == 0 {
		return 0, nil
	} else {
		return credentials[0].IdByTenant, nil
	}
}
