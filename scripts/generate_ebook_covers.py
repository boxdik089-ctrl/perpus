import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "/www/wwwroot/perpus-main/public/uploads/covers"
os.makedirs(OUTPUT_DIR, exist_ok=True)

FONTS = {
    "black": "/usr/share/fonts/truetype/lato/Lato-Black.ttf" if os.path.exists("/usr/share/fonts/truetype/lato/Lato-Black.ttf") else "/usr/share/fonts/truetype/lato/Lato-Bold.ttf",
    "bold": "/usr/share/fonts/truetype/lato/Lato-Bold.ttf",
    "medium": "/usr/share/fonts/truetype/lato/Lato-Medium.ttf" if os.path.exists("/usr/share/fonts/truetype/lato/Lato-Medium.ttf") else "/usr/share/fonts/truetype/lato/Lato-Regular.ttf",
    "regular": "/usr/share/fonts/truetype/lato/Lato-Regular.ttf",
    "italic": "/usr/share/fonts/truetype/lato/Lato-Italic.ttf"
}

BOOKS = [
    {
        "filename": "cover-ebook-01.jpg",
        "title": "PEMROGRAMAN\nKOMPETITIF DASAR",
        "subtitle": "Panduan Algoritma, Logika & Persiapan OSN Informatika",
        "author": "William Gozali & Alham Fikri Aji (TOKI)",
        "badge": "E-BOOK RESMI • OLIMPIADE KOMPUTER",
        "category": "Sains Komputer",
        "ddc": "DDC 005.13",
        "isbn": "ISBN 978-602-536-101-1",
        "grad_top": (10, 25, 47),
        "grad_mid": (23, 42, 69),
        "grad_bot": (11, 19, 32),
        "accent": (56, 189, 248),
        "accent_glow": (14, 165, 233),
        "motif": "binary"
    },
    {
        "filename": "cover-ebook-02.jpg",
        "title": "BELAJAR JENIUS\nBAHASA GO (GOLANG)",
        "subtitle": "Pemrograman Modern, Microservices & Cloud Computing",
        "author": "Gun Gun Febrianza",
        "badge": "E-BOOK RESMI • TEKNOLOGI PPLG",
        "category": "Rekayasa Perangkat Lunak",
        "ddc": "DDC 005.276",
        "isbn": "ISBN 978-623-289-540-8",
        "grad_top": (4, 47, 46),
        "grad_mid": (15, 76, 75),
        "grad_bot": (6, 28, 28),
        "accent": (45, 212, 191),
        "accent_glow": (20, 184, 166),
        "motif": "grid"
    },
    {
        "filename": "cover-ebook-03.jpg",
        "title": "PEMROGRAMAN\nJAVA DESKTOP",
        "subtitle": "GUI Swing, Database MySQL & Arsitektur MVC",
        "author": "Ifnu Bima",
        "badge": "E-BOOK RESMI • KOLEKSI VOKASI",
        "category": "Teknologi (PPLG)",
        "ddc": "DDC 005.133",
        "isbn": "ISBN 978-979-291-882-3",
        "grad_top": (69, 10, 10),
        "grad_mid": (120, 25, 25),
        "grad_bot": (28, 6, 6),
        "accent": (251, 146, 60),
        "accent_glow": (249, 115, 22),
        "motif": "diamonds"
    },
    {
        "filename": "cover-ebook-04.jpg",
        "title": "ADMINISTRASI SERVER\n& JARINGAN KOMPUTER",
        "subtitle": "Manajemen Linux Server, Routing & Cyber Security",
        "author": "Eka Maulidia & Tim Kemendikdasmen",
        "badge": "E-BOOK RESMI • JARINGAN TJKT",
        "category": "Jaringan (TJKT)",
        "ddc": "DDC 004.6",
        "isbn": "ISBN 978-602-244-931-7",
        "grad_top": (6, 78, 59),
        "grad_mid": (16, 120, 90),
        "grad_bot": (4, 38, 29),
        "accent": (52, 211, 153),
        "accent_glow": (16, 185, 129),
        "motif": "nodes"
    },
    {
        "filename": "cover-ebook-05.jpg",
        "title": "BOGA DASAR:\nMASAKAN NUSANTARA",
        "subtitle": "Teknik Pengolahan, Sanitasi Dapur & Kuliner Tradisional",
        "author": "Dra. Wiwi Rusmini, Dra. Laksmi Dharmayanti",
        "badge": "E-BOOK RESMI • KULINER VOKASI",
        "category": "Tata Boga & Kuliner",
        "ddc": "DDC 641.595",
        "isbn": "ISBN 978-602-244-672-9",
        "grad_top": (120, 53, 15),
        "grad_mid": (180, 83, 9),
        "grad_bot": (45, 20, 6),
        "accent": (251, 191, 36),
        "accent_glow": (245, 158, 11),
        "motif": "circles"
    }
]

