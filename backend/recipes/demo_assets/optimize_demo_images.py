from pathlib import Path

from PIL import Image

IMAGE_DIR = Path(__file__).resolve().parent / "images"
TARGET_SIZE = (1200, 800)
QUALITY = 82


def optimize_image(path: Path) -> None:
    with Image.open(path) as image:
        image = image.convert("RGB")
        image.thumbnail(TARGET_SIZE)

        canvas = Image.new("RGB", TARGET_SIZE, (245, 245, 245))
        x = (TARGET_SIZE[0] - image.width) // 2
        y = (TARGET_SIZE[1] - image.height) // 2
        canvas.paste(image, (x, y))

        canvas.save(path, "JPEG", quality=QUALITY, optimize=True)


def main() -> None:
    images = sorted(IMAGE_DIR.glob("recipe-*.jpg"))

    if len(images) != 15:
        raise SystemExit(f"Expected 15 demo images, found {len(images)}.")

    for image_path in images:
        optimize_image(image_path)
        print(f"Optimized {image_path.name}")


if __name__ == "__main__":
    main()
