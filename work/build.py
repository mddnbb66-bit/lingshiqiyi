import pathlib
import re

root = pathlib.Path(__file__).resolve().parent.parent
work = root / "work"

# three：把末尾的 export{a as B,...} 改成一个全局对象，整体包进箭头函数作用域
three = (root / "three.module.min.js").read_text(encoding="utf-8")
m = re.search(r"export\s*\{([^}]*)\}\s*;?\s*$", three)
pairs = []
for part in m.group(1).split(","):
    local, _, name = part.strip().partition(" as ")
    pairs.append(f"{name or local}:{local}")
body = three[: m.start()].replace("being imported.", "being loaded.")
classic = "(() => {\n" + body + "\nglobalThis.THREE_LIB = {" + ",".join(pairs) + "};\n})();\n"
(root / "three.classic.js").write_text(classic, encoding="utf-8")

# 游戏：去掉 import 行，改为读取全局对象，并包进自己的作用域
game = "\n".join((work / f"game{i}.js").read_text(encoding="utf-8") for i in range(1, 6))
game = game.replace("import * as THREE from 'three';", "const THREE = globalThis.THREE_LIB;", 1)
game = "(() => {\n" + game + "\n})();\n"
(root / "game.js").write_text(game, encoding="utf-8")

css = (work / "style.css").read_text(encoding="utf-8")
html = (work / "shell.html").read_text(encoding="utf-8").replace("/*STYLE*/", css)
(root / "index.html").write_text(html, encoding="utf-8")
for f in ("index.html", "three.classic.js", "game.js"):
    print(f, (root / f).stat().st_size, "bytes")
for f, s in (("three", classic), ("game", game)):
    print(f, "import/export statements:", len(re.findall(r"(^|[;}\s])(import|export)[\s{*]", s)))
