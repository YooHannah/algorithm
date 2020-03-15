/* 数字格式化，整数部分，每三位加一个逗号 */
str = '11100011.31';
str1 = str.split('.')
console.log(str1);
str2 = '';
length = str1[0].length;
count = parseInt(length / 3);
console.log(count)
if (length % 3) {
    count++
}
console.log(count)
for (var i = 0; i < count; i++) {
    if (i !== count - 1) {
        str2 = ',' + str1[0].slice(-3) + str2;
        str1[0] = str1[0].slice(0, str1[0].length - 3);
    } else {
        str2 = str1[0].slice(-3) + str2;
    }

}
console.log(str2 + '.' + str1[1])
/**不考虑小数情况下可以直接用正则处理
 * '12345678'.replace(/(?=(\B\d{3})+$)/g,',')
 * \bxxxx 匹配项xxxx 前面不能是 字母数字下划线
 * \Bxxxx 匹配项xxxx 前面只能是 字母数字下划线
 */

/* 数组随机排序 */
var array = [1, 2, 3, 4, 5, 6, 7];
function randsort(arr) {
    let len = arr.length;
    for (let i = 0; i < len; i++) {
        let index = parseInt(Math.random() * len);
        let temp = arr[index];
        arr[index] = arr[i];
        arr[i] = temp;
    }
    return arr;
}
console.log(randsort(array))

/* 寻找出现次数最多字符和它的个数*/
var str = 'aashjkdnlosavropehjkknlp';
function findmore(str) {
    let letters = {};
    for (let i = 0; i < str.length; i++) {
        if (!letters[str[i]]) {
            letters[str[i]] = 1;
        } else {
            letters[str[i]]++;
        }
    }
    let maxcount = 0;
    let letter = [];
    for (let k in letters) {
        if (letters[k] > maxcount) {
            maxcount = letters[k];
            letter = [];
            letter.push(k)
        } else if (letters[k] == maxcount) {
            letter.push(k)
        }
    }
    return {
        letters: letters,
        maxcount: maxcount,
        letter: letter
    }
}
console.log(findmore(str));

/* 数组去重 */
function unique(arr) {
    let temp = [];
    let obj = {};
    for (let i = 0; i < arr.length; i++) {
        if (!obj[arr[i]]) {
            temp.push(arr[i]);
            obj[arr[i]] = 1;
        }
    }
    return temp;
}
var arr = [1, 2, 3, 4, 2, 2, 3, 7, 8, 9, 4, 5];
console.log(unique(arr))

/*little test*/
var a = 5;
function test() {
    a = 0;
    console.log(a);
    console.log(this.a);
    var a; //如果给a赋初始值，则不会继续找全局里面的a
    console.log(a)
}
test() //0 5 0
new test() //0 undefined 0

/*二分查找*/
var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
function sort(arr, val) {
    if (val == undefined) {
        return 'nothing to search'
    }
    if (val > arr[arr.length - 1] || val < arr[0]) {
        return 'beyond range';
    }
    var start = 0;
    var end = arr.length - 1;
    while (start < end) {
        var middle = Math.round((start + end) / 2);
        console.log(middle);
        if (arr[middle] > val) {
            end = middle;
        }
        if (arr[middle] < val) {
            start = middle;
        }
        if (arr[middle] == val) {
            break
        }
    }
    return middle;
}
console.log(sort(arr, 10));


/*事件监听*/
class EventEmitter {
    /* TODO */
    constructor() {
        this.listeners = [];
    }
    on(eventName, func) { //建立监听事件，有的话，就把关联函数push进去,没有的话就新建监听事件
        for (let i = 0; i < this.listeners.length; i++) {
            if (this.listeners[i].name === eventName) {
                this.listeners[i].funcs.push(func);
                return
            }
        }
        this.listeners.push({
            name: eventName,
            funcs: []
        })
        if (func) {
            this.listeners[this.listeners.length - 1].funcs.push(func)
        }
    }
    emit(eventName, ...args) { //触发监听事件
        for (let j = 0; j < this.listeners.length; j++) {
            if (this.listeners[j].name === eventName) {
                for (let k = 0; k < this.listeners[j].funcs.length; k++) {
                    this.listeners[j].funcs[k](args)
                }
            }
        }
    }
    off(eventName, func) { //取消监听
        for (let j = 0; j < this.listeners.length; j++) {
            if (this.listeners[j].name === eventName) {
                if (func == undefined) { //整个事件不再监听
                    this.listeners.splice(j, 1);
                }
                for (let k = 0; k < this.listeners[j].funcs.length; k++) { //取消监听事件的指定关联函数
                    if (func === this.listeners[j].funcs[k]) {
                        this.listeners[j].funcs.splice(k, 1);
                        return
                    }
                }
            }
        }
    }
}

/*题目：给定英文文章，统计个单词出现频率，按频率大小排序，频率相同按字母顺序，输出前20位*/

