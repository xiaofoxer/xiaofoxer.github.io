# xiaofoxer.github.io
(ÒωÓױ)！
下载git。
git config --global user.name "xiaofox"
git config --global user.email "1225247980@qq.com"
git config --list

找到Git(安装目录)/usr/bin目录下的ssh-keygen.exe (如果找不到，可以在计算机全局搜索)；在 “我的电脑”右键 属性-->高级系统设置-->环境变量-->系统变量,找到Path变量，进行编辑，End到最后，输入分号（切记：输入英文状态下的分号），粘贴复制ssh-keygen所在的路径，确定 保存；
eg: D:\Git\usr\bin

重启。

ssh-keygen -t rsa -C "1225247980@qq.com"

cat ~/.ssh/id_rsa.pub   命令可得ssh。

个人设置——帐号——ssh key


usage:
右键 git bash here
git clone https://github.com/xiaofoxer/xiaofoxer.github.io.git

git pull origin master

TortoiseGit
