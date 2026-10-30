#!/usr/bin/env python3
"""
================================================================================
📚 GENERATOR ASET BUKU 3D TERBUKA SMKN 1 BERINGIN (HERO SHOWCASE)
================================================================================
Semua teks, logo, foto gedung, dan judul dapat diedit langsung pada variabel di bawah.
Setelah mengubah teks atau aset gambar, jalankan di terminal:
    npm run generate:book
atau:
    python3 scripts/generate-book-showcase.py
================================================================================
"""

import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# ==============================================================================
# 📝 1. PENGATURAN TEKS & ASET (BISA DIEDIT SESUAI KEBUTUHAN)
# ==============================================================================
SCHOOL_NAME = "SMKN 1 BERINGIN"
SCHOOL_MOTTO = '"Berilmu, Berkarakter, Berdaya Saing"'

# Judul Utama pada Gelombang Pita Biru Cover
TITLE_LINE1_WHITE = "Baca. "
TITLE_LINE2_GRADIENT = "Jelajahi."
TITLE_LINE3_WHITE = "Berkembang."
SUBTITLE_COVER = "Perpustakaan Digital SMKN 1 Beringin"

# Path Aset Relatif dalam Repository
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO_PATH = os.path.join(BASE_DIR, "public/assets/logo.png")
BUILDING_PATH = os.path.join(BASE_DIR, "public/assets/gedung-smk.jpg")
TEMPLATE_PATH = os.path.join(BASE_DIR, "public/assets/showcase/template-open-book.jpg")
OUTPUT_PATH = os.path.join(BASE_DIR, "public/assets/showcase/buku-smkn1-beringin.png")

# Font Fallback
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_ITALIC = "/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf"
FONT_SUB = "/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf"


