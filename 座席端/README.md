# 座席端
开发框架: jquery.1.7.2.min.js  
样例: [http://git.any800.com/goldeneasysale/any800 ](http://git.any800.com/goldeneasysale/any800)  develop分支  
目录: any800Chat  
代码路径: any800Chat\WebContent

#### 入口文件: 
/any800Chat/WebContent/tools/main.js

#### 设计开发文档
参见 杂项/doc/BS坐席端设计文档V1.0.doc  

#### 开发方式: 
1. 功能组件化,将不同的功能保存为组件  
2. 异步加载, 通过入口文件异步加载需要使用的js,css,impl(模板)文件  
3. 页面分块, 通过menuBar.js文件区分页面,不同的页面加载不同的js  
4. 引入vue模块, 部分需要频繁加载的项通过vue实时更新  

#### 流程图
参见 杂项/流程图/BS登陆对话流程.pos  
参见 杂项/流程图/座席端断线重连.pos  

#### 目录
- bootstrapUI                 --引入模块插件包含vue, vue-swiper, tinymce, zeroclipboard  
- dialogue                    --会话模块  
  - categoryTree.js         --对话分类  
  - commonStored.js	        --常用预存  
  - commonStoredDataGrid.js	--常用预存数据存储  
  - commonStoredPag.js	    --常用预存分页展示  
  - contextmenu.js          --对话右键菜单  
  - drag.js	                --中部右部拖拽  
  - editorFun.js            --输入框汇总  
  - history.js              --历史记录  
  - init.js                 --会话初始化  
  - messagenotify.js	      --消息通知(老插件,已停止使用)  
  - orgnization.js	        --组织架构(转移邀请坐席使用)  
  - picture.js              --图片处理(放大缩小图片)  
  - pluginCenter.js         --插件中心  
  - recommend.js            --智能推荐  
  - revoke.js	              --消息撤回  
  - screenCapture.js        --截屏  
  - searchCategory.js       --对话分类搜索  
  - showMessage.js          --消息展示,消息处理发送  
  - uploadFile.js           --上传文件  
  - visitorInfo.js          --访客信息  
- fkjk                        --访客监控  
  - init.js                 --初始化访客监控  
  - visitorMonitor.js       --访客监控功能  
- kfjk                        --坐席监控  
  - init.js                 --初始化坐席监控, 坐席监控功能  
- tools                       --初始化登录页面  
  - api.js                  --基础api  
  - base64.js               --base64转换  
  - canvas2image.js         --图片转换  
  - changeTitle.js          --切换标题  
  - config.js               --配置  
  - connection.js           --连接状态监控  
  - cropper.min.js          --图片剪裁  
  - ding.js                 --声音提醒  
  - interface.js            --接口(会话,发送消息,接受消息等)  
  - kfMerge.js              --第三方会话窗口  
  - leaveControl.js         --对话结束控制  
  - loadProgress.js         --登录进度控制  
  - log.js                  --日志  
  - main.js                 --主流程初始化(对接登录,消息接收处理,所有主进程任务)  
  - md5.js                  --MD5  
  - menuBar.js              --菜单栏控制  
  - messageList.js          --消息列表  
  - notification.js         --通知(浏览器通知与其他通知汇总)  
  - operatorDeal.js         --转移邀请处理  
  - operatorOrg.js          --坐席监控组织架构  
  - popOut.js               --弹出层  
  - quicklogin.js           --登录鉴权初始化  
  - statusPresent.js        --网页状态监控  
  - statusPresent.js        --网页状态监控  
  - userList.js             --访客列表  
  - webSocket.js            --webSocket消息中心  
  - xiff.js                 --消息中心控制(flash或webSocket)  
- dialogue.tmpl               --会话模板  
- fkjk.tmpl                   --访客监控模板  
- kfjk.tmpl                   --坐席监控模板  
- index.html                  --入口  
