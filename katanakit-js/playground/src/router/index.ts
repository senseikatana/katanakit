import { createMemoryHistory, createRouter } from "vue-router";

import HomeView from "../views/HomeView.vue";
import FetchView from "../views/FetchView.vue";
import QueryView from "../views/QueryView.vue";
import WatchView from "../views/WatchView.vue";
import UrlBuilderView from "../views/UrlBuilderView.vue";

const routes = [
	{ path: "/", component: HomeView, meta: { title: "Home" } },
	{ path: "/fetch", component: FetchView, meta: { title: "useRequest" } },
	{ path: "/query", component: QueryView, meta: { title: "useQuery" } },
	{ path: "/watch", component: WatchView, meta: { title: "useWatch" } },
	{
		path: "/url-builder",
		component: UrlBuilderView,
		meta: { title: "useBuildUrl" },
	},
];

export const router = createRouter({
	history: createMemoryHistory(),
	routes,
});
