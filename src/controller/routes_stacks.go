package controller

import (
	"encoding/json"
	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/bitbark/engine"
	"github.com/bitbark/model"
	"github.com/bitbark/util"
	"github.com/getsentry/sentry-go"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"sort"
	"time"
)

func RoutesStacks(controllerRoutes *gin.Engine) {

	api := controllerRoutes.Group("/api")
	db := util.DB
	err := db.AutoMigrate(&model.StackItem{})
	if err != nil {
		util.SentryException(err)
	}

	api.POST("/stacks", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		c.Header("Content-Type", "application/json")
		var subject = claims.RegisteredClaims.Subject
		var stackItem model.StackItem
		if err := c.ShouldBindJSON(&stackItem); err != nil {
			util.SentryException(err)
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}
		stackItem.Auth0Subject = subject
		stackItem.IdByTenant, err = latestIdStack(db, subject)
		if err != nil {
			util.SentryException(err)
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}
		stackItem.IdByTenant = stackItem.IdByTenant + uint(1)
		stackItem.CreatedAt = time.Now()
		var projects []model.ProjectItem
		var credentialsItem []model.CredentialItem
		result := db.Where("auth0_subject = ? AND id_by_tenant = ?", subject, stackItem.ProjectId).Find(&projects)
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		} else if len(projects) == 0 {
			sentry.CaptureMessage("Bad request.")
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}
		result = db.Where("auth0_subject = ? AND id_by_tenant = ?", subject, stackItem.CredentialId).Find(&credentialsItem)
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		} else if len(credentialsItem) == 0 {
			sentry.CaptureMessage("Bad request.")
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}
		stackItem.Status = "CREATING"
		stackItem.StatusMessage = "CREATING"
		stackItem.StackName = "bitbark-" + util.ReplaceSpaceWithUnderscore(stackItem.Name) + "-" + util.ReplaceSpaceWithUnderscore(projects[0].Name) + "-" + util.RandomString(5)
		result = db.Create(&stackItem)
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		go func() {
			err, stackId := engine.CreateNewStack(stackItem.StackName, credentialsItem[0].AccessKey, credentialsItem[0].SecretKey, stackItem.Region, stackItem.Template)
			if err != nil {
				result := db.Model(&model.StackItem{}).Where("auth0_subject = ? and id_by_tenant = ?", subject, stackItem.IdByTenant).Updates(map[string]interface{}{"StackId": stackId})
				if result.Error != nil {
					util.SentryException(result.Error)
					c.String(http.StatusInternalServerError, "Internal server error.")
					return
				}
			} else {
				result := db.Model(&model.StackItem{}).Where("auth0_subject = ? and id_by_tenant = ?", subject, stackItem.IdByTenant).Updates(map[string]interface{}{"StackId": stackId})
				if result.Error != nil {
					util.SentryException(result.Error)
					c.String(http.StatusInternalServerError, "Internal server error.")
					return
				}
			}
		}()

		jsonResponse := make(map[string]interface{})
		jsonResponse["message"] = "created"
		responseJSON, _ := json.Marshal(jsonResponse)
		c.String(http.StatusOK, string(responseJSON))
	})

	api.GET("/stacks", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		c.Header("Content-Type", "application/json")
		var subject = claims.RegisteredClaims.Subject
		var stackItems []model.StackItem
		var stackItemsResponse []model.StackItemResponse
		var projects []model.ProjectItem
		var credentialsItem []model.CredentialItem
		result := db.Select("id_by_tenant", "project_id", "name", "description", "credential_id", "template", "template_permissions", "template_properties", "region", "stack_name", "status_message", "status", "updated_at", "created_at").Where("auth0_subject = ?", subject).Find(&stackItems)
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		for _, stackItem := range stackItems {
			result := db.Where("auth0_subject = ? AND id_by_tenant = ?", subject, stackItem.ProjectId).Find(&projects)
			if result.Error != nil {
				util.SentryException(result.Error)
				c.String(http.StatusInternalServerError, "Internal server error.")
				return
			} else if len(projects) == 0 || len(projects) > 1 {
				sentry.CaptureMessage("Bad request.")
				c.String(http.StatusBadRequest, "Bad request.")
				return
			}
			result = db.Where("auth0_subject = ? AND id_by_tenant = ?", subject, stackItem.CredentialId).Find(&credentialsItem)
			if result.Error != nil {
				sentry.CaptureMessage("Bad request.")
				c.String(http.StatusBadRequest, "Bad request.")
				return
			} else if len(credentialsItem) == 0 || len(credentialsItem) > 1 {
				util.SentryException(result.Error)
				c.String(http.StatusInternalServerError, "Internal server error.")
				return
			}

			go func() {
				err, status := engine.RetrieveStatusStack(stackItem.StackName, credentialsItem[0].AccessKey, credentialsItem[0].SecretKey, stackItem.Region)
				if err != nil {
					result := db.Model(&model.StackItem{}).Where("auth0_subject = ? and id_by_tenant = ?", subject, stackItem.IdByTenant).Updates(map[string]interface{}{"Status": "ERROR", "StatusMessage": err.Error()})
					if result.Error != nil {
						util.SentryException(result.Error)
						c.String(http.StatusInternalServerError, "Internal server error.")
						return
					}
				} else {
					result := db.Model(&model.StackItem{}).Where("auth0_subject = ? and id_by_tenant = ?", subject, stackItem.IdByTenant).Updates(map[string]interface{}{"Status": status, "StatusMessage": status})
					if result.Error != nil {
						util.SentryException(result.Error)
						c.String(http.StatusInternalServerError, "Internal server error.")
						return
					}
				}
			}()

			var stackItemResponse = model.NewStackItemResponse(stackItem.IdByTenant, stackItem.Name, stackItem.StackName, stackItem.Description, projects[0].Name, credentialsItem[0].AccessKeyMask, stackItem.Region, stackItem.Template, stackItem.TemplatePermissions, stackItem.TemplateProperties, stackItem.Status, stackItem.StatusMessage, stackItem.CreatedAt, stackItem.UpdatedAt)
			stackItemsResponse = append(stackItemsResponse, *stackItemResponse)
		}
		jsonResponse := make(map[string]interface{})
		jsonResponse["content"] = stackItemsResponse
		responseJSON, _ := json.Marshal(jsonResponse)
		c.String(http.StatusOK, string(responseJSON))
	})

	api.GET("/stacks/:id", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		credentialId := c.Param("id")
		var subject = claims.RegisteredClaims.Subject
		var stackItems []model.StackItem
		var stackItemResponse model.StackItemResponse
		var projects []model.ProjectItem
		var credentialsItem []model.CredentialItem
		result := db.Select("id_by_tenant", "project_id", "name", "description", "credential_id", "template", "template_permissions", "template_properties", "status_message", "status", "updated_at", "created_at").Where("auth0_subject = ? and id_by_tenant = ?", subject, credentialId).Find(&stackItems)
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		if len(stackItems) == 0 {
			sentry.CaptureMessage("Bad request.")
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}

		for _, stackItem := range stackItems {
			result := db.Where("auth0_subject = ? AND id_by_tenant = ?", subject, stackItem.ProjectId).Find(&projects)
			if result.Error != nil {
				util.SentryException(result.Error)
				c.String(http.StatusInternalServerError, "Internal server error.")
				return
			} else if len(projects) == 0 || len(projects) > 1 {
				sentry.CaptureMessage("Bad request.")
				c.String(http.StatusBadRequest, "Bad request.")
				return
			}
			result = db.Where("auth0_subject = ? AND id_by_tenant = ?", subject, stackItem.CredentialId).Find(&credentialsItem)
			if result.Error != nil {
				util.SentryException(result.Error)
				c.String(http.StatusInternalServerError, "Internal server error.")
				return
			} else if len(credentialsItem) == 0 || len(credentialsItem) > 1 {
				sentry.CaptureMessage("Bad request.")
				c.String(http.StatusBadRequest, "Bad request.")
				return
			}
			stackItemResponse.IdByTenant = stackItem.IdByTenant
			stackItemResponse.Name = stackItem.Name
			stackItemResponse.Description = stackItem.Description
			stackItemResponse.ProjectName = projects[0].Name
			stackItemResponse.AccessKeyMask = credentialsItem[0].AccessKeyMask
			stackItemResponse.Template = stackItem.Template
			stackItemResponse.TemplatePermissions = stackItem.TemplatePermissions
			stackItemResponse.TemplateProperties = stackItem.TemplateProperties
			stackItemResponse.Status = stackItem.Status
			stackItemResponse.StatusMessage = stackItem.StatusMessage
			stackItemResponse.CreatedAt = stackItem.CreatedAt
			stackItemResponse.UpdatedAt = stackItem.UpdatedAt

		}
		jsonResponse := make(map[string]interface{})
		jsonResponse["content"] = stackItemResponse
		responseJSON, _ := json.Marshal(jsonResponse)
		c.Header("Content-Type", "application/json")
		c.String(http.StatusOK, string(responseJSON))
	})

	api.PATCH("/stacks/:id", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		stackId := c.Param("id")
		var subject = claims.RegisteredClaims.Subject
		var stackItem model.StackItem
		if err := c.ShouldBindJSON(&stackItem); err != nil {
			util.SentryException(err)
			c.String(http.StatusBadRequest, "Bad request.")
			return
		}
		result := db.Model(&model.StackItem{}).Where("auth0_subject = ? and id_by_tenant = ?", subject, stackId).Update("description", stackItem.Description)
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		jsonResponse := make(map[string]interface{})
		jsonResponse["content"] = "updated"
		responseJSON, _ := json.Marshal(jsonResponse)
		c.Header("Content-Type", "application/json")
		c.String(http.StatusOK, string(responseJSON))
	})

	api.DELETE("/stacks/:id", func(c *gin.Context) {
		claims, _ := c.Request.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		var subject = claims.RegisteredClaims.Subject
		stackID := c.Param("id")
		stack := model.CredentialItem{}
		stack.Auth0Subject = subject
		result := db.Where("auth0_subject = ? AND id_by_tenant = ?", subject, stackID).Delete(&model.StackItem{})
		if result.Error != nil {
			util.SentryException(result.Error)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		jsonResponse := make(map[string]interface{})
		jsonResponse["message"] = "deleted"
		responseJSON, _ := json.Marshal(jsonResponse)
		c.Header("Content-Type", "application/json")
		c.String(http.StatusOK, string(responseJSON))
	})
}

func latestIdStack(db *gorm.DB, s string) (uint, error) {
	var stacks []model.StackItem
	result := db.Where("auth0_subject = ?", s).Find(&stacks)
	if result.Error != nil {
		util.SentryException(result.Error)
		return 0, result.Error
	}
	sort.SliceStable(stacks, func(i, j int) bool {
		return stacks[i].IdByTenant > stacks[j].IdByTenant
	})
	if len(stacks) == 0 {
		return 0, nil
	} else {
		return stacks[0].IdByTenant, nil
	}
}
