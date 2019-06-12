
/*
 * anysee.js
 * ver beta
 * 用于模型在Web上展示用
 * author xudatong
 * email datongoworld@hotmail.com
 * created 2019.05.30
 * 
 */



/**
 * 目前使用的是 three.js r105 版本
 * 如果出错，请自己引用一下脚本
 * three.min.js
 * FBXLoader.js
 * OrbitControls.js
 * inflate.min.js
 */
document.write("<script  src='https://raw.githack.com/mrdoob/three.js/master/build/three.min.js'></script>");
document.write("<script  src='https://raw.githack.com/mrdoob/three.js/master/examples/js/loaders/FBXLoader.js'></script>");
document.write("<script  src='https://raw.githack.com/mrdoob/three.js/master/examples/js/controls/OrbitControls.js'></script>");
document.write("<script  src='https://raw.githack.com/mrdoob/three.js/master/examples/js/libs/inflate.min.js'></script>");



function ANYSEE(view,alpha){
    /** 视窗 */
    this.view = view ;
    /** 透明背景 */
    this.alpha = alpha ;
    /** 视窗大小 宽 */
    this.width = view === document.body ? window.innerWidth : view.offsetWidth;
    /** 视窗大小 高 */
    this.height = view === document.body ? window.innerHeight : view.offsetHeight;
    /** 画布 */
    this.container = null;
    /** 渲染 */
    this.renderer = null;
    /** 相机 */
    this.camera = null;
    /** 模型场景 */
    this.scene = null;
    /** 计时器 */
    this.clock = null;
    /** UI 相机 */
    this.uiCamera = null;
    /** UI 场景 */
    this.uiScene = null;
    /** 场景背景颜色 雾 */
    this.background = {
        color : 0xffffff,
        fog : {
            use : true,
            color : 0xffffff,
            near : 30,
            far : 1500
        }
    };
    /** 地板 */
    this.ground = {
        use : true ,
        mesh : null ,
        size : {
            x : 2000,
            y : 2000
        },
        color: 0x999999
    };
    /** 网格 */
    this.grid = {
        use : true,
        grid : null ,
        size : 2000,
        sub : 20,
        colorCenterLine : alpha ? 0x000000 : 0x666666,
        colorGrid : alpha ? 0x0A0A0A : 0xCCCCCC
    };
    /** 控制 */
    this.controls = {
        control : null,
        pos : new THREE.Vector3(0,0,0),
        min : 10,
        max : 800,
        autoRotateSpeed : 0.05,
        autoRotate : true,
        dampingFator : 0.1,
        enableDamping : true,
        enablePan : false
    };
    /** 灯光 */
    this.light = {
        ambient : null,
        hemisphereLight : null,
        directionalLight : null
    };
    /** 模型 */
    this.model = {
        url : '',
        name : '',
        /** 模型类型 0 JSon 1 Fbx */
        type : 0,
        size : 1,
        model : null,
        mixer : null,
        group : null,
        /**
         * default 默认动画，如果打开就播放默认动画
         * auto 自动播放那个动画
         * next 是否播放下一段，如果是，当前动画播放完后会播放 auto
         * time 当前动画长度 
         * 动画clip 数组
         */
        anims : {
            default : false,
            auto : 0,
            next : false,
            time : 0,
            clips : null
        }
    };
    /** Mesh Button */
    this.meshbuttons = {
        /** 按钮数组 */
        buttons : Array(),
        /** 交互数组 */
        intersect : Array()
    };
    /** 点击 */
    this.touch = {
        mouse : null ,
        raycaster : null,
        /** 
         * 如果渲染器放在主页中，并且主页有滚动的情况下 需要打开
         * 如果像单页跳出来的地方，例如使用magnificPopup 也就是全屏的情况下，需要关掉
         */
        scroll : true
    },
    /** HDR 环境贴图 */
    this.hdr = null ;
    /** 数据路径 */
    this.apiPath = 'anysee/';
    /** UI */
    this.ui = {
        logo : {
            show : true ,
            ui : null
        } ,
        author : {
            ui : null,
            pos : 2,
            size : 0.2
        }
    };
    /** debug模式 */
    this.debug = false ;

}

