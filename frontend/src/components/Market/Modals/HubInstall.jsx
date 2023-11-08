import { Form, message } from "antd";
import { useEffect, useState } from "react";
import { sendUserRequest } from "../../../utils/request";
import BaseInstallModal from "./BaseInstall";

export default function HubInstallModal({ initData, visible, onClose }) {
  const [showData, setShowData] = useState(null);
  const [detailData, setDetailData] = useState(null);

  const [form] = Form.useForm();
  const [installLoading, setInstallLoading] = useState(false);
  const onModalClose = () => {
    form.resetFields();
    setInstallLoading(false);
    onClose();
  };
  const onInstallSuccess = () => {
    onModalClose();
  };

  // set the default show info
  useEffect(() => {
    if (visible === true && !!initData) {
      setShowData(transformInitShowData(initData));
      getDetailData(initData.repo_name, initData.name, initData.version);
    }
  }, [visible]);

  return (
    <BaseInstallModal
      showData={showData}
      visible={visible}
      installLoading={installLoading}
      form={form}
      onModalCloseFunc={onModalClose}
      installFunc={() => {
        if (!!detailData) {
          installHelmHub(form.getFieldsValue());
        }
      }}
      onVersionSelectChangeFunc={(version) => {
        !!detailData &&
          getDetailData(detailData.repository.name, detailData.name, version);
      }}
      getConfigDefaultValueFunc={getConfigDefaultValue}
    />
  );

  function transformInitShowData(element) {
    return {
      name: element.name,
      repo_name: !!element.repo_display_name
        ? element.repo_display_name
        : element.repo_name,
      version: element.version,
      app_version: element.app_version,
      description: element.description,
    };
  }

  function transformDetailToShowData(element) {
    return {
      name: element.name,
      repo_name: element.repository.display_name
        ? element.repository.display_name
        : element.repository.name,
      version: element.version,
      app_version: element.app_version,
      description: element.description,
      available_versions: element.available_versions,
    };
  }

  function getDetailData(repoName, packageName, version) {
    sendUserRequest("/helm/detailHub", {
      repo_name: repoName,
      package_name: packageName,
      version: version,
    }).then((res) => {
      setDetailData(res.data);
      setShowData(transformDetailToShowData(res.data));
    });
  }

  async function installHelmHub(v) {
    if (v.release_name === "") {
      message.error("必须输入Release名称！");
      return;
    }
    setInstallLoading(true);
    sendUserRequest("/helm/install", {
      install_from_hub: true,
      release_name: v.release_name,
      package_name: detailData.name,
      repo_name: detailData.repository.name,
      version: v.version,
      config: v.config,
      config_file: v.config === "configFile" ? v.config_file : "",
    })
      .then((res) => {
        if (res.status === true) {
          setTimeout(() => message.info("安装成功"), 1000);
        }
      })
      .finally(onInstallSuccess);
  }

  async function getConfigDefaultValue() {
    return sendUserRequest("/helm/getHubValue", {
      package_id: detailData.package_id,
      version: detailData.version,
    }).then((res) => {
      if (!!res.data && typeof res.data === "string") {
        return res.data;
      } else {
        return "";
      }
    });
  }
}
