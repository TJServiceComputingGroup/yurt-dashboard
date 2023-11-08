import { Button, Form, Input, Modal, Select } from "antd";
import ConfigEditorInput from "../../Utils/ConfigEditorInput";
import { useEffect, useState } from "react";

export default function BaseInstallModal({
  showData, // {name, repo_name, version, app_version, description, available_versions}
  visible,
  installLoading,
  form,
  onModalCloseFunc,
  installFunc,
  onVersionSelectChangeFunc, // params: reponame, chartname, version
  getConfigDefaultValueFunc,
}) {
  const [showConfigFileItem, setShowConfigFileItem] = useState(false);

  useEffect(() => {
    if (!!showData) {
      form.setFieldsValue({
        version: showData.version,
      });
    }
  }, [showData]);

  return (
    <Modal
      style={{
        minWidth: "600px",
        maxWidth: "45%",
      }}
      title={!!showData && showData.name}
      visible={visible}
      maskClosable={false}
      onCancel={() => {
        setShowConfigFileItem(false);
        !!onModalCloseFunc && onModalCloseFunc();
      }}
      destroyOnClose
      footer={[
        <Button
          key="install-button"
          type="primary"
          loading={installLoading}
          onClick={!!installFunc && installFunc}
        >
          安装
        </Button>,
      ]}
    >
      <Form
        preserve={false}
        labelCol={{
          span: 4,
        }}
        wrapperCol={{
          span: 14,
        }}
        layout="horizontal"
        form={form}
        initialValues={{
          release_name: "",
          version: "",
          appVersion: "",
          config: "defaultConfig",
          config_file: "",
        }}
      >
        <Form.Item
          label="部署名称"
          name="release_name"
          tooltip="部署Release的名称"
          rules={[
            {
              required: true,
              message: "部署名称不能为空",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="仓库" tooltip="Chart包来源仓库">
          {!!showData && showData.repo_name}
        </Form.Item>
        <Form.Item label="介绍">{!!showData && showData.description}</Form.Item>
        <Form.Item label="版本" name="version" tooltip="选择安装的Chart包版本">
          <Select
            style={{ width: 120 }}
            options={
              !!showData &&
              !!showData.available_versions &&
              showData.available_versions.map((item) => ({
                value: item.version,
                label: item.version,
              }))
            }
            onChange={(value) => {
              !!onVersionSelectChangeFunc && onVersionSelectChangeFunc(value);
            }}
          />
        </Form.Item>
        <Form.Item label="APP版本" tooltip="应用版本">
          {!!showData && showData.app_version}
        </Form.Item>
        <Form.Item label="配置" name="config" tooltip="配置方式">
          <Select
            options={[
              { label: "默认配置", value: "defaultConfig" },
              { label: "使用配置文件", value: "configFile" },
            ]}
            onChange={(value) => {
              if (value === "configFile") {
                setShowConfigFileItem(true);
              } else {
                setShowConfigFileItem(false);
              }
            }}
          />
        </Form.Item>
        {showConfigFileItem && (
          <Form.Item label="配置文件" name="config_file">
            <ConfigEditorInput
              downloadFileName={!!showData && showData.name}
              getDefaultValueFunc={getConfigDefaultValueFunc}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
