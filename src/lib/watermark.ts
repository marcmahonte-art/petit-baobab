/**
 * Adds a watermark to a canvas/image for free plan users.
 * @param imageDataUrl - The image data URL to add watermark to
 * @returns A new data URL with the watermark applied
 */
export async function addWatermark(imageDataUrl: string): Promise<string> {
  // Create an offscreen canvas
  const img = new Image()
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(imageDataUrl)
        return
      }
      
      // Draw original image
      ctx.drawImage(img, 0, 0)
      
      // Add watermark text
      ctx.font = `bold ${Math.max(16, Math.round(img.width / 20))}px Nunito, sans-serif`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Rotate watermark diagonally
      ctx.save()
      ctx.translate(img.width / 2, img.height / 2)
      ctx.rotate(-Math.PI / 6)
      
      // Multiple watermark lines across the image
      const lineHeight = Math.max(40, Math.round(img.height / 8))
      for (let row = -3; row <= 3; row++) {
        for (let col = -2; col <= 2; col++) {
          ctx.fillText(
            'Petit Baobab',
            col * img.width * 0.4,
            row * lineHeight
          )
        }
      }
      
      ctx.restore()
      resolve(canvas.toDataURL('image/png'))
    }
    
    img.onerror = () => resolve(imageDataUrl)
    img.src = imageDataUrl
  })
}
