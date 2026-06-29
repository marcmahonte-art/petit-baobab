import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  const categories = {
    animals: "animals",
    culture: "culture",
    fruits: "fruits",
    alphabet: "alphabet",
    jobs: "jobs",
  }

  const baseDir = path.join(process.cwd(), "public", "illustrations")
  const result: Record<string, { id: string; name: string; image: string; category: string }[]> = {}

  for (const [key, folder] of Object.entries(categories)) {
    const dirPath = path.join(baseDir, folder)
    result[key] = []

    if (fs.existsSync(dirPath)) {
      try {
        const files = fs.readdirSync(dirPath)
        const svgFiles = files
          .filter((f) => f.toLowerCase().endsWith(".svg"))
          .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))

        result[key] = svgFiles.map((file) => {
          const nameWithoutExt = path.parse(file).name
          const friendlyName = nameWithoutExt
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")

          return {
            id: `${key}-${nameWithoutExt}`,
            name: friendlyName,
            image: `/illustrations/${folder}/${file}`,
            category: key,
          }
        })
      } catch (err) {
        console.error(`Error reading directory ${dirPath}:`, err)
      }
    }
  }

  return NextResponse.json(result)
}
