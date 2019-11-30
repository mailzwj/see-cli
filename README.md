# see-cli
ReactJS组件开发脚手架

## 安装
```js
npm install -g @mailzwj/see-cli
```

## 用法
```bash
see [命令]

命令：
  see init [project]  初始化应用                               [aliases: i]
  see serve [path]    启动本地静态服务器                         [aliases: s]

选项：
  --version     显示版本号                                            [布尔]
  --port, -p    端口                                          [默认值: 9000]
  --type, -t    设置初始化类型             [可选值: "js", "ts"] [默认值: "js"]
  --source, -s  资源托管服务     [可选值: "gitee", "github"] [默认值: "gitee"]
  --help        显示帮助信息                                           [布尔]
```

## DEMO
```js
see init newPlugin --type 'ts'
```
