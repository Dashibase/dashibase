import { createWebHistory, createRouter, RouteLocation } from "vue-router"
import Main from "@/components/Main.vue"
import SignUp from "@/components/auth/SignUp.vue"
import LogIn from "@/components/auth/LogIn.vue"
import Dashboard from "@/components/dashboard/Dashboard.vue"
import SingleView from "@/components/dashboard/views/SingleView.vue"
import ViewContainer from "@/components/dashboard/views/ViewContainer.vue"

const routes = [
  {
    path: "/",
    name: "Home",
    component: Main,
    children: [
      {
        path: "signup",
        name: "Sign Up",
        component: SignUp,
      }, {
        path: "login",
        name: "Log In",
        component: LogIn,
      }, {
        path: "",
        component: Dashboard,
        children: [
          {
            path: "/:pageId",
            component: ViewContainer,
            props: true,
          }, {
            path: "/:pageId/new",
            component: SingleView,
            props: (route:RouteLocation) => ({ pageId: route.params.pageId, createMode: true }),
          }, {
            path: "/:pageId/view/:itemId",
            component: SingleView,
            props: true,
          },
        ]
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
