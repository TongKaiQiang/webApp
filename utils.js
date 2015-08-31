//在数组、字符串、对象的原型上扩展的方法，为了不影响原有的我们的方法名前面加前缀:my
~function () {
    var aryPro = Array.prototype;
    aryPro.myDistinct = function () {
        var obj = {};
        for (var i = 0; i < this.length; i++) {
            var cur = this[i];
            if (obj[cur] == cur) {
                this[i] = this[this.length - 1];
                this.length -= 1;
                i--;
                continue;
            }
            obj[cur] = cur;
        }
        obj = null;
    }
    aryPro.myForEach = function (fn, context) {
        context = context || window;
        if (Array.prototype.forEach) {
            this.forEach(fn, context);
        } else {
            for (var i = 0; i < this.length; i++) {
                fn.apply(context, [this[i], i, this]);
            }
        }
    }
    aryPro.myMap = function (fn, context) {
        context = context || window;
        var ary = [];
        if (Array.prototype.map) {
            ary = this.map(fn, context);
        } else {
            for (var i = 0; i < this.length; i++) {
                ary[i] = fn.apply(context, [this[i], i, this]);
            }
        }
        return ary;
    }

    var strPro = String.prototype;
    strPro.myTrim = function () {
        return this.replace(/(^\s*|\s*$)/g, "");
    }
    strPro.mySub = function () {
        var len = arguments[0] || 10, isD = arguments[1] || false, str = "", n = 0;
        for (var i = 0; i < this.length; i++) {
            var s = this.charAt(i);
            /[\u4e00-\u9fa5]/.test(s) ? n += 2 : n++;
            if (n > len) {
                isD ? str += "..." : void 0;
                break;
            }
            str += s;
        }
        return str;
    }
    strPro.myFormatTime = function () {
        var reg = /^(\d{4})(?:-|\/|\.|:)(\d{1,2})(?:-|\/|\.|:)(\d{1,2})(?:\s+)(\d{1,2})(?:-|\/|\.|:)(\d{1,2})(?:-|\/|\.|:)(\d{1,2})$/g, ary = [];
        this.replace(reg, function () {
            ary = ([].slice.call(arguments)).slice(1, 7);
        });
        var format = arguments[0] || "{0}年{1}月{2}日 {3}:{4}:{5}";
        return format.replace(/{(\d+)}/g, function () {
            var val = ary[arguments[1]];
            return val.length === 1 ? "0" + val : val;
        });
    }
    strPro.myQueryURLParameter = function () {
        var reg = /([^?&=]+)=([^?&=]+)/g, obj = {};
        this.replace(reg, function () {
            obj[arguments[1]] = arguments[2];
        });
        return obj;
    }

    var objPro = Object.prototype;
    objPro.myHasPubProperty = function () {
        var attr = arguments[0];
        return (attr in this) && !this.hasOwnProperty(attr);
    }
}();

//我们常用的DOM方法库
var utils = {
    //将类数组转换为数组
    listToArray: function (likeAry) {
        var ary = [];
        try {
            ary = [].slice.call(likeAry, 0);
        } catch (e) {
            for (var i = 0; i < likeAry.length; i++) {
                ary[i] = likeAry[i];
            }
        }
        return ary;
    },
    //将JSON格式的字符串转化为JSON格式的对象
    toJSON: function (jsonStr) {
        var jsonObj = null;
        try {
            jsonObj = JSON.parse(jsonStr);
        } catch (e) {
            jsonObj = eval("(" + jsonStr + ")");
        }
        return jsonObj;
    }
};

/*--获取页面上的元素--*/
//getElementsByClass：通过class样式值，来获取一组元素
utils.getElementsByClass = function (cName, context) {
    //如果没有传递上下文，我们让上下文默认为document
    context = context || document;
    //判断getElementsByClassName是否兼容,兼容的话我们直接使用这个方法
    if (document.getElementsByClassName) {
        //不兼容情况下我们获取的是一个数组，为了统一，我们把类数组转换为数组
        return this.listToArray(context.getElementsByClassName(cName));
    }
    //如果不兼容，我们首先获取所有的标签，然后循环中判断当前的标签的className样式值中是否包含我们传递进来的cName，包含的话当前元素就是我们想要的
    var allTag = context.getElementsByTagName("*"), reg = new RegExp("(?:^| +)" + cName + "(?: +|$)"), ary = [];
    for (var i = 0; i < allTag.length; i++) {
        var cur = allTag[i];
        reg.test(cur.className) ? ary.push(cur) : void 0;
    }
    return ary;
}

