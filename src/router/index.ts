import { createWebHistory, createRouter } from "vue-router"
import Main from "@/components/Main.vue"
import SignUp from "@/components/dashboard/SignUp.vue"
import SignIn from "@/components/dashboard/SignIn.vue"
import Dashboard from "@/components/dashboard/Dashboard.vue"
import CreateItem from "@/components/dashboard/CreateItem.vue"
import ViewItem from "@/components/dashboard/ViewItem.vue"
import ViewContainer from "@/components/dashboard/ViewContainer.vue"

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
        path: "signin",
        name: "Sign In",
        component: SignIn,
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
            component: CreateItem,
            props: true,
          }, {
            path: "/:pageId/view/:itemId",
            component: ViewItem,
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
