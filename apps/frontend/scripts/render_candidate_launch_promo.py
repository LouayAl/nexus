from __future__ import annotations

import math
from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PROMO_DIR = ROOT / "public" / "promo"
OUT_DIR = PROMO_DIR / "generated"
OUT_DIR.mkdir(parents=True, exist_ok=True)

WIDTH, HEIGHT = 1080, 1920
FPS = 30
DURATION = 20
TOTAL_FRAMES = FPS * DURATION

NAVY = (38, 65, 109)
BLUE = (63, 128, 188)
ORANGE = (226, 132, 42)
INK = (24, 34, 55)
WHITE = (255, 255, 255)
SOFT = (245, 248, 252)
SCENE_LENGTH = 4.0


def font(size: int, bold: bool = False, serif: bool = False) -> ImageFont.FreeTypeFont:
    if serif:
        path = "C:/Windows/Fonts/georgiab.ttf" if bold else "C:/Windows/Fonts/georgia.ttf"
    else:
        path = "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"
    return ImageFont.truetype(path, size)


FONTS = {
    "hero": font(82, bold=True, serif=True),
    "hero_small": font(56, bold=True, serif=True),
    "display": font(68, bold=True, serif=True),
    "title": font(46, bold=True),
    "section": font(38, bold=True),
    "body": font(28),
    "caption": font(22, bold=True),
    "small": font(20),
    "tiny": font(18, bold=True),
}


def ease(x: float) -> float:
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


def ease_io(x: float) -> float:
    x = max(0.0, min(1.0, x))
    return 0.5 - math.cos(x * math.pi) / 2


def pop(x: float) -> float:
    x = max(0.0, min(1.0, x))
    back = 1.70158
    return 1 + (back + 1) * (x - 1) ** 3 + back * (x - 1) ** 2


def lerp(a: float, b: float, p: float) -> float:
    return a + (b - a) * p


