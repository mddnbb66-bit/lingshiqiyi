# 搅动泥沙

第一人称洞穴潜水恐怖模拟（Three.js，浏览器）。没有怪物，杀死你的是黑暗、淤泥、气压表和你自己的呼吸。

当前内容：第一关「三米湖」原型。

## 运行
双击 `index.html` 即可（不需要联网和本地服务器）。建议戴耳机。

操作：W 蛙踢前进（松开滑行）｜空格 上浮｜C 下沉｜鼠标转头（锁不住时拖动或方向键）
E 系主绳 / 捡相机｜按住 Q 摸线｜Shift+W 剪踢冲刺｜S 倒踢｜A/D 直升机转身｜按住 Tab 看压力表｜按住 R 慢呼吸｜L 头灯｜B 弹幕｜Esc 暂停

## 目录
- `work/`：源码。`game1.js`–`game5.js` 按顺序拼接；`style.css`；`shell.html`（页面骨架）；`build.py`（构建脚本）。
- `three.module.min.js`：Three.js r170 原始文件。
- `index.html`、`game.js`、`three.classic.js`：构建产物，不要手改。

## 构建
改了 `work/` 就要重新构建，不能只改产物：
```
python3 work/build.py
```

## 代码规范
现代 JavaScript：不用 `var`，默认 `const`，需要重新赋值才用 `let`；class、箭头函数、解构、可选链。

## 分支与说明
规则、设计文档和工作记录在 `GloBal-Text` 分支。

## 调试
地址后加 `?debug`（如 `index.html?debug`），控制台可用 `__jdns.goto(25)` 传送到主通道 25 米处，`__jdns.G` / `__jdns.P` 查看状态。
