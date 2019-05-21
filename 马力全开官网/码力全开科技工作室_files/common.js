//-----------------  获取数据类型
function getBaseType(e) {
    return Object.prototype.toString.apply(e).slice(8, -1)
}

//------------------ 遍历对象
function eachObj(e, t) {
    for (var n in e) t(e[n], n, e)
}


//----------------- 获取对象属性数组
function getKeys(e, t) {
    var n = [];
    return eachObj(e, function (e, t) {
        n.push(t)
    }), n.sort(t)
}

//----------------- 扩展对象属性
function extend(e, t) {
    return eachObj(t, function (t, n) {
        e[n] = t
    }), e
}

//----------------- 获取元素在文档流中的位置
function getPosition(e) {
    var t = 0,
        n = 0;
    if (!e.tagName) return console.warn("element must be a HTML element object"), {
        x: null,
        y: null
    };
    for (; e !== document.body;) t += e.offsetLeft, n += e.offsetTop, e = e.offsetParent;
    return {
        x: t,
        y: n
    }
} 


//------------------- 动画库
! function (t) {
    function s(t) {
        this.ele = t, // dom元素
        this.record = [], // 类名数组
        this.index = 0, // 当前类序号
        this.dir = 1, // + 添加类 - 删除类
        this.status = !1//是否执行动画
    }
    s.prototype = {
        /**
         * 普通类名切换
         * 一般会有 display: block
         * 设置延时器 保证后续类名的动画执行
         */
        _toggleClass: function (t, s) {
            var i = this;
            var timer
            classArr = t.split(" ") 
            classArr.forEach(function (t) {
                i.ele.classList.toggle(t)
            })

            // this.ele.clientWidth
            // if(s) {
            //     timer = setTimeout(s)
            // }

            s && setTimeout(s)
        },
        /**
         * transition动画类名
         */
        _transfromClass: function (t, s) {
            var i = this;
            // let time = parseFloat(getComputedStyle(i.ele)['transition-duration']) * 1000
            // setTimeout(() => {
            //     s()
            // }, time);
            this.ele.addEventListener("transitionend", function trans(event) {
                event.stopPropagation()
                if(this === event.currentTarget) {
                    s()
                    i.ele.removeEventListener("transitionend", trans)
                }
            }, false)
            this._toggleClass(t)
        },
        /**
         * animation动画类名
         */
        _animationClass: function (t, s) {
            var i = this;
            this.ele.addEventListener("animationend", function t(e) {
                if(i.ele === e.target) {
                    s()
                    i.ele.removeEventListener("animationend", t)
                }
            }) 
            this._toggleClass(t)
        },
        /**
         * 动画集中管理处
         * 顺序添加类名过程
         * 1. 依次添加类名 添加成功后 this.index + 1
         * 2. 所有类名添加完毕 this.index === this.record.length
         * 
         * 完毕后
         * this.index -= 1
         * this.dir = -1
         * 
         * 顺数减少
         * 1. this.index + (-1)
         * 2. this.record的类名删除完后 this.index = -1
         * 
         * 完毕后
         * this.index = 0
         * this.dir = 1
         */
        _toggle: function () {
            var t = this.record[this.index];
            if (this.index === this.record.length || -1 === this.index) {
                this.end && this.end()
                this.index = this.dir > 0 ? this.index - 1 : 0;

                this.dir *= -1
                
                this.status = false
                return
            }
            switch (t.type) {
                case "class":
                    this._toggleClass(t.className, this._toggle.bind(this));
                    break;
                case "transfrom":
                    this._transfromClass(t.className, this._toggle.bind(this));
                    break;
                case "animation":
                    this._animationClass(t.className, this._toggle.bind(this))
            }
            this.index += this.dir
        },
        // record 添加class类名
        base: function (t) {
            return this.record.push({
                className: t || "js-open",
                type: "class"
            }), this
        },
        //record 添加transfrom类名
        transfrom: function (t) {
            return this.record.push({
                className: t,
                type: "transfrom"
            }), this
        },
        //record 添加animation类名
        animation: function (t) {
            return this.record.push({
                className: t,
                type: "animation"
            }), this
        },
        /**
         * 执行动画第一步
         * 执行条件：
         * 1. this.status === false
         * 2. this.index !== 0 && this.index !== this.record.length-1
         */
        toggle: function () {
            // this.status || 
            // (
            //     0 !== this.index && 
            //     this.index !== this.record.length - 1 ||
            //     (this.status = !0),
            //     this._toggle()
            // )
            if(!this.status && (this.index === 0 || this.index === this.record.length - 1)) {
                this.status = true
                this._toggle()
            }
        },
        /**
         * 
         */
        lastStart: function () {
            var t = this;
            //--- 开始运动
            this.status = false
            //--- 数组序号最后一位
            this.index = this.record.length - 1
            //--- 递减
            this.dir = -1
            //--- 
            this.record.forEach(function (s) {
                t.ele.classList.add(s.className)
            })
            return this
        },
        /**
         * 回调函数
         */
        end: function (t) {
            return this.end = t, this
        }
    }, 
    t.Pack = s
}(window);