W, H = 600, 900

def lerp(c1, c2, t):
    return int(c1 + (c2 - c1) * t)

def lerp_color(color1, color2, t):
    return tuple(lerp(c1, c2, t) for c1, c2 in zip(color1, color2))

def create_cover(book):
    img = Image.new("RGB", (W, H), (0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Base Gradient
    top_c = book["grad_top"]
    mid_c = book["grad_mid"]
    bot_c = book["grad_bot"]

    for y in range(H):
        t = y / H
        if t < 0.5:
            color = lerp_color(top_c, mid_c, t / 0.5)
        else:
            color = lerp_color(mid_c, bot_c, (t - 0.5) / 0.5)
        draw.line([(0, y), (W, y)], fill=color)

    # 2. Geometric Motif / Tech Aesthetic Layer
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)

    motif = book["motif"]
    accent = book["accent"]

    if motif == "binary":
        for i in range(15):
            y = 120 + i * 22
            x = 80 + (i % 3) * 30
            ov_draw.line([(x, y), (x + 200, y)], fill=(*accent, 22), width=1)
            ov_draw.text((x + 210, y - 6), f"0x{i*17:02X} BIN_OK", fill=(*accent, 35))
    elif motif == "grid":
        for x in range(60, W - 60, 40):
            ov_draw.line([(x, 100), (x, 480)], fill=(*accent, 18), width=1)
        for y in range(100, 480, 40):
            ov_draw.line([(60, y), (W - 60, y)], fill=(*accent, 18), width=1)
    elif motif == "diamonds":
        for cy in range(120, 460, 60):
            for cx in range(80, W - 80, 80):
                ov_draw.polygon([
                    (cx, cy - 20), (cx + 20, cy), (cx, cy + 20), (cx - 20, cy)
                ], outline=(*accent, 25), fill=(*accent, 8))
    elif motif == "nodes":
        pts = [(100, 150), (220, 190), (160, 280), (320, 240), (450, 170), (400, 310), (280, 380), (460, 400)]
        for i in range(len(pts)-1):
            ov_draw.line([pts[i], pts[i+1]], fill=(*accent, 35), width=2)
        for px, py in pts:
            ov_draw.ellipse([px-6, py-6, px+6, py+6], fill=(*accent, 80), outline=(255, 255, 255, 120), width=1)
    elif motif == "circles":
        for r in range(40, 260, 35):
            ov_draw.ellipse([W//2 - r, 280 - r, W//2 + r, 280 + r], outline=(*accent, 30), width=1)

    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))
    draw = ImageDraw.Draw(img)

    # 3. Outer Premium Framing & Borders
    draw.rectangle([24, 24, W - 25, H - 25], outline=(*accent, 140), width=1)
    draw.rectangle([28, 28, W - 29, H - 29], outline=(255, 255, 255, 40), width=1)

    # Corner brackets
    corner_len = 24
    # Top-Left
    draw.line([(24, 24), (24 + corner_len, 24)], fill=accent, width=3)
    draw.line([(24, 24), (24, 24 + corner_len)], fill=accent, width=3)
    # Top-Right
    draw.line([(W - 25 - corner_len, 24), (W - 25, 24)], fill=accent, width=3)
    draw.line([(W - 25, 24), (W - 25, 24 + corner_len)], fill=accent, width=3)
    # Bottom-Left
    draw.line([(24, H - 25), (24 + corner_len, H - 25)], fill=accent, width=3)
    draw.line([(24, H - 25), (24, H - 25 - corner_len)], fill=accent, width=3)
    # Bottom-Right
    draw.line([(W - 25 - corner_len, H - 25), (W - 25, H - 25)], fill=accent, width=3)
    draw.line([(W - 25, H - 25), (W - 25, H - 25 - corner_len)], fill=accent, width=3)

    # 4. Top Header & Badge
    font_school = ImageFont.truetype(FONTS["bold"], 13)
    school_text = "PERPUSTAKAAN DIGITAL • SMK NEGERI 1 BERINGIN"
    school_bbox = draw.textbbox((0, 0), school_text, font=font_school)
    school_w = school_bbox[2] - school_bbox[0]
    draw.text(((W - school_w) // 2, 45), school_text, fill=(200, 225, 255), font=font_school)

    # Glowing E-Book Badge Pill
    font_badge = ImageFont.truetype(FONTS["black"], 12)
    badge_text = book["badge"]
    b_bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
    bw = b_bbox[2] - b_bbox[0]
    bx = (W - bw - 32) // 2
    by = 75
    # Pill background
    draw.rounded_rectangle([bx, by, bx + bw + 32, by + 28], radius=14, fill=(*book["accent_glow"], 40), outline=accent, width=1)
    draw.text((bx + 16, by + 6), badge_text, fill=accent, font=font_badge)

    # 5. Book Title Plate
    font_title = ImageFont.truetype(FONTS["black"], 32)
    title_lines = book["title"].split("\n")
    cur_y = 210
    for line in title_lines:
        t_bbox = draw.textbbox((0, 0), line, font=font_title)
        lw = t_bbox[2] - t_bbox[0]
        # Text shadow
        draw.text(((W - lw) // 2 + 2, cur_y + 2), line, fill=(0, 0, 0, 200), font=font_title)
        draw.text(((W - lw) // 2, cur_y), line, fill=(255, 255, 255), font=font_title)
        cur_y += 42

    # Accent divider under title
    cur_y += 15
    draw.line([(W // 2 - 60, cur_y), (W // 2 + 60, cur_y)], fill=accent, width=3)
    draw.ellipse([W // 2 - 4, cur_y - 3, W // 2 + 4, cur_y + 3], fill=(255, 255, 255))

    # Subtitle
    font_sub = ImageFont.truetype(FONTS["regular"], 15)
    sub_lines = []
    # simple wrap
    words = book["subtitle"].split(" ")
    cur_sub = ""
    for w in words:
        test = f"{cur_sub} {w}".strip()
        sb = draw.textbbox((0, 0), test, font=font_sub)
        if (sb[2] - sb[0]) > (W - 140):
            sub_lines.append(cur_sub)
            cur_sub = w
        else:
            cur_sub = test
    if cur_sub:
        sub_lines.append(cur_sub)

    cur_y += 28
    for s_line in sub_lines:
        sb = draw.textbbox((0, 0), s_line, font=font_sub)
        sw = sb[2] - sb[0]
        draw.text(((W - sw) // 2, cur_y), s_line, fill=(210, 225, 240), font=font_sub)
        cur_y += 22

    # 6. Author Card / Badge
    cur_y = max(cur_y + 35, 460)
    font_author_label = ImageFont.truetype(FONTS["regular"], 11)
    author_lbl = "PENULIS / KONTRIBUTOR RESMI"
    al_bb = draw.textbbox((0, 0), author_lbl, font=font_author_label)
    draw.text(((W - (al_bb[2] - al_bb[0])) // 2, cur_y), author_lbl, fill=(160, 180, 200), font=font_author_label)

    cur_y += 18
    font_author = ImageFont.truetype(FONTS["bold"], 18)
    auth_bb = draw.textbbox((0, 0), book["author"], font=font_author)
    draw.text(((W - (auth_bb[2] - auth_bb[0])) // 2, cur_y), book["author"], fill=(255, 255, 255), font=font_author)

    # 7. Category & Feature Pills
    cur_y += 48
    font_pill = ImageFont.truetype(FONTS["medium"], 12)
    pills = [book["category"], "Edisi Digital PDF", "Akses Siswa"]
    pill_widths = []
    for p in pills:
        pb = draw.textbbox((0, 0), p, font=font_pill)
        pill_widths.append(pb[2] - pb[0] + 24)
    total_pw = sum(pill_widths) + (len(pills) - 1) * 10
    start_px = (W - total_pw) // 2

    for p, pw in zip(pills, pill_widths):
        draw.rounded_rectangle([start_px, cur_y, start_px + pw, cur_y + 26], radius=13, fill=(15, 23, 42, 180), outline=(255, 255, 255, 40), width=1)
        pb = draw.textbbox((0, 0), p, font=font_pill)
        text_w = pb[2] - pb[0]
        draw.text((start_px + (pw - text_w) // 2, cur_y + 5), p, fill=(226, 232, 240), font=font_pill)
        start_px += pw + 10

    # 8. Bottom Information Strip (DDC, ISBN, Barcode imitation)
    bot_y = H - 120
    draw.line([(40, bot_y), (W - 40, bot_y)], fill=(255, 255, 255, 30), width=1)

    # DDC Pill on left
    draw.rounded_rectangle([45, bot_y + 15, 160, bot_y + 50], radius=8, fill=(10, 15, 25), outline=accent, width=1)
    font_ddc_lbl = ImageFont.truetype(FONTS["regular"], 9)
    draw.text((55, bot_y + 19), "KLASIFIKASI", fill=(148, 163, 184), font=font_ddc_lbl)
    font_ddc = ImageFont.truetype(FONTS["black"], 14)
    draw.text((55, bot_y + 31), book["ddc"], fill=(255, 255, 255), font=font_ddc)

    # ISBN & Barcode on right
    font_isbn = ImageFont.truetype(FONTS["bold"], 11)
    draw.text((W - 225, bot_y + 18), book["isbn"], fill=(203, 213, 225), font=font_isbn)

    # Simulated barcode lines
    bx = W - 225
    by = bot_y + 34
    bar_pattern = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 4]
    cur_bx = bx
    for bw in bar_pattern:
        draw.rectangle([cur_bx, by, cur_bx + bw, by + 18], fill=(220, 230, 245))
        cur_bx += bw + 2
        if cur_bx > W - 50:
            break

    # Bottom Copyright
    font_copy = ImageFont.truetype(FONTS["regular"], 10)
    copy_text = "E-BOOK KOLEKSI PERPUSTAKAAN SMK NEGERI 1 BERINGIN • BEBAS BACA"
    cb = draw.textbbox((0, 0), copy_text, font=font_copy)
    draw.text(((W - (cb[2] - cb[0])) // 2, H - 42), copy_text, fill=(140, 160, 180), font=font_copy)

    # 9. Realistic Book Spine Lighting Effect (Left Edge)
    spine = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(spine)
    for x in range(40):
        alpha = int(90 * math.cos((x / 40) * (math.pi / 2)))
        s_draw.line([(x, 0), (x, H)], fill=(0, 0, 0, alpha))
    # highlight line at edge
    s_draw.line([(2, 0), (2, H)], fill=(255, 255, 255, 45), width=1)

    img = Image.alpha_composite(img.convert("RGBA"), spine).convert("RGB")

    # Save image
    out_path = os.path.join(OUTPUT_DIR, book["filename"])
    img.save(out_path, "JPEG", quality=95, optimize=True)
    print(f"Generated: {out_path} ({os.path.getsize(out_path)} bytes)")

for b in BOOKS:
    create_cover(b)
print("All 5 ebook covers generated successfully!")