//getChildren：获取指定标签名的所有的元素字节点(获取所有的元素子节定，我们可以通过元素的标签名在进行过滤)
utils.getChildren = function (curEle, tagName) {
    var all = curEle.childNodes, ary = [];
    for (var i = 0; i < all.length; i++) {
        var cur = all[i];
        if (cur.nodeType === 1) {//说明是元素子节点
            if (typeof tagName != "undefined") {//说明传递标签名字了
                if (cur.nodeName.toLowerCase() != tagName.toLowerCase()) {//如果我们当前元素的标签名和我们传递进来的不一样，就不在添加了，直接进入下一次的循环即可
                    continue;
                }
            }
            ary.push(cur);
        }
    }
    return ary;
}

//getPre：获取上一个哥哥元素节点
utils.getPre = function (curEle) {
    //判断是否兼容previousElementSibling,兼容就用它即可
    if (curEle.previousElementSibling) {
        return curEle.previousElementSibling;
    }
    //不兼容的话，我们获取当前元素的上一个哥哥节点，如果存在并且不是元素节点，就基于当前这个继续往上找
    var pre = curEle.previousSibling;
    while (pre && pre.nodeType !== 1) {
        pre = pre.previousSibling;
    }
    return pre;
}

//getNext：获取下一个弟弟元素节点
utils.getNext = function (curEle) {
    if (curEle.nextElementSibling) {
        return curEle.nextElementSibling;
    }
    var next = curEle.nextSibling;
    while (next && next.nodeType !== 1) {
        next = next.nextSibling;
    }
    return next;
}

//getSibling：获取相邻的兄弟元素节点
utils.getSibling = function (curEle) {
    var pre = this.getPre(curEle), next = this.getNext(curEle);
    var ary = [];
    pre ? ary.push(pre) : void 0;
    next ? ary.push(next) : void 0;
    return ary;
}

//getPres：获取所有的哥哥元素节点
utils.getPres = function (curEle) {
    var ary = [], pre = this.getPre(curEle);
    while (pre) {
        ary.unshift(pre);
        pre = this.getPre(pre);
    }
    return ary;
}

//getNexts：获取所有的弟弟元素节点
utils.getNexts = function (curEle) {
    var ary = [], next = this.getNext(curEle);
    while (next) {
        ary.push(next);
        next = this.getNext(next);
    }
    return ary;
}

//getSiblings：获取所有的兄弟元素节点
utils.getSiblings = function (curEle) {
    return this.getPres(curEle).concat(this.getNexts(curEle));
}

//getIndex：获取当前元素的索引
utils.getIndex = function (curEle) {
    //家里10个孩子，我排行老六，我的索引是5，这是为啥呢？因为我有5个哥哥
    return this.getPres(curEle).length;
}

//getFirst：获取大儿子
utils.getFirst = function (curEle, tagName) {
    var all = this.getChildren(curEle, tagName);
    return all.length > 0 ? all[0] : null;
}

//getLast：获取小儿子
utils.getLast = function (curEle, tagName) {
    var all = this.getChildren(curEle, tagName);
    return all.length > 0 ? all[all.length - 1] : null;
}


/*--操作页面上的元素--*/
//prepend：将节点添加到容器的第一个位置,和我们appendChild对应，原理：用insertBefore添加到指定容器第一个儿子之前
utils.prepend = function (newEle, continer) {
    var first = this.getFirst(continer);
    if (!first) {
        //如果一个儿子都没有，我直接添加进去即可
        continer.appendChild(newEle);
        return;
    }
    //如果有大儿子，添加到大儿子之前
    continer.insertBefore(newEle, first);
}

//insertAfter：添加到指定的节点之后，原理：添加到执行节点下一个弟弟之前
utils.insertAfter = function (newEle, oldEle) {
    var next = this.getNext(oldEle);
    if (!next) {
        //如果没有弟弟，我们就添加到末尾
        oldEle.parentNode.appendChild(newEle);
        return;
    }
    //如果有弟弟，添加到弟弟的前面
    oldEle.parentNode.insertBefore(newEle, next);
}

