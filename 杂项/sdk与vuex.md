# sdk与vuex.md
#### 使用keyFrame的方法对事件进行绑定
```javascript
import {keyFrame} from 'nclient-microfront' 
keyFrame.addHandler('store', 'visitor-data-skin-logo', (data) => {
  dispatch('skin/setLogo', data, {root: true});
})
```
#### 实验中的方法:  
```javascript
import {convertVuex, Handler, DataHandler} from 'nclient-microfront'  
const store = new Vuex.Store({
  modules: {
    login: convertVuex(sdk.login)  
  }
}
```
引用sdk中的方法或对象,前提是继承Handler或DataHandler  
```javascript
class T extends DataHandle{  
  constructor(number) {  
    super('login', number)  //data中保存的名称, 第二个参数保证重复时不会覆盖
    this.isLogin = false
  }  
  doSome () {

  }
}  
```
在vuex中调用  
```javascript
...mapState({
  isLogin: state => state.login.target.isLogin
})

...mapAction({
  "doSome": 'login.doSome'
})
```