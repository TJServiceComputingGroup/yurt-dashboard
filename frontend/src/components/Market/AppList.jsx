import { Button, Table, Typography, Input, Space } from "antd";
import { useEffect, useState } from "react";
import { sendUserRequest } from "../../utils/request";
import { getCurrentTime } from "../../utils/utils";
import { MoreOutlined } from "@ant-design/icons";
import AppManageModal from "./Modals/AppManage";
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";

function AppList({ history }) {
  const [tableData, setTableData] = useState([]);

  const [lastUpdate, setLastUpdata] = useState(getCurrentTime());
  const [refreshLoading, setRefreshLoading] = useState(false);

  useEffect(() => {
    handleRefresh();
  }, []);

  // filter
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const handleTableChange = (_, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };
  const handleSearch = (confirm) => {
    confirm({
      closeDropdown: true,
    });
  };

  // modal
  const [operationApp, setOperationApp] = useState({});
  const [manageVisible, setManageVisible] = useState(false);
  const openModal = (data) => {
    setOperationApp(data);
    setManageVisible(true);
  };

  // column
  const getNameColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          value={selectedKeys && selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(confirm)}
          placeholder="搜索关键字"
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            size="small"
            style={{
              width: 90,
            }}
            onClick={clearFilters}
          >
            重置
          </Button>
          <Button
            type="primary"
            size="small"
            style={{
              width: 90,
            }}
            onClick={() => handleSearch(confirm)}
          >
            搜索
          </Button>
        </Space>
      </div>
    ),
    filteredValue: filteredInfo[dataIndex] || null,
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
  });

  const getColumnSorterProps = (dataIndex) => ({
    sorter: (a, b) => a[dataIndex].localeCompare(b[dataIndex], "en"),
    sortOrder: sortedInfo.field === dataIndex ? sortedInfo.order : null,
  });

  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      width: "20%",
      ellipsis: true,
      ...getNameColumnSearchProps("name"),
      ...getColumnSorterProps("name"),
    },
    {
      title: "命名空间",
      dataIndex: "namespace",
      width: "20%",
      ellipsis: true,
      ...getNameColumnSearchProps("namespace"),
      ...getColumnSorterProps("namespace"),
    },
    {
      title: "应用包名",
      dataIndex: "chartName",
      ellipsis: true,
      ...getNameColumnSearchProps("chartName"),
      ...getColumnSorterProps("chartName"),
    },
    {
      title: "包版本",
      dataIndex: "version",
      width: "15%",
    },
    {
      title: "应用版本",
      dataIndex: "appVersion",
      width: "15%",
    },
    {
      title: "操作",
      dataIndex: "operations",
      render: ({ releaseName, namespace, version, appVersion, desc }) => (
        <MoreOutlined
          onClick={() => {
            openModal({
              namespace: namespace,
              name: releaseName,
              desc: desc,
              version: version,
              appVersion: appVersion,
            });
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <div>
        <h2>应用管理</h2>
        <Typography>
          <blockquote>
            在此管理已安装的应用。访问应用商店以获取更多应用。
          </blockquote>
        </Typography>
      </div>

      <div style={{ marin: "10px 0" }}>
        <div style={{ height: 30, marginBottom: 8 }}>
          <div style={{ float: "right" }}>
            <span style={{ marginRight: 8, color: "#919CA4" }}>
              上次更新: {lastUpdate}
            </span>
            <Button
              style={{ marginRight: 8 }}
              loading={refreshLoading}
              onClick={handleRefresh}
            >
              刷新列表
            </Button>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => {
                history.push("/appmarket");
              }}
            >
              访问市场
            </Button>
          </div>
        </div>

        <Table
          size="middle"
          columns={columns}
          dataSource={tableData}
          loading={tableData === null}
          onChange={handleTableChange}
        />
      </div>

      <AppManageModal
        data={operationApp}
        visible={manageVisible}
        onClose={() => {
          setManageVisible(false);
        }}
        onSuccess={() => {
          handleRefresh();
        }}
      />
    </div>
  );

  function handleRefresh() {
    setRefreshLoading(true);
    sendUserRequest("/helm/list").then((hls) => {
      if (hls.data && Array.isArray(hls.data.release_elements)) {
        setTableData(hls.data.release_elements.map(transformHelmList));
      } else {
        setTableData([]);
      }
      setFilteredInfo({});
      setSortedInfo({});
      setLastUpdata(getCurrentTime());
      setRefreshLoading(false);
    });
  }
}

const transformHelmList = (element) => ({
  key: element.name,
  name: element.name,
  namespace: element.namespace,
  chartName: element.chart_name,
  version: element.version,
  appVersion: element.app_version,
  operations: {
    releaseName: element.name,
    namespace: element.namespace,
    version: element.version,
    appVersion: element.app_version,
    desc: element.description,
  },
});

export default withRouter(AppList);