def main():
    print("🎨 1/4 Merancang 2D Cover dari nol (1200 x 1680)...")
    CW, CH = 1200, 1680
    cover = Image.new("RGBA", (CW, CH), (255, 255, 255, 255))
    draw = ImageDraw.Draw(cover)

    # A. Langit Biru Gradien Lembut
    for y in range(700):
        t = y / 700.0
        r = int(140 * (1 - t) + 235 * t)
        g = int(200 * (1 - t) + 245 * t)
        b = int(255 * (1 - t) + 255 * t)
        draw.line([(0, y), (CW, y)], fill=(r, g, b, 255))

    # B. Foto Gedung Sekolah SMKN 1 Beringin dengan Tiang Bendera
    if os.path.exists(BUILDING_PATH):
        school = Image.open(BUILDING_PATH).convert("RGBA")
        sw, sh = school.size
        crop_bldg = school.crop((120, 40, sw - 120, sh - 40))
        bldg_w = CW
        bldg_h = int(round(crop_bldg.height * (bldg_w / crop_bldg.width)))
        bldg_resized = crop_bldg.resize((bldg_w, bldg_h), Image.Resampling.LANCZOS)

        # Gradien lembut di tepi atas foto agar menyatu halus dengan langit
        bldg_alpha = np.ones((bldg_h, bldg_w), dtype=np.float32)
        feather_h = 100
        for y in range(feather_h):
            bldg_alpha[y, :] = y / float(feather_h)

        bldg_np = np.array(bldg_resized)
        bldg_np[:, :, 3] = (bldg_np[:, :, 3].astype(np.float32) * bldg_alpha).astype(np.uint8)
        bldg_feathered = Image.fromarray(bldg_np)

        cover.paste(bldg_feathered, (0, 360), bldg_feathered)

    # C. Efek Awan Halus
    cloud_overlay = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(cloud_overlay)
    cdraw.ellipse([CW - 400, -30, CW + 100, 280], fill=(255, 255, 255, 160))
    cdraw.ellipse([CW - 250, 40, CW + 80, 320], fill=(255, 255, 255, 190))
    cdraw.ellipse([80, -60, 480, 220], fill=(255, 255, 255, 130))
    cloud_blur = cv2.GaussianBlur(np.array(cloud_overlay), (55, 55), 0)
    cover = Image.alpha_composite(cover, Image.fromarray(cloud_blur))
    draw = ImageDraw.Draw(cover)

    # D. Logo Resmi SMKN 1 Beringin (Bersih, tajam, tanpa logo lama)
    if os.path.exists(LOGO_PATH):
        logo = Image.open(LOGO_PATH).convert("RGBA")
        l_size = 175
        logo_resized = logo.resize((l_size, l_size), Image.Resampling.LANCZOS)
        cover.paste(logo_resized, (75, 95), logo_resized)

    # E. Tipografi Header Sekolah
    font_school = ImageFont.truetype(FONT_BOLD, 54)
    font_motto = ImageFont.truetype(FONT_ITALIC, 35)
    draw.text((275, 125), SCHOOL_NAME, font=font_school, fill=(15, 23, 42, 255))
    draw.text((275, 195), SCHOOL_MOTTO, font=font_motto, fill=(30, 58, 138, 235))

    # F. Gelombang Pita Biru Mewah (Royal Blue ke Deep Navy)
    wave_mask = np.zeros((CH, CW), dtype=np.uint8)
    curve_pts = []
    for x in range(CW):
        t = x / float(CW)
        y = int(980 - 110 * np.sin(t * np.pi * 0.9) + 45 * np.cos(t * np.pi * 1.5))
        curve_pts.append((x, y))

    banner_poly = np.array(curve_pts + [(CW, CH), (0, CH)], dtype=np.int32)
    cv2.fillPoly(wave_mask, [banner_poly], 255)

    banner_img = np.zeros((CH, CW, 4), dtype=np.uint8)
    for y in range(800, CH):
        t = (y - 800) / float(CH - 800)
        r = int(29 * (1 - t) + 12 * t)
        g = int(78 * (1 - t) + 38 * t)
        b = int(216 * (1 - t) + 120 * t)
        banner_img[y, :, 0] = r
        banner_img[y, :, 1] = g
        banner_img[y, :, 2] = b
        banner_img[y, :, 3] = wave_mask[y, :]

    cover = Image.alpha_composite(cover, Image.fromarray(banner_img))
    draw = ImageDraw.Draw(cover)

    # Highlight Kilau Glossy pada Garis Lengkung Pita
    hl_mask = np.zeros((CH, CW), dtype=np.float32)
    cv2.polylines(hl_mask, [np.array(curve_pts, dtype=np.int32)], False, 1.0, 7)
    hl_mask = cv2.GaussianBlur(hl_mask, (7, 7), 0)
    cov_np = np.array(cover).astype(np.float32)
    for c in range(3):
        cov_np[:, :, c] = np.clip(cov_np[:, :, c] + hl_mask * 130, 0, 255)
    cover = Image.fromarray(cov_np.astype(np.uint8))
    draw = ImageDraw.Draw(cover)

    # G. Tipografi Utama: Baca. Jelajahi. Berkembang.
    font_title = ImageFont.truetype(FONT_BOLD, 110)
    font_sub = ImageFont.truetype(FONT_SUB, 42)

    title_x = 90
    title_y = 1080

    # 1. 'Baca. '
    bbox1 = font_title.getbbox(TITLE_LINE1_WHITE)
    w1 = bbox1[2] - bbox1[0]
    draw.text((title_x, title_y), TITLE_LINE1_WHITE, font=font_title, fill=(255, 255, 255, 255))

    # 2. 'Jelajahi.' Gradien Sian Elektrik
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

    # Konversi ke OpenCV BGR
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

    # Penajaman halaman terbuka pada sisi kanan
    gaussian = cv2.GaussianBlur(base_np, (0, 0), 2.0)
    base_sharp = cv2.addWeighted(base_np, 1.35, gaussian, -0.35, 0)
    bh, bw, _ = base_sharp.shape

    # Koordinat 4 sudut cover depan pada skala 2x (76, 296), (676, 152), (796, 1016), (196, 1148)
    src_pts = np.float32([[0, 0], [CW, 0], [CW, CH], [0, CH]])
    dst_pts_2x = np.float32([[76, 296], [676, 152], [796, 1016], [196, 1148]])

    M = cv2.getPerspectiveTransform(src_pts, dst_pts_2x)
    warped_cover = cv2.warpPerspective(cover_2d_np, M, (bw, bh), flags=cv2.INTER_LANCZOS4)

    # Masking poligon cover
    poly = np.array(dst_pts_2x, dtype=np.int32)
    cover_mask = np.zeros((bh, bw), dtype=np.float32)
    cv2.fillPoly(cover_mask, [poly], 1.0)
    cover_mask = cv2.GaussianBlur(cover_mask, (3, 3), 0.5)
    cover_mask_3 = np.repeat(cover_mask[:, :, np.newaxis], 3, axis=2)

    # Composite cover baru menggantikan cover lama 100% bersih tanpa sisa
    composite = (base_sharp.astype(np.float32) * (1.0 - cover_mask_3) + warped_cover.astype(np.float32) * cover_mask_3).astype(np.uint8)

    # Bayangan lipatan punggung buku (spine crease shadow)
    spine_crease = np.zeros((bh, bw), dtype=np.float32)
    cv2.polylines(spine_crease, [np.array([[676, 152], [796, 1016]], dtype=np.int32)], False, 1.0, 7)
    spine_crease = cv2.GaussianBlur(spine_crease, (13, 13), 0)
    for c in range(3):
        composite[:, :, c] = np.clip(composite[:, :, c].astype(np.float32) * (1.0 - spine_crease * 0.35), 0, 255).astype(np.uint8)

    # ==============================================================================
    # ✂️ 3/4 ISOLASI BUKU TERBUKA & MASK TRANSPARAN ULTRA BERSIH
    # ==============================================================================
    print("✂️ 3/4 Memisahkan latar belakang & defringing antialias...")
    bg_color = np.array([253, 249, 244], dtype=np.float32)
    diff = np.linalg.norm(composite.astype(np.float32) - bg_color, axis=2)

    # Batasi hanya area buku (x < 1400)
    seg_mask = np.zeros((bh, bw), dtype=np.uint8)
    seg_mask[:, :1400] = (diff[:, :1400] > 14).astype(np.uint8) * 255

    # Filter komponen terbesar (hanya buku terbuka utuh)
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(seg_mask)
    areas = stats[1:, cv2.CC_STAT_AREA]
    largest_idx = 1 + np.argmax(areas)
    clean_mask = (labels == largest_idx).astype(np.uint8) * 255

    # Isi seluruh celah/lubang di dalam area buku
    contours, hierarchy = cv2.findContours(clean_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    filled_mask = np.zeros_like(clean_mask)
    cv2.drawContours(filled_mask, contours, -1, 255, -1)

    # Erosi 1px & Gaussian blur untuk tepian antialiased tanpa artefak putih
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    eroded_mask = cv2.erode(filled_mask, kernel, iterations=1)
    smooth_alpha = cv2.GaussianBlur(eroded_mask.astype(np.float32), (3, 3), 0.7)

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
    print(f"✅ 4/4 Selesai! Aset buku 3D tersimpan di: {OUTPUT_PATH}")
    print(f"   Dimensi Retina: {trimmed_pil.width} x {trimmed_pil.height} px")


if __name__ == "__main__":
    main()