def draw_round(draw: ImageDraw.ImageDraw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def rgba(img: Image.Image) -> Image.Image:
    return img.convert("RGBA")


def crop_cover(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    tw, th = size
    scale = max(tw / img.width, th / img.height)
    nw, nh = int(img.width * scale), int(img.height * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return resized.crop((left, top, left + tw, top + th))


def soft_shadow(size: tuple[int, int], radius: int, blur: int, alpha: int) -> Image.Image:
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((blur, blur, size[0] - blur, size[1] - blur), radius=radius, fill=(0, 0, 0, alpha))
    return img.filter(ImageFilter.GaussianBlur(blur))


def blur_regions(img: Image.Image, boxes: list[tuple[float, float, float, float]]) -> Image.Image:
    result = rgba(img)
    for box in boxes:
        x1, y1, x2, y2 = box
        if x2 <= 1 and y2 <= 1:
            x1, y1, x2, y2 = x1 * img.width, y1 * img.height, x2 * img.width, y2 * img.height
        rect = tuple(map(int, (x1, y1, x2, y2)))
        crop = result.crop(rect).filter(ImageFilter.GaussianBlur(18))
        veil = Image.new("RGBA", crop.size, (255, 255, 255, 86))
        crop.alpha_composite(veil)
        result.paste(crop, rect)
    return result


def privacy_boxes(name: str) -> list[tuple[float, float, float, float]]:
    lower = name.lower()
    boxes: list[tuple[float, float, float, float]] = []

    if lower == "profile computer.png":
        boxes += [
            (0.905, 0.012, 0.988, 0.048),
            (0.210, 0.254, 0.264, 0.338),
            (0.190, 0.352, 0.284, 0.382),
        ]
    elif "computer" in lower and ("formation" in lower or "experience" in lower or "skills" in lower):
        boxes += [
            (0.905, 0.010, 0.988, 0.040),
            (0.208, 0.174, 0.264, 0.242),
            (0.190, 0.252, 0.286, 0.276),
        ]
    if lower == "profile.png":
        boxes += [
            (0.080, 0.210, 0.260, 0.275),
            (0.280, 0.200, 0.650, 0.235),
        ]
    return boxes


def sanitize_sources() -> dict[str, Image.Image]:
    images: dict[str, Image.Image] = {}
    for path in PROMO_DIR.glob("*.png"):
        img = Image.open(path)
        clean = blur_regions(img, privacy_boxes(path.name))
        out = OUT_DIR / f"safe-{path.name}"
        clean.convert("RGB").save(out, quality=95)
        images[path.name] = clean
    images["logo"] = Image.open(ROOT / "public" / "brand" / "Logo.webp").convert("RGBA")
    return images


def paste_center(base: Image.Image, layer: Image.Image, cx: float, cy: float):
    x = int(cx - layer.width / 2)
    y = int(cy - layer.height / 2)
    base.alpha_composite(layer, (x, y))


def fit_width(img: Image.Image, width: int) -> Image.Image:
    ratio = width / img.width
    return img.resize((width, int(img.height * ratio)), Image.Resampling.LANCZOS)


def make_phone(screen: Image.Image, w: int = 335, h: int = 720) -> Image.Image:
    bezel = 18
    img = Image.new("RGBA", (w + bezel * 2, h + bezel * 2), (0, 0, 0, 0))
    shadow = soft_shadow(img.size, 54, 24, 95)
    img.alpha_composite(shadow, (0, 8))
    d = ImageDraw.Draw(img)
    draw_round(d, (0, 0, img.width, img.height), 54, (18, 24, 35), (255, 255, 255, 46), 2)
    screen_img = crop_cover(screen, (w, h))
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w, h), radius=38, fill=255)
    img.paste(screen_img, (bezel, bezel), mask)
    d.rounded_rectangle((img.width // 2 - 38, 12, img.width // 2 + 38, 24), radius=9, fill=(20, 25, 35, 230))
    return img


def make_laptop(screen: Image.Image, w: int = 810, h: int = 520) -> Image.Image:
    img = Image.new("RGBA", (w + 92, h + 124), (0, 0, 0, 0))
    shadow = soft_shadow((w + 92, h + 94), 34, 24, 80)
    img.alpha_composite(shadow, (0, 10))
    d = ImageDraw.Draw(img)
    frame = (46, 18, 46 + w, 18 + h)
    draw_round(d, frame, 32, (24, 30, 44), (255, 255, 255, 46), 2)
    screen_img = crop_cover(screen, (w - 38, h - 40))
    mask = Image.new("L", (w - 38, h - 40), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 38, h - 40), radius=20, fill=255)
    img.paste(screen_img, (65, 38), mask)
    base_y = h + 38
    d.rounded_rectangle((0, base_y, img.width, base_y + 40), radius=22, fill=(214, 220, 230))
    d.rounded_rectangle((330, base_y + 2, 570, base_y + 12), radius=6, fill=(184, 193, 207))
    return img


def make_screen_card(screen: Image.Image, w: int, h: int, radius: int = 28) -> Image.Image:
    img = Image.new("RGBA", (w + 56, h + 56), (0, 0, 0, 0))
    img.alpha_composite(soft_shadow(img.size, radius + 12, 22, 58), (0, 8))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((24, 20, 24 + w, 20 + h), radius=radius, fill=WHITE, outline=(222, 228, 238), width=2)
    screen_img = crop_cover(screen, (w, h))
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w, h), radius=radius - 6, fill=255)
    img.paste(screen_img, (24, 20), mask)
    return img


def add_vignette(frame: Image.Image, strength: int = 74):
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for i in range(18):
        alpha = int(strength * (i / 17) ** 2)
        d.rectangle((i * 14, i * 18, WIDTH - i * 14, HEIGHT - i * 18), outline=(12, 24, 42, alpha), width=28)
    frame.alpha_composite(overlay)


