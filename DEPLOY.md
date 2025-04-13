# 部署说明

## GitHub Pages 部署

1. 访问仓库的 Settings 页面
2. 选择 Pages 选项
3. 在 Source 部分选择：
   - Branch: main
   - Folder: / (root)
4. 点击 Save 保存设置
5. 等待几分钟，访问生成的网站地址

## 本地部署

1. 克隆仓库到本地：
```bash
git clone https://github.com/bxb51129/weathercheck.git
```

2. 在浏览器中打开 index.html 文件

## 环境变量设置

如果需要设置环境变量（如API密钥），可以在本地创建 .env 文件：
```
WEATHER_API_KEY=你的API密钥
```

## 注意事项

- 确保网络连接正常
- API密钥需要正确配置
- 如果使用GitHub Pages，可能需要等待几分钟才能看到更新 