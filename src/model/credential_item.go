package model

import (
	"gorm.io/gorm"
	"time"
)

type CredentialItem struct {
	gorm.Model
	ID            uint   `gorm:"primary_key"`
	IdByTenant    uint   `gorm:"not null"`
	Auth0Subject  string `gorm:"not null"`
	ProjectId     int    `gorm:"not null"`
	Name          string `gorm:"not null"`
	Description   string `default:""`
	Provider      string `gorm:"not null"`
	Account       string `gorm:"not null"`
	SecretKey     string `gorm:"not null"`
	AccessKey     string `gorm:"not null"`
	AccessKeyMask string `gorm:"not null"`
}

type CredentialItemResponse struct {
	IdByTenant    uint
	Name          string
	Description   string
	ProjectName   string
	Provider      string
	Account       string
	AccessKeyMask string
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

func NewCredentialItemResponse(idByTenant uint, accessKeyMask string, name string, description string, provider string, account string, createdAt time.Time, updatedAt time.Time, projectName string) *CredentialItemResponse {
	return &CredentialItemResponse{IdByTenant: idByTenant, AccessKeyMask: accessKeyMask, Name: name, Description: description, Provider: provider, Account: account, CreatedAt: createdAt, UpdatedAt: updatedAt, ProjectName: projectName}
}
