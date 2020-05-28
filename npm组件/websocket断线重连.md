# websocket断线重连

1. 创建websocket连接
2. 对当前连接的成功失败,消息进行监听
3. 设置重连次数
4. 发送接收pingpong消息
5. 检测消息
    a. navigator.onLine 浏览器在线 否 -> 6  
    b. websocket连接是否存在并且当前的websocket状态不是CLOSE 否 -> 6  
    c. pong的时间超过最大超时时间 -> 6   
6. 当前的websocket状态是OPEN时,关闭websocket
7. 检测当前断线重连的次数小于一定次数的 是 -> 8 否 -> 9
8. 当前的websocket状态是CLOSE时,重新连接websocket 推送断线重连消息,并等待调用 5
9. 推送websocket断开消息

#### 初始化
重连检测时间checkTime: 3秒  
最大重连时间reconnectTime: 20秒  
最大重连次数connectTime: 2次  
已重连次数connnectNumber: 0次  
是否启用断线重连keepAliveModel: true

#### 流程图
参见 杂项/流程图/座席端断线重连.pos