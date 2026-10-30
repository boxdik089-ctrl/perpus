#!/usr/bin/env python3
"""
================================================================================
📚 GENERATOR ASET BUKU 3D TERBUKA SMKN 1 BERINGIN (HERO SHOWCASE) - ULTRA PERFECT
================================================================================
Menghasilkan aset buku 3D terbuka 100% sempurna tanpa terpotong:
- BAB 1 & BAB 2 terlihat utuh dengan lengkungan kertas atas alami
- Tepi kanan buku melengkung anggun mengikuti kontur halaman 2 murni
- Tanpa bocoran teks banner kanan (huruf terpotong R, K, d, b)
- Tanpa double logo / ghosting pada cover depan
- Latar transparan Retina antialiasing murni
================================================================================
"""

import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# ==============================================================================
# 📝 1. PENGATURAN TEKS & ASET
# ==============================================================================
SCHOOL_NAME = "SMKN 1 BERINGIN"
SCHOOL_MOTTO = '"Berilmu, Berkarakter, Berdaya Saing"'

# Judul Utama pada Gelombang Pita Biru Cover
TITLE_LINE1_WHITE = "Baca. "
TITLE_LINE2_GRADIENT = "Jelajahi."
TITLE_LINE3_WHITE = "Berkembang."
SUBTITLE_COVER = "Perpustakaan Digital SMKN 1 Beringin"

# Path Aset
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO_PATH = os.path.join(BASE_DIR, "public/assets/logo.png")
BUILDING_PATH = os.path.join(BASE_DIR, "public/assets/gedung-smk.jpg")
TEMPLATE_PATH = os.path.join(BASE_DIR, "public/assets/showcase/template-open-book.jpg")
OUTPUT_PATH = os.path.join(BASE_DIR, "public/assets/showcase/buku-3d-open-beringin.png")
OUTPUT_LEGACY_PATH = os.path.join(BASE_DIR, "public/assets/showcase/buku-smkn1-beringin.png")

# Font Fallback
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_ITALIC = "/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf"
FONT_SUB = "/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf"


