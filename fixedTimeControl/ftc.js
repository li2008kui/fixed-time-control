//屏蔽右键菜单
document.oncontextmenu = function (event) {
    if (window.event) {
        event = window.event;
    }

    try {
        var the = event.srcElement;
        if (!((the.tagName == "INPUT" && the.type.toLowerCase() == "text") || the.tagName == "TEXTAREA")) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}

//禁止选择
function disableselect(e) {
    return false
}
function reEnable() {
    return true
}
//if IE4+ 
document.onselectstart = new Function("return false")
//if NS6 
if (window.sidebar) {
    document.onmousedown = disableselect
    document.onclick = reEnable
}

var ft = null;
var bx1 = 0;
var bx2 = 0;
var by1 = 0;
var by2 = 0;
var rx = 0;
var ry = 0;
var pointArray = new Array();// push([x, y])
var isLowIe = false;

if (navigator.appName == "Microsoft Internet Explorer") {
    if ($.browser.version < 8) {
        isLowIe = true;
    }
}

function addDimmingPoint(dpindex, dpCount, hh, mm, le) {
    $(".divDimmingPoint").css("width", "16px").css("height", "16px");
    var tm = (hh > 9 ? hh : "0" + hh) + ":" + (mm > 9 ? mm : "0" + mm);
    $("#divFixedTime").append("<div id='divDimmingPoint_" + dpindex + "' class='divDimmingPoint'><div class='divValue'><span class='spLevel'>" + le + "</span>%[<span class='spTime'>" + tm + "</span>]</div></div>");

    var cc = parseInt(255 * le / 100, 10);
    var hexcc = cc.toString(16);
    hexcc = hexcc.length > 1 ? hexcc : "0" + hexcc;
    var ccstr = "#" + hexcc + hexcc + "00";
    var dp = $("#divDimmingPoint_" + dpindex);
    rx = dp.width() / 2;
    ry = dp.height() / 2;
    var px = bx1 - rx + (((bx2 - bx1) * (((hh + 12) % 24 * 3600) + (mm * 60))) / (24 * 3600));
    var py = by2 - ((by2 - by1) * le / 100);

    pointArray.push([px, py]);
    $("#divDimmingPoint_" + dpindex).css("left", px).css("top", py - ry).css("background-color", ccstr);

    viewLine(bx1, bx2, pointArray);
}

$(document).ready(function () {
    // 获取可移动的坐标范围
    ft = $("#divFixedTime")[0];
    bx1 = ft.offsetLeft + 29 + (isLowIe ? 8 : 0);
    bx2 = bx1 + 544;//ft.offsetWidth;
    by1 = ft.offsetTop + 48 + (isLowIe ? 16 : 0);
    by2 = by1 + 226;//ft.offsetHeight;
    var dpindex = 0;

    addDimmingPoint(++dpindex, 0, 18, 0, 100);
    addDimmingPoint(++dpindex, 1, 21, 0, 100);
    addDimmingPoint(++dpindex, 2, 0, 0, 100);

    $("#btnAdd").click(function () {
        var dpCount = $(".divDimmingPoint").children().length;
        var dpid = 0;
        var hh = 0;
        var mm = 0;
        var le = 100;

        if (dpCount > 4) {
            alert("集中控制器最多支持设置5个调光时间点！");
            return;
        }

        if (dpCount > 0) {
            $(".divDimmingPoint").each(function () {
                if (this.id.split('_')[1] > dpid) {
                    dpid = this.id.split('_')[1];
                    tm = $(this).find(".spTime").text();
                    le = $(this).find(".spLevel").text();
                }
            });

            hh = (parseInt(tm.split(':')[0], 10) + 3) % 24;
            mm = parseInt(tm.split(':')[1], 10);
        }

        addDimmingPoint(++dpindex, dpCount, hh, mm, le);
    });

    $("#btnDelete").click(function () {
        $(".divDimmingPoint").each(function () {
            if ($(this).width() == 20 && $(this).height() == 20) {
                if (confirm("您确认要移除该调光时间点吗？")) {
                    $(this).remove();

                    pointArray = [];
                    $(".divDimmingPoint").each(function () {
                        //rx = this.clientWidth / 2;
                        ry = this.clientHeight / 2;
                        pointArray.push([this.offsetLeft, this.offsetTop + ry]);
                    });
                    viewLine(bx1, bx2, pointArray);
                }

                return;
            }
        });
    });

    $("#btnClear").click(function () {
        if ($(".divDimmingPoint").children().length > 0) {
            if (confirm("您确认要移除所有调光时间点吗？")) {
                $(".divDimmingPoint").remove();
                $(".divLine").remove();
                pointArray = [];
            }
        }
    });

    //$(".divDimmingPoint").bind("mousedown", function (e) {//bind(type,[data],fn) 为每个匹配元素的特定事件绑定事件处理函数；直接绑定在元素上，不支持动态生成的元素。
    //$(".divDimmingPoint").live("mousedown", function (e) {//live(type,[data],fn) 给所有匹配的元素附加一个事件处理函数，即使这个元素是以后再添加进来的；通过冒泡的方式来绑定到元素上，支持动态生成的元素，1.9.1以已经被移除。
    //$("#divFixedTime").delegate(".divDimmingPoint", "mousedown", function (e) {delegate(selector,[type],[data],fn) 指定的元素（属于被选元素的子元素）添加一个或多个事件处理程序，并规定当这些事件发生时运行的函数；//更精确的小范围使用事件代理，性能优于.live()。
    //$(".divDimmingPoint").on("mousedown", function (e) {//与下面属同一种方式，但少了子选择器，这样无法成功绑定到动态生成的元素。
    $("#divFixedTime").on("mousedown", ".divDimmingPoint", function (e) {//on(events,[selector],[data],fn) 在选择元素上绑定一个或多个事件的事件处理函数；1.9版本整合了之前的三种方式的新事件绑定机制，不管是（click / bind / delegate)之中那个方法，最终都是jQuery底层都是调用on方法来完成最终的事件绑定。
        var $divdp = $(this);
        rx = this.clientWidth / 2;
        ry = this.clientHeight / 2;
        //改变鼠标指针的形状
        $(this).css("cursor", "move");
        // 激活当前节点（变大一点）
        $(".divDimmingPoint").css("width", "16px").css("height", "16px");
        $(this).css("width", "20px").css("height", "20px");
        /* 获取需要拖动节点的坐标 */
        var offset_x = $(this)[0].offsetLeft;//x坐标
        var offset_y = $(this)[0].offsetTop;//y坐标
        /* 获取当前鼠标的坐标 */
        var event = e || window.event;//firefox没有window.event对象
        var mouse_x = event.pageX;
        var mouse_y = event.pageY;

        /* 绑定拖动事件 */
        /* 由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素 */
        $(document).bind("mousemove", function (ev) {
            /* 计算鼠标移动了的位置 */
            var _x = ev.pageX - mouse_x;
            var _y = ev.pageY - mouse_y;

            /* 设置移动后的元素坐标 */
            var now_x = offset_x + _x;
            var now_y = offset_y + _y;

            // 判断是否超出可移动的坐标范围
            if (now_x < bx1 - rx) {
                now_x = bx1 - rx;
            } else if (now_x > bx2 - rx) {
                now_x = bx2 - rx
            }

            if (now_y < by1 - ry) {
                now_y = by1 - ry;
            } else if (now_y > by2 - ry) {
                now_y = by2 - ry;
            }

            var ll = parseInt(100 * (by2 - now_y - ry) / (by2 - by1), 10);
            var tt = parseInt(24 * 3600 * (bx2 - now_x - rx) / (bx2 - bx1), 10);
            var tm = "18:00";
            var hh = 0;
            var mm = 0;
            var cc = parseInt(255 * ll / 100, 10);//parseInt(255 * (by2 - now_y - ry) / (by2 - by1));
            var hexcc = cc.toString(16);
            hexcc = hexcc.length > 1 ? hexcc : "0" + hexcc;
            var ccstr = "#" + hexcc + hexcc + "00";

            if (43200 > tt) {
                hh = parseInt((43200 - tt) / 3600, 10);
                mm = parseInt(((43200 - tt) % 3600) / 60, 10);
            } else {
                hh = ((parseInt((43200 - tt) / 3600, 10) + 23) % 24);
                mm = 60 - Math.abs(parseInt(((43200 - tt) % 3600) / 60));

                if (mm == 60) {
                    hh += 1;
                    mm = 0;
                }
            }

            tm = (hh > 9 ? hh : "0" + hh) + ":" + (mm > 9 ? mm : "0" + mm);

            /* 改变目标元素的位置 */
            $divdp.css({
                left: now_x + "px",
                top: now_y + "px",
                background: ccstr
            });

            $divdp.find(".spLevel").text(ll);
            $divdp.find(".spTime").text(tm);

            pointArray = [];
            $(".divDimmingPoint").each(function () {
                //rx = this.clientWidth / 2;
                ry = this.clientHeight / 2;
                pointArray.push([this.offsetLeft, this.offsetTop + ry]);
            });
            viewLine(bx1, bx2, pointArray);
        });
    });

    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup", function () {
        $(".divDimmingPoint").css("cursor", "pointer");
        $(this).unbind("mousemove");
    });
});

