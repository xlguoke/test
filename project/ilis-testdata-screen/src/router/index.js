import Vue from 'vue';
import VueRouter from 'vue-router';
// import userAuth from "@/lib/userAuth";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: 'home',
    component: () => import("../views/home/index.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/login/index.vue"),
  },
  {
    path: "*",
    redirect: "/",
  }
];

const router = new VueRouter({
  routes
});

// router.beforeEach(async (to, from, next) => {
//   const { name } = to;

//   if (userAuth.userLaboratoryID) {
//     if (name === "login") {
//       next("/");
//       return;
//     }
//   } else {
//     if (name === "home") {
//       next("/login");
//       return;
//     }
//   }

//   next();
// });

export default router;