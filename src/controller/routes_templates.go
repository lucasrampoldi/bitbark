package controller

import (
	"encoding/json"
	"fmt"
	"github.com/bitbark/model"
	"github.com/bitbark/util"
	"github.com/gin-gonic/gin"
	"github.com/go-git/go-git/v5"
	"gopkg.in/yaml.v3"
	"net/http"
	"os"
)

type Property struct {
	Name         string `yaml:"Name"`
	Description  string `yaml:"Description"`
	Engine       string `yaml:"Engine"`
	EstimateCost string `yaml:"EstimateCost"`
	Provider     string `yaml:"Provider"`
}
type Permission struct {
	ControlAccessService string `yaml:"ControlAccessService"`
	Policy               string `yaml:"Policy"`
}

func RoutesTemplates(controllerRoutes *gin.Engine) {

	api := controllerRoutes.Group("/api")

	api.GET("/templates", func(c *gin.Context) {
		c.Header("Content-Type", "application/json")
		var templates []model.TemplateItem
		dirPath := "/tmp/templates"
		engine := "cloudformation"
		err := os.RemoveAll(dirPath)
		if err != nil {
			util.SentryException(err)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}
		err = cloneRepo()
		if err != nil {
			util.SentryException(err)
			c.String(http.StatusInternalServerError, "Internal server error.")
			return
		}

		fTemplates, err := os.ReadDir(dirPath + "/" + engine)

		for _, fTemplate := range fTemplates {
			var templateItem model.TemplateItem
			var property Property
			var permission Permission

			f, err := os.ReadFile(dirPath + "/" + engine + "/" + fTemplate.Name() + "/properties.yml")
			if err != nil {
				util.SentryException(err)
			}
			yaml.Unmarshal(f, &property)
			templateItem.Name = property.Name
			templateItem.Description = property.Description
			templateItem.Engine = property.Engine
			templateItem.EstimatedCost = property.EstimateCost
			templateItem.Provider = property.Provider

			f, err = os.ReadFile(dirPath + "/" + engine + "/" + fTemplate.Name() + "/template.yml")
			if err != nil {
				util.SentryException(err)
			}
			templateItem.Template = string(f[:])

			f, err = os.ReadFile(dirPath + "/" + engine + "/" + fTemplate.Name() + "/permissions.yml")
			if err != nil {
				util.SentryException(err)
			}
			yaml.Unmarshal(f, &permission)
			templateItem.ControlAccessService = permission.ControlAccessService
			templateItem.Policy = permission.Policy

			if templateItem.Name != "" && templateItem.Template != "" && templateItem.Policy != "" {
				templates = append(templates, templateItem)
			}
		}

		jsonResponse := make(map[string]interface{})
		jsonResponse["content"] = templates
		responseJSON, _ := json.Marshal(jsonResponse)
		c.String(http.StatusOK, string(responseJSON))
	})
}

func cloneRepo() error {
	_, err := git.PlainClone("/tmp/templates", false, &git.CloneOptions{
		URL:      os.Getenv("GITHUB_TEMPLATE_REPOSITORY"),
		Progress: os.Stdout,
	})
	if err != nil {
		return err
	}
	return nil
}

func pullRepo() {
	r, err := git.PlainOpen("/tmp/templates")
	fmt.Println(err)

	w, err := r.Worktree()
	fmt.Println(err)

	err = w.Pull(&git.PullOptions{RemoteName: "origin"})
	fmt.Println(err)
}