def draw_bg(frame: Image.Image, t: float, mode: str = "navy"):
    d = ImageDraw.Draw(frame)
    if mode == "light":
        d.rectangle((0, 0, WIDTH, HEIGHT), fill=(249, 251, 254))
        d.polygon([(0, 0), (WIDTH, 0), (WIDTH, 445), (0, 735)], fill=(36, 66, 111))
        d.polygon([(0, 360), (WIDTH, 125), (WIDTH, 540), (0, 800)], fill=(47, 87, 143, 235))
    else:
        d.rectangle((0, 0, WIDTH, HEIGHT), fill=(30, 56, 96))
        d.polygon([(0, 1330), (WIDTH, 1115), (WIDTH, HEIGHT), (0, HEIGHT)], fill=(249, 251, 254))
        d.rectangle((260, 330, 820, 1585), fill=(39, 72, 122, 120))
    for i in range(22):
        speed = 0.55 + (i % 5) * 0.11
        x = (70 + i * 83 + math.sin(t * speed + i * 0.8) * 34) % WIDTH
        y = (130 + i * 117 + math.cos(t * (speed + 0.18) + i) * 28) % HEIGHT
        r = 2 + (i % 4)
        fill = (255, 255, 255, 34) if mode == "navy" else (*([ORANGE, BLUE, NAVY][i % 3]), 34)
        d.ellipse((x - r, y - r, x + r, y + r), fill=fill)
    for i in range(5):
        y = int(650 + i * 178 + math.sin(t * 0.8 + i) * 12)
        d.line((80, y, WIDTH - 80, y - 190), fill=(255, 255, 255, 12), width=2)
    add_vignette(frame, 38 if mode == "light" else 58)


def draw_logo(frame: Image.Image, logo: Image.Image):
    bounds = logo.getchannel("A").getbbox()
    mark_source = logo.crop(bounds) if bounds else logo
    mark = fit_width(mark_source, 292)
    pad_x, pad_y = 14, 3
    badge = Image.new("RGBA", (mark.width + pad_x * 2, mark.height + pad_y * 2), (0, 0, 0, 0))
    shadow = soft_shadow(badge.size, 24, 10, 34)
    badge.alpha_composite(shadow, (0, 4))
    d = ImageDraw.Draw(badge, "RGBA")
    d.rounded_rectangle(
        (0, 0, badge.width - 1, badge.height - 1),
        radius=12,
        fill=(255, 255, 255, 170),
        outline=(255, 255, 255, 112),
        width=1,
    )
    badge.alpha_composite(mark, (pad_x, pad_y))
    frame.alpha_composite(badge, (56, 44))


def apply_scene_transition(frame: Image.Image, t: float):
    local = t % SCENE_LENGTH
    if local >= 0.46 or t < 0.08:
        return
    p = ease_io(local / 0.46)
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    lead = int(lerp(-WIDTH * 0.85, WIDTH * 1.25, p))
    d.polygon(
        [(lead - 420, -80), (lead + 260, -80), (lead - 520, HEIGHT + 80), (lead - 1200, HEIGHT + 80)],
        fill=(255, 255, 255, 180),
    )
    d.polygon(
        [(lead - 160, -80), (lead + 50, -80), (lead - 730, HEIGHT + 80), (lead - 940, HEIGHT + 80)],
        fill=(*ORANGE, 150),
    )
    d.polygon(
        [(lead + 80, -80), (lead + 260, -80), (lead - 520, HEIGHT + 80), (lead - 700, HEIGHT + 80)],
        fill=(28, 54, 94, 120),
    )
    overlay = overlay.filter(ImageFilter.GaussianBlur(0.35))
    frame.alpha_composite(overlay)


def draw_text(draw: ImageDraw.ImageDraw, xy, text, fnt, fill, anchor=None):
    draw.text(xy, text, font=fnt, fill=fill, anchor=anchor)