//html：如果不传参数，是获取指定元素的内容，传递参数是往指定元素中添加内容(把原有的覆盖)
utils.html = function (curEle, str) {
    if (typeof str === "undefined") {
        return curEle.innerHTML;
    }
    curEle.innerHTML = str;
}

/*--操作页面上元素的样式的--*/
//getWin：获取浏览器的相关盒子模型信息
utils.getWin = function (attr) {
    return document.documentElement[attr] || document.body[attr];
}

//offset：获取当前元素距离第一屏幕body的x/y轴的偏移量
utils.offset = function (curEle) {
    var par = curEle.offsetParent, top = 0, left = 0;
    top += curEle.offsetTop;
    left += curEle.offsetLeft;
    while (par) {
        top += par.offsetTop;
        left += par.offsetLeft;
        if (navigator.userAgent.indexOf("MSIE 8.0") < 0) {
            top += par.clientTop;
            left += par.clientLeft;
        }
        par = par.offsetParent;
    }
    return {top: top, left: left};
}

//getCss：获取当前元素的经过计算的样式值
utils.getCss = function (curEle, attr) {
    var value = null, reg = /(margin|padding|float|display|border|background)/;
    if (window.getComputedStyle) {
        value = window.getComputedStyle(curEle, null)[attr];
    } else {
        value = curEle.currentStyle[attr];
    }
    value = !reg.test(attr) ? parseFloat(value) : value;
    return value;
}

//setCss：设置元素的样式属性的值
//opacity需要处理兼容，width、height、margin、marginLeft...、padding、paddingLeft...、left、top、right、bottom这些常用的，如果我们传递进来的时候没有写单位，我们要默认加上"px"，剩下的你传递的是啥我就赋值为啥
utils.setCss = function (curEle, attr, value) {
    var regPx = /^(width|height|margin|marginLeft|marginRight|marginTop|marginBottom|padding|paddingLeft|paddingRight|paddingTop|paddingBottom|left|top|right|bottom)$/;
    if (attr === "opacity") {
        curEle["style"]["opacity"] = value;
        curEle["style"]["filter"] = "alpha(opacity=" + value * 100 + ")";
        return;
    }
    if (regPx.test(attr)) {
        var reg = /^[+-]?(\d|[1-9]\d+)(\.\d+)?(px|em|rem|pt|%)$/;
        curEle["style"][attr] = reg.test(value) ? value : value + "px";
        return;
    }
    curEle["style"][attr] = value;
}

//setGroupCss：批量设置样式，原理：把需要设置的样式统一放在一个对象中传递进来，循环这个对象，调用setCss一个个的设置
utils.setGroupCss = function (curEle, styleObj) {
    if (Object.prototype.toString.call(styleObj) === "[object Object]") {
        for (var key in styleObj) {
            this.setCss(curEle, key, styleObj[key]);
        }
    }
}

//hasClass：判断是否存在某一个样式值
utils.hasClass = function (curEle, cName) {
    var reg = new RegExp("(?:^| +)" + cName + "(?: +|$)", "g");
    return reg.test(curEle.className);
}

//addClass：给元素追加class样式值
utils.addClass = function (curEle, cName) {
    //首先判断是否存在这个样式,不存在我们才添加
    if (!this.hasClass(curEle, cName)) {
        var cc = curEle.className;
        curEle.className += (cc === "") ? cName : " " + cName;
        //一定要记住，如果前面有样式值了，我们追加的时候前面加一个空格
    }
}

//removeClass：移除样式
utils.removeClass = function (curEle, cName) {
    //首先判断是否存在这个样式，如果存在我才移除
    if (this.hasClass(curEle, cName)) {
        var reg = new RegExp("(?:^| +)" + cName + "(?: +|$)");
        curEle.className = curEle.className.replace(reg, " ");
    }
}

//检测数据类型的，继承到我么的utils上
~function (utils) {
    var numObj = {
        isNum: "Number",
        isStr: "String",
        isBoo: "Boolean",
        isNul: "Null",
        isUnd: "Undefined",
        isObj: "Object",
        isAry: "Array",
        isFun: "Function",
        isReg: "RegExp"
    }, isType = function () {
        var outerArg = arguments[0];
        return function () {
            var innerArg = arguments[0], reg = new RegExp("^\\[object " + outerArg + "\\]$", "i");
            return reg.test(Object.prototype.toString.call(innerArg));
        }
    };
    for (var key in numObj) {
        utils[key] = isType(numObj[key]);
    }
}(utils);