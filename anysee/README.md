## Anysee

version : beta

author  : datong

### 介绍

anysee.js 是用来在web上面展示3d模型的软件
是我学习three.js练手的一个小软件
可以理解为简化three.js上的代码量
让你简单的几行代码就可以展示3d模型!目前只支持FBX模型加载,未来加入json模型

目前基于three.js r105版本

[范例文件](https://github.com)

### 源文件及目录

```
anysee
	├──core
	|	├──controls
	|	|	└──OrbitControls.js
	|	├──libs
	|	|	└──inflate.min.js
	|	├──loaders
	|	|	└──FBXLoader.js
	|	└──three.min.js
	├──data
	|	├──hdr
	|	└──interface
	└──src
		├──anysee.githack.js
		└──anysee.js
```

### 引用

在您的html中可以有两种引用anysee.js的方法

- `<script src="anysee/src/anysee.githack.js"></script>`

  这种方法已经把OrbitControls.js,inflate.min.js,FBXLoader.js 以及three.min.js 直接引用进去,不过用的是github上的,虽然简单，但是很不安全

- `<script src="anysee/src/anysee.js"></script>`

  如果您引用这个的话,您还需要单独引用其他4个核心js

  ```
  <script src="anysee/core/three.min.js"></script>
  <script src="anysee/core/loaders/FBXLoader.js"></script>
  <script src="anysee/core/controls/OrbitControls.js"></script>
  <script src="anysee/core/libs/inflate.min.js"></script>
  ```

### 方法调用

- #### ANYSEE(view,alpha)

  @param {视窗} view

  @param {透明} alpha

  `构造一个anysee视窗`

  ```
  var myAnysee = new ANYSEE(document.body,true);
  ```

- #### ANYSEE.addMeshButton(name,open,pos,size,envents)

  @param {名字} name

  @param {应用} open

  @param {位置 `THREE.Vector3`} pos

  @param {大小 `THREE.Vector3`} size

  @param {事件组 数组 `ANYSEE.MeshButtonEvent`} envents

  `添加 Mesh 按钮`

  ```
  var myAnysee = new ANYSEE(document.body,true);
  myAnysee.loadFBXModel("boy","data/model/fbx/tinyboy.FBX");
  
  var evs = new ANYSEE.MeshButtonEvent("animator",1,0,"chunli");
  myAnysee.addMeshButton("Button1",true,new THREE.Vector3(0,50,0),new THREE.Vector3(40,100,40),[evs]);
  
  myAnysee.init(false);
  ```

- #### ANYSEE.init(debug)

  @param {Debug} debug

  `初始化anysee视窗`

- #### ANYSEE.loadFBXModel(name,url)

  @param {名称} name

  @param {地址} url

  `读取fbx模型`

  ```
  var myAnysee = new ANYSEE(document.body,true);
  myAnysee.loadFBXModel("boy","data/model/fbx/tinyboy.FBX");
  myAnysee.init(false);
  ```

- #### ANYSEE.setApiPath(path)

  @param {地址} path

  `设置api地址,设置环境图地址 默认为 anysee/`

- #### ANYSEE.setBackground(color,useFog,forColor,fogNear,fogFar)

  @param {背景颜色} color

  @param {使用雾气} useFog

  @param {雾气颜色} forColor

  @param {雾气最近距离} fogNear

  @param {雾气最远距离} fogFar

  `设置背景`

  ```
  var myAnysee = new ANYSEE(document.body,true);
  myAnysee.setBackground(0xffffff,true,0xffffff,100,2000);
  myAnysee.init(false);
  ```

- #### ANYSEE.setControl(rotateSpeed,enablePan)

  @param {自动旋转速度} rotateSpeed

  @param {是否允许平移} enablePan

  `设置控制器`

- #### ANYSEE.setHDR(path)

  @param {路径} path

  `设置HDR纹理路径`

- #### ANYSEE.setGrid(use)

  @param {是否启用地面网格} use

  `设置地面网格 默认 true`

- #### ANYSEE.setModelAnimationClips(default,clips)

  @param {自动播放序号} default

  @param {`ANYSEE.ModelAnimationClip` 数组} clips

  `设置模型动画组`

  ```
  var myAnysee = new ANYSEE(document.body,true);
  myAnysee.loadFBXModel("boy","data/model/fbx/tinyboy.FBX");
  
  var run = new ANYSEE.ModelAnimationClip("Idle",30,10,26);
  myAnysee.setModelAnimationClips(0,[run]);
  
  myAnysee.init(false);
  ```

- #### ANYSEE.setModelDefaultAnimation(open)

  @param {打开默认动画} open

  `设置默认动画 如果打开这个,那么设置 ANYSEE.setModelAnimationClips 将无效`

- #### ANYSEE.setModelGroup(group)

  @param {`ANYSEE.ModelGroup` 数组} group

  `设置模型组 用于修改材质球`

  ```
  var myAnysee = new ANYSEE(document.body,true);
  myAnysee.loadFBXModel("boy","data/model/fbx/tinyboy.FBX");
  
  var group = new ANYSEE.ModelGroup("ALLMODEL",new ANYSEE.Material("",0xffffff, 0.6, 0.9, 1));
  myAnysee.setModelGroup([group]);
  
  myAnysee.init(false);
  ```

- #### ANYSEE.setTouch(scroll)

  @param {`boolean` 滚动} scroll

  `设置点击`

  `如果渲染器放在主页中，并且主页有滚动的情况下 需要打开`

  `如果像单页跳出来的地方，例如使用magnificPopup 也就是全屏的情况下，需要关掉`

- #### ANYSEE.Material(texture,color,metalness,roughness,opacity)

  @param {纹理地址} texture

  @param {颜色} color

  @param {高光度} metalness

  @param {粗糙度} roughness

  @param {透明度} opacity

  `构造一个Material`

  ```
  new ANYSEE.Material("",0xffffff, 0.5, 0.9, 1);
  ```

- #### ANYSEE.MeshButtonEvent(action,execute,callback,names)

  @param {动作 `switch` 显示及不显示 `animator` 模型动画} action

  @param {执行 `switch` 0-1 `animator` 0-n} execute

  @param {返回 `switch` 0-1 `animator` 0-n} callback

  @param {标签组 string} names

  `构造一个按钮事件`

  ```
  new ANYSEE.MeshButtonEvent("animator",1,0,"chunli,ryn");
  ```

- #### ANYSEE.ModelAnimationClip(name,fps,start,end)

  @param {动作名称} name

  @param {动作帧率} fps

  @param {开始时间} start

  @param {结束时间} end

  `构造一个动画片段`

  ```
  new ANYSEE.ModelAnimationClip("Idle",60,20,80);
  ```

- #### ANYSEE.ModelGroup(group,material)

  @param {组名称 以`,` 分开 如果为 `ALLMODEL` 为全部} group

  @param {`ANYSEE.Material`} material

  `构造一个模型组`

  ```
  new ANYSEE.ModelGroup("Box001,Teapot001",new ANYSEE.Material("",0xffffff, 0.5, 0.9, 1));
  ```

  

