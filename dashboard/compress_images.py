
import os
from PIL import Image
import sys

# 设置imgs文件夹路径
imgs_folder = os.path.join(os.path.dirname(__file__), 'src', 'assets', 'imgs')

# 定义压缩质量，范围0-100，85是一个较好的平衡点
quality = 85

# 遍历imgs文件夹中的所有文件
for filename in os.listdir(imgs_folder):
    file_path = os.path.join(imgs_folder, filename)

    # 检查是否为图片文件
    if os.path.isfile(file_path) and filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        try:
            # 打开图片
            img = Image.open(file_path)

            # 获取原始大小
            original_size = os.path.getsize(file_path) / 1024  # KB

            # 保存压缩后的图片，保持原始格式
            if filename.lower().endswith('.png'):
                # PNG图片使用optimize参数
                img.save(file_path, optimize=True, compress_level=6)
            else:
                # JPEG图片使用quality参数
                img.save(file_path, quality=quality, optimize=True)

            # 获取压缩后大小
            compressed_size = os.path.getsize(file_path) / 1024  # KB

            # 计算压缩率
            compression_ratio = (1 - compressed_size / original_size) * 100

            print(f"已压缩: {filename}")
            print(f"  原始大小: {original_size:.2f} KB")
            print(f"  压缩后大小: {compressed_size:.2f} KB")
            print(f"  压缩率: {compression_ratio:.2f}%")
            print()

        except Exception as e:
            print(f"压缩 {filename} 时出错: {str(e)}")

print("所有图片压缩完成！")