def pill(text: str, fill, outline=None, text_fill=None) -> Image.Image:
    pad_x, pad_y = 28, 13
    box = ImageDraw.Draw(Image.new("RGBA", (1, 1))).textbbox((0, 0), text, font=FONTS["caption"])
    w = box[2] - box[0] + pad_x * 2
    h = box[3] - box[1] + pad_y * 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, w, h), radius=h // 2, fill=fill, outline=outline, width=2 if outline else 1)
    alpha = fill[3] if len(fill) > 3 else 255
    automatic_fill = WHITE if fill[0] < 220 or alpha < 120 else NAVY
    d.text((w / 2, h / 2 + 1), text, font=FONTS["caption"], fill=text_fill or automatic_fill, anchor="mm")
    return img


def paste_motion(base: Image.Image, layer: Image.Image, cx: float, cy: float, ghost_dx: float = 0, ghost_alpha: int = 34):
    if abs(ghost_dx) > 0.1:
        ghost = layer.copy()
        ghost.putalpha(ghost.getchannel("A").point(lambda a: int(a * ghost_alpha / 255)))
        paste_center(base, ghost, cx - ghost_dx, cy)
    paste_center(base, layer, cx, cy)


def draw_kicker(d: ImageDraw.ImageDraw, text: str, x: int, y: int, light: bool = True):
    fill = (255, 255, 255, 36) if light else (39, 67, 112, 22)
    outline = (255, 255, 255, 78) if light else (39, 67, 112, 48)
    img = pill(text, fill, outline=outline, text_fill=(245, 249, 255) if light else NAVY)
    return img, (x, y)


def scene_progress(t: float, start: float, end: float) -> float:
    return max(0.0, min(1.0, (t - start) / (end - start)))


def montage_asset(t: float) -> str:
    names = [
        "profile computer.png",
        "profile skills computer.png",
        "profile formation computer.png",
        "profile experience computer.png",
    ]
    return names[int(t * 1.7) % len(names)]


