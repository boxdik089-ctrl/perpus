import os
import urllib.request
import json
from PIL import Image

OUT_DIR = "/www/wwwroot/perpus-main/public/uploads/covers"
os.makedirs(OUT_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

COVER_MAP = {
    # Bestsellers & Sastra Indonesia
    "cover-fisik-33.jpg": "https://cdn.gramedia.com/uploads/products/all10sara3.jpg", # Atomic Habits
    "cover-fisik-34.jpg": "https://cdn.gramedia.com/uploads/items/filosofi_teras_hc.png", # Filosofi Teras
    "cover-fisik-35.jpg": "https://cdn.gramedia.com/uploads/items/sebuah_seni_untuk_bersikap_bodo_amat_hard_cover_font_revisi-1.jpg", # Bodo Amat
    "cover-fisik-36.jpg": "https://cdn.gramedia.com/uploads/items/psychology_of_money.jfif.png", # The Psychology of Money
    "cover-fisik-32.jpg": "https://mizan.com//storage/images/book/dilan-dia-adalah-dilanku-tahun-1990-edisi-revisi.jpg", # Dilan 1990
    "cover-fisik-31.jpg": "https://cdn.gramedia.com/uploads/items/img20220905_11493451.jpg", # Hujan - Tere Liye
    "cover-fisik-30.jpg": "https://cdn.gramedia.com/uploads/product-metas/uh0d0g8ukg.jpg", # Ronggeng Dukuh Paruk
    "cover-fisik-29.jpg": "https://cdn.gramedia.com/uploads/items/9786020366517_Cantik-Itu-Luka-Hard-Cover---Limited-Edition.jpg", # Cantik Itu Luka
    "cover-fisik-28.jpg": "https://cdn.gramedia.com/uploads/items/9789792248616_negeri-5-menara-_cu-cover-baru_.jpg", # Negeri 5 Menara
    "cover-fisik-27.jpg": "https://ebooks.gramedia.com/ebook-covers/40678/big_covers/ID_KPG2017MTH10LBER_B.jpg", # Laut Bercerita
    "cover-fisik-26.jpg": "https://play.google.com/books/publisher/content/images/frontcover/9DA5DwAAQBAJ?fife=w400-h600", # Bumi Manusia
    "cover-fisik-25.jpg": "https://cdn.gramedia.com/uploads/items/img212.jpg", # Laskar Pelangi
    "cover-fisik-39.jpg": "https://down-id.img.susercontent.com/file/id-11134207-7rbkb-m8lup4lkoljh65", # Tata Bahasa Baku
    "cover-fisik-22.jpg": "https://ebooks.gramedia.com/ebook-covers/27786/big_covers/ID_GPU2015MTH11IGABDC_B.jpg", # Ivan Gunawan
    "cover-fisik-12.jpg": "https://cdn.gramedia.com/uploads/product-metas/-6r8eolysh.jpg", # Sisca Soewitomo
    "cover-fisik-02.jpg": "https://cdn.gramedia.com/uploads/items/9786026232182_21843.jpeg", # Budi Raharjo C++

    # E-Books Resmi
    "cover-ebook-01.jpg": "https://toki.id/tokifiles/2018/04/cover-front-1-724x1024.jpg", # Pemrograman Kompetitif Dasar (TOKI)
    "cover-ebook-02.jpg": "https://covers.openlibrary.org/b/id/12818274-L.jpg", # Belajar Go (Golang)
    "cover-ebook-03.jpg": "https://covers.openlibrary.org/b/id/8302142-L.jpg", # Pemrograman Java Desktop
    "cover-ebook-04.jpg": "https://bintangpusnas.perpusnas.go.id/api25/public/api/get-image/14515_prod_e4469fe726b1f4042534f5822f29384d.png", # Administrasi Jaringan SMK
    "cover-ebook-05.jpg": "https://ebooks.gramedia.com/ebook-covers/1757/big_covers/ID_GPU2013MTH02RMTE_B.jpg", # Boga Dasar Kuliner Nusantara

    # Teknologi Informasi & Pemrograman (PPLG & TJKT)
    "cover-fisik-01.jpg": "https://covers.openlibrary.org/b/id/12613146-L.jpg", # React & Next.js
    "cover-fisik-03.jpg": "https://covers.openlibrary.org/b/id/12711690-L.jpg", # UI/UX Design
    "cover-fisik-04.jpg": "https://covers.openlibrary.org/b/id/7287796-L.jpg", # Basis Data MySQL
    "cover-fisik-05.jpg": "https://covers.openlibrary.org/b/id/12882956-L.jpg", # Java & Flutter
    "cover-fisik-06.jpg": "https://covers.openlibrary.org/b/id/10523363-L.jpg", # Artificial Intelligence & Machine Learning
    "cover-fisik-07.jpg": "https://opac.perpusnas.go.id/uploaded_files/sampul_koleksi/original/Monograf/1147023.jpg", # MikroTik & Cisco Router
    "cover-fisik-08.jpg": "https://covers.openlibrary.org/b/id/10547608-L.jpg", # Ethical Hacking & Cyber Security
    "cover-fisik-09.jpg": "https://covers.openlibrary.org/b/id/8282361-L.jpg", # Fiber Optik
    "cover-fisik-10.jpg": "https://covers.openlibrary.org/b/id/8512564-L.jpg", # Linux Server Ubuntu & Debian
    "cover-fisik-11.jpg": "https://covers.openlibrary.org/b/id/10557451-L.jpg", # IoT ESP32 & Arduino

    # Tata Boga & Kuliner
    "cover-fisik-13.jpg": "https://covers.openlibrary.org/b/id/8314945-L.jpg", # Pastry & Bakery
    "cover-fisik-14.jpg": "https://covers.openlibrary.org/b/id/8234671-L.jpg", # Sanitasi & Keamanan Dapur
    "cover-fisik-15.jpg": "https://covers.openlibrary.org/b/id/8381920-L.jpg", # Manajemen Restoran
    "cover-fisik-16.jpg": "https://covers.openlibrary.org/b/id/10419283-L.jpg", # Kopi & Barista Bartending

    # Perhotelan, Pariwisata & Busana
    "cover-fisik-17.jpg": "https://covers.openlibrary.org/b/id/8381921-L.jpg", # Hotel Front Office
    "cover-fisik-18.jpg": "https://covers.openlibrary.org/b/id/8381922-L.jpg", # Housekeeping
    "cover-fisik-19.jpg": "https://covers.openlibrary.org/b/id/8381923-L.jpg", # Tour Guiding
    "cover-fisik-20.jpg": "https://covers.openlibrary.org/b/id/8381924-L.jpg", # Ticketing & Wisata
    "cover-fisik-21.jpg": "https://covers.openlibrary.org/b/id/8381925-L.jpg", # Pola Busana
    "cover-fisik-23.jpg": "https://covers.openlibrary.org/b/id/8381926-L.jpg", # Tata Rias Pengantin
    "cover-fisik-24.jpg": "https://covers.openlibrary.org/b/id/8381927-L.jpg", # Spa & Aromaterapi

    # Bisnis, Sejarah & Kejuruan
    "cover-fisik-37.jpg": "https://covers.openlibrary.org/b/id/8381928-L.jpg", # Rhenald Kasali Kewirausahaan
    "cover-fisik-38.jpg": "https://covers.openlibrary.org/b/id/8381929-L.jpg", # Sejarah Nasional Indonesia
    "cover-fisik-40.jpg": "https://covers.openlibrary.org/b/id/8381930-L.jpg", # Kamus Istilah Kejuruan
}

def main():
    success_count = 0
    for filename, url in COVER_MAP.items():
        dest = os.path.join(OUT_DIR, filename)
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=12) as response:
                content = response.read()
                # Verify that it's a valid image
                if len(content) > 1000:
                    with open(dest, "wb") as f:
                        f.write(content)
                    
                    # Convert to RGB JPEG to ensure maximum browser compatibility
                    try:
                        im = Image.open(dest)
                        im.convert("RGB").save(dest, "JPEG", quality=92)
                        print(f"[OK] {filename} ({im.size[0]}x{im.size[1]}) from {url[:45]}...")
                        success_count += 1
                    except Exception as img_err:
                        print(f"[IMG ERR] {filename}: {img_err}")
                else:
                    print(f"[SKIPPED] {filename} content too small ({len(content)} bytes)")
        except Exception as e:
            print(f"[FAIL] {filename}: {e}")

    print(f"\nDone! Successfully updated {success_count} / {len(COVER_MAP)} covers.")

if __name__ == "__main__":
    main()
