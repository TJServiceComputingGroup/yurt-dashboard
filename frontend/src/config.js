import ClusterInfo from "./components/Cluster/ClusterInfo";
import Deployment from "./components/WorkloadManagement/Deployment";
import Nodes from "./components/NodeManagement/Nodes";
import Entry from "./components/User/Entry";
import NodePool from "./components/NodeManagement/NodePool";
import StatefulSet from "./components/WorkloadManagement/StatefulSet";
import Job from "./components/WorkloadManagement/Job";
import Pod from "./components/WorkloadManagement/Pod";
import Lab from "./components/Lab/Lab";
import SystemApp from "./components/AppManagement/SystemApp";
import RepoManagement from "./components/Market/RepoManagement";
import AppList from "./components/Market/AppList";
import HelmMarket from "./components/Market/HelmMarket";
import Service from "./components/WorkloadManagement/Service";

export const routes = [
  {
    path: "/clusterInfo",
    main: () => <ClusterInfo></ClusterInfo>,
  },
  {
    path: "/deployment",
    main: () => <Deployment></Deployment>,
  },
  {
    path: "/nodes",
    main: () => <Nodes></Nodes>,
  },
  {
    path: "/login",
    main: () => <Entry></Entry>,
  },
  {
    path: "/nodepool",
    main: () => <NodePool></NodePool>,
  },
  {
    path: "/statefulset",
    main: () => <StatefulSet></StatefulSet>,
  },
  {
    path: "/job",
    main: () => <Job></Job>,
  },
  {
    path: "/pod",
    main: () => <Pod></Pod>,
  },
  {
    path: "/service",
    main: () => <Service></Service>,
  },
  {
    path: "/lab",
    main: () => <Lab></Lab>,
  },
  {
    path: "/systemapp",
    type: "admin",
    main: () => <SystemApp></SystemApp>,
  },
  {
    path: "/repo",
    type: "admin",
    main: () => <RepoManagement></RepoManagement>,
  },
  {
    path: "/applist",
    type: "admin",
    main: () => <AppList></AppList>,
  },
  {
    path: "/appmarket",
    type: "admin",
    main: () => <HelmMarket></HelmMarket>,
  },
];

// use baseurl defined by the environment variable  (Only for debug purpose)
// or use default (browser location url) if not defined
export const baseURL = process.env.BASE_URL
  ? process.env.BASE_URL
  : window.location.origin;
