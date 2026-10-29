import os
import urllib.request
import json
from PIL import Image, ImageOps

COVERS_DIR = "/www/wwwroot/perpus-main/public/uploads/covers"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# Verified high-resolution PURE 2D FLAT FRONT COVERS (no 3D mockups, no borders, no tables)
PURE_COVER_REPLACEMENTS = {
    # Filosofi Teras (Pure flat 2D cover art, replaces the 500x500 Gramedia 3D mockup)
    "real-filosofi-teras.png": "https://m.media-amazon.com/images/I/71YF9P4FwRL._AC_UF1000,1000_QL80_.jpg",
    # Atomic Habits (Pure flat 2D Indonesian edition cover art, replaces padded Gramedia mockup)
    "real-atomic-habits.jpg": "https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg",
    # The Psychology of Money (Pure flat 2D cover art, removes black sidebars)
    "real-psychology-money.png": "https://m.media-amazon.com/images/I/71TRUbzcvaL._AC_UF1000,1000_QL80_.jpg",
    # Sebuah Seni untuk Bersikap Bodo Amat (Pure flat 2D cover art)
    "real-bodo-amat.jpg": "https://m.media-amazon.com/images/I/71OX8Y0R8IL._AC_UF1000,1000_QL80_.jpg",
    # Tata Bahasa Baku Bahasa Indonesia (Pure flat 2D front cover, replaces square Shopee photo)
    "real-tatabahasa-baku.jpg": "https://covers.openlibrary.org/b/id/8381928-L.jpg",
    # Clean Code (Pure flat front cover)
    "real-clean-code.jpg": "https://covers.openlibrary.org/b/id/11140924-L.jpg",
    # Berani Tidak Disukai (Pure flat front cover)
    "real-berani-tidak-disukai.jpg": "https://m.media-amazon.com/images/I/71u-sE0gO8L._AC_UF1000,1000_QL80_.jpg",
    # Bicara Itu Ada Seninya
    "real-bicara-ada-seninya.jpg": "https://m.media-amazon.com/images/I/71xYp6q+yKL._AC_UF1000,1000_QL80_.jpg",
    # Dilan 1990
    "real-dilan-1990.jpg": "https://mizan.com//storage/images/book/dilan-dia-adalah-dilanku-tahun-1990-edisi-revisi.jpg",
    # Cantik Itu Luka
    "real-cantik-itu-luka.jpg": "https://cdn.gramedia.com/uploads/items/9786020366517_Cantik-Itu-Luka-Hard-Cover---Limited-Edition.jpg",
    # Laut Bercerita
    "real-laut-bercerita.jpg": "https://ebooks.gramedia.com/ebook-covers/40678/big_covers/ID_KPG2017MTH10LBER_B.jpg",
    # Hujan - Tere Liye
    "real-hujan-tereliye.jpg": "https://cdn.gramedia.com/uploads/items/img20220905_11493451.jpg",
    # Bumi Manusia
    "real-bumi-manusia.jpg": "https://play.google.com/books/publisher/content/images/frontcover/9DA5DwAAQBAJ?fife=w800-h1200",
}

def autocrop_borders(img, tolerance=24):
    """Crops uniform solid borders (white, black, or near-monochrome margin) from all 4 sides."""
    # Convert to RGB
    img_rgb = img.convert("RGB")
    w, h = img_rgb.size
    
    # Check top-left corner color
    c_tl = img_rgb.getpixel((0, 0))
    c_tr = img_rgb.getpixel((w - 1, 0))
    c_bl = img_rgb.getpixel((0, h - 1))
    c_br = img_rgb.getpixel((w - 1, h - 1))
    
    # Check if border is white or black
    is_white_border = (c_tl[0] > 235 and c_tl[1] > 235 and c_tl[2] > 235) and (c_tr[0] > 235 and c_tr[1] > 235 and c_tr[2] > 235)
    is_black_border = (c_tl[0] < 20 and c_tl[1] < 20 and c_tl[2] < 20) and (c_tr[0] < 20 and c_tr[1] < 20 and c_tr[2] < 20)
    
    if not (is_white_border or is_black_border):
        # Also check alpha bbox if RGBA
        if img.mode == "RGBA":
            alpha = img.split()[-1]
            bbox = alpha.getbbox()
            if bbox and (bbox[0] > 5 or bbox[1] > 5 or bbox[2] < w - 5 or bbox[3] < h - 5):
                return img.crop(bbox)
        return img

    gray = img_rgb.convert("L")
    if is_white_border:
        inv = ImageOps.invert(gray)
        # thresholding to avoid small noise
        inv = inv.point(lambda p: 255 if p > tolerance else 0)
        bbox = inv.getbbox()
    else: # black border
        thresh = gray.point(lambda p: 255 if p > tolerance else 0)
        bbox = thresh.getbbox()

    if bbox:
        # Avoid overcropping: only crop if the bbox preserves at least 60% of width and height
        bw = bbox[2] - bbox[0]
        bh = bbox[3] - bbox[1]
        if bw > w * 0.55 and bh > h * 0.55:
            # Add a slight 2px margin inwards to avoid lingering hairline border
            safe_bbox = (
                min(bbox[0] + 1, bbox[2] - 10),
                min(bbox[1] + 1, bbox[3] - 10),
                max(bbox[2] - 1, bbox[0] + 10),
                max(bbox[3] - 1, bbox[1] + 10)
            )
            return img.crop(safe_bbox)

    return img

def main():
    print("--- 1. Downloading pure replacement covers ---", flush=True)
    for filename, url in PURE_COVER_REPLACEMENTS.items():
        dest = os.path.join(COVERS_DIR, filename)
        try:
            print(f"Fetching pure cover: {filename} from {url[:50]}...", flush=True)
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=12) as res:
                content = res.read()
                if len(content) > 3000:
                    with open(dest, "wb") as f:
                        f.write(content)
                    print(f"  [DOWNLOADED] {filename} ({len(content)} bytes)", flush=True)
                else:
                    print(f"  [SKIPPED] {filename} response too small", flush=True)
        except Exception as e:
            print(f"  [FAIL] {filename}: {e}", flush=True)

    print("\n--- 2. Autocropping borders from all covers in uploads ---", flush=True)
    files = [f for f in os.listdir(COVERS_DIR) if f.startswith("real-")]
    for filename in sorted(files):
        p = os.path.join(COVERS_DIR, filename)
        try:
            im = Image.open(p)
            orig_size = im.size
            cropped = autocrop_borders(im)
            if cropped.size != orig_size:
                # Save cropped image in high quality RGB JPEG/PNG
                if filename.endswith(".png"):
                    cropped.save(p, "PNG")
                else:
                    cropped.convert("RGB").save(p, "JPEG", quality=95)
                print(f"  [CROPPED] {filename:30} {orig_size[0]}x{orig_size[1]} -> {cropped.size[0]}x{cropped.size[1]} (ratio {cropped.size[1]/cropped.size[0]:.2f})", flush=True)
            else:
                # Ensure it's clean RGB JPEG if jpg
                if filename.endswith((".jpg", ".jpeg")) and im.mode != "RGB":
                    im.convert("RGB").save(p, "JPEG", quality=95)
        except Exception as e:
            print(f"  [ERR] {filename}: {e}", flush=True)

    print("\nCover optimization completed!", flush=True)

if __name__ == "__main__":
    main()
