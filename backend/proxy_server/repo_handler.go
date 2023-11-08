package main

import (
	"fmt"
	"net/http"
	helm_client "yurt_console_backend/helm_client"

	"github.com/gin-gonic/gin"
)

func listRepoHandler(c *gin.Context) {
	rsp, err := helm_client.RepoList()
	if err != nil {
		logger.Warn(c.ClientIP(), "repo list fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("repo list fail: %v", err))
		return
	}

	JSONSuccessWithData(c, "repo list success", rsp.RepoElments)
}

func addRepoHandler(c *gin.Context) {
	requestParas := &struct {
		User
		RepoName string `json:"repo_name"`
		RepoURL  string `json:"repo_url"`
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Warn(c.ClientIP(), "addRepoHandler", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("addRepoHandler: parse parameters fail: %v", err))
		return
	}
	err := helm_client.RepoAdd(&helm_client.RepoAddOptions{
		Name: requestParas.RepoName,
		URL: requestParas.RepoURL,
	})
	if err != nil {
		logger.Warn(c.ClientIP(), "add repo failed", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("add repo failed: %v", err))
		return
	}

	JSONSuccess(c, "add repo success")
}

func updateRepoHandler(c *gin.Context) {
	requestParas := &struct {
		User
		RepoNames []string `json:"repo_names"`
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Warn(c.ClientIP(), "updateRepoHandler", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("updateRepoHandler: parse parameters fail: %v", err))
		return
	}

	err := helm_client.RepoUpdate(&helm_client.RepoUpdateOptions{
		Names: requestParas.RepoNames,
	})
	if err != nil {
		logger.Warn(c.ClientIP(), "update repo failed", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("update repo failed: %v", err))
		return
	}

	JSONSuccess(c, "update repo success")
}

func removeRepoHandler(c *gin.Context) {
	requestParas := &struct {
		User
		RepoNames []string `json:"repo_names"`
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Warn(c.ClientIP(), "removeRepoHandler", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("removeRepoHandler: parse parameters fail: %v", err))
		return
	}

	err := helm_client.RepoRemove(&helm_client.RepoRemoveOptions{
		Names: requestParas.RepoNames,
	})
	if err != nil {
		logger.Warn(c.ClientIP(), "remove repo failed", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("remove repo failed: %v", err))
		return
	}

	JSONSuccess(c, "remove repo success")
}
