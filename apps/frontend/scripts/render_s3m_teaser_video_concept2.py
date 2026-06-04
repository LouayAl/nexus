from __future__ import annotations

import math
from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "brand"
LOGO_PATH = OUT_DIR / "Logo.webp"
VIDEO_PATH = OUT_DIR / "s3m-linkedin-recruitment-teaser-concept2.mp4"
COVER_PATH = OUT_DIR / "s3m-linkedin-recruitment-teaser-concept2-cover.png"

W = H = 1080
FPS = 30
DURATION = 6.0
FRAMES = int(FPS * DURATION)

INK = (4, 28, 50)
NAVY = (8, 47, 82)
BLUE = (24, 147, 214)
CYAN = (80, 205, 238)
ORANGE = (244, 121, 43)
PANEL = (246, 251, 253)


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    fonts = {
        "display": "C:/Windows/Fonts/bahnschrift.ttf",
        "bold": "C:/Windows/Fonts/segoeuib.ttf",
        "regular": "C:/Windows/Fonts/segoeui.ttf",
    }
    return ImageFont.truetype(fonts[name], size=size)


def clamp(v: float, lo: int = 0, hi: int = 255) -> int:
    return int(max(lo, min(hi, round(v))))


def ease(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def pop(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 + 0.08 * math.sin(t * math.pi) * (1 - t)


def draw_centered(draw: ImageDraw.ImageDraw, center, text: str, fnt, fill, stroke_width=0, stroke_fill=None):
    box = draw.textbbox((0, 0), text, font=fnt, stroke_width=stroke_width)
    x = center[0] - (box[2] - box[0]) / 2
    y = center[1] - (box[3] - box[1]) / 2 - box[1] / 2
    draw.text((x, y), text, font=fnt, fill=fill, stroke_width=stroke_width, stroke_fill=stroke_fill)


def rounded(draw: ImageDraw.ImageDraw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def background(t: float) -> Image.Image:
    y = np.linspace(0, 1, H)[:, None]
    x = np.linspace(0, 1, W)[None, :]
    glow1 = np.exp(-(((x - 0.28) ** 2) / 0.12 + ((y - 0.2) ** 2) / 0.09))
    glow2 = np.exp(-(((x - 0.72) ** 2) / 0.10 + ((y - 0.76) ** 2) / 0.12))
    drift = 0.5 + 0.5 * np.sin((x * 2.2 + y * 1.1 + t * 0.22) * math.tau)
    r = 2 + 8 * glow2 + 4 * drift
    g = 18 + 48 * (1 - y) + 34 * glow1 + 18 * glow2
    b = 36 + 78 * (1 - y) + 95 * glow1 + 56 * glow2
    im = Image.fromarray(np.dstack([r, g, b]).clip(0, 255).astype(np.uint8), "RGB").convert("RGBA")
    d = ImageDraw.Draw(im, "RGBA")
    d.rounded_rectangle((28, 28, 1052, 1052), radius=32, outline=(255, 255, 255, 216), width=2)
    return im


def logo_image(width: int, opacity: float = 1.0) -> Image.Image:
    logo = Image.open(LOGO_PATH).convert("RGBA")
    height = int(width * logo.height / logo.width)
    logo = logo.resize((width, height), Image.Resampling.LANCZOS)
    if opacity < 1:
        alpha = logo.getchannel("A").point(lambda px: int(px * opacity))
        logo.putalpha(alpha)
    return logo


def icon(draw: ImageDraw.ImageDraw, kind: str, cx: float, cy: float, color, alpha: int):
    if kind == "candidate":
        draw.ellipse((cx - 13, cy - 17, cx + 13, cy + 9), fill=(*color, alpha))
        draw.arc((cx - 25, cy + 2, cx + 25, cy + 42), 205, 335, fill=(*color, alpha), width=5)
    elif kind == "role":
        draw.rounded_rectangle((cx - 24, cy - 17, cx + 24, cy + 21), radius=6, outline=(*color, alpha), width=5)
        draw.line((cx - 10, cy - 17, cx - 10, cy - 27, cx + 10, cy - 27, cx + 10, cy - 17), fill=(*color, alpha), width=5)
    else:
        draw.rounded_rectangle((cx - 24, cy - 23, cx + 24, cy + 25), radius=4, outline=(*color, alpha), width=5)
        for dx in (-10, 10):
            draw.line((cx + dx, cy - 13, cx + dx, cy + 12), fill=(*color, alpha), width=4)
        draw.line((cx - 18, cy + 24, cx + 18, cy + 24), fill=(*color, alpha), width=5)


def card(layer: Image.Image, box, title: str, subtitle: str, kind: str, color, progress: float):
    progress = ease(progress)
    x0, y0, x1, y1 = box
    cy_shift = 22 * (1 - progress)
    alpha = clamp(255 * progress)
    scale = pop(progress)
    cx = (x0 + x1) / 2
    cy = (y0 + y1) / 2 + cy_shift
    bw = (x1 - x0) * scale
    bh = (y1 - y0) * scale
    box = (cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2)

    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow, "RGBA")
    rounded(sd, (box[0] + 8, box[1] + 12, box[2] + 8, box[3] + 12), 26, (0, 8, 20, clamp(92 * progress)))
    layer.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(14)))

    d = ImageDraw.Draw(layer, "RGBA")
    rounded(d, box, 26, (246, 251, 253, alpha), (255, 255, 255, alpha), 2)
    d.rounded_rectangle((box[0] + 18, box[1] + 18, box[2] - 18, box[1] + 25), radius=4, fill=(*color, alpha))
    d.ellipse((box[0] + 28, box[1] + 50, box[0] + 94, box[1] + 116), fill=(232, 243, 249, alpha), outline=(*color, alpha), width=2)
    icon(d, kind, box[0] + 61, box[1] + 82, color, alpha)
    title_font = font("bold", 27)
    subtitle_font = font("regular", 18)
    text_x = box[0] + 112
    max_text_w = box[2] - text_x - 28
    while d.textbbox((0, 0), title, font=title_font)[2] > max_text_w and title_font.size > 21:
        title_font = font("bold", title_font.size - 1)
    while d.textbbox((0, 0), subtitle, font=subtitle_font)[2] > max_text_w and subtitle_font.size > 13:
        subtitle_font = font("regular", subtitle_font.size - 1)
    d.text((text_x, box[1] + 49), title, font=title_font, fill=(*INK, alpha))
    d.text((text_x, box[1] + 86), subtitle, font=subtitle_font, fill=(52, 88, 112, alpha))

    if box[3] - box[1] >= 175:
        line_y_start = box[1] + 128
        max_line_w = box[2] - box[0] - 62
        for i, width in enumerate((140, 185, 110)):
            yy = line_y_start + i * 18
            line_w = min(width, max_line_w)
            if yy + 7 <= box[3] - 22:
                d.rounded_rectangle((box[0] + 31, yy, box[0] + 31 + line_w, yy + 7), radius=4, fill=(14, 49, 78, clamp(210 * progress)))