function viewLine(bx1, bx2, pointArray) {
    $(".divLine").remove();
    var len = pointArray.length;

    if (len > 0) {
        pointArray.sort(function (x, y) {
            return parseFloat(x[0]) - parseFloat(y[0]);
        });

        $("#divFixedTime").append("<div class='divLine' style='left: " + bx1 + "px; top: " + pointArray[len - 1][1] + "px; width: " + (pointArray[0][0] - bx1 + 8 + 1) + "px; height: 1px;'></div>");

        for (var i = 0; i < len; i++) {
            $("#divFixedTime").append("<div class='divLine' style='left: " + (bx1 + pointArray[i][0] - 28) + "px; top: " + (pointArray[i > 0 ? i - 1 : len - 1][1] > pointArray[i][1] ? pointArray[i][1] : pointArray[i > 0 ? i - 1 : len - 1][1]) + "px; width: 1px; height: " + Math.abs(pointArray[i > 0 ? i - 1 : len - 1][1] - pointArray[i][1]) + "px;'></div>");
            $("#divFixedTime").append("<div class='divLine' style='left: " + (bx1 + pointArray[i][0] - 28) + "px; top: " + pointArray[i][1] + "px; width: " + ((i + 1 < len ? pointArray[i + 1][0] : bx2) - pointArray[i][0] + 1) + "px; height: 1px;'></div>");
        }
    }
}

