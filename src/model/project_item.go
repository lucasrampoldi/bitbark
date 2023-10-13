package model

import (
	"gorm.io/gorm"
	"time"
)

type ProjectItem struct {
	gorm.Model
	ID           uint   `gorm:"primary_key"`
	IdByTenant   uint   `gorm:"not null"`
	Auth0Subject string `gorm:"not null"`
	Name         string `gorm:"not null"`
	Description  string `default:""`
}
type ProjectItemResponse struct {
	IdByTenant  uint
	Name        string
	Description string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func NewProjectItemResponse(idByTenant uint, name string, description string, createdAt time.Time, updatedAt time.Time) *ProjectItemResponse {
	return &ProjectItemResponse{IdByTenant: idByTenant, Name: name, Description: description, CreatedAt: createdAt, UpdatedAt: updatedAt}
}
