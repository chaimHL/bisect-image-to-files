# bisect-image-to-files

本库适用于需要将上传的图片重中间一分为二进行裁切处理后再上传的场景。

借助 canvas 实现将图片从中间一分为左右 2 半，各自生成新的 File 对象，放入数组中返回。

## 安装

```shell
npm install bisect-image-to-files
# 或
pnpm add bisect-image-to-files
```

## 使用

将图片 File 对象，传入 `bisectImageToFiles()` 即可，方法返回结果为一数组，数组里是被截为左右 2 半的图片各自生成的 File 对象。

### vue3 项目

```typescript
import bisectImageToFiles from 'bisect-image-to-files'
const files = await bisectImageToFiles(file)
```
