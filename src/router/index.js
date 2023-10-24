import { createRouter, createWebHistory } from "vue-router";
import Homepage from "../components/homePage.vue";
import BulkCancel from "../components/bulkCancel.vue";
import SettingsAPI from "../components/settingsAPI.vue";
import BulkSend from "../components/bulkSend.vue";
import ExportData from "../components/exportData.vue";

const routes = [
  { path: "/", name: "Home", component: Homepage },
  { path: "/cancel", name: "Bulk Cancel", component: BulkCancel },
  { path: "/settings", name: "Settings", component: SettingsAPI },
  { path: "/send", name: "Bulk Send", component: BulkSend },
  {path: "/export", name: "Export Data", component: ExportData },
  {path: "/:catchAll(.*)", component: Homepage}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: "router-link-active",
});

export default router;
