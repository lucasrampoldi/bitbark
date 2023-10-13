package model

import (
	"gorm.io/gorm"
	"time"
)

type StackItem struct {
	gorm.Model
	ID                  uint   `gorm:"primary_key"`
	IdByTenant          uint   `gorm:"not null"`
	Auth0Subject        string `gorm:"not null"`
	Name                string `gorm:"not null"`
	Description         string `default:""`
	ProjectId           int    `gorm:"not null"`
	CredentialId        int    `gorm:"not null"`
	Template            string `default:""`
	TemplatePermissions string `default:""`
	TemplateProperties  string `default:""`
	Status              string `default:"Creating"`
	StatusMessage       string `default:""`
	//AWS
	Region    string `default:""`
	StackName string `gorm:"not null"`
	StackId   string `gorm:"not null"`
}

type StackItemResponse struct {
	IdByTenant          uint
	Name                string
	Description         string
	ProjectName         string
	Region              string
	Template            string
	TemplatePermissions string
	TemplateProperties  string
	Status              string
	StatusMessage       string
	CreatedAt           time.Time
	UpdatedAt           time.Time
	//AWS
	StackName     string
	AccessKeyMask string
}

func NewStackItemResponse(idByTenant uint, name string, stackName string, description string, projectName string, accessKeyMask string, region string, template string, templatePermissions string, templateProperties string, status string, statusMessage string, createdAt time.Time, updatedAt time.Time) *StackItemResponse {
	return &StackItemResponse{IdByTenant: idByTenant, Name: name, StackName: stackName, Description: description, ProjectName: projectName, AccessKeyMask: accessKeyMask, Region: region, Template: template, TemplatePermissions: templatePermissions, TemplateProperties: templateProperties, Status: status, StatusMessage: statusMessage, CreatedAt: createdAt, UpdatedAt: updatedAt}
}
