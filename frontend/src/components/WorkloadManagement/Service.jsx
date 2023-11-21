import Workload from "./WorkloadTemplate";
import { getServices } from "../../utils/request";
import { renderDictCell } from "../../utils/utils";

function renderPorts(ports) {
  return (
    <div>
      {ports &&
        ports.map((port, i) => {
          console.log(port);
          return (
            <div key={i} style={{ whiteSpace: "nowrap" }}>
              {port.port} / {port.protocol}
            </div>
          );
        })}
    </div>
  );
}

const columns = [
  {
    title: "名称",
    dataIndex: "title",
  },
  {
    title: "标签",
    dataIndex: "tag",
    render: (svc) => renderDictCell(svc),
  },
  {
    title: "命名空间",
    dataIndex: "namespace",
  },
  {
    title: "类型",
    dataIndex: "type",
  },
  {
    title: "内部IP",
    dataIndex: "clusterip",
  },
  {
    title: "端口列表",
    dataIndex: "ports",
    render: (ports) => renderPorts(ports),
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
  },
];

export default function Service() {
  return (
    <Workload
      title="Service"
      table={{
        columns,
        fetchData: getServices,
      }}
    />
  );
}
