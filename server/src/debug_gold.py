import urllib.request
import re
import ssl

# 目标网址
url = "https://www.beijingrtj.com/phone.html"

print("="*50)
print(f"正在尝试连接 (忽略SSL证书验证): {url}")
print("="*50)

# 伪装 + 忽略证书
headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
}
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE  # 关键：完全忽略证书验证

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        print(f"✅ [网络通畅] 状态码: {response.status}")
        
        raw_data = response.read()
        print(f"📦 获取数据大小: {len(raw_data)} bytes")
        
        # 智能解码
        content = ""
        try:
            content = raw_data.decode('utf-8')
            print("🔤 UTF-8 解码: 成功")
        except:
            print("⚠️ UTF-8 解码失败，尝试 GBK...")
            try:
                content = raw_data.decode('gbk', errors='ignore')
                print("🔤 GBK 解码: 成功")
            except:
                print("❌ 解码彻底失败")
        
        # 预览内容 (看是不是我们要的)
        print("-" * 20)
        clean_content = re.sub(r'\s+', ' ', content)
        print("📄 页面内容预览 (前500字):")
        print(clean_content[:500])
        print("-" * 20)
        
        # 模拟抓取核心数据
        print("🔍 模拟数据提取:")
        # 尝试匹配常见的黄金价格格式 (数字.数字)
        prices = re.findall(r'(\d{3,}\.\d{2})', clean_content)
        if prices:
            print(f"🎉 发现疑似价格数据: {prices[:5]} ...")
        else:
            print("❌ 未发现价格数字，可能需要调整正则。")

except Exception as e:
    print(f"❌ 依然失败: {e}")

print("="*50)
