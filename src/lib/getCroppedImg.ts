export default async function getCroppedImg(
  imageSrc: string,
  crop: any,
  rotation = 0
): Promise<string> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return imageSrc;

  const safeRatio = image.naturalWidth / Math.max(1, image.naturalHeight);
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  ctx.drawImage(image, 0, 0);
  ctx.restore();

  return canvas.toDataURL("image/jpeg", 0.85);
}
