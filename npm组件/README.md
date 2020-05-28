# npm组件
开发框架: vue  
样例:   
[http://git.any800.com/goldeneasysale/any800/](http://git.any800.com/goldeneasysale/any800/)  muldevelop 分支  
目录: frontSeparate  
组件库开发: nclient-sdk    

#### nclient-sdk使用
1. npm run test 测试  
2. npm run build 打包  
3. npm run release 打包并发布  
4. npm run lint 代码美化  

#### js中调用

综合性组件[https://www.npmjs.com/package/nclient-microfront](https://www.npmjs.com/package/nclient-microfront)   
基础组件[https://www.npmjs.com/package/@mikefeng110808/micro-util](https://www.npmjs.com/package/@mikefeng110808/micro-util)  

##### 组件划分了多个模块
1. 多语言
2. 发布订阅
3. 切换标题
4. 日志
5. 本地缓存
6. 手机输入框拉伸
7. websocket(config)
...等模块  


#### 工程类创建
[https://www.npmjs.com/package/nclient-build](https://www.npmjs.com/package/nclient-build)

1. nclient-build workspace (创建工作区)
2. nclient-build class (创建js文件,用于类创建)
3. nclient-build component (创建vue和js类)
4. nclient-build vue (创建vue文件)
5. nclient-build project --dir=./project (创建项目)
6. nclient-build version (版本号)
7. nclient-build help (帮助)
8. nclient-build fast-config (vue项目快捷设置)