def main():
    print("🎨 1/4 Merancang 2D Cover dari nol (1200 x 1680) tanpa cacat...")
    CW, CH = 1200, 1680
    cover = Image.new("RGBA", (CW, CH), (255, 255, 255, 255))
    draw = ImageDraw.Draw(cover)

    # A. Langit Biru Cerah Gradien Lembut (Clean Sky)
    for y in range(750):
        t = y / 750.0
        r = int(135 * (1 - t) + 235 * t)
        g = int(195 * (1 - t) + 245 * t)
        b = int(255 * (1 - t) + 255 * t)
        draw.line([(0, y), (CW, y)], fill=(r, g, b, 255))

    # B. Foto Gedung SMKN 1 Beringin Asli
    if os.path.exists(BUILDING_PATH):
        school = Image.open(BUILDING_PATH).convert("RGBA")
        sw, sh = school.size
        crop_bldg = school.crop((100, 30, sw - 100, sh - 30))
        bldg_w = CW
        bldg_h = int(round(crop_bldg.height * (bldg_w / crop_bldg.width)))
        bldg_resized = crop_bldg.resize((bldg_w, bldg_h), Image.Resampling.LANCZOS)

        # Gradien lembut di tepi atas foto agar menyatu halus dengan langit
        bldg_alpha = np.ones((bldg_h, bldg_w), dtype=np.float32)
        feather_h = 120
        for y in range(feather_h):
            bldg_alpha[y, :] = y / float(feather_h)

        bldg_np = np.array(bldg_resized)
        bldg_np[:, :, 3] = (bldg_np[:, :, 3].astype(np.float32) * bldg_alpha).astype(np.uint8)
        bldg_feathered = Image.fromarray(bldg_np)

        cover.paste(bldg_feathered, (0, 360), bldg_feathered)

    # C. Efek Awan Halus Organik
    cloud_overlay = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(cloud_overlay)
    cdraw.ellipse([CW - 420, -40, CW + 120, 290], fill=(255, 255, 255, 170))
    cdraw.ellipse([CW - 270, 30, CW + 90, 330], fill=(255, 255, 255, 200))
    cdraw.ellipse([60, -70, 500, 230], fill=(255, 255, 255, 140))
    cloud_blur = cv2.GaussianBlur(np.array(cloud_overlay), (55, 55), 0)
    cover = Image.alpha_composite(cover, Image.fromarray(cloud_blur))
    draw = ImageDraw.Draw(cover)

    # D. Logo Resmi SMKN 1 Beringin (Tunggal, Tajam, Posisi Presisi Tanpa Ghosting)
    if os.path.exists(LOGO_PATH):
        logo = Image.open(LOGO_PATH).convert("RGBA")
        l_size = 175
        logo_resized = logo.resize((l_size, l_size), Image.Resampling.LANCZOS)
        cover.paste(logo_resized, (90, 95), logo_resized)

    # E. Nama Sekolah & Motto
    font_school = ImageFont.truetype(FONT_BOLD, 46)
    font_motto = ImageFont.truetype(FONT_ITALIC, 29)
    draw.text((290, 115), SCHOOL_NAME, font=font_school, fill=(15, 23, 42, 255))
    draw.text((292, 175), SCHOOL_MOTTO, font=font_motto, fill=(30, 58, 138, 240))

    # F. Gelombang Biru Bawah (Ocean Wave)
    wave_overlay = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    wdraw = ImageDraw.Draw(wave_overlay)

    # Lapisan 1: Gelombang Belakang (Sian Cerah)
    curve_back = []
    for x in range(CW + 1):
        y = int(870 + 80 * np.sin(x / 240.0) + 30 * np.cos(x / 420.0))
        curve_back.append((x, y))
    poly_back = [(0, CH), (0, 950)] + curve_back + [(CW, 870), (CW, CH)]
    wdraw.polygon(poly_back, fill=(2, 132, 199, 140))

    # Lapisan 2: Gelombang Utama (Biru Royal Gradien)
    curve_front = []
    for x in range(CW + 1):
        y = int(930 - 75 * np.cos(x / 280.0) + 20 * np.sin(x / 180.0))
        curve_front.append((x, y))
    poly_front = [(0, CH), (0, 890)] + curve_front + [(CW, 960), (CW, CH)]
    wdraw.polygon(poly_front, fill=(3, 70, 170, 255))

    cover = Image.alpha_composite(cover, wave_overlay)
    draw = ImageDraw.Draw(cover)

    # Gradien Vertikal pada pita biru bawah
    cov_np = np.array(cover)
    for y in range(920, CH):
        t = (y - 920) / float(CH - 920)
        mask_wave = (cov_np[y, :, 0] < 50) & (cov_np[y, :, 2] > 120)
        cov_np[y, mask_wave, 0] = np.clip(cov_np[y, mask_wave, 0] * (1.0 - t * 0.4), 0, 255)
        cov_np[y, mask_wave, 1] = np.clip(cov_np[y, mask_wave, 1] * (1.0 - t * 0.4), 0, 255)
        cov_np[y, mask_wave, 2] = np.clip(cov_np[y, mask_wave, 2] * (1.0 - t * 0.25), 0, 255)

    # Highlight Lengkungan Pita Putih
    hl_mask = np.zeros((CH, CW), dtype=np.float32)
    for pt in curve_front[::2]:
        x, y = pt
        if 0 <= y < CH and 0 <= x < CW:
            hl_mask[max(0, y - 2):min(CH, y + 3), x] = 1.0
    hl_mask = cv2.GaussianBlur(hl_mask, (5, 5), 0)
    for c in range(3):
        cov_np[:, :, c] = np.clip(cov_np[:, :, c] + hl_mask * 140, 0, 255)
    cover = Image.fromarray(cov_np.astype(np.uint8))
    draw = ImageDraw.Draw(cover)

    # G. Tipografi Judul Spektakuler 'Baca. Jelajahi. Berkembang.'
    font_title = ImageFont.truetype(FONT_BOLD, 110)
    font_sub = ImageFont.truetype(FONT_SUB, 42)

    title_x = 110
    title_y = 1070

    # 1. 'Baca. '
    bbox1 = font_title.getbbox(TITLE_LINE1_WHITE)
    w1 = bbox1[2] - bbox1[0]
    draw.text((title_x, title_y), TITLE_LINE1_WHITE, font=font_title, fill=(255, 255, 255, 255))

    # 2. 'Jelajahi.' Gradien Sian Elektrik Menawan
    bbox2 = font_title.getbbox(TITLE_LINE2_GRADIENT)
    w2 = bbox2[2] - bbox2[0]
    h2 = bbox2[3] - bbox2[1]
    j_img = Image.new("RGBA", (w2 + 30, h2 + 40), (0, 0, 0, 0))
    j_draw = ImageDraw.Draw(j_img)
    j_draw.text((0, 0), TITLE_LINE2_GRADIENT, font=font_title, fill=(255, 255, 255, 255))
    j_np = np.array(j_img)
    for x in range(j_np.shape[1]):
        t = x / max(1, j_np.shape[1] - 1)
        r = int(56 * (1 - t) + 96 * t)
        g = int(189 * (1 - t) + 165 * t)
        b = int(248 * (1 - t) + 250 * t)
        mask = j_np[:, x, 3] > 0
        j_np[mask, x, 0] = r
        j_np[mask, x, 1] = g
        j_np[mask, x, 2] = b
    j_grad = Image.fromarray(j_np)
    cover.paste(j_grad, (title_x + w1, title_y), j_grad)
    draw = ImageDraw.Draw(cover)

    # 3. 'Berkembang.'
    draw.text((title_x, title_y + 135), TITLE_LINE3_WHITE, font=font_title, fill=(255, 255, 255, 255))

    # 4. Subtitle Cover
    draw.text((title_x + 4, title_y + 275), SUBTITLE_COVER, font=font_sub, fill=(186, 230, 253, 230))

    cover_2d_np = cv2.cvtColor(np.array(cover), cv2.COLOR_RGBA2BGR)

    # ==============================================================================
    # 📐 2/4 PROYEKSIKAN COVER KE PERSPEKTIF 3D BUKU TERBUKA (RETINA 2X)
    # ==============================================================================
    print("📐 2/4 Memetakan cover ke perspektif 3D buku terbuka Retina...")
    if not os.path.exists(TEMPLATE_PATH):
        raise FileNotFoundError(f"Template buku tidak ditemukan di: {TEMPLATE_PATH}")

    base_pil = Image.open(TEMPLATE_PATH)
    base_2x = base_pil.resize((base_pil.width * 2, base_pil.height * 2), Image.Resampling.LANCZOS)
    base_np = cv2.cvtColor(np.array(base_2x), cv2.COLOR_RGB2BGR)

    # Penajaman halus halaman terbuka pada sisi kanan
    gaussian = cv2.GaussianBlur(base_np, (0, 0), 2.0)
    base_sharp = cv2.addWeighted(base_np, 1.35, gaussian, -0.35, 0)
    bh, bw, _ = base_sharp.shape

    # Poligon 14-titik presisi yang mencakup SELURUH muka cover depan dan spine kiri
    cover_poly_full = np.array([
        [30, 312],      # Puncak spine kiri terluar
        [200, 260],
        [400, 210],
        [550, 178],
        [680, 150],     # Puncak engsel tengah (spine top)
        [800, 1018],    # Dasar engsel tengah (spine bottom)
        [600, 1045],
        [400, 1080],
        [210, 1150],    # Sudut bawah cover depan
        [105, 1118],    # Dasar spine kiri terluar
        [90, 912],
        [72, 712],
        [54, 512],
        [30, 312]
    ], dtype=np.int32)

    # Hapus pixel cover lama pada base_sharp sehingga tidak bocor/ghosting sama sekali
    cv2.fillPoly(base_sharp, [cover_poly_full], (250, 215, 170))

    # Koordinat 4 sudut cover depan (mencakup dari tepi spine terluar x=30 ke engsel tengah x=680..800)
    src_pts = np.float32([[0, 0], [CW, 0], [CW, CH], [0, CH]])
    dst_pts_2x = np.float32([[30, 312], [680, 150], [800, 1018], [105, 1118]])

    M = cv2.getPerspectiveTransform(src_pts, dst_pts_2x)
    warped_cover = cv2.warpPerspective(cover_2d_np, M, (bw, bh), flags=cv2.INTER_LANCZOS4)

    # Masking poligon cover
    cover_mask = np.zeros((bh, bw), dtype=np.float32)
    cv2.fillPoly(cover_mask, [cover_poly_full], 1.0)
    cover_mask = cv2.GaussianBlur(cover_mask, (3, 3), 0.5)
    cover_mask_3 = np.repeat(cover_mask[:, :, np.newaxis], 3, axis=2)

    # Composite cover baru menggantikan cover lama 100% bersih tanpa sisa
    composite = (base_sharp.astype(np.float32) * (1.0 - cover_mask_3) + warped_cover.astype(np.float32) * cover_mask_3).astype(np.uint8)

    # Bayangan lipatan punggung buku (spine crease shadow) & engsel tengah
    spine_crease = np.zeros((bh, bw), dtype=np.float32)
    cv2.polylines(spine_crease, [np.array([[676, 152], [796, 1016]], dtype=np.int32)], False, 1.0, 7)
    cv2.polylines(spine_crease, [np.array([[54, 320], [120, 1110]], dtype=np.int32)], False, 0.5, 5)
    spine_crease = cv2.GaussianBlur(spine_crease, (11, 11), 0)
    for c in range(3):
        composite[:, :, c] = np.clip(composite[:, :, c].astype(np.float32) * (1.0 - spine_crease * 0.35), 0, 255).astype(np.uint8)

    # ==============================================================================
    # ✂️ 3/4 ISOLASI BUKU TERBUKA DENGAN KONTUR ULTRA PRESISI TANPA TERPOTONG
    # ==============================================================================
    print("✂️ 3/4 Memisahkan latar belakang & defringing antialias...")

    # Poligon batas luar presisi buku terbuka utuh:
    # - Atas Halaman 1 & 2 melengkung tinggi -> BAB 1 & BAB 2 terlihat 100% utuh tanpa terpotong
    # - Tepi kanan Halaman 2 melengkung alami -> tidak bocor ke teks hero section template
    # - Bawah buku lega -> nomor halaman 12 dan teks motto bawah terlihat utuh
    book_poly_2x = np.array([
        # 1. Puncak Spine & Garis Atas Cover Depan
        [30, 312],
        [200, 260],
        [400, 210],
        [550, 178],
        [676, 152],     # Puncak engsel tengah (spine top)
        
        # 2. Puncak Lengkungan Atas Halaman 1 (BAB 1) - MELENGKUNG TINGGI, BAB 1 UTUH!
        [700, 95],
        [740, 65],
        [790, 45],
        [840, 48],
        [890, 68],
        [940, 96],
        [990, 122],
        [1040, 142],    # Lembah antara Halaman 1 dan 2
        
        # 3. Puncak Lengkungan Atas Halaman 2 (BAB 2) - UTUH PENUH DI ATAS JARGON!
        [1100, 108],
        [1160, 65],
        [1220, 38],
        [1270, 35],
        [1310, 42],
        [1335, 60],     # Sudut kanan atas halaman 2
        [1345, 100],
        
        # 4. Tepi Lengkungan Kanan Halaman 2 (Bersih, Presisi, Tanpa Bocor ke Teks Hero Kanan)
        [1350, 200],
        [1352, 340],
        [1352, 480],
        [1350, 620],
        [1348, 760],
        [1342, 860],
        [1330, 940],
        [1315, 980],    # Sudut kanan bawah halaman 2
        
        # 5. Garis Bawah Halaman 2 & 1 (Lega di bawah teks 'Beringin Maju' & nomor halaman)
        [1260, 1020],
        [1160, 1035],
        [1040, 1050],
        [920, 1025],
        [796, 1020],    # Dasar engsel tengah (spine bottom)
        
        # 6. Garis Bawah Cover Depan
        [600, 1045],
        [400, 1080],
        [210, 1150],    # Sudut bawah cover depan
        
        # 7. Tepi Luar Spine Kiri (Hardcover Silinder)
        [106, 1118],    # Dasar spine kiri
        [90, 912],
        [72, 712],
        [54, 512],
        [30, 312]       # Kembali ke puncak spine kiri
    ], dtype=np.int32)

    poly_mask = np.zeros((bh, bw), dtype=np.uint8)
    cv2.fillPoly(poly_mask, [book_poly_2x], 255)

    # Deteksi warna foreground terhadap background asli
    bg_color = np.array([253, 249, 244], dtype=np.float32)
    diff = np.linalg.norm(composite.astype(np.float32) - bg_color, axis=2)
    color_mask = (diff > 10).astype(np.uint8) * 255

    # Core poligon solid + tepi halus
    core_poly = cv2.erode(poly_mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    final_mask = np.maximum(core_poly, cv2.bitwise_and(poly_mask, color_mask))

    # Antialiasing gaussian sub-pixel
    smooth_alpha = cv2.GaussianBlur(final_mask.astype(np.float32), (5, 5), 1.0)

    # Unmatte: hilangkan kontribusi warna background dari pixel semi-transparan
    a_norm = np.clip(smooth_alpha / 255.0, 0.0, 1.0)[:, :, np.newaxis]
    comp_float = composite.astype(np.float32)
    unmatted_bgr = comp_float.copy()
    mask_semi = (a_norm[:, :, 0] > 0.05) & (a_norm[:, :, 0] < 0.98)

    for c in range(3):
        ch = comp_float[:, :, c]
        unmatted_ch = (ch - (1.0 - a_norm[:, :, 0]) * bg_color[c]) / np.maximum(a_norm[:, :, 0], 0.05)
        unmatted_bgr[mask_semi, c] = np.clip(unmatted_ch[mask_semi], 0, 255)

    ub, ug, ur = cv2.split(unmatted_bgr.astype(np.uint8))
    rgba = cv2.merge([ub, ug, ur, smooth_alpha.astype(np.uint8)])

    # Crop presisi ke bounding box non-transparan
    y_indices, x_indices = np.where(smooth_alpha > 8)
    pad = 12
    ymin = max(0, y_indices.min() - pad)
    ymax = min(rgba.shape[0], y_indices.max() + pad)
    xmin = max(0, x_indices.min() - pad)
    xmax = min(rgba.shape[1], x_indices.max() + pad)
    trimmed = rgba[ymin:ymax, xmin:xmax]

    # Simpan PNG transparan resolusi tinggi
    trimmed_pil = Image.fromarray(cv2.cvtColor(trimmed, cv2.COLOR_BGRA2RGBA))

    # ==============================================================================
    # 💾 4/4 SIMPAN ASET BUKU KE PUBLIC DIRECTORY
    # ==============================================================================
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    trimmed_pil.save(OUTPUT_PATH, optimize=True)
    trimmed_pil.save(OUTPUT_LEGACY_PATH, optimize=True)
    print(f"✅ 4/4 Selesai! Aset buku 3D tersimpan di:")
    print(f"   -> {OUTPUT_PATH}")
    print(f"   -> {OUTPUT_LEGACY_PATH}")
    print(f"   Dimensi Retina: {trimmed_pil.width} x {trimmed_pil.height} px")


if __name__ == "__main__":
    main()
