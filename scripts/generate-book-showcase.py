#!/usr/bin/env python3
"""
Generator Aset Buku 3D Hero Showcase SMKN 1 Beringin
Semua teks, logo, foto gedung, dan judul dapat diedit langsung pada variabel di bawah ini.
Setelah mengubah teks/gambar, jalankan: npm run generate:book
"""

import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# ==============================================================================
# 📝 PENGATURAN TEKS & ASET COVER (BISA DIEDIT SESUAI KEBUTUHAN)
# ==============================================================================
SCHOOL_NAME = "SMKN 1 BERINGIN"
SCHOOL_MOTTO = '"Berilmu, Berkarakter, Berdaya Saing"'

# Judul Utama pada Pita Biru Cover
TITLE_LINE1_WHITE = "Baca. "
TITLE_LINE2_GRADIENT = "Jelajahi."
TITLE_LINE3_WHITE = "Berkembang."
SUBTITLE_COVER = "Perpustakaan Digital SMKN 1 Beringin"

# Path Aset
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO_PATH = os.path.join(BASE_DIR, "public/assets/logo.png")
BUILDING_PATH = os.path.join(BASE_DIR, "public/assets/gedung-smk.jpg")
TEMPLATE_MOCKUP = "/root/.gemini/antigravity/brain/3d172128-0e07-43c5-a3fd-d7ab624384dd/.user_uploaded/media_1793274214243_922c6a49.jpg"
OUTPUT_PATH = os.path.join(BASE_DIR, "public/assets/showcase/buku-smkn1-beringin.png")

# ==============================================================================
# 🎨 1. GENERATE DESAIN 2D COVER DARI AWAL (RESOLUSI TINGGI 1200 x 1700)
# ==============================================================================
print("1. Merancang 2D Cover dari nol...")
CW, CH = 1200, 1700
cover = Image.new('RGBA', (CW, CH), (255, 255, 255, 255))
draw = ImageDraw.Draw(cover)

# Langit Biru Cerah
for y in range(650):
    t = y / 650.0
    r = int(120 * (1-t) + 225 * t)
    g = int(210 * (1-t) + 242 * t)
    b = int(255 * (1-t) + 255 * t)
    draw.line([(0, y), (CW, y)], fill=(r, g, b, 255))

# Foto Gedung Sekolah SMKN 1 Beringin
if os.path.exists(BUILDING_PATH):
    school = Image.open(BUILDING_PATH).convert('RGBA')
    sw, sh = school.size
    crop_bldg = school.crop((160, 60, sw - 160, sh - 60))
    bldg_w = CW
    bldg_h = int(round(crop_bldg.height * (bldg_w / crop_bldg.width)))
    bldg_resized = crop_bldg.resize((bldg_w, bldg_h), Image.Resampling.LANCZOS)
    cover.paste(bldg_resized, (0, 350))

# Efek Awan Halus
cloud_overlay = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
cloud_draw = ImageDraw.Draw(cloud_overlay)
cloud_draw.ellipse([CW - 450, -50, CW + 100, 300], fill=(255, 255, 255, 140))
cloud_draw.ellipse([CW - 350, 50, CW + 50, 350], fill=(255, 255, 255, 180))
cloud_draw.ellipse([100, -80, 500, 250], fill=(255, 255, 255, 110))
cloud_blur = cv2.GaussianBlur(np.array(cloud_overlay), (51, 51), 0)
cover = Image.alpha_composite(cover, Image.fromarray(cloud_blur))
draw = ImageDraw.Draw(cover)

# Logo Resmi SMKN 1 Beringin
if os.path.exists(LOGO_PATH):
    logo = Image.open(LOGO_PATH).convert('RGBA')
    logo_size = 180
    logo_resized = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    cover.paste(logo_resized, (80, 100), logo_resized)

# Tipografi Header Sekolah
font_school = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 56)
font_motto = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf', 36)
draw.text((290, 130), SCHOOL_NAME, font=font_school, fill=(15, 23, 42, 255))
draw.text((290, 205), SCHOOL_MOTTO, font=font_motto, fill=(30, 58, 138, 230))

