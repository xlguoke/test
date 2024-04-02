## 1.10.1 (2024-03-21)


### Bug Fixes

* A requested file or directory could not be found at the time an operation was processed. ([350b275](http://192.168.2.31/ilis2/uhbs/handbook/commits/350b275d505b9a42fdb4f8fd9f4e20a08e3a8400))
* append `/ilis2` to the ilis server address when opening udr online ([2298ca1](http://192.168.2.31/ilis2/uhbs/handbook/commits/2298ca192f25118e007fcca80474781635863070))
* column missmatch when saving onsite-task ([1b269de](http://192.168.2.31/ilis2/uhbs/handbook/commits/1b269de824360278669463098e6d57f62c5bfd5e))
* **custodian:** correct the composite primary key of the `table sample_param_and_test_item` ([038982c](http://192.168.2.31/ilis2/uhbs/handbook/commits/038982ca1e8f17741dd9e7dc1497c4b99c87e85d))
* saving multiple test parameters results in only one parameter being persisted ([2d28e19](http://192.168.2.31/ilis2/uhbs/handbook/commits/2d28e19785ce67ed12935f71b6f8e90ffd90690c))
* store hitek center urls in the base url form ([fa0703d](http://192.168.2.31/ilis2/uhbs/handbook/commits/fa0703d90db33ed64d637ee5c748f31d09bf98e2))
* templates download issue on the Android platform ([1beaa2b](http://192.168.2.31/ilis2/uhbs/handbook/commits/1beaa2bfd5b6788b1218c2cd2181414d5f3234f9))
* using cordova filesystem native url on the Android platform ([fad8881](http://192.168.2.31/ilis2/uhbs/handbook/commits/fad8881e7a800fb447a3df9ef365d84619fbde13))
* 创建任务，多个参数时规程数据错乱 ([9238d4a](http://192.168.2.31/ilis2/uhbs/handbook/commits/9238d4adc0e33eee60fac7b63a1efd4efd98c359))


### Features

* add createDate in the project ([e83a856](http://192.168.2.31/ilis2/uhbs/handbook/commits/e83a856aeef228cfb2cb18ddeb633848e904720e))
* add Criterion pagination support ([fec4a71](http://192.168.2.31/ilis2/uhbs/handbook/commits/fec4a7195c40893cfa3e5e483921989fa5d468fa))
* add function findTemplates() in template module ([35602e0](http://192.168.2.31/ilis2/uhbs/handbook/commits/35602e05c9774835ac7e9cd8cbee2239fa082f78))
* add several stores ([8cec055](http://192.168.2.31/ilis2/uhbs/handbook/commits/8cec0554dda890a662505061fd0457e9274fe1e6))
* Add sql batch execution ([e348da0](http://192.168.2.31/ilis2/uhbs/handbook/commits/e348da04b9a2e35c96c59eb9472c75e55e5afe4f))
* adding extra files for udr online/offline support ([35223bb](http://192.168.2.31/ilis2/uhbs/handbook/commits/35223bb3246f2ee9afb5a602e1de2c80c4972b16))
* change ilis server in runtime ([89bed92](http://192.168.2.31/ilis2/uhbs/handbook/commits/89bed9291f09b681c2e25546e1d63d444d39576e))
* error handling ([883bfdb](http://192.168.2.31/ilis2/uhbs/handbook/commits/883bfdb484601b468459e7df1febdf3adcc5ecd5))
* ilis client query ([33a6456](http://192.168.2.31/ilis2/uhbs/handbook/commits/33a64566d68a6e146ecd35ae159faff52d9dc87d))
* online & onsite task management ([2fa7b05](http://192.168.2.31/ilis2/uhbs/handbook/commits/2fa7b055f6beea3af52fe47256b7068f573fe26c))
* open and save online task ([782394a](http://192.168.2.31/ilis2/uhbs/handbook/commits/782394a5570d9666c0fbbd8e46b51d644a9b17dc))
* persistence of several basic data ([62a37d3](http://192.168.2.31/ilis2/uhbs/handbook/commits/62a37d3ee826058d37a58669541eace2eece34fd))
* prevent saving identical online task based on the primary key ([bbdf9e7](http://192.168.2.31/ilis2/uhbs/handbook/commits/bbdf9e7240e6a6ee85e58da86f9cf73f436dd457))
* **project:** incremental semver support ([d8b1940](http://192.168.2.31/ilis2/uhbs/handbook/commits/d8b194060183c990eca71ac3b6654288f4191141))
* refreshing token when appropriate ([006f845](http://192.168.2.31/ilis2/uhbs/handbook/commits/006f8450c42ba1f8d3e7b81d274e0f190ecc80c3))
* Ruby on Rails fashion schema migration support ([d37c8cd](http://192.168.2.31/ilis2/uhbs/handbook/commits/d37c8cdaf9b9923752a6a592d7eb4f53aff7d505))
* show project version ([fac4a59](http://192.168.2.31/ilis2/uhbs/handbook/commits/fac4a5973121336e71ba121e6013a9d56cf65939))
* **task:** findByTestTaskIds ([c13b219](http://192.168.2.31/ilis2/uhbs/handbook/commits/c13b219d67a4736acdab85fbb99fcf3dcc7537c8))
* template add group by test-item support ([f77af74](http://192.168.2.31/ilis2/uhbs/handbook/commits/f77af749c3ca64a0967a1992164aded7f67ed12a))
* template management ([a75c11e](http://192.168.2.31/ilis2/uhbs/handbook/commits/a75c11eb05ec8235455dc3525e7f39786d70bcec))
* update the hitek-center url accordingly ([dc83866](http://192.168.2.31/ilis2/uhbs/handbook/commits/dc83866b434b71dc98a8b32ab07c0f785361dde3))
* 选中规程列表支持分页查询 ([418f99c](http://192.168.2.31/ilis2/uhbs/handbook/commits/418f99ce02fc4d87b364746889e1e4fd70796fd4))



# [1.0.0](http://192.168.2.31/ilis2/uhbs/handbook/compare/33a64566d68a6e146ecd35ae159faff52d9dc87d...v1.0.0) (2024-03-14)


### Bug Fixes

* A requested file or directory could not be found at the time an operation was processed. ([350b275](http://192.168.2.31/ilis2/uhbs/handbook/commits/350b275d505b9a42fdb4f8fd9f4e20a08e3a8400))
* column missmatch when saving onsite-task ([1b269de](http://192.168.2.31/ilis2/uhbs/handbook/commits/1b269de824360278669463098e6d57f62c5bfd5e))
* templates download issue on the Android platform ([1beaa2b](http://192.168.2.31/ilis2/uhbs/handbook/commits/1beaa2bfd5b6788b1218c2cd2181414d5f3234f9))
* using cordova filesystem native url on the Android platform ([fad8881](http://192.168.2.31/ilis2/uhbs/handbook/commits/fad8881e7a800fb447a3df9ef365d84619fbde13))


### Features

* add createDate in the project ([e83a856](http://192.168.2.31/ilis2/uhbs/handbook/commits/e83a856aeef228cfb2cb18ddeb633848e904720e))
* add function findTemplates() in template module ([35602e0](http://192.168.2.31/ilis2/uhbs/handbook/commits/35602e05c9774835ac7e9cd8cbee2239fa082f78))
* add several stores ([8cec055](http://192.168.2.31/ilis2/uhbs/handbook/commits/8cec0554dda890a662505061fd0457e9274fe1e6))
* Add sql batch execution ([e348da0](http://192.168.2.31/ilis2/uhbs/handbook/commits/e348da04b9a2e35c96c59eb9472c75e55e5afe4f))
* adding extra files for udr online/offline support ([35223bb](http://192.168.2.31/ilis2/uhbs/handbook/commits/35223bb3246f2ee9afb5a602e1de2c80c4972b16))
* change ilis server in runtime ([89bed92](http://192.168.2.31/ilis2/uhbs/handbook/commits/89bed9291f09b681c2e25546e1d63d444d39576e))
* error handling ([883bfdb](http://192.168.2.31/ilis2/uhbs/handbook/commits/883bfdb484601b468459e7df1febdf3adcc5ecd5))
* ilis client query ([33a6456](http://192.168.2.31/ilis2/uhbs/handbook/commits/33a64566d68a6e146ecd35ae159faff52d9dc87d))
* online & onsite task management ([2fa7b05](http://192.168.2.31/ilis2/uhbs/handbook/commits/2fa7b055f6beea3af52fe47256b7068f573fe26c))
* open and save online task ([782394a](http://192.168.2.31/ilis2/uhbs/handbook/commits/782394a5570d9666c0fbbd8e46b51d644a9b17dc))
* persistence of several basic data ([62a37d3](http://192.168.2.31/ilis2/uhbs/handbook/commits/62a37d3ee826058d37a58669541eace2eece34fd))
* prevent saving identical online task based on the primary key ([bbdf9e7](http://192.168.2.31/ilis2/uhbs/handbook/commits/bbdf9e7240e6a6ee85e58da86f9cf73f436dd457))
* refreshing token when appropriate ([006f845](http://192.168.2.31/ilis2/uhbs/handbook/commits/006f8450c42ba1f8d3e7b81d274e0f190ecc80c3))
* Ruby on Rails fashion schema migration support ([d37c8cd](http://192.168.2.31/ilis2/uhbs/handbook/commits/d37c8cdaf9b9923752a6a592d7eb4f53aff7d505))
* show project version ([fac4a59](http://192.168.2.31/ilis2/uhbs/handbook/commits/fac4a5973121336e71ba121e6013a9d56cf65939))
* **task:** findByTestTaskIds ([c13b219](http://192.168.2.31/ilis2/uhbs/handbook/commits/c13b219d67a4736acdab85fbb99fcf3dcc7537c8))
* template add group by test-item support ([f77af74](http://192.168.2.31/ilis2/uhbs/handbook/commits/f77af749c3ca64a0967a1992164aded7f67ed12a))
* template management ([a75c11e](http://192.168.2.31/ilis2/uhbs/handbook/commits/a75c11eb05ec8235455dc3525e7f39786d70bcec))
* update the hitek-center url accordingly ([dc83866](http://192.168.2.31/ilis2/uhbs/handbook/commits/dc83866b434b71dc98a8b32ab07c0f785361dde3))



