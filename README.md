+ 高级软件开发布置的作业
+ 自己写一个练练ts
# 源码分类
## CAC
最近在vuepress源码中看的`npm`包`CAC`
+ 负责通过命令行交互,写一个有基本功能的玩玩,比较简易
## DomTree
+ 存储书签的树结构
## MarkdownParser
+ 解析`markdown`写成的书签文件,设置一个抽象类,可以写别的parser
+ 输入算法比较简单
+ 输出通过访问者模式traverse加上compose函数进行
### 可视化
+ 使用了比较简单的实现方式,否则中文间隔不太好处理(不是正经的字符长度)
## Utils
工具箱
## typescript
+ 使用ts-node编译ts并且直接执行
## test
+ 使用jest,ts-jest进行自动化测试,测试的过程比较水,因为第一次干这种事,就用现有的简单例子测试了一下,还真测出了bug..
+ 使用vscode安装插件`jest runner`进行测试
# usage
+ 参照`lab.pdf`作业要求
+ 一些小的要求有点懒得写了,但是基本可以使用现有的框架使用相应api编写完成的命令即可
# later
+ 完善代码
+ 看看类型,改一改private,public等,写的时候没太注意(主要是debug时不太方便..)
+ 后续可以添加vue/react框架直接改成web项目,不过只自己动手搭过vue的使用webpack框架,react的应该还要使用babel解析jsx语法吧



