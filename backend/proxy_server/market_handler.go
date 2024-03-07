package main

import (
	"fmt"
	"net/http"
	"strings"
	helm_client "yurt_console_backend/helm_client"

	"github.com/gin-gonic/gin"
)

const HELM_DEFAULT_NAMESPACE = "default"

func helmListHandler(c *gin.Context) {
	res, err := helm_client.List(&helm_client.ListReleaseOptions{
		Namespace: HELM_DEFAULT_NAMESPACE,
		ShowOptions: helm_client.ListShowOptions{
			ShowAll: true,
		},
	})
	if err != nil {
		logger.Warn(c.ClientIP(), "helm list fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("helm list fail: %v", err))
		return
	}

	JSONSuccessWithData(c, "helm list ok", res)
}

func helmUninstallHandler(c *gin.Context) {
	requestParas := &struct {
		User
		ReleaseNames []string `json:"release_names"`
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Warn(c.ClientIP(), "parse request paras fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("helmUninstallHandler: parse parameters fail: %v", err))
		return
	}
	if err := helm_client.Uninstall(&helm_client.UninstallOptions{
		Namespace: HELM_DEFAULT_NAMESPACE,
		Names:     requestParas.ReleaseNames,
	}); err != nil {
		logger.Warn(c.ClientIP(), "helm uninstall fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("helmUninstallHandler: helm uninstall fail: %v", err))
		return
	}

	logger.Info(HELM_DEFAULT_NAMESPACE, fmt.Sprintf("helm uninstall successsfully: %s", strings.Join(requestParas.ReleaseNames, ",")))
	JSONSuccess(c, fmt.Sprintf("helm uninstall successsfully: %s", strings.Join(requestParas.ReleaseNames, ",")))
}

func helmInstallHandler(c *gin.Context) {
	requestParas := &struct {
		User
		ReleaseName    string `json:"release_name"`
		RepoName       string `json:"repo_name"`
		Version        string `json:"version"`
		PackageName    string `json:"package_name"`
		InstallFromHub bool   `json:"install_from_hub"`
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Warn(c.ClientIP(), "parse request paras fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("helmInstallHandler: parse parameters fail: %v", err))
		return // parse failed, then abort
	}

	if requestParas.InstallFromHub {
		if err := helm_client.InstallHubPackage(&helm_client.HubInstallOptions{
			ReleaseName: requestParas.ReleaseName,
			RepoName:    requestParas.RepoName,
			Version:     requestParas.Version,
			PackageName: requestParas.PackageName,
			Namespace:   HELM_DEFAULT_NAMESPACE,
		}); err != nil {
			logger.Warn(c.ClientIP(), "helm install hub package fail", err.Error())
			JSONErr(c, http.StatusBadRequest, fmt.Sprintf("helmInstallHandler: helm install fail: %v", err))
			return
		}
	} else {
		if err := helm_client.Install(&helm_client.InstallOptions{
			Namespace:   HELM_DEFAULT_NAMESPACE,
			ReleaseName: requestParas.ReleaseName,
			ChartString: requestParas.RepoName + "/" + requestParas.PackageName,
			Version:     requestParas.Version,
		}); err != nil {
			logger.Warn(c.ClientIP(), "helm install repo package fail", err.Error())
			JSONErr(c, http.StatusBadRequest, fmt.Sprintf("helmInstallHandler: helm install fail: %v", err))
			return
		}
	}

	logger.Info(HELM_DEFAULT_NAMESPACE, fmt.Sprintf("helm install package %s successsfully", requestParas.PackageName))
	JSONSuccess(c, fmt.Sprintf("helm install %s successsfully", requestParas.PackageName))
}

type helmChartVersion struct {
	Version    string `json:"version"`
	AppVersion string `json:"app_version"`
}

type helmSearchElemnet struct {
	Name            string `json:"name"`
	RepoName        string `json:"repo_name"`
	RepoDisplayName string `json:"repo_display_name"`
	Description     string `json:"description"`
	Version         string `json:"version"`
	AppVersion      string `json:"app_version"`
	ImageURL        string `json:"image_url"`

	// only for repo search
	AvailableVersions []helmChartVersion `json:"available_versions"`
}

type helmSearchRes struct {
	Elements    []helmSearchElemnet `json:"elements"`
	TotalResNum int                 `json:"total"`
}

func helmSearchHubHandler(c *gin.Context) {
	requestParas := &struct {
		User
		SearchName string `json:"search_name"`
		Limit      int    `json:"limit"`
		Offset     int    `json:"offset"`
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Warn(c.ClientIP(), "parse request paras fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("helmSearchHubHandler: parse parameters fail: %v", err))
		return // parse failed, then abort
	}

	res, err := helm_client.SearchHub(&helm_client.HubSearchOptions{
		Name:   requestParas.SearchName,
		Limit:  requestParas.Limit,
		Offset: requestParas.Offset,
	})
	if err != nil {
		logger.Warn(c.ClientIP(), "helm search hub package fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("helmSearchHubHandler: helm search fail: %v", err))
		return
	}

	var searchRes helmSearchRes
	searchRes.Elements = []helmSearchElemnet{}
	for _, one := range res.HubSearchElements {
		newElement := helmSearchElemnet{
			Name:            one.NormalizedName,
			RepoName:        one.Repo.Name,
			RepoDisplayName: one.Repo.DisplayName,
			Description:     one.Description,
			Version:         one.Version,
			AppVersion:      one.AppVersion,
		}
		if one.ImageID != "" {
			newElement.ImageURL = fmt.Sprintf("https://artifacthub.io/image/%s@2x", one.ImageID)
		}
		searchRes.Elements = append(searchRes.Elements, newElement)
	}
	for _, facet := range res.HubSearchFacets {
		if facet.Title == "Kind" {
			for _, option := range facet.Options {
				if option.ID == 0 {
					searchRes.TotalResNum = option.Total
					break
				}
			}
		}
	}
	if searchRes.TotalResNum == 0 {
		searchRes.TotalResNum = requestParas.Offset + len(searchRes.Elements)
	}

	JSONSuccessWithData(c, "helm search hub success", searchRes)
}

func helmSearchRepoHandler(c *gin.Context) {
	requestParas := &struct {
		User
		SearchNames []string `json:"search_names"`
		RepoNames   []string `json:"repo_names"`
		Version     string   `json:"version"`
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Warn(c.ClientIP(), "parse request paras fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("helmSearchRepoHandler: parse parameters fail: %v", err))
		return // parse failed, then abort
	}

	res, err := helm_client.SearchRepo(&helm_client.RepoSearchOptions{
		RepoNames: requestParas.RepoNames,
		Names:     requestParas.SearchNames,
		Version:   requestParas.Version,
	})
	if err != nil {
		logger.Warn(c.ClientIP(), "helm search repo package fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("helmSearchRepoHandler: helm search fail: %v", err))
		return
	}

	var searchRes helmSearchRes
	searchRes.Elements = []helmSearchElemnet{}
	chartAvailableVersions := map[string][]helmChartVersion{}
	for _, one := range res.RepoSearchElements {
		if _, ok := chartAvailableVersions[one.ChartName]; ok {
			chartAvailableVersions[one.ChartName] = append(chartAvailableVersions[one.ChartName], helmChartVersion{
				Version:    one.Version,
				AppVersion: one.AppVersion,
			})
		} else {
			newElement := helmSearchElemnet{
				Name:        one.ChartName,
				Description: one.Description,
				Version:     one.Version,
				AppVersion:  one.AppVersion,
			}
			reponames := strings.Split(one.Name, "/")
			if len(reponames) > 0 {
				newElement.RepoName = reponames[0]
				newElement.RepoDisplayName = newElement.RepoName
			}
			searchRes.Elements = append(searchRes.Elements, newElement)

			chartAvailableVersions[one.ChartName] = []helmChartVersion{{
				Version:    one.Version,
				AppVersion: one.AppVersion,
			}}
		}
	}

	for i := range searchRes.Elements {
		one := &searchRes.Elements[i]
		one.AvailableVersions = chartAvailableVersions[one.Name]
	}

	searchRes.TotalResNum = len(searchRes.Elements)
	JSONSuccessWithData(c, "helm search repo success", searchRes)
}

func helmDetailHubHandler(c *gin.Context) {
	requestParas := &struct {
		User
		RepoName    string `json:"repo_name"`
		PackageName string `json:"package_name"`
		Version     string `json:"version"`
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Warn(c.ClientIP(), "parse request paras fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("helmDetailHubHandler: parse parameters fail: %v", err))
		return // parse failed, then abort
	}

	res, err := helm_client.DetailHub(&helm_client.HubDetailOptions{
		RepoName:    requestParas.RepoName,
		PackageName: requestParas.PackageName,
		Version:     requestParas.Version,
	})
	if err != nil {
		logger.Warn(c.ClientIP(), "helm detail hub package fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("helmDetailHubHandler: helm detail fail: %v", err))
		return
	}
	JSONSuccessWithData(c, "helm detail hub success", res)
}

func helmGetHubValueHandler(c *gin.Context) {
	requestParas := &struct {
		User
		ID      string `json:"package_id"`
		Version string `json:"version"`
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Warn(c.ClientIP(), "parse request paras fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("helmGetHubValueHandler: parse parameters fail: %v", err))
		return // parse failed, then abort
	}

	res, err := helm_client.GetHubValue(&helm_client.HubGetValueOptions{
		ID:      requestParas.ID,
		Version: requestParas.Version,
	})
	if err != nil {
		logger.Warn(c.ClientIP(), "helm get hub package value fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("helmGetHubValueHandler: helm value fail: %v", err))
		return
	}
	JSONSuccessWithData(c, "helm get hub package value success", res)
}

func helmGetRepoValueHandler(c *gin.Context) {
	requestParas := &struct {
		User
		Name     string `json:"name"`
		RepoName string `json:"repo_name"`
		Version  string `json:"version"`
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Error(c.ClientIP(), "helmGetRepoValueHandler, fail to parse request parameter:", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("helmGetRepoValueHandler: parse parameters fail: %v", err))
		return
	}

	defConfig, err := helm_client.ShowValues(&helm_client.ShowOptions{
		ChartString: requestParas.RepoName + "/" + requestParas.Name,
		Version:     requestParas.Version,
	})
	if err != nil {
		logger.Error(c.ClientIP(), "helmGetRepoValueHandler, get chart values error:", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("helmGetRepoValueHandler: get chart values error: %s", err))
		return
	}

	JSONSuccessWithData(c, "get repo default config success", defConfig)
}
