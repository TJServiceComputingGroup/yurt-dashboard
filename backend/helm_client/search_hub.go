package helm_client

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"net/url"
	"path"

	"github.com/google/go-querystring/query"
)

const HelmHubURL = "https://artifacthub.io/api/v1/packages"

type HubSearchElementRepo struct {
	URL         string `json:"url"`				// repo url
	Name        string `json:"name"`			// repo name
	DisplayName string `json:"display_name"`	// display-only name
}

type HubSearchAvailableVersion struct {
	Version string `json:"version"`
}

type HubSearchElement struct {
	ID                string                      `json:"package_id"`
	Name              string                      `json:"name"`
	NormalizedName    string                      `json:"normalized_name"`
	ImageID           string                      `json:"logo_image_id"`		// Get the icon by URL:https://artifacthub.io/image/{ImageID}@2x
	Description       string                      `json:"description"`
	Version           string                      `json:"version"`
	AppVersion        string                      `json:"app_version"`
	ContentURL        string                      `json:"content_url"`			// The direct download address of the specified version of the hub chart package. Only for valueHub.
	AvailableVersions []HubSearchAvailableVersion `json:"available_versions"`	// A list of available versions of a search result. Only for valueHub
	Repo              HubSearchElementRepo        `json:"repository"`
}

type HubSearchFacetOption struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Total int    `json:"total"`
}

type HubSearchFacet struct {
	Title     string                 `json:"title"`
	FilterKey string                 `json:"filter_key"`
	Options   []HubSearchFacetOption `json:"options"`
}

type HubSearchRsp struct {
	HubSearchElements []HubSearchElement `json:"packages"`
	HubSearchFacets   []HubSearchFacet   `json:"facets"`
}

type HubSearchOptions struct {
	Name   string `json:"name"`
	Limit  int    `json:"limit"`
	Offset int    `json:"offset"`
}

type HubDetailOptions struct {
	RepoName    string `json:"repo_name"`
	PackageName string `json:"package_name"`
	Version     string `json:"version"`
}

type HubGetValueOptions struct {
	ID      string `json:"package_id"`
	Version string `json:"version"`
}

// Search results from the hub based on keywords
func (c *baseClient) searchHub(o *HubSearchOptions) (*HubSearchRsp, error) {
	searchURL, err := url.Parse(HelmHubURL)
	if err != nil {
		return nil, err
	}
	searchURL.Path = path.Join(searchURL.Path, "search")
	v, err := query.Values(struct {
		Name       string `url:"ts_query_web"`
		Limit      int    `url:"limit"`
		Offset     int    `url:"offset"`
		Facets     bool   `url:"facets"`
		Sort       string `url:"sort"`
		Kind       int    `url:"kind"`
		Deprecated bool   `url:"deprecated"`
	}{
		o.Name,
		o.Limit,
		o.Offset,
		true,
		"relevance",
		0,
		false})
	if err != nil {
		return nil, err
	}
	searchURL.RawQuery = v.Encode()
	req, err := http.NewRequest(http.MethodGet, searchURL.String(), nil)
	if err != nil {
		return nil, err
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		return nil, errors.New("search request get error code")
	}

	result := &HubSearchRsp{}
	json.NewDecoder(res.Body).Decode(result)
	return result, nil
}

// Get more detailed information about a search result
func (c *baseClient) detailHub(o *HubDetailOptions) (*HubSearchElement, error) {
	valueURL, err := url.Parse(HelmHubURL)
	if err != nil {
		return nil, err
	}
	valueURL.Path = path.Join(valueURL.Path, "helm", o.RepoName, o.PackageName)
	if o.Version != "" {
		valueURL.Path = path.Join(valueURL.Path, o.Version)
	}

	req, err := http.NewRequest(http.MethodGet, valueURL.String(), nil)
	if err != nil {
		return nil, err
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		return nil, errors.New("value request get error code")
	}

	result := &HubSearchElement{}
	json.NewDecoder(res.Body).Decode(result)
	return result, nil
}

func (c *baseClient) getHubChartValue(o *HubGetValueOptions) (string, error) {
	valueURL, err := url.Parse(HelmHubURL)
	if err != nil {
		return "", err
	}
	valueURL.Path = path.Join(valueURL.Path, o.ID, o.Version, "values")

	req, err := http.NewRequest(http.MethodGet, valueURL.String(), nil)
	if err != nil {
		return "", err
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		return "", errors.New("value request get error code")
	}

	content, err := ioutil.ReadAll(res.Body)
	return string(content), nil
}