ANYSEE.prototype = {
    /**
     * 加载FBX模型
     * @param {模型名字} name 
     * @param {模型地址} url 
     */
    loadFBXModel: function(name,url){
        this.model.name = name ;
        this.model.url = url;
        this.model.type = 1;
    },
    /**
     * 加载Json模型 暂不可用
     * @param {模型名字} name 
     * @param {模型地址} url 
     */
    loadJsonModel:function(name,url){
        this.model.name = name ;
        this.model.url = url;
        this.model.type = 0;
    },
    /**
     * 设置控制器
     * @param {自动旋转速度} rotateSpeed 
     * @param {是否可以平移} enablePan 
     */
    setControl :function(rotateSpeed,enablePan) {
        this.controls.autoRotateSpeed = rotateSpeed ;
        this.controls.autoRotate = rotateSpeed === 0 ? false : true ;
        this.controls.enablePan = enablePan ;
    },
    /**
     * 设置网格
     * @param {使用网格} use
     */
    setGrid : function (use){
        this.grid.use = use ;
    },
    /**
     * 设置背景
     * @param {背景颜色} color
     * @param {使用雾} fog
     * @param {雾颜色} fogColor
     * @param {雾最近距离} fogNear
     * @param {雾最远距离} fogFar
     */
    setBackground : function(color , fog , fogColor , fogNear, fogFar){
        this.background.color = color ;
        this.background.fog.use = fog ;
        this.background.fog.color = fogColor ;
        this.background.fog.near = fogNear ;
        this.background.fog.far = fogFar;
    },
    /**
     * 设置默认动画
     * @param {打开默认动画} open
     */
    setModelDefaultAnimation : function(open){
        this.model.anims.default = open ;
    },
    /**
     * 设置模型动画组
     * @param {默认打开的动画 INT} defaultClip
     * @param {动画组 ANYSEE.ModelAnimationClip 数组} clips
     */
    setModelAnimationClips : function(defaultClip,clips){
        this.model.anims.auto = defaultClip;
        this.model.anims.clips = clips ;
    },
    /**
     * 设置模型组 用于修改材质球
     * @param {ANYSEE.ModelGroup 数组} group
     */
    setModelGroup : function(group){
        this.model.group = group ;
    },
    /**
     * 如果渲染器放在主页中，并且主页有滚动的情况下 需要打开
     * 如果像单页跳出来的地方，例如使用magnificPopup 也就是全屏的情况下，需要关掉
     */
    setTouch : function(scroll){
        this.touch.scroll = scroll
    },
    /**
     * 设置API的路径，放置修改路径，目前默认路径为 anysee/
     * @param {路径} path
     */
    setApiPath : function(path){
        this.apiPath = path ;
    },
    /**
     * 设置环境图路径，默认已经有环境图，如果需要更换请用这个方法
     * @param {路径} path
     */
    setHDR : function(path){
        this.hdr = new THREE.CubeTextureLoader()
        .setPath(path)
        .load(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']);
    },
    /**
     * @param {按钮名称} name 
     * @param {是否打开} open 
     * @param {按钮位置} pos 
     * @param {按钮大小} size 
     * @param {事件组 array} event 
     */
    addMeshButton : function(name,open,pos,size,events){
        var button = {
            name : name ,
            open : open ,
            pos : pos ,
            size : size ,
            events : events ,
            mesh : null 
        };
        if( this.meshbuttons.buttons == null){
            this.meshbuttons.buttons = new Array();
        }
        this.meshbuttons.buttons.push(button);
    },
    /**
     * 初始化anysee
     * 当所有准备好后执行这一步
     * @param {Debug模式 主要开启MeshButton预览} debug
     */
    init: function(debug){
        this.debug = debug ;
        InitAnysee(this);
    },
    /**
     * 更新，目前不需要调用，已在 init 后自动更新
     */
    update: function(){
        UpdateAnysee(this);
    }
};

/**
 * @param {动作 'switch' 显示及不显示 'animator' 模型动画} action 
 * @param {执行 'switch' 0-1 'animator' 0-n} execute
 * @param {返回 'switch' 0-1 'animator' 0-n} callback 
 * @param {标签组 string} names
 */
ANYSEE.MeshButtonEvent = function(action,execute,callback,names){
    this.action = action ;
    this.execute = execute ;
    this.callback = callback ;
    this.names = names ;
};
/**
 * 
 * @param {按钮名称} name 
 * @param {是否打开} open 
 * @param {按钮位置} pos 
 * @param {按钮大小} size 
 * @param {事件组 array} event 
 */
ANYSEE.MeshButton = function(name,open,pos,size,events){
    this.name = name ;
    this.open = open ;
    this.pos = pos ;
    this.size = size ;
    this.events = events ;
    this.mesh = null ;
};
/**
 * 
 * @param {动画名称} name 
 * @param {动画帧率} fps 
 * @param {动画开始时间} start 
 * @param {动画结束时间} end 
 */
ANYSEE.ModelAnimationClip = function(name,fps,start,end){
    this.name = name ,
    this.fps = fps ,
    this.start = start,
    this.end = end,
    this.clip = null 
};

/**
 * 
 * @param {组名称 如果为 'ALLMODEL' 为全部} group 
 * @param {ANYSEE.Material} material 
 */
ANYSEE.ModelGroup = function(group,material){
    this.names= group,
    this.group= new Array(),
    this.material= material
};
/**
 * 
 * @param {纹理地址} url 
 * @param {颜色} color 
 * @param {高光度} metalness 
 * @param {粗糙度} roughness 
 * @param {透明度} opacity 
 */
ANYSEE.Material = function(url,color,metalness,roughness,opacity){
    this.url = url,
    this.color = color,
    this.metalness = metalness ,
    this.roughness = roughness ,
    this.transparent = opacity === 1 ? false : true ,
    this.opacity = opacity
};

function InitAnysee(view){

    

    if(view.hdr === null){
        view.hdr = new THREE.CubeTextureLoader()
        .setPath(view.apiPath + "data/hdr/")
        .load(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']);
    }

    view.width = view.view === document.body ? window.innerWidth : view.view.offsetWidth;
    view.height = view.view === document.body ? window.innerHeight : view.view.offsetHeight;
    view.container = document.createElement('div');
    view.view.appendChild(view.container);

    if (view.view === document.body) {
        view.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        view.uiCamera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 1, 10);
    } else {
        view.camera = new THREE.PerspectiveCamera(45, view.width / view.height, 1, 10000);
        view.uiCamera = new THREE.OrthographicCamera(-view.width / 2, view.width / 2, view.height / 2, -view.height / 2, 1, 10);
    }
    view.uiCamera.position.set(0,0,10);
    view.uiScene = new THREE.Scene();

    var uiTextureLoader = new THREE.TextureLoader();
    uiTextureLoader.load(view.apiPath + 'data/interface/logo.png', function(tex){
        var aMaterial = new THREE.SpriteMaterial({
            map: tex
        });
        view.ui.author.ui = new THREE.Sprite(aMaterial);
        view.uiScene.add(view.ui.author.ui);

        var lMaterial = new THREE.SpriteMaterial({
            map: tex
        });
        view.ui.logo.ui = new THREE.Sprite(lMaterial);
        view.uiScene.add(view.ui.logo.ui);

        UpdateUI(view);
    });

    view.clock = new THREE.Clock();

    view.scene = new THREE.Scene();
    view.scene.background = new THREE.Color( view.background.color );
    if(view.background.fog.use){
        view.scene.fog = new THREE.Fog( view.background.fog.color, view.background.fog.near, view.background.fog.far );
    }

    view.light.ambient = new THREE.AmbientLight(0xffffff, 1);
    view.light.hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    view.light.hemisphereLight.color.setHSL(0.6, 1, 0.6);
    view.light.hemisphereLight.groundColor.setHSL(0.8, 1, 0.8);
    view.light.hemisphereLight.position.set(0, 500, 0);
    view.light.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    view.light.directionalLight.color.setHSL(0.1, 1, 0.95);
    view.light.directionalLight.position.set(-1, 1, 1);
    view.light.directionalLight.position.multiplyScalar(100);
    view.light.directionalLight.castShadow = true;
    view.light.directionalLight.shadow.camera.top = 200;
    view.light.directionalLight.shadow.camera.bottom = - 200;
    view.light.directionalLight.shadow.camera.left = - 200;
    view.light.directionalLight.shadow.camera.right = 200;
    view.light.directionalLight.shadow.mapSize.set(4096, 4096);

    view.scene.add(view.light.ambient);
    view.scene.add(view.light.hemisphereLight);
    view.scene.add(view.light.directionalLight);

    view.renderer = new THREE.WebGLRenderer({
        alpha: view.alpha,
        antialias: true
    });
    view.renderer.setPixelRatio(window.devicePixelRatio);
    if (view.view === document.body) {
        view.renderer.setSize(window.innerWidth, window.innerHeight);
    } else {
        view.renderer.setSize(view.width, view.height);
    }
    view.renderer.autoClear = false;
    view.renderer.gammaInput = true;
    view.renderer.gammaOutput = true;
    view.renderer.shadowMap.enabled = true;
    view.renderer.shadowMap.renderReverseSided = false;
    view.container.appendChild(view.renderer.domElement);

    view.controls.control = new THREE.OrbitControls(view.camera, view.renderer.domElement);
    view.controls.control.target.set(view.controls.pos.x, view.controls.pos.y, view.controls.pos.z);
    view.controls.control.minDistance = view.controls.min;
    view.controls.control.maxDistance = view.controls.max;

    view.controls.control.enableDamping = view.controls.enableDamping;
    view.controls.control.dampingFator = view.controls.dampingFator;
    view.controls.control.autoRotate = view.controls.autoRotate;
    view.controls.control.autoRotateSpeed = view.controls.autoRotateSpeed;
    view.controls.control.enablePan = view.controls.enablePan;

    /* Load Model */
    if(view.model.url !=''){
        if(view.model.type === 0){
            
        }else if(view.model.type === 1){
            var loader = new THREE.FBXLoader();
            loader.load( view.model.url, function ( object ) {
                view.model.model = object ;
                FinishLoadModel(view);
                if(view.model.anims.default ){
                    view.model.mixer = new THREE.AnimationMixer( object );
                    view.model.mixer.clipAction( object.animations[ 0 ] ).play();
                }else if (view.model.anims.clips != null){
                    view.model.mixer = new THREE.AnimationMixer( object );
                    BuildNewModelAnimationClip(view.model.anims.clips,object.animations[ 0 ]);
                    if(view.model.anims.clips.length > view.model.anims.auto){
                        view.model.mixer.clipAction(view.model.anims.clips[ view.model.anims.auto ].clip ).play();
                    }
                }
                
            });
        }
    }
    /* Load Model */


    if(view.ground.use){
        view.ground.mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( view.ground.size.x,view.ground.size.y ), new THREE.MeshPhongMaterial( { color:view.ground.color, depthWrite: false } ) );
        view.ground.mesh.rotation.x = -Math.PI/2;
        view.ground.mesh.receiveShadow = true;
        view.scene.add(view.ground.mesh);
    }
    

    window.addEventListener('resize', function() {
        if (view.view === document.body) {
            view.camera.aspect = window.innerWidth / window.innerHeight;
            view.camera.updateProjectionMatrix();
            UpdateUI(view);
            view.renderer.setSize(window.innerWidth, window.innerHeight);
        } else {
            view.width = view.view.offsetWidth;
            view.height = view.view.offsetHeight;
            view.camera.aspect = view.width / view.height;
            view.camera.updateProjectionMatrix();
            UpdateUI(view);
            view.renderer.setSize(view.width, view.height);
        }
    },false);

    /** 添加事件按钮 */

    AddMeshButton(view);

    /** 添加事件按钮 */

    UpdateAnysee(view);
}