! function (t) {
    function i(t) {
        var i = t.time,
            e = t.now,
            n = t.aims,
            r = t.spendTime,
            o = e + 60 * (n - e) / (i - r);
        return n - e > 0 ? o >= n ? n : o : o <= n ? n : o
    }
    /**
     * 构造函数
     */
    function e() {
        // 运动状态记录
        this.record = []
        //
        this.timeoutMap = {} 
        //
        this.listeners = {
            start: [],
            frame: [],
            end: []
        } 
        this.frames = 0 
        // console.log(this)
        // return
        this._init()
    }
    e.prototype = {
        /**
         * 初始化
         */
        _init: function () {
            this.index = 0 //record 数组序号从0开始
            this.nowIndex = 0 
            this.timer = null 
            this.time = 0 
            this.startTime = null
            this.record.forEach(function (t) {
                eachObj(t, function (i, e) {
                    ~e.indexOf("_") || (t[e].now = t[e].from)
                })
            })
            return this
        },
        _getSpendTime: function () {
            var t, i = this.time,
                e = this.nowIndex;
            return t = this.record.reduce(function (t, i, n) {
                return n < e && (t += i._time), t
            }, 0), i - t
        },
        /**
         * 屏幕下一帧 执行 函数
         */
        _request: function (t) {
            var i = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
                window.msRequestAnimationFrame;
            return this.timer = i(t), this
        },
        _cancel: function () {
            return (window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
                window.msCancelAnimationFrame)(this.timer), this
        },
        _algorithm: function (t) {
            var e = t.type || "linear",
                n = t.time || 1e3,
                r = t.now,
                o = t.aims || 0,
                s = t.spendTime || 0;
            switch (e) {
                case "linear":
                    return i({
                        time: n,
                        now: r,
                        aims: o,
                        spendTime: s
                    })
            }
        },
        /**
         * 执行listener 某一类型的 所有 绑定函数
         */
        _emit: function (t, i) {
            this.listeners[t] && this.listeners[t].forEach(function (t) {
                t(i)
            })
            return this
        },
        /**
         * listern数组 某类型 添加函数
         */
        on: function (type, cb) {
            ~getKeys(this.listeners)
            .indexOf(type) 
            && cb 
            && this.listeners[type].push(cb)
            return this
        },
        /**
         * 将运动初始状态记录到
         * record数组第 index位(默认第一位)
         */
        from: function (t) {
            //--- 开始属性
            t = t || {};
            //---- 运动初始状态
            //---- 记录到record数组第一位
            var i = this.record[this.index] || {};
            eachObj(t, function (value, property) {
                i[property] = {
                    from: value,
                    now: value,
                    to: 0
                }
            })
            
            this.record[this.index] = i
            return this
        },
        /**
         * 将运动结束状态记录到
         * record数组第 index位(默认第一位)
         */
        to: function (target) {
            target = target || {};

            var i = this.record[this.index] || {};

            eachObj(target, function (value, property) {
                let base = i[property] || { from:0, now: 0}
                
                i[property] = extend(base, {
                    to: value
                })
            })
            this.record[this.index] = i
            return this
        },
        /**
         * 将运动曲线 linear
         * 运动时间 1000
         * 记录到 record数组第 index位(默认第一位)
         */
        transition: function (t) {
            var i //运动曲线
            var e //运动时间

            if("string" == typeof t) {
                e = t
            } else {
                i = t.type || "linear"
                e = t.time || 1e3
            }
            var n = this.record[this.index] || {};

            extend(n, {
                _time: e,
                _type: i
            })

            this.record[this.index] = n
            return this
        },
        /**
         * index 序号 赋值为数组长度
         */
        next: function () {
            this.index = this.record.length
            return this
        },
        timeout: function (t) {
            if (t && "number" == typeof t) {
                var i = 0 === this.record.length ? -1 : this.index;
                this.timeoutMap[i] = null != this.timeoutMap[i] ? this.timeoutMap[i] + t : t
            }
            return this
        },
        /**
         * 
         */
        start: function () {
            var t = this.record
            var i = this;
            this.next()._emit("start")
            return this.next()._emit("start")._request(function e() {

                var n = t[i.nowIndex],// record 的index项
                    r = {};
                if (!i.startTime && i.timeoutMap[-1]) return i.startTime = (new Date).getTime(), i.pause(),
                    void setTimeout(function () {
                        i._request(e)
                    }, i.timeoutMap[-1]);
                    
                if (i.time === n._time) {
                    var o = i.timeoutMap[i.nowIndex];
                    if (i.time = 0, i.nowIndex++ , o) return i.pause(), void setTimeout(function () {
                        i._request(e)
                    }, o);
                    n = t[i.nowIndex]
                }
                if (i.nowIndex === t.length) return void i._emit("end").close();
                eachObj(n, function (t, e) {
                    if (!~e.indexOf("_")) {
                        var o = i._algorithm({
                            type: n._type,
                            time: n._time,
                            now: t.now,
                            aims: t.to,
                            spendTime: i.time
                        });
                        r[e] = o, n[e].now = o, o === t.to && (i.time = n._time)
                    }
                }), i.time != n._time && (i.time += 60), i._emit("frame", r), i.frames++ , i._request(
                    e)
            })
        },
        pause: function () {
            return this._cancel()
        },
        close: function () {
            return this._cancel()._init()
        }
    }

    t.Amt = e
}(window);



