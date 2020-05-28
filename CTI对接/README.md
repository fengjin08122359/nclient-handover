# CTI对接
开发框架: vue  
样例:   
[http://git.any800.com/kcwo/architect](http://git.any800.com/kcwo/architect)  front_mike分支  
后台目录: work-order  
微信目录: wxFront  

#### 后台开发目录
- src/sdk
  - callCenter        CTI对接  
    - PbxTransfer.js  第三方接口  
    - deal.js         接口封装  
    - index.js        入口(接口调用)  
  - workOrder         工单  
    - mix             代码混合(针对不同展示页)  
    - types           工单中不同的模块  
    - auth.js         权限  
    - index.js        入口(创建汇总)  
    - piece.js        每个模块中不同的切片  
    - utils.js        工具类,不同切片的创建  