function getResult(str) {
    let words = str.match(/\b[a-zA-Z\'\_\-]+\b/ig)
    if (!words || words.length === 1) {
        console.log('what you see is what you get ^~^')
        return words
    }
    let obj = {}
    words.map(item => {
        let lower = item.toLowerCase()
        obj[lower] = obj[lower] ? ++obj[lower] : 1
    })
    words = []
    Object.keys(obj).sort().sort(function(a, b) {
        return obj[b] - obj[a]
    }).slice(0, 20).map(key => {
        console.log(key + ' ' + obj[key])
        words.push(key + ':' + obj[key])
    })
    return words
}

/**
 * 说明：生成一个指定长度（默认6位）的随机字符，随机字符包含小写字母和数字。
 * 输入：输入随机字符长度，无输入默认6位
 * 输出：随机字符，如"6bij0v"
 */

function idGenerator(length) {
    /* 功能实现 */
    length = length || 6
    const options = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const len = options.length
    let str = ''
    for (let i = 0; i < length; i++) {
        let random = Math.floor((Math.random() * len))
        str += options[random]
    }
    return str
}
/**
 * 渲染带标记的文本
 * 说明：实现一个 marked 方法对带标记的文本进行 HTML 渲染
 *   标记的文本的格式如 @@文本@@，*文本*，默认规则如下
 *   '@@'使用blink标签, '*'使用em标签,
 *   '**'使用strong标签, '__' 使用strong标签。
 *   同时也可通过第二个参数对符号和标签做自定义配对。
 *   
 * 示例：
 *   marked('@@whatever@@') // <p><blink>whatever</blink></p>
 *   marked('*abc* @@def@@ __ghi__') // <p><em>abc</em> <blink>def</blink> <strong>ghi</strong></p>
 *   marked('@@**cool**@@') // <p><blink><strong>cool</strong></blink></p>
 *   marked('++hello++', { '++': 'big' }) // <p><big>hello</big></p>
 */
function marked(str, options) {
    /* 代码实现 */
    // let reg = /(\@\@|\*\*|\*|\_\_)((?:.|\r?\n)+?)\1/g;
    let list = Object.assign({
        '@@': 'blink',
        '*': 'em',
        '**': 'strong',
        '__': 'strong'
    }, options || {})
    let regstr = Object.keys(list).sort((a, b) => {
        return b.length - a.length
    }).map(item => {
        return item.split('').map(word => {
            return '\\' + word
        }).join('')
    }).join('|')
    let reg = new RegExp('(' + regstr + ')((?:.|\\r?\\n)+?)\\1', 'ig')
    str = str.replace(reg, (...args) => {
        let tag = list[args[1]]
        if (reg.test(args[2])) {
            args[2] = marked(args[2], list)
        }
        return '<' + tag + '>' + args[2] + '</' + tag + '>'
    })
    return str
}

/**
 * 简单实现一个queryString，具有parse和stringify的能力，
 * parse，用于把一个URL查询字符串解析成一个键值对的集合。
 * 输入：查询字符串 'foo=bar&abc=xyz&abc=123'
 * 输出：一个键值对的对象
 * {
 *   foo: 'bar',
 *   abc: ['xyz', '123'],
 * }
 * stringify，相反的，用于序列化给定对象的自身属性，生成URL查询字符串。
 * 输入：一个键值对的对象
 * {
 *   foo: 'bar',
 *   abc: ['xyz', '123'],
 * }
 * 输出：查询字符串 'foo=bar&abc=xyz&abc=123'
 */

const queryString = {
    parse(str) {
        /* 功能实现 */
        let arr = str.split('&')
        arr = arr.map(item => {
            return item.split('=')
        })
        let temp = {}
        for (let item in arr) {
            let key = item[0]
            let val = item[1]
            if (temp[key]) {
                if (typeof temp[key] === 'string') {
                    temp[key] = [temp[key], val]
                } else {
                    temp[key].push(val)
                }
            } else {
                temp[key] = val
            }
        }
        return temp
    },
    stringify(obj) {
        /* 功能实现 */
        let str = ''
        Object.keys(obj).map(key => {
            let val = obj[key]
            if (typeof val != 'object') {
                str += '&' + key + '=' + val
            } else if (Array.isArray(val)) {
                val.map(i => {
                    str += '&' + key + '=' + val[i]
                })
            }
        })
        return str.substr(1)
    },
};

/**
 * 对象扁平化
 * 说明：请实现 flatten(input) 函数，input 为一个 javascript 对象（Object 或者 Array），返回值为扁平化后的结果。
 * 示例：
 *   var input = {
 *     a: 1,
 *     b: [ 1, 2, { c: true }, [ 3 ] ],
 *     d: { e: 2, f: 3 },
 *     g: null, 
 *   }
 *   var output = flatten(input);
 *   output如下
 *   {
 *     "a": 1,
 *     "b[0]": 1,
 *     "b[1]": 2,
 *     "b[2].c": true,
 *     "b[3][0]": 3,
 *     "d.e": 2,
 *     "d.f": 3,
 *     // "g": null,  值为null或者undefined，丢弃
 *  }
 */
function flatten(input) {
    /* 代码实现 */
    let result = {}
    for (let key in input) {
        let value = input[key]
        if (value === undefined || value === null) {
            continue
        }
        if (typeof value === 'object' && Array.isArray(value)) {
            let valueObj = {}
            for (let i in value) {
                valueObj['[' + i + ']'] = value[i]
            }
            let obj = flatten(valueObj)
            Object.keys(obj).map(item => {
                let newkey = key + item
                result[newkey] = obj[item]
            })
        } else if (typeof value === 'object' && !Array.isArray(value)) {
            let obj = flatten(value)
            Object.keys(obj).map(item => {
                let newkey = key + '.' + item
                result[newkey] = obj[item]
            })
        } else {
            result[key] = input[key]
        }
    }
    return result
}

