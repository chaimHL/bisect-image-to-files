

/**
 * @param imgFile 图片文件
 * @returns 从中间一分为 2 后，生成的图片文件数组
 */
async function bisectImageToFiles(imgFile: File): Promise<File[]> {
  // 最终返回的图片文件列表
  const files: File[] = []
  let canvas: HTMLCanvasElement | null = null
  let ctx: CanvasRenderingContext2D | null = null
  // 图片临时地址
  let imgObjUrl: string = ''
  let img: HTMLImageElement
  // 获取图片文件名、类型
  const imgName = imgFile.name
  const imgType = imgFile.type

  // canvas 画布的原始尺寸（等于图片的原始尺寸）
  let width = 0
  let height = 0

  try {
    await crateCanvas(imgFile)
    drawImage()
    // 生成左半边图片文件
    await createScreenshotsFile('left', 0)
    // 生成右半边图片文件
    await createScreenshotsFile('right', width / 2)
    return files
  } catch (error) {
    console.error('Error processing image:', error)
    throw error
  } finally {
    if (imgObjUrl) {
      URL.revokeObjectURL(imgObjUrl)
    }
  }

  /**
 * 根据图片的原始尺寸设置 canvas 画布的尺寸
 * @param imgFile 图片文件
 */
  function crateCanvas(imgFile: File): Promise<void> {
    return new Promise((resolve, reject) => {
      imgObjUrl = URL.createObjectURL(imgFile)
      img = new Image()
      img.src = imgObjUrl
      img.onload = () => {
        canvas = document.createElement('canvas')
        ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          reject(new Error('Failed to get 2D context'))
          return
        }
        canvas.width = width = img.naturalWidth
        canvas.height = height = img.naturalHeight
        resolve()
      }
      img.onerror = () => {
        URL.revokeObjectURL(imgObjUrl)
        reject(new Error('Failed to load image'))
      }
    })
  }

  /** 绘制图片 */
  function drawImage() {
    if (!canvas || !ctx) {
      throw new Error('Canvas or context is not initialized')
    }
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)
  }

  /**
 * 生成截图文件
 * @param position 标示生成的左半边 or 右半边图片
 * @param x 截图开始位置的左上角 x 坐标（相对于原图）
 */
  function createScreenshotsFile(position: string, x: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!ctx) {
        reject(new Error('Canvas context is not initialized'))
        return
      }
      const imgData = ctx.getImageData(x, 0, width / 2, height)
      const screenshotCanvas = document.createElement('canvas')
      const screenshotCtx = screenshotCanvas.getContext('2d')
      if (!screenshotCtx) {
        reject(new Error('Failed to get 2D context for screenshot'))
        return
      }
      screenshotCanvas.width = width / 2
      screenshotCanvas.height = height
      screenshotCtx.putImageData(imgData, 0, 0)
      screenshotCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas'))
          return
        }
        const file = new File([blob], `${position}-${imgName}`, { type: imgType })
        files.push(file)
        resolve()
      }, imgType)
    })
  }
}

export default bisectImageToFiles