# Gelombang Pita Biru Mewah (Royal Blue to Deep Navy)
wave_mask = np.zeros((CH, CW), dtype=np.uint8)
curve_pts = []
for x in range(CW):
    t = x / float(CW)
    y = int(1020 - 100 * np.sin(t * np.pi * 0.9) + 40 * np.cos(t * np.pi * 1.5))
    curve_pts.append((x, y))

banner_poly = np.array(curve_pts + [(CW, CH), (0, CH)], dtype=np.int32)
cv2.fillPoly(wave_mask, [banner_poly], 255)

banner_img = np.zeros((CH, CW, 4), dtype=np.uint8)
for y in range(850, CH):
    t = (y - 850) / float(CH - 850)
    r = int(29 * (1-t) + 9 * t)
    g = int(78 * (1-t) + 30 * t)
    b = int(216 * (1-t) + 80 * t)
    banner_img[y, :, 0] = r
    banner_img[y, :, 1] = g
    banner_img[y, :, 2] = b
    banner_img[y, :, 3] = wave_mask[y, :]

cover = Image.alpha_composite(cover, Image.fromarray(banner_img))
draw = ImageDraw.Draw(cover)

# Kilau Highlight Glossy di Tepian Atas Pita
highlight_mask = np.zeros((CH, CW), dtype=np.float32)
cv2.polylines(highlight_mask, [np.array(curve_pts, dtype=np.int32)], False, 1.0, 6)
highlight_mask = cv2.GaussianBlur(highlight_mask, (7, 7), 0)
cover_np = np.array(cover).astype(np.float32)
for c in range(3):
    cover_np[:, :, c] = np.clip(cover_np[:, :, c] + highlight_mask * 120, 0, 255)
cover = Image.fromarray(cover_np.astype(np.uint8))
draw = ImageDraw.Draw(cover)

# Judul Utama pada Pita: Baca. Jelajahi. Berkembang.
font_title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 115)
font_sub = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf', 44)

title_x = 90
title_y = 1120

# 1. 'Baca. '
bbox_baca = font_title.getbbox(TITLE_LINE1_WHITE)
w_baca = bbox_baca[2] - bbox_baca[0]
draw.text((title_x, title_y), TITLE_LINE1_WHITE, font=font_title, fill=(255, 255, 255, 255))

# 2. 'Jelajahi.' Gradien Sian-ke-Biru Elektrik
bbox_jela = font_title.getbbox(TITLE_LINE2_GRADIENT)
w_jela = bbox_jela[2] - bbox_jela[0]
h_jela = bbox_jela[3] - bbox_jela[1]
jela_img = Image.new('RGBA', (w_jela + 30, h_jela + 40), (0, 0, 0, 0))
jela_draw = ImageDraw.Draw(jela_img)
jela_draw.text((0, 0), TITLE_LINE2_GRADIENT, font=font_title, fill=(255, 255, 255, 255))
jela_np = np.array(jela_img)
for x in range(jela_np.shape[1]):
    t = x / max(1, jela_np.shape[1] - 1)
    r = int(56 * (1-t) + 165 * t)
    g = int(189 * (1-t) + 180 * t)
    b = 255
    mask = jela_np[:, x, 3] > 0
    jela_np[mask, x, 0] = r
    jela_np[mask, x, 1] = g
    jela_np[mask, x, 2] = b
jela_gradient = Image.fromarray(jela_np)
cover.paste(jela_gradient, (title_x + w_baca, title_y), jela_gradient)
draw = ImageDraw.Draw(cover)

# 3. 'Berkembang.'
draw.text((title_x, title_y + 140), TITLE_LINE3_WHITE, font=font_title, fill=(255, 255, 255, 255))

# 4. Subtitle
draw.text((title_x + 4, title_y + 285), SUBTITLE_COVER, font=font_sub, fill=(186, 230, 253, 230))
draw.rectangle([(0, 0), (CW - 1, CH - 1)], outline=(30, 58, 138, 180), width=8)

# Simpan cover 2D sementara
cover_2d_np = cv2.cvtColor(np.array(cover), cv2.COLOR_RGBA2BGR)

# ==============================================================================
# 📐 2. PROYEKSIKAN COVER 2D KE PERSPEKTIF BUKU 3D
# ==============================================================================
print("2. Memetakan cover ke perspektif 3D buku terbuka...")
base = cv2.imread(TEMPLATE_MOCKUP)
bh, bw, _ = base.shape