//---------------- 全屏加载动画
window.addEventListener("load", function () {
    ! function () {
        var e = document.getElementById("page");
        document.getElementById("page-loading").classList.add("js-hidden"), 
        e.classList.remove("js-hidden")
    }()
});


//---------------- 
window.addEventListener("load", function () {
    //-------  head 动画
    ! function () {
        function e() {
            var e = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
            t.classList[e > 30 ? "add" : "remove"]("page__header--small")
        }
        var t = document.getElementById("page-header");
        t && document.addEventListener("scroll", e)
    }(),
    //------- head 响应式动画
    function () {
        var e = document.querySelector("button.page__menu-btn"),
            t = document.querySelector("nav.page__nav");
        if (e && t) {
            var a = new Pack(t);
            a.base("js-open").transfrom("page__nav--open")

            e.addEventListener("click", function () {
                a.toggle()
            })
        }
    }(),

    /**
     * banner 标题动画
     * 1. 添加类名     transform: translateY(0)!important;
     * 2. 添加 transition: all .5s
     * 3. 添加类名 transform: translateY(0)!important;
     * 4. 动画结束后删除各个相关动画类
     */
    function () {
        var e = document.getElementById("page-header");
        if (e) {
            var t = e.querySelector(".info__title");
            desc = e.querySelector(".info__desc") 
            t && 
            new Pack(t)
            .base("js-ease-out-leave-active")
            .base("js-ease-out-leave")
            .transfrom("js-ease-out-enter-active")
            .end(function () {
                    ["js-ease-out-enter", "js-ease-out-enter-active", "js-ease-out-leave",
                        "js-ease-out-leave-active"].forEach(function (e) {
                            desc.classList.remove(e)
                        })
            })
            .toggle()

            if(desc) {
                var a = new Pack(desc)
                a
                .base("js-ease-out-leave-active")
                .base("js-ease-out-leave")
                .transfrom("js-ease-out-enter-active")
                .end(function () {
                    [
                        "js-ease-out-enter", 
                        "js-ease-out-enter-active",
                        "js-ease-out-leave",
                        "js-ease-out-leave-active"
                    ]
                    .forEach(function (e) {
                        desc.classList.remove(e)
                    })
                })
                .toggle()
            }
        }
    }()
});