def connection(draw: ImageDraw.ImageDraw, a, b, progress: float, color, width=4):
    progress = ease(progress)
    mx = a[0] + (b[0] - a[0]) * progress
    my = a[1] + (b[1] - a[1]) * progress
    draw.line((a[0], a[1], mx, my), fill=(*color, clamp(180 * progress)), width=width)
    if progress > 0.05:
        draw.ellipse((mx - 7, my - 7, mx + 7, my + 7), fill=(*color, clamp(230 * progress)))


def center_engine(layer: Image.Image, t: float):
    d = ImageDraw.Draw(layer, "RGBA")
    p = ease((t - 0.55) / 0.7)
    alpha = clamp(255 * p)
    cx, cy = 540, 470

    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, "RGBA")
    gd.ellipse((cx - 190, cy - 115, cx + 190, cy + 115), fill=(31, 161, 226, clamp(54 * p)))
    gd.ellipse((cx - 125, cy - 74, cx + 125, cy + 74), fill=(244, 121, 43, clamp(38 * p)))
    layer.alpha_composite(glow.filter(ImageFilter.GaussianBlur(24)))

    rounded(d, (344, 350, 736, 590), 34, (248, 252, 254, alpha), (255, 255, 255, alpha), 2)
    for r, color, speed in ((166, BLUE, 0.22), (139, ORANGE, -0.28), (113, CYAN, 0.34)):
        start = (t * speed * 360) % 360
        d.arc((cx - r, cy - r, cx + r, cy + r), start, start + 58, fill=(*color, alpha), width=5)

    logo = logo_image(278, p)
    layer.alpha_composite(logo, (cx - logo.width // 2, cy - logo.height // 2 - 16))
    draw_centered(d, (cx, cy + 84), "Recruitment Match", font("bold", 24), (6, 52, 90, alpha))


def timeline(layer: Image.Image, t: float):
    d = ImageDraw.Draw(layer, "RGBA")
    p = ease((t - 2.35) / 0.7)
    alpha = clamp(255 * p)
    rounded(d, (176, 714, 904, 842), 30, (248, 252, 254, alpha), (255, 255, 255, alpha), 2)
    labels = [("Candidate", BLUE), ("Role", ORANGE), ("Company", CYAN)]
    xs = [292, 540, 788]
    line_p = ease((t - 2.55) / 0.5)
    d.line((xs[0] + 31, 764, xs[0] + 31 + (xs[1] - xs[0] - 62) * line_p, 764), fill=(*BLUE, clamp(145 * p)), width=3)
    d.line((xs[1] + 31, 764, xs[1] + 31 + (xs[2] - xs[1] - 62) * line_p, 764), fill=(*BLUE, clamp(145 * p)), width=3)
    for idx, (label, color) in enumerate(labels):
        step_p = ease((t - 2.5 - idx * 0.25) / 0.45)
        d.ellipse((xs[idx] - 26, 738, xs[idx] + 26, 790), fill=(235, 246, 251, clamp(255 * step_p)), outline=(*color, clamp(255 * step_p)), width=4)
        draw_centered(d, (xs[idx], 764), str(idx + 1), font("bold", 24), (*INK, clamp(255 * step_p)))
        draw_centered(d, (xs[idx], 812), label, font("bold", 20), (*INK, clamp(255 * step_p)))


def tagline(layer: Image.Image, t: float):
    d = ImageDraw.Draw(layer, "RGBA")
    p = ease((t - 3.15) / 0.7)
    alpha = clamp(255 * p)
    text1 = "we will make you feel "
    text2 = "different"
    f = font("bold", 41)
    b1 = d.textbbox((0, 0), text1, font=f)
    b2 = d.textbbox((0, 0), text2, font=f)
    tw = b1[2] - b1[0] + b2[2] - b2[0]
    x = (W - tw) / 2
    y = 887
    d.text((x + 2, y + 2), text1, font=f, fill=(0, 10, 22, clamp(75 * p)))
    d.text((x + b1[2] - b1[0] + 2, y + 2), text2, font=f, fill=(0, 10, 22, clamp(75 * p)))
    d.text((x, y), text1, font=f, fill=(230, 247, 255, alpha))
    d.text((x + b1[2] - b1[0], y), text2, font=f, fill=(*ORANGE, alpha))


def render_frame(i: int) -> Image.Image:
    t = i / FPS
    im = background(t)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer, "RGBA")

    connection(d, (336, 420), (384, 452), (t - 0.9) / 0.5, BLUE)
    connection(d, (696, 452), (748, 420), (t - 1.15) / 0.5, ORANGE)
    connection(d, (540, 590), (540, 714), (t - 1.55) / 0.65, CYAN)

    card(layer, (72, 260, 336, 464), "Candidate", "skills and ambition", "candidate", BLUE, (t - 0.15) / 0.65)
    card(layer, (744, 260, 1008, 464), "Role", "requirements and fit", "role", ORANGE, (t - 0.45) / 0.65)
    card(layer, (376, 104, 704, 250), "Company", "culture and opportunity", "company", CYAN, (t - 0.75) / 0.65)

    center_engine(layer, t)
    timeline(layer, t)
    tagline(layer, t)

    im.alpha_composite(layer)
    return ImageEnhance.Sharpness(im.convert("RGB")).enhance(1.08)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    writer = imageio.get_writer(
        VIDEO_PATH,
        fps=FPS,
        codec="libx264",
        quality=9,
        macro_block_size=1,
        ffmpeg_params=["-pix_fmt", "yuv420p", "-movflags", "+faststart", "-crf", "16"],
    )
    cover = None
    try:
        for i in range(FRAMES):
            frame = render_frame(i)
            if i == int(FPS * 4.0):
                cover = frame
            writer.append_data(np.asarray(frame))
    finally:
        writer.close()
    if cover is None:
        cover = render_frame(int(FPS * 4.0))
    cover.save(COVER_PATH, optimize=True)
    print(f"video={VIDEO_PATH}")
    print(f"cover={COVER_PATH}")


if __name__ == "__main__":
    main()