src_pts = np.float32([[0, 0], [CW, 0], [CW, CH], [0, CH]])
dst_pts = np.float32([[23, 172], [322, 108], [382, 524], [86, 592]])

M = cv2.getPerspectiveTransform(src_pts, dst_pts)
warped_cover = cv2.warpPerspective(cover_2d_np, M, (bw, bh), flags=cv2.INTER_LANCZOS4)

cover_poly = np.array([[23, 172], [322, 108], [382, 524], [86, 592]], dtype=np.int32)
mask_cover = np.zeros((bh, bw), dtype=np.float32)
cv2.fillPoly(mask_cover, [cover_poly], 1.0)
mask_cover = cv2.GaussianBlur(mask_cover, (3, 3), 0)
mask_cover_3 = np.repeat(mask_cover[:, :, np.newaxis], 3, axis=2)

result = (base.astype(np.float32) * (1.0 - mask_cover_3) + warped_cover.astype(np.float32) * mask_cover_3).astype(np.uint8)

# Crease shadow
spine_crease = np.zeros((bh, bw), dtype=np.float32)
cv2.polylines(spine_crease, [np.array([[322, 108], [382, 524]], dtype=np.int32)], False, 1.0, 5)
spine_crease = cv2.GaussianBlur(spine_crease, (7, 7), 0)
for c in range(3):
    result[:, :, c] = np.clip(result[:, :, c].astype(np.float32) * (1.0 - spine_crease * 0.25), 0, 255).astype(np.uint8)

# ==============================================================================
# ✂️ 3. POTONG BUKU MENJADI PNG TRANSPARAN RETINA ULTRA SHARP
# ==============================================================================
print("3. Memotong aset buku transparan Retina...")
x1, y1, x2, y2 = 15, 70, 720, 625
crop = result[y1:y2, x1:x2].copy()
hc, wc, _ = crop.shape

book_poly = np.array([
    [7, 100], [100, 75], [200, 56], [307, 36], [340, 42], [410, 24],
    [475, 8], [540, 32], [600, 70], [645, 122], [665, 175], [680, 260],
    [692, 380], [695, 465], [685, 490], [640, 498], [580, 505], [520, 518],
    [450, 495], [380, 475], [300, 495], [200, 512], [120, 525], [70, 532],
    [45, 460], [25, 350], [12, 240], [7, 150]
], dtype=np.int32)

solid_mask = np.zeros((hc, wc), dtype=np.uint8)
cv2.fillPoly(solid_mask, [book_poly], 255)

gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
is_fg = (gray < 246).astype(np.uint8) * 255
combined = np.maximum(solid_mask, is_fg)

num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(combined)
largest_label = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
refined_mask = np.zeros_like(combined)
refined_mask[labels == largest_label] = 255

kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
refined_mask = cv2.morphologyEx(refined_mask, cv2.MORPH_CLOSE, kernel)
clean_alpha = cv2.GaussianBlur(refined_mask.astype(np.float32), (3, 3), 0.7).astype(np.uint8)

b, g, r = cv2.split(crop)
rgba = cv2.merge([b, g, r, clean_alpha])

y_indices, x_indices = np.where(clean_alpha > 5)
pad = 8
ymin = max(0, y_indices.min() - pad)
ymax = min(rgba.shape[0], y_indices.max() + pad)
xmin = max(0, x_indices.min() - pad)
xmax = min(rgba.shape[1], x_indices.max() + pad)
trimmed = rgba[ymin:ymax, xmin:xmax]

trimmed_pil = Image.fromarray(cv2.cvtColor(trimmed, cv2.COLOR_BGRA2RGBA))
w_target = 1664
h_target = int(round(trimmed_pil.height * (w_target / trimmed_pil.width)))
retina_book = trimmed_pil.resize((w_target, h_target), Image.Resampling.LANCZOS)

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
retina_book.save(OUTPUT_PATH, optimize=True)
print(f"✅ Selesai! Aset buku 3D tersimpan di: {OUTPUT_PATH} ({w_target}x{h_target}px)")