/**
 * 返回顶部
 */
window.addEventListener("load", function () {
    var n = document.getElementById("back-top")
    o = new Pack(n)

    ! function () {
        
        function t() {
            var t = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop
            var e = n.classList.contains("back-top--hidden") && n.classList.contains("js-hidden")
            if(t > 350 && e || t < 350 && !e) {
                o.toggle()
            }
        }
        /**
        * 1. 首先 opacity: 0; display: none!important;
        * 2. 当 >350 并被隐藏 则显示
        * 3. 当 <350 并被显示显示 则隐藏
        */        
        if(n) {
            o
            .transfrom("back-top--hidden")//    opacity: 0;
            .base("js-hidden")//    display: none!important;
            .lastStart() 

            
            //----  初始判断
            t()

            //----  滚动判断
            document.addEventListener("scroll", t) 


            //---- 单击回到顶部
            n.addEventListener("click", function () {
                (new Amt)
                .from({
                    top: window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop,
                })
                .to({
                    top: 220,
                })
                .transition(1e3)
                .on("frame", function (t) {
                    window.scrollTo(0, t.top)
                })
                .start()
            })
        }

    }()
});


window.addEventListener("load", function () {
    function frame(e) {
        var t = null
        var i = window.requestAnimationFrame || 
                window.mozRequestAnimationFrame || 
                window.webkitRequestAnimationFrame ||
                window.msRequestAnimationFrame

        var  o = window.cancelAnimationFrame || window.mozCancelAnimationFrame

        function n() {
            // 取消 动画帧请求.
            o(t)
            // 添加 动画帧请求
            t = i(
                e.bind(null, function () {
                    document.removeEventListener("scroll", n)
                })
            )
            e()
        }

        document.addEventListener("scroll", n) 
        n()
    }

    window._skappPostAnimation = function () {
        document.querySelectorAll("article.page__mini-article")
        .forEach(function (n) {
            if (!n.parentElement.parentElement.classList.contains("js-hidden")) {
                var t = getPosition(n)
                var i = new Pack(n)

                i.base("js-ease-out-leave-active")//transform: translateY(40px);     opacity: 0;
                .base("js-ease-out-leave") //transform .5s ease-out,opacity .5s ease-out!important
                .transfrom("js-ease-out-enter-active")// transform: translateY(0)!important; opacity: 1!important;
                .end(function () {
                    [
                        "js-ease-out-enter",  
                        "js-ease-out-enter-active", 
                        "js-ease-out-leave",
                        "js-ease-out-leave-active"
                    ].forEach(function (e) {
                        n.classList.remove(e)
                    })
                })

                frame(function (callback) {
                    /**
                     * t.y 元素在文档流的中的top
                     * window.scrollY 滚动条滚动值
                     * document.documentElement.clientHeight 可视区域高度
                     */
                    if(t.y - window.scrollY - document.documentElement.clientHeight < 50) {
                        //----- 移除该元素sroll事件监听
                        callback && callback()
                        //----- 运动
                        i.toggle()
                    }
                })
                // document.addEventListener("scroll", function n() {
                //     if(t.y - window.scrollY - document.documentElement.clientHeight < 50) {
                //         //----- 移除该元素sroll事件监听
                //         // callback && callback()
                //         //----- 运动
                //         i.toggle()
                //         document.removeEventListener("scroll", n)
                //     }                    
                // })
            }
        })
    } 
    window._skappPostAnimation()
});

