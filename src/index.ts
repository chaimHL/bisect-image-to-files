// 最终返回的图片文件列表
let files: File[] = []

let canvas: HTMLCanvasElement
let ctx: CanvasRenderingContext2D | null = null

// 图片临时地址
let imgObjUrl: string
let img: HTMLImageElement
let imgName: string
let imgType: string

// canvas 画布的原始尺寸（等于图片的原始尺寸）
let width: number
let height: number

/**
 * @param imgFile 图片文件
 * @returns 从中间一分为 2 后，生成的图片文件数组
 */
async function bisectImageToFiles(imgFile: File) {
  // 获取图片文件名、类型
  imgName = imgFile.name
  imgType = imgFile.type
  // 清空图片文件列表
  files = []
  await crateCanvas(imgFile)
  drawImage()
  // 生成左半边图片文件
  await createScreenshotsFile('left', 0)
  // 生成右半边图片文件
  await createScreenshotsFile('right', width / 2)
  return files
}
/**
 * 根据图片的原始尺寸设置 canvas 画布的尺寸
 * @param imgFile 图片文件
 */
function crateCanvas(imgFile: File) {
  return new Promise((resolve, reject) => {
    imgObjUrl = URL.createObjectURL(imgFile)
    img = new Image()
    img.src = imgObjUrl
    img.onload = () => {
      canvas = document.createElement('canvas')
      ctx = canvas.getContext('2d', { willReadFrequently: true })
      canvas.width = width = img.naturalWidth
      canvas.height = height = img.naturalHeight
      resolve(true)
    }
    img.onerror = () => {
      URL.revokeObjectURL(imgObjUrl)
      reject(false)
    }
  })
}

/** 绘制图片 */
function drawImage() {
  if (!canvas || !ctx) return
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)
  URL.revokeObjectURL(imgObjUrl)
}

/**
 *
 * @param position 标示生成的左半边 or 右半边图片
 * @param x 截图开始位置的左上角 x 坐标（相对于原图）
 */
function createScreenshotsFile(position: string, x: number) {
  return new Promise((resolve, reject) => {
    if (!ctx) {
      reject(false)
      return
    }
    const imgData = ctx.getImageData(x, 0, width / 2, height)
    const canvas = document.createElement('canvas')

    const ctx2 = canvas.getContext('2d')

    canvas.width = width / 2
    canvas.height = height

    ctx2?.putImageData(imgData, 0, 0)

    canvas.toBlob((blob) => {
      const file = new File([blob!], position + imgName, { type: imgType })
      files.push(file)
      resolve(true)
    })
  })
}

export default bisectImageToFiles