$(document).keydown(function (e) {
    switch (e.keyCode) {
        case 37://left
            e.preventDefault();
            pointArray = [];
            var tm = "18:00";
            var hh = 0;
            var mm = 0;
            var px = 0;
            var py = 0;

            $(".divDimmingPoint").each(function () {
                //rx = this.clientWidth / 2;
                ry = this.clientHeight / 2;

                if ($(this).width() == 20 && $(this).height() == 20) {
                    tm = $(this).find(".spTime").text();
                    hh = parseInt(tm.split(':')[0], 10);//IE6/7/8中parseInt第一个参数为不法八进制字符串且第二个参数不传时返回值为0
                    mm = parseInt(tm.split(':')[1], 10);

                    if (mm > 0) {
                        mm -= 1;
                    } else {
                        if (hh > 0) {
                            hh -= 1;
                            mm = 59;
                        } else {
                            hh = 23;
                            mm = 59;
                        }
                    }

                    tm = (hh > 9 ? hh : "0" + hh) + ":" + (mm > 9 ? mm : "0" + mm);
                    $(this).find(".spTime").text(tm);
                    px = bx1 - rx + (((bx2 - bx1) * (((hh + 12) % 24 * 3600) + (mm * 60))) / (24 * 3600));
                    py = this.offsetTop + ry;

                    pointArray.push([px, py]);
                    $(this).css("left", px);
                } else {
                    pointArray.push([this.offsetLeft, this.offsetTop + ry]);
                }
            });
            viewLine(bx1, bx2, pointArray);
            break;
        case 38://up
            e.preventDefault();
            pointArray = [];
            var le = 0;
            var flag = false;
            var px = 0;
            var py = 0;

            $(".divDimmingPoint").each(function () {
                //rx = this.clientWidth / 2;
                ry = this.clientHeight / 2;

                if ($(this).width() == 20 && $(this).height() == 20) {
                    le = parseInt($(this).find(".spLevel").text(), 10);

                    if (le < 100) {
                        le += 1;
                    } else {
                        flag = true;
                        return;
                    }

                    $(this).find(".spLevel").text(le);
                    var cc = parseInt(255 * le / 100, 10);
                    var hexcc = cc.toString(16);
                    hexcc = hexcc.length > 1 ? hexcc : "0" + hexcc;
                    var ccstr = "#" + hexcc + hexcc + "00";
                    px = this.offsetLeft;
                    py = by2 - ((by2 - by1) * le / 100);

                    pointArray.push([px, py]);
                    $(this).css("top", py - ry).css("background-color", ccstr);
                } else {
                    pointArray.push([this.offsetLeft, this.offsetTop + ry]);
                }
            });

            if (!flag) {
                viewLine(bx1, bx2, pointArray);
            }
            break;
        case 39://right
            e.preventDefault();
            pointArray = [];
            var tm = "18:00";
            var hh = 0;
            var mm = 0;
            var px = 0;
            var py = 0;

            $(".divDimmingPoint").each(function () {
                //rx = this.clientWidth / 2;
                ry = this.clientHeight / 2;

                if ($(this).width() == 20 && $(this).height() == 20) {
                    tm = $(this).find(".spTime").text();
                    hh = parseInt(tm.split(':')[0], 10);
                    mm = parseInt(tm.split(':')[1], 10);

                    if (mm < 59) {
                        mm += 1;
                    } else {
                        if (hh < 23) {
                            hh += 1;
                            mm = 0;
                        } else {
                            hh = 0;
                            mm = 0;
                        }
                    }

                    tm = (hh > 9 ? hh : "0" + hh) + ":" + (mm > 9 ? mm : "0" + mm);
                    $(this).find(".spTime").text(tm);
                    px = bx1 - rx + (((bx2 - bx1) * (((hh + 12) % 24 * 3600) + (mm * 60))) / (24 * 3600));
                    py = this.offsetTop + ry

                    pointArray.push([px, py]);
                    $(this).css("left", px);
                } else {
                    pointArray.push([this.offsetLeft, this.offsetTop + ry]);
                }
            });
            viewLine(bx1, bx2, pointArray);
            break;
        case 40://down
            e.preventDefault();
            pointArray = [];
            var le = 0;
            var flag = false;
            var px = 0;
            var py = 0;

            $(".divDimmingPoint").each(function () {
                //rx = this.clientWidth / 2;
                ry = this.clientHeight / 2;

                if ($(this).width() == 20 && $(this).height() == 20) {
                    le = parseInt($(this).find(".spLevel").text(), 10);

                    if (le > 0) {
                        le -= 1;
                    } else {
                        flag = true;
                        return;
                    }

                    $(this).find(".spLevel").text(le);
                    var cc = parseInt(255 * le / 100, 10);
                    var hexcc = cc.toString(16);
                    hexcc = hexcc.length > 1 ? hexcc : "0" + hexcc;
                    var ccstr = "#" + hexcc + hexcc + "00";
                    px = this.offsetLeft;
                    py = by2 - ((by2 - by1) * le / 100);

                    pointArray.push([px, py]);
                    $(this).css("top", py - ry).css("background-color", ccstr);
                } else {
                    pointArray.push([this.offsetLeft, this.offsetTop + ry]);
                }
            });

            if (!flag) {
                viewLine(bx1, bx2, pointArray);
            }
            break;
        default://default
            break;
    }
});