def render_frame(t: float, assets: dict[str, Image.Image]) -> Image.Image:
    frame = Image.new("RGBA", (WIDTH, HEIGHT), WHITE)
    d = ImageDraw.Draw(frame)

    if t < 4.0:
        draw_bg(frame, t, "navy")
        d = ImageDraw.Draw(frame)
        p = ease_io(scene_progress(t, 0.0, 4.0))
        enter = ease(scene_progress(t, 0.22, 1.45))
        draw_text(d, (88, int(248 + (1 - enter) * 58)), "Candidate", FONTS["display"], ORANGE)
        draw_text(d, (88, int(328 + (1 - enter) * 58)), "profiles", FONTS["display"], ORANGE)
        draw_text(d, (88, int(440 + (1 - enter) * 44)), "From signup to a complete profile,", FONTS["body"], (224, 234, 248))
        draw_text(d, (88, int(478 + (1 - enter) * 44)), "all in one polished space.", FONTS["body"], (224, 234, 248))

        laptop = make_laptop(assets["register computer.png"], 860, 550)
        phone = make_phone(assets["register mobile.png"], 332, 718)
        laptop = laptop.rotate(lerp(-10, -3, p) + math.sin(t * 1.0) * 0.45, expand=True, resample=Image.Resampling.BICUBIC)
        phone = phone.rotate(lerp(14, 6, p) + math.sin(t * 1.2) * 0.55, expand=True, resample=Image.Resampling.BICUBIC)
        paste_motion(frame, laptop, lerp(1245, 650, p), lerp(1165, 1060, p), 28 * (1 - p))
        paste_motion(frame, phone, lerp(-155, 418, p), lerp(1390, 1190, p), -26 * (1 - p))
        d.line((88, 595, int(88 + 330 * p), 595), fill=ORANGE, width=7)

    elif t < 8.0:
        draw_bg(frame, t, "light")
        d = ImageDraw.Draw(frame)
        p = ease_io(scene_progress(t, 4.0, 8.0))
        q = ease_io(scene_progress(t, 4.15, 5.75))
        frame.alpha_composite(pill("01  START", ORANGE), (88, 156))
        draw_text(d, (88, 244), "Create your account", FONTS["hero_small"], WHITE)
        draw_text(d, (88, 318), "A clean path for every candidate.", FONTS["body"], (225, 235, 248))

        laptop = make_laptop(assets["register computer.png"], 900, 575)
        laptop = laptop.rotate(lerp(7, -2, p) + math.sin(t * 0.8) * 0.35, expand=True, resample=Image.Resampling.BICUBIC)
        paste_motion(frame, laptop, lerp(1280, 570, q), 965 + math.sin(t * 1.55) * 7, 22 * (1 - q))
        phone = make_phone(assets["login mobile.png"], 305, 665).rotate(lerp(-18, 4, q) + math.sin(t * 1.15) * 0.4, expand=True, resample=Image.Resampling.BICUBIC)
        paste_motion(frame, phone, lerp(-120, 775, q), lerp(1500, 1225, q), -32 * (1 - q))

        for i, label in enumerate(["Google", "LinkedIn", "Email"]):
            r = ease(scene_progress(t, 5.35 + i * 0.22, 6.45 + i * 0.22))
            chip = pill(f"+ {label}", [BLUE, NAVY, ORANGE][i])
            frame.alpha_composite(chip, (int(92 + i * 238), int(1510 + (1 - r) * 34)))
        d.rounded_rectangle((88, 1658, 992, 1668), radius=5, fill=(217, 225, 237))
        d.rounded_rectangle((88, 1658, int(88 + 904 * p), 1668), radius=5, fill=ORANGE)

    elif t < 12.0:
        draw_bg(frame, t, "navy")
        d = ImageDraw.Draw(frame)
        p = ease_io(scene_progress(t, 8.0, 12.0))
        frame.alpha_composite(pill("02  COMPLETE", ORANGE), (88, 156))
        draw_text(d, (88, 244), "Build your full profile", FONTS["hero_small"], WHITE)
        draw_text(d, (88, 320), "Skills, education, experience, languages.", FONTS["body"], (225, 235, 248))

        center = make_phone(assets["profile.png"], 352, 742).rotate(math.sin(t * 1.25) * 0.8, expand=True, resample=Image.Resampling.BICUBIC)
        left = make_phone(assets["profile skills.png"], 286, 608).rotate(lerp(-18, -10, p), expand=True, resample=Image.Resampling.BICUBIC)
        right = make_phone(assets["profile formation.png"], 286, 608).rotate(lerp(18, 10, p), expand=True, resample=Image.Resampling.BICUBIC)
        paste_motion(frame, left, lerp(-100, 245, p), lerp(1240, 1135, p), -28 * (1 - p))
        paste_motion(frame, right, lerp(1180, 837, p), lerp(1250, 1145, p), 28 * (1 - p))
        paste_motion(frame, center, 540, lerp(1560, 1115, p), 0)

        meter_y = 1620
        d.rounded_rectangle((150, meter_y, 930, meter_y + 76), radius=38, fill=(255, 255, 255, 238))
        d.rounded_rectangle((182, meter_y + 25, 898, meter_y + 51), radius=13, fill=(222, 228, 238))
        d.rounded_rectangle((182, meter_y + 25, int(182 + 716 * p), meter_y + 51), radius=13, fill=ORANGE)
        draw_text(d, (540, meter_y + 118), f"{int(lerp(20, 100, p)):03d}% profile ready", FONTS["section"], NAVY, anchor="mm")

    elif t < 16.0:
        draw_bg(frame, t, "light")
        d = ImageDraw.Draw(frame)
        p = ease_io(scene_progress(t, 12.0, 16.0))
        frame.alpha_composite(pill("03  PROFILE OVERVIEW", ORANGE), (88, 156))
        draw_text(d, (88, 244), "Recruiters scan", FONTS["hero_small"], WHITE)
        draw_text(d, (88, 310), "every key detail fast", FONTS["hero_small"], (255, 184, 104))
        draw_text(d, (88, 392), "One complete profile, clear sections, ready to review.", FONTS["body"], (225, 235, 248))

        name = ["profile skills computer.png", "profile formation computer.png", "profile experience computer.png"][int((t - 12.0) * 0.95) % 3]
        laptop = make_laptop(assets[name], 920, 595).rotate(math.sin(t * 0.9) * 0.8, expand=True, resample=Image.Resampling.BICUBIC)
        paste_motion(frame, laptop, 540, lerp(1370, 990, p), 0)
        tab_p = ease_io((math.sin((t - 12.0) * math.pi * 0.9) + 1) / 2)
        d.rounded_rectangle((105, 1515, 975, 1602), radius=43, fill=(255, 255, 255, 232), outline=(225, 230, 238), width=2)
        x = int(130 + tab_p * 550)
        d.rounded_rectangle((x, 1530, x + 190, 1587), radius=29, fill=ORANGE)
        for i, label in enumerate(["Formation", "Experience", "Skills"]):
            draw_text(d, (215 + i * 285, 1560), label, FONTS["caption"], NAVY if i != int(tab_p * 2.99) else WHITE, anchor="mm")

        base_x = lerp(1180, 560, ease(scene_progress(t, 13.0, 16.0)))
        for i, name in enumerate(["profile computer.png", "profile skills computer.png", "profile formation computer.png"]):
            card = make_screen_card(assets[name], 560, 360, 26)
            card.putalpha(card.getchannel("A").point(lambda a: int(a * 0.58)))
            card = card.rotate(-9 + i * 9 + math.sin(t * 0.9 + i) * 0.9, expand=True, resample=Image.Resampling.BICUBIC)
            paste_motion(frame, card, base_x + (i - 1) * 220, 1195 + i * 106, 14 * (1 - p))
        phone = make_phone(assets["profile.png"], 305, 650).rotate(8, expand=True, resample=Image.Resampling.BICUBIC)
        paste_center(frame, phone, lerp(-180, 780, ease(scene_progress(t, 13.0, 16.0))), 1305)

    else:
        draw_bg(frame, t, "light")
        d = ImageDraw.Draw(frame)
        p = ease_io(scene_progress(t, 16.0, 20.0))
        draw_text(d, (88, int(220 + (1 - p) * 30)), "Candidate profiles", FONTS["hero_small"], ORANGE)
        draw_text(d, (92, 308), "Fill your profile. Upload your CV. Get discovered.", FONTS["body"], (227, 236, 249))
        laptop = make_laptop(assets[montage_asset(t)], 760, 490).rotate(-7 + math.sin(t) * 0.8, expand=True, resample=Image.Resampling.BICUBIC)
        phone = make_phone(assets["profile.png"], 338, 720).rotate(7 + math.sin(t * 1.3) * 0.8, expand=True, resample=Image.Resampling.BICUBIC)
        paste_motion(frame, laptop, lerp(990, 628, p), 1005, 20 * (1 - p))
        paste_motion(frame, phone, lerp(-150, 370, p), 1165, -20 * (1 - p))
        d.rounded_rectangle((88, 1552, 992, 1660), radius=54, fill=ORANGE)
        draw_text(d, (540, 1607), "Candidate space now open", FONTS["title"], WHITE, anchor="mm")

    apply_scene_transition(frame, t)
    draw_logo(frame, assets["logo"])
    return frame.convert("RGB")


def main():
    assets = sanitize_sources()
    output = PROMO_DIR / "s3m-candidate-profile-linkedin-promo.mp4"
    cover = PROMO_DIR / "s3m-candidate-profile-linkedin-promo-cover.png"
    writer = imageio.get_writer(
        output,
        fps=FPS,
        codec="libx264",
        quality=8,
        macro_block_size=1,
        output_params=["-pix_fmt", "yuv420p", "-movflags", "faststart"],
    )
    for i in range(TOTAL_FRAMES):
        t = i / FPS
        frame = render_frame(t, assets)
        writer.append_data(np.asarray(frame))
        if i == FPS:
            frame.save(cover)
    writer.close()
    print(f"Rendered {output}")
    print(f"Cover {cover}")


if __name__ == "__main__":
    main()
