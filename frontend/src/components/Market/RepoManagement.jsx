import { Input, message, Typography, Table, Button, Modal, Form } from "antd";
import { useEffect, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { sendUserRequest } from "../../utils/request";
import { getCurrentTime } from "../../utils/utils";

const columns = [
  {
    title: "Name",
    dataIndex: "name",
  },
  {
    title: "URL",
    dataIndex: "url",
  },
];

export default function RepoManagement() {
  const [tableData, setTableData] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const [lastUpdate, setLastUpdate] = useState(getCurrentTime());
  const [refreshLoading, setRefreshLoading] = useState(false);

  useEffect(() => {
    handleRefresh();
  }, []);

  const [updateLoading, setUpdateLoading] = useState(false);

  // filter components
  const [inputVal, setInput] = useState("");
  var filterData =
    tableData &&
    tableData.filter((row) =>
      typeof row.name === "string"
        ? row.name.indexOf(inputVal) >= 0
        : JSON.stringify(row.name).indexOf(inputVal) >= 0
    );

  //modal
  const [repoAddModallVisible, setRepoAddModalVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form] = Form.useForm();

  return (
    <div>
      <div>
        <h2>源管理</h2>
        <Typography>
          <blockquote>在此管理第三方仓库。添加源以获取更多应用。</blockquote>
        </Typography>
      </div>

      <div style={{ margin: "10px 0" }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "inline-block" }}>
            <Input
              placeholder="搜索源"
              value={inputVal}
              onChange={(e) => setInput(e.target.value)}
              style={{ width: 180 }}
              suffix={<SearchOutlined />}
            />
          </div>
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
                setRepoAddModalVisible(true);
              }}
            >
              添加源
            </Button>
          </div>
        </div>

        <Table
          size="small"
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: selectedKeys,
            onChange: (selectedRowKeys) => {
              setSelectedKeys(selectedRowKeys);
            },
            getCheckboxProps: (record) => ({
              name: record.name,
            }),
          }}
          columns={columns}
          dataSource={filterData}
          loading={filterData === null}
        />

        {filterData && filterData.length > 0 ? (
          <div
            style={{ position: "relative", bottom: 42, width: "fit-content" }}
          >
            <Button
              disabled={selectedKeys.length === 0}
              onClick={updateRepo}
              loading={updateLoading}
            >
              批量更新
            </Button>
            <Button
              style={{ marginLeft: 10 }}
              disabled={selectedKeys.length === 0}
              onClick={removeRepo}
            >
              批量移除
            </Button>
          </div>
        ) : null}
      </div>

      <Modal
        destroyOnClose
        style={{
          minWidth: "600px",
          maxWidth: "45%",
        }}
        title="添加源"
        visible={repoAddModallVisible}
        maskClosable={false}
        closable={false}
        okText="添加"
        cancelText="关闭"
        onCancel={() => {
          setRepoAddModalVisible(false);
        }}
        okButtonProps={{ loading: addLoading }}
        onOk={() => {
          addRepo(form.getFieldsValue());
        }}
      >
        <Form
          preserve={false}
          form={form}
          layout="horizontal"
          labelCol={{ span: 4 }}
          initialValues={{
            repo_name: "",
            repo_url: "",
          }}
        >
          <Form.Item label="源名称" name="repo_name">
            <Input></Input>
          </Form.Item>
          <Form.Item label="源地址" tooltip="填写源的URL地址" name="repo_url">
            <Input></Input>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );

  function handleRefresh() {
    setRefreshLoading(true);
    sendUserRequest("/repo/list").then((rls) => {
      if (rls.data && Array.isArray(rls.data)) {
        setTableData(
          rls.data.map((element) => ({
            key: element.name,
            name: element.name,
            url: element.url,
          }))
        );
      } else {
        setTableData([]);
      }
      setSelectedKeys([]);
      setLastUpdate(getCurrentTime());
      setRefreshLoading(false);
    });
  }

  function addRepo(v) {
    setAddLoading(true);
    sendUserRequest("/repo/add", {
      ...v,
    }).then((res) => {
      setAddLoading(false);
      setRepoAddModalVisible(false);
      if (res.status === "error") {
        message.info("添加源失败");
      } else {
        message.info("添加源成功");
        setInput("");
        handleRefresh();
      }
    });
  }

  function updateRepo() {
    setUpdateLoading(true);
    sendUserRequest("/repo/update", {
      repo_names: selectedKeys,
    }).then((res) => {
      setUpdateLoading(false);
      if (res.status === "error") {
        message.info("更新源失败");
      } else {
        message.info("更新源成功");
        setInput("");
        handleRefresh();
      }
    });
  }

  function removeRepo() {
    sendUserRequest("/repo/remove", {
      repo_names: selectedKeys,
    }).then((res) => {
      if (res.status === "error") {
        message.info("删除源失败");
      } else {
        message.info("删除源成功");
        setInput("");
        handleRefresh();
      }
    });
  }
}
