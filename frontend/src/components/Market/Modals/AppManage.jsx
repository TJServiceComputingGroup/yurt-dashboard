import { Modal, Button, Form, message, Popconfirm } from "antd";
import { useState } from "react";
import { sendUserRequest } from "../../../utils/request";

export default function AppManageModal({
  data,
  visible,
  onClose,
  onDealing,
  onSuccess,
}) {
  const [modalLoading, setModalLoading] = useState(false);
  const onModalClose = () => {
    setModalLoading(false);
    if (onClose) {
      onClose();
    }
  };
  const onUninstallBegin = () => {
    if (onDealing) {
      onDealing();
    }
  };
  const onUninstallSuccess = () => {
    onModalClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Modal
      style={{
        minWidth: "600px",
        maxWidth: "45%",
      }}
      title={data.name}
      visible={visible}
      maskClosable={false}
      onCancel={onModalClose}
      destroyOnClose
      footer={[
        <Button
          key="upgrade-button"
          onClick={() => {
            message.info("功能正在开发中，敬请期待");
          }}
        >
          升级
        </Button>,
        <Popconfirm
          key="uninstall-popconfirm"
          title="是否确认卸载组件？"
          okText="确认卸载"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={() => {
            setModalLoading(true);
            uninstallApp();
          }}
        >
          <Button type="primary" danger loading={modalLoading}>
            卸载
          </Button>
        </Popconfirm>,
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
      >
        <Form.Item label="介绍">{data.desc}</Form.Item>
        <Form.Item label="当前版本">{data.version}</Form.Item>
        <Form.Item label="APP版本">{data.appVersion}</Form.Item>
      </Form>
    </Modal>
  );

  async function uninstallApp() {
    onUninstallBegin();
    sendUserRequest("/helm/uninstall", {
      release_names: [data.name],
      namespace: data.namespace,
    })
      .then((res) => {
        if (res.status === true) {
          setTimeout(() => message.info("卸载成功"), 1000);
        }
      })
      .finally(onUninstallSuccess);
  }
}
