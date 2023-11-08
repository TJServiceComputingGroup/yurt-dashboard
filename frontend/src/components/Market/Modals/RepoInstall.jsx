import { Form, message } from "antd";
import { useEffect, useState } from "react";
import {
  sendUserRequest,
  sendUserRequestWithTimeout,
} from "../../../utils/request";
import BaseInstallModal from "./BaseInstall";

export default function RepoInstallModal({ initData, visible, onClose }) {
  const [showData, setShowData] = useState(null);

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
        if (!!initData) {
          installHelmHub(form.getFieldsValue());
        }
      }}
      onVersionSelectChangeFunc={onSelectVersion}
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
      available_versions: element.available_versions,
    };
  }

  function onSelectVersion(version) {
    initData.available_versions.forEach((item) => {
      if (item.version === version) {
        setShowData((oldData) => {
          return {
            ...oldData,
            version: item.version,
            app_version: item.app_version,
          };
        });
        return;
      }
    });
  }

  async function installHelmHub(v) {
    if (v.release_name === "") {
      message.error("必须输入Release名称！");
      return;
    }
    setInstallLoading(true);
    sendUserRequest("/helm/install", {
      install_from_hub: false,
      release_name: v.release_name,
      package_name: initData.name,
      repo_name: initData.repo_name,
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
    return sendUserRequestWithTimeout(10000, "/helm/getRepoValue", {
      name: initData.name,
      repo_name: initData.repo_name,
      version: showData.version,
    }).then((res) => {
      if (!!res.data && typeof res.data === "string") {
        return res.data;
      } else {
        return "";
      }
    });
  }
}