function UpdateAnysee(view){
    lateUpdate();
    function lateUpdate(){
        requestAnimationFrame(lateUpdate);
        var delta = view.clock.getDelta();
        if( view.model.mixer){
            if(!view.model.anims.default && view.model.anims.next && view.model.anims.clips != null){
                view.model.anims.time -= delta ;
                if(view.model.anims.time <=0){
                    view.model.anims.next = false ;
                    if(view.model.anims.clips.length > view.model.anims.auto){
                        view.model.mixer.stopAllAction();
                        view.model.mixer.clipAction(view.model.anims.clips[view.model.anims.auto].clip).play();
                    }
                }
            }
            view.model.mixer.update(delta);
        }

        if(view.controls.control != null &&  view.controls.autoRotate){
            view.controls.control.update();
        }
        view.renderer.clear();
        view.renderer.render(view.scene, view.camera);
        view.renderer.clearDepth();
        view.renderer.render(view.uiScene, view.uiCamera);
    }
};

function UpdateUI(view){

    var width = view.width / 2;
    var height = view.height / 2;

    if (view.view === document.body) {
        width = window.innerWidth / 2;
        height = window.innerHeight / 2;
    }
    view.uiCamera.left = -width;
    view.uiCamera.right = width;
    view.uiCamera.top = height;
    view.uiCamera.bottom = -height;
    view.uiCamera.updateProjectionMatrix();
    if (view.ui.author.ui != null) {
        var uiMaterial = view.ui.author.ui.material;
        var imageWidth = uiMaterial.map.image.width;
        var imageHeight = uiMaterial.map.image.height;
        var wsize = (width * 2) * view.ui.author.size; ///取宽度比例大小
        var a = wsize / imageWidth ///实际比例
        view.ui.author.ui.scale.set(imageWidth * a, imageHeight * a, 1);
        switch (view.ui.author.pos) {
            case 0:
            view.ui.author.ui.position.set(0, 0, 1);
            break;
            case 1:
            view.ui.author.ui.position.set(-width + (imageWidth / 2) * a, height - (imageHeight / 2) * a, 1);
            break;
            case 2:
            view.ui.author.ui.position.set(width - (imageWidth / 2) * a, height - (imageHeight / 2) * a, 1);
            break;
            case 3:
            view.ui.author.ui.position.set(-width + (imageWidth / 2) * a, -height + (imageHeight / 2) * a, 1);
            break;
            case 4:
            view.ui.author.ui.position.set(width - (imageWidth / 2) * a, -height + (imageHeight / 2) * a, 1);
            break;
        }
    }
    if(view.ui.logo.ui != null && view.ui.logo.show){
        var logoMaterial = view.ui.logo.ui.material;
        var imageWidth = logoMaterial.map.image.width;
        var imageHeight = logoMaterial.map.image.height;
        var wsize = (width * 2) * 0.75; ///取宽度比例大小
        var a = wsize / imageWidth ///实际比例
        view.ui.logo.ui.scale.set(imageWidth * a, imageHeight * a, 1);
        view.ui.logo.ui.position.set(0, 0, 1);
    }
};

