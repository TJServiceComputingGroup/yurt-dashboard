import { Select, Typography } from "antd";
import { Input, Button, List, Card, Popover, Avatar } from "antd";
import { useEffect, useState } from "react";
import { sendUserRequest } from "../../utils/request";
import HubInstallModal from "./Modals/HubInstall";
import RepoInstallModal from "./Modals/RepoInstall";
import { SearchOutlined } from "@ant-design/icons";

const { Paragraph } = Typography;
const { Meta } = Card;

export default function HelmMarket() {
  const pageSize = 12;
  const [inputValue, setInputValue] = useState("");
  const [selectSearchHub, setSelectSearchHub] = useState(true);
  const [curSearchInputValue, setCurSearchInputValue] = useState("");
  const [isCurSearchHub, setIsCurSearchHub] = useState(true);

  const [searchData, setSearchData] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [totalNum, setTotalNum] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    doSearch();
  }, []);

  // modal
  const [modalConfig, setModalConfig] = useState({});
  const [isHubInstallModalVisible, setHubInstallModalVisible] = useState(false);
  const [isRepoInstallModalVisible, setRepoInstallModalVisible] =
    useState(false);
  const openModal = (item) => {
    setModalConfig(item);
    if (isCurSearchHub) {
      setHubInstallModalVisible(true);
    } else {
      setRepoInstallModalVisible(true);
    }
  };

  const onSearchEnd = (data) => {
    setSearchLoading(false);

    setCurSearchInputValue(inputValue);
    setIsCurSearchHub(selectSearchHub);
    setSearchData(data.elements.map(transformSearchData));
    setTotalNum(data.total);
    setCurrentPage(1);
  };

  const onChangePageEnd = (page, data) => {
    setSearchLoading(false);

    setSearchData(data.elements.map(transformSearchData));
    setTotalNum(data.total);
    setCurrentPage(page);
  };

  const doSearch = () => {
    setSearchLoading(true);
    if (selectSearchHub) {
      sendUserRequest("/helm/searchHub", {
        search_name: inputValue,
        limit: pageSize,
        offset: 0,
      }).then((res) => {
        onSearchEnd(res.data);
      });
    } else {
      sendUserRequest("/helm/searchRepo", {
        search_names: [inputValue],
        RepoNames: [],
        Version: "",
      }).then((res) => {
        onSearchEnd(res.data);
      });
    }
  };

  const changePage = (page) => {
    setSearchLoading(true);
    if (isCurSearchHub) {
      sendUserRequest("/helm/searchHub", {
        search_name: curSearchInputValue,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }).then((res) => {
        onChangePageEnd(page, res.data);
      });
    } else {
      sendUserRequest("/helm/searchRepo", {
        search_names: [curSearchInputValue],
        RepoNames: [],
        Version: "",
      }).then((res) => {
        onChangePageEnd(page, res.data);
      });
    }
  };

  return (
    <div>
      <div>
        <h2>应用市场</h2>
        <Paragraph>
          <blockquote>一键部署应用程序到集群。</blockquote>
        </Paragraph>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Select
            style={{ width: 100 }}
            size="large"
            defaultValue="hub"
            options={[
              { label: "Hub", value: "hub" },
              { label: "Repo", value: "repo" },
            ]}
            onChange={(value) => {
              if (value === "hub") {
                setSelectSearchHub(true);
              } else {
                setSelectSearchHub(false);
              }
            }}
          />
          <Input
            placeholder="search package"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ width: 400, marginLeft: 10 }}
            onPressEnter={() => {
              doSearch();
            }}
            suffix={
              <Button
                type="text"
                icon={<SearchOutlined />}
                loading={searchLoading}
                onClick={() => {
                  doSearch();
                }}
              />
            }
          />
        </div>
      </div>

      <div>
        <List
          style={{ margin: 10 }}
          grid={{ sm: 1, md: 1, lg: 2, xl: 3, column: 4, gutter: 10 }}
          dataSource={!!searchData ? searchData : []}
          loading={!searchData}
          rowKey="key"
          pagination={{
            current: currentPage,
            onChange: (page) => {
              changePage(page);
            },
            defaultPageSize: pageSize,
            showSizeChanger: false,
            total: totalNum,
          }}
          renderItem={(data) => (
            <List.Item>
              <Card
                style={{ maxWidth: 400, height: 150 }}
                hoverable
                onClick={() => {
                  openModal(data);
                }}
              >
                <Meta
                  avatar={!!data.image_url && <Avatar src={data.image_url} />}
                  title={data.name}
                  description={
                    <Popover
                      overlayStyle={{ width: "400px", height: "auto" }}
                      title={data.name}
                      content={data.description}
                      mouseEnterDelay={1}
                    >
                      <div
                        style={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {data.description === ""
                          ? "No description"
                          : data.description}
                      </div>
                    </Popover>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </div>
      <HubInstallModal
        initData={modalConfig}
        visible={isHubInstallModalVisible}
        onClose={() => {
          setHubInstallModalVisible(false);
        }}
      />
      <RepoInstallModal
        initData={modalConfig}
        visible={isRepoInstallModalVisible}
        onClose={() => {
          setRepoInstallModalVisible(false);
        }}
      />
    </div>
  );

  function transformSearchData(element, i) {
    return {
      key: currentPage.toString() + "-" + i.toString(),
      ...element,
    };
  }
}
