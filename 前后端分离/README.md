# 前后端分离
开发框架: vue  
样例: [http://git.any800.com/gzcb/any800 ](http://git.any800.com/gzcb/any800)  muldevelop分支  
目录: frontSeparate  
代码路径:frontSeparate\

#### 目录: 
- jtalk-server-end              --前后端分离,配置页面
- jtalk-server-end-preview      --前后端分离,配置预览页面
- licence-manage                --许可证
- micro-util                    --组件库(基础)
- nclient-micro-front           --组件库(进阶)
- plugin-center                 --插件中心
- pythonTools                   --python脚本
- sdk-client-end                --座席端前后端分离
- sdk-client-end-rebuild        --sdk更新(未使用)
- sdk-visitor-end               --访客端前后端分离
- sdk-visitor-end-re            --sdk更新,添加扩展方法(未使用)
- sdk-visitor-end-rebuild       --sdk更新(未使用)

#### 开发方式: 
1. 使用vue框架开发使用vuex,vue-router
2. 数据功能与UI初步分离,功能保留在src/sdk文件夹下
3. 通过发布订阅模式连接数据功能和vuex
4. 功能拆分,通过发布订阅模式控制访客端座席端状态
5. 详情请查看目录下 README.md 文件

#### 流程图
参见 杂项/流程图/多语言版本开发.pos  
参见 杂项/流程图/访客端功能整理.pos  
参见 杂项/流程图/访客端开发设计图.pos  
参见 杂项/流程图/座席端断线重连.pos     