function FinishLoadModel(view){
    if(view.model.model != null){
        var boundingBox = new Array();
        view.model.model.traverse(function(child){
            if(child.isMesh){
                child.geometry.computeBoundingBox();
                boundingBox.push(child.geometry.boundingBox);
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        view.model.model.position.set(0, 0, 0);
        
        if(view.model.group != null){
            for(var g = 0; g <view.model.group.length ; g++){
                if(view.model.group[g].names==="ALLMODEL"){
                    var isNotTex = (view.model.group[g].material.url.replace(/(^\s*)|(\s*$)/g,"").length === 0) ;
                    var texture = null ;
                    if(!isNotTex){
                        texture = new THREE.TextureLoader().load( view.model.group[g].material.url);
                    }
                    view.model.model.traverse(function(child){
                        if(child.isMesh){
                            var mat ;
                            if(child.material.length === undefined){
                                mat = new THREE.MeshStandardMaterial({
                                    map: isNotTex == true ? child.material.map : texture ,
                                    skinning : child.material.skinning,
                                    color: view.model.group[g].material.color,
                                    metalness: view.model.group[g].material.metalness,
                                    roughness: view.model.group[g].material.roughness,
                                    shading: THREE.SmoothShading,
                                    combine: THREE.MixOperation,
                                    transparent: view.model.group[g].material.transparent,
                                    opacity: view.model.group[g].material.opacity,
                                    envMap: view.hdr
                                });
                            }
                            else {
                                mat = child.material ;
                                for(var m = 0; m < mat.length ; m++){
                                    
                                    var nm = new THREE.MeshStandardMaterial({
                                        map: isNotTex == true ? mat[m].map : texture ,
                                        skinning : mat[m].skinning,
                                        color: view.model.group[g].material.color,
                                        metalness: view.model.group[g].material.metalness,
                                        roughness: view.model.group[g].material.roughness,
                                        shading: THREE.SmoothShading,
                                        combine: THREE.MixOperation,
                                        transparent: view.model.group[g].material.transparent,
                                        opacity: view.model.group[g].material.opacity,
                                        envMap: view.hdr
                                    });
                                    mat[m] = nm ;
                                }
                            }
                            child.material = mat ;
                        }
                    });
                    
                }
                else {
                    var names = view.model.group[g].names.split(',');
                    names.forEach(function(n) {
                        view.model.group[g].group.push(object.getObjectByName( n ));
                    });
                    var isNotTex = (view.model.group[g].material.url.replace(/(^\s*)|(\s*$)/g,"").length === 0) ;
                    var texture = null ;
                    if(!isNotTex){
                        texture = new THREE.TextureLoader().load( view.model.group[g].material.url);
                    }
                    for(var m = 0 ; m < view.model.group[g].group.length ; m++){
                        var mat ;
                        if(view.model.group[g].group[m].material.length === undefined){
                            mat = new THREE.MeshStandardMaterial({
                                map: isNotTex == true ? view.model.group[g].group[m].material.map : texture ,
                                skinning : view.model.group[g].group[m].material.skinning,
                                color: view.model.group[g].material.color,
                                metalness: view.model.group[g].material.metalness, ///值越大，有高光，越小，越亮
                                roughness: view.model.group[g].material.roughness, ///值越小 高光越小 越大 高光看不见
                                shading: THREE.SmoothShading,
                                combine: THREE.MixOperation,
                                transparent: view.model.group[g].material.transparent,
                                opacity: view.model.group[g].material.opacity,
                                envMap: view.hdr
                            });
                        }
                        else{
                            mat = view.model.group[g].group[m].material ;
                            for(var m = 0; m < mat.length ; m++){
                                
                                var nm = new THREE.MeshStandardMaterial({
                                    map: isNotTex == true ? mat[m].map : texture ,
                                    skinning : mat[m].skinning,
                                    color: view.model.group[g].material.color,
                                    metalness: view.model.group[g].material.metalness,
                                    roughness: view.model.group[g].material.roughness,
                                    shading: THREE.SmoothShading,
                                    combine: THREE.MixOperation,
                                    transparent: view.model.group[g].material.transparent,
                                    opacity: view.model.group[g].material.opacity,
                                    envMap: view.hdr
                                });
                                mat[m] = nm ;
                            }
                        }
                        view.model.group[g].group[m].material = mat ;
                    }
                }
            }
        }
    
        var min = new THREE.Vector3(0,0,0);
        var max = new THREE.Vector3(0,0,0);
        boundingBox.forEach(function(item){
            min.x = item.min.x < min.x ? item.min.x : min.x ;
            min.y = item.min.y < min.y ? item.min.y : min.y ;
            min.z = item.min.z < min.z ? item.min.z : min.z ;
            max.x = item.max.x > max.x ? item.max.x : max.x ;
            max.y = item.max.y > max.y ? item.max.y : max.y ;
            max.z = item.max.z > max.z ? item.max.z : max.z ;
        });
        view.controls.pos.x = min.x + (max.x - min.x) * 0.5;
        view.controls.pos.y = min.z + (max.z - min.z) * 0.5;
        view.controls.pos.z = min.y + (max.y - min.y) * 0.5;
        view.controls.max = max.x + max.y + max.z;
    
        view.controls.control.reset();
        view.controls.control.target.set(view.controls.pos.x, view.controls.pos.y, view.controls.pos.z);

        view.camera.position.set(view.controls.pos.x ,view.controls.pos.y * 2 ,view.controls.pos.z + view.controls.max * 1.8);
    
        view.ui.logo.show = false ;
        view.uiScene.remove(view.ui.logo.ui) ;

        view.scene.add(view.model.model);

        if(view.background.fog.use && view.scene.fog !=null){
            view.scene.fog.near = view.controls.max*2;
            view.scene.fog.near = view.controls.max*6;
        }

        if(view.grid.use){
            view.grid.sub = Math.round (view.grid.size / ( ( max.x + max.z ) / 2 ) * 2);
            view.grid.sub += view.grid.sub % 2 ;
            view.grid.grid = new THREE.GridHelper( view.grid.size, view.grid.sub, view.grid.colorCenterLine, view.grid.colorGrid );
            view.grid.grid.material.opacity = 0.2;
            view.scene.add( view.grid.grid );
        }
    }

    console.log("ANYSEE by datong","beta");
}

function AddMeshButton(view){
    if(view.meshbuttons.buttons.length > 0){
        for(var e = 0 ; e < view.meshbuttons.buttons.length ; e++){
            var eMaterial = new THREE.MeshStandardMaterial({
                map: null,
                transparent: true,
                color: Math.random() * 0xffffff,
                opacity: view.debug === true ? 0.5 : 0
            });
            var geometry = new THREE.BoxGeometry(view.meshbuttons.buttons[e].size.x, view.meshbuttons.buttons[e].size.y,view.meshbuttons.buttons[e].size.z);
            view.meshbuttons.buttons[e].mesh = new THREE.Mesh(geometry, eMaterial);
            view.meshbuttons.buttons[e].mesh.position.set(view.meshbuttons.buttons[e].pos.x,view.meshbuttons.buttons[e].pos.y,view.meshbuttons.buttons[e].pos.z);
            
            view.meshbuttons.buttons[e].mesh.visible = view.meshbuttons.buttons[e].open ;
            view.meshbuttons.intersect.push(view.meshbuttons.buttons[e].mesh);
            view.scene.add(view.meshbuttons.buttons[e].mesh);
        }

        view.renderer.domElement.addEventListener('mousedown', function(event) {
            if(event.button == 0){
                TouchMeshButton(event.clientX,event.clientY);
            }
        },false);
        view.renderer.domElement.addEventListener('touchstart', function(event) {
            TouchMeshButton(event.touches[0].clientX,event.touches[0].clientY);
        },false);
    }

    /**
     * 保证让鼠标和手指都可以点击此处
     * @param {点击的位置} touch_x 
     * @param {点击的位置} touch_y
     */
    function TouchMeshButton(touch_x,touch_y){
        if(view.touch.mouse == null){
            view.touch.mouse = new THREE.Vector2();
        }
        if(view.touch.raycaster == null){
            view.touch.raycaster = new THREE.Raycaster();
        }
        /**
         * 当html指定了DOCTYPE时，使用document.documentElement.scrollTop
         * 当html没指定DOCTYPE时，使用document.body.scrollTop
         */
        var scrollTop = view.touch.scroll === true ? Math.max(document.documentElement.scrollTop,document.body.scrollTop) : 0;
        var scrollLeft = view.touch.scroll === true ? Math.max(document.documentElement.scrollLeft,document.body.scrollLeft ) : 0;
        var x = GetDomElementAbsoluteLeft() - scrollLeft;
        var y = GetDomElementAbsoluteTop() - scrollTop;
        view.touch.mouse.x = ((touch_x- x) / view.renderer.domElement.clientWidth) * 2 - 1;
        view.touch.mouse.y = -((touch_y - y) / view.renderer.domElement.clientHeight) * 2 + 1;

        view.touch.raycaster.setFromCamera(view.touch.mouse, view.camera);
        var intersects = view.touch.raycaster.intersectObjects(view.meshbuttons.intersect);
        if(intersects.length > 0){
            for(var i = 0; i < intersects.length ; i++){
                for(var t = 0 ; t < view.meshbuttons.buttons.length ; t++){
                    if(intersects[i].object.uuid === view.meshbuttons.buttons[t].mesh.uuid){
                        TouchMeshButtonEvent(view.meshbuttons.buttons[t].events);
                    }
                }
            }
        }
    }

    /**
     * 
     * @param {ANYSEE.MeshButtonEvent Array} events 
     */
    function TouchMeshButtonEvent(events){

        events.forEach(function(item) {
            var names = item.names.split(',');
            for(var i = 0; i < names.length ; i++){
                if(item.action == 'switch'){
                    view.meshbuttons.buttons.forEach(function(obj) {
                        if(obj.name === names[i]){
                            obj.mesh.visible = item.execute === 0 ? false : true ;
                        }
                    });
                    if(view.model.name === names[i]){
                        view.model.model.visible = item.execute === 0 ? false : true ;
                    }
                }
                else if(item.action == 'animator'){
                    if(view.model.name === names[i] && view.model.mixer != null && view.model.anims.clips !=null 
                        && view.model.anims.clips.length > item.execute && view.model.anims.clips[item.execute]!=null){
                        view.model.mixer.stopAllAction();
                        view.model.mixer.clipAction(view.model.anims.clips[item.execute].clip).play();
                        view.model.anims.auto = item.callback ;
                        view.model.anims.next = true ;
                        view.model.anims.time = view.model.anims.clips[item.execute].clip.duration;
                    }
                }
            }
        });
    }

    function GetDomElementAbsoluteLeft(){
        o = view.renderer.domElement;
        oLeft = o.offsetLeft
        while (o.offsetParent != null) {
            oParent = o.offsetParent
            oLeft += oParent.offsetLeft
            o = oParent
        }
        return oLeft
    }
    function GetDomElementAbsoluteTop(){
        o = view.renderer.domElement;
        oTop = o.offsetTop;
        while (o.offsetParent != null) {
            oParent = o.offsetParent
            oTop += oParent.offsetTop
            o = oParent
        }
        return oTop
    }
}

function BuildNewModelAnimationClip(clips,oclip){
    for(var i = 0; i < clips.length ; i++){
        var s = clips[i].start ;
        var e = clips[i].end;
        var f = clips[i].fps;
        var n = clips[i].name;
        var l = (e-s)/f;
        var tarcks = [oclip.tracks.length];
        var sf = s / f;
        var ef = e / f;
        for(var j = 0; j < oclip.tracks.length; j++){
            var arr = oclip.tracks[j].name.split('.');
            var time = [];
            var value = [];
            var old = 0;
            for (var ti = 0; ti < oclip.tracks[j].times.length; ti++) {
                if (oclip.tracks[j].times[ti] >= sf && oclip.tracks[j].times[ti] <= ef) {
                    if (time.length == 0) {
                        old = oclip.tracks[j].times[ti];
                    }
                    time.push(oclip.tracks[j].times[ti] - old);
                    var mm = 3;
                    if (arr[arr.length - 1] == 'quaternion') {
                        mm = 4;
                    }
                    for (var p = 0; p < mm; p++) {
                        var num = ti * mm + p;
                        value.push(oclip.tracks[j].values[num]);
                    }
                }
            }
            if (time.length <= 0) {
                time.push(0);
            }
            if (value.length <= 0) {
                if (arr[arr.length - 1] == 'position') {
                    value.push(oclip.tracks[i].values[0]);
                    value.push(oclip.tracks[i].values[1]);
                    value.push(oclip.tracks[i].values[2]);
                } else if (arr[arr.length - 1] == 'quaternion') {
                    value.push(oclip.tracks[i].values[0]);
                    value.push(oclip.tracks[i].values[1]);
                    value.push(oclip.tracks[i].values[2]);
                    value.push(oclip.tracks[i].values[3]);
                } else if (arr[arr.length - 1] == 'scale') {
                    value.push(oclip.tracks[i].values[0]);
                    value.push(oclip.tracks[i].values[1]);
                    value.push(oclip.tracks[i].values[2]);
                }
            }
            var track;
            if (arr[arr.length - 1] == 'quaternion') {
                track = new THREE.QuaternionKeyframeTrack(oclip.tracks[j].name, time, value);
            } else {
                track = new THREE.VectorKeyframeTrack(oclip.tracks[j].name, time, value);
            }
            tarcks[j] = track;
        }
        clips[i].clip = new THREE.AnimationClip(clips[i].name, l, tarcks);
    }
};