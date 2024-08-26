<h3 align="center">ILIS Union</h3>

### Built With

* ![vue](https://img.shields.io/badge/vue.js-3-%234FC08D?logo=vue.js)
* ![vite](https://img.shields.io/badge/vite-5-%23%23646CFF?logo=vite)
* ![vue-router](https://img.shields.io/badge/vue_router-v4-green)

### Understanding File-based route

项目使用了[Unplugin Vue Router](https://uvr.esm.is/introduction.html)
在进行开发前必须熟练掌握[Vue Router](https://router.vuejs.org/guide/)以及[File-based
Routing](https://uvr.esm.is/guide/file-based-routing.html)

#### 项目URL定义：

- `/` 根目录用作门户展示，当前登录用户待办、子系统均展示在此页面
- `/login` 普通用户登录
- `/admin` 统一平台管理，用于维护人员进行统一平台相关数据管理，包含平台用户、角色、子系统等等
- `/admin/login` 管理员登录

`/admin`以及子路径下的资源应该使用同一套layout（`/admin/login`除外）

门户若需包含子路径，应该使用门户对应的layout

#### Route meta

使用[definePage](https://uvr.esm.is/guide/extending-routes.html#definepage) Macro

使用[custom block](https://uvr.esm.is/guide/extending-routes.html#sfc-route-custom-block)

#### Router guard

根据登录用户角色进行菜单展示

### Fetch

项目中应该使用[Fetch](https://vueuse.org/core/useFetch/#creating-a-custom-instance)而不是Axios
