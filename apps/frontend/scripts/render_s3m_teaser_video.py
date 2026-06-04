from __future__ import annotations

import math
from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "brand"
VIDEO_PATH = OUT_DIR / "s3m-linkedin-recruitment-teaser-video.mp4"
THUMB_PATH = OUT_DIR / "s3m-linkedin-recruitment-teaser-cover.png"
LOGO_PATH = OUT_DIR / "Logo.webp"

W = H = 1080
FPS = 30
DURATION = 6.0
FRAMES = int(FPS * DURATION)

NAVY = (5, 31, 54)
DEEP = (1, 13, 25)
BLUE = (21, 143, 209)
CYAN = (62, 195, 241)
ORANGE = (244, 121, 43)
PAPER = (238, 248, 252)


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    fonts = {
        "display": "C:/Windows/Fonts/bahnschrift.ttf",
        "bold": "C:/Windows/Fonts/segoeuib.ttf",
        "regular": "C:/Windows/Fonts/segoeui.ttf",
        "black": "C:/Windows/Fonts/arialbd.ttf",
    }
    return ImageFont.truetype(fonts[name], size=size)


def ease_out(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def ease_in_out(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def clamp(v: float, lo: int = 0, hi: int = 255) -> int:
    return int(max(lo, min(hi, round(v))))


def rounded_box(draw: ImageDraw.ImageDraw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def text_center(draw: ImageDraw.ImageDraw, xy, text, fnt, fill, stroke_width=0, stroke_fill=None):
    bbox = draw.textbbox((0, 0), text, font=fnt, stroke_width=stroke_width)
    x = xy[0] - (bbox[2] - bbox[0]) / 2
    y = xy[1] - (bbox[3] - bbox[1]) / 2 - bbox[1] / 2
    draw.text((x, y), text, font=fnt, fill=fill, stroke_width=stroke_width, stroke_fill=stroke_fill)


def make_background(t: float) -> Image.Image:
    y = np.linspace(0, 1, H)[:, None]
    x = np.linspace(0, 1, W)[None, :]
    glow = np.exp(-(((x - 0.55) ** 2) / 0.07 + ((y - 0.42) ** 2) / 0.16))
    wave = 0.5 + 0.5 * np.sin((x * 4.5 + t * 0.55) * math.tau)

    r = DEEP[0] + 5 * y + 4 * glow
    g = DEEP[1] + 34 * (1 - y) + 28 * glow + 5 * wave
    b = DEEP[2] + 65 * (1 - y) + 95 * glow + 8 * wave
    arr = np.dstack([r, g, b]).clip(0, 255).astype(np.uint8)
    im = Image.fromarray(arr, "RGB").convert("RGBA")
    d = ImageDraw.Draw(im, "RGBA")

    d.rounded_rectangle((29, 29, 1051, 1051), radius=25, outline=(255, 255, 255, 226), width=2)
    return im


def draw_profile_card(layer: Image.Image, x: float, y: float, w: int, h: int, accent, label: str, progress: float):
    d = ImageDraw.Draw(layer, "RGBA")
    alpha = clamp(255 * progress)
    shadow = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow, "RGBA")
    rounded_box(sd, (x + 7, y + 9, x + w + 7, y + h + 9), 22, (0, 9, 22, clamp(72 * progress)))
    layer.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(7)))
    rounded_box(d, (x, y, x + w, y + h), 22, (235, 243, 247, alpha), (255, 255, 255, alpha), 2)
    d.rounded_rectangle((x, y + h * 0.47, x + w, y + h), radius=22, fill=(214, 224, 230, clamp(200 * progress)))

    d.rounded_rectangle((x + 23, y + 24, x + 96, y + 31), radius=4, fill=(*accent, alpha))
    text_center(d, (x + w - 47, y + 31), label, font("bold", 15), (8, 36, 62, alpha), 1, (255, 255, 255, alpha))

    cx, cy = x + 50, y + 77
    d.ellipse((cx - 26, cy - 26, cx + 26, cy + 26), fill=(4, 33, 58, alpha), outline=(*accent, alpha), width=2)
    d.arc((cx - 13, cy - 13, cx + 13, cy + 13), 205, 335, fill=(*accent, alpha), width=2)
    d.arc((cx - 18, cy + 3, cx + 18, cy + 29), 205, 335, fill=(*accent, alpha), width=2)

    widths = [142, 174, 120, 186]
    for i, line_w in enumerate(widths):
        yy = y + 58 + i * 23
        d.rounded_rectangle((x + 96, yy, x + 96 + line_w, yy + 8), radius=4, fill=(5, 34, 59, alpha))
    d.rounded_rectangle((x + 24, y + h - 35, x + w - 25, y + h - 26), radius=5, fill=(5, 34, 59, alpha))
    d.rounded_rectangle((x + 24, y + h - 35, x + 24 + (w - 49) * (0.5 + 0.35 * progress), y + h - 26), radius=5, fill=(*accent, alpha))


def draw_logo(layer: Image.Image, t: float, opacity: float):
    d = ImageDraw.Draw(layer, "RGBA")
    alpha = clamp(255 * opacity)
    cx, cy = W // 2, 466
    pulse = 1 + 0.03 * math.sin(t * math.tau * 2)

    glow = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, "RGBA")
    gd.ellipse((cx - 155, cy - 58, cx + 155, cy + 58), fill=(40, 171, 235, clamp(70 * opacity)))
    gd.ellipse((cx - 118, cy - 43, cx + 118, cy + 43), fill=(255, 126, 43, clamp(50 * opacity)))
    layer.alpha_composite(glow.filter(ImageFilter.GaussianBlur(22)))

    logo = Image.open(LOGO_PATH).convert("RGBA")
    target_w = int(335 * pulse)
    target_h = int(target_w * logo.height / logo.width)
    logo = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
    if alpha < 255:
        logo_alpha = logo.getchannel("A").point(lambda px: int(px * opacity))
        logo.putalpha(logo_alpha)
    layer.alpha_composite(logo, (cx - target_w // 2, cy - target_h // 2))


def draw_main_panel(layer: Image.Image, t: float):
    d = ImageDraw.Draw(layer, "RGBA")
    panel_in = ease_out((t - 0.42) / 0.8)
    y = 332 - 24 * (1 - panel_in)
    alpha = clamp(255 * panel_in)
    shadow = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow, "RGBA")
    rounded_box(sd, (158, y + 18, 922, y + 490), 36, (0, 9, 22, clamp(112 * panel_in)))
    layer.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(13)))
    rounded_box(d, (151, y, 929, y + 476), 36, (244, 251, 254, alpha), (255, 255, 255, alpha), 4)
    rounded_box(d, (169, y + 17, 911, y + 459), 28, (252, 255, 255, clamp(235 * panel_in)), (21, 102, 150, clamp(210 * panel_in)), 2)
    d.rounded_rectangle((188, y + 35, 892, y + 438), radius=24, fill=(248, 253, 255, alpha))

    for i, yy in enumerate((y + 97, y + 133, y + 169)):
        d.rounded_rectangle((204, yy, 411, yy + 8), radius=4, fill=(5, 34, 59, alpha))
    d.ellipse((204, y + 45, 254, y + 95), fill=(5, 44, 76, alpha))

    draw_logo(layer, t, panel_in)

    title_p = ease_out((t - 1.25) / 0.72)
    title_y = y + 340 - 18 * (1 - title_p)
    title_font = font("display", 85)
    title_fill = (7, 52, 88, clamp(255 * title_p))
    text_center(d, (540 + 4, title_y + 5), "STAY TUNED", title_font, (2, 18, 34, clamp(105 * title_p)))
    text_center(d, (540, title_y), "STAY TUNED", title_font, title_fill, 1, (255, 255, 255, clamp(245 * title_p)))
    tag_p = ease_out((t - 2.0) / 0.6)
    tag_y0 = y + 385
    rounded_box(d, (194, tag_y0, 886, tag_y0 + 67), 23, (247, 252, 255, clamp(246 * tag_p)), (22, 91, 137, clamp(210 * tag_p)), 2)

    f = font("bold", 39)
    text1 = "we will make you feel "
    text2 = "different"
    b1 = d.textbbox((0, 0), text1, font=f)
    b2 = d.textbbox((0, 0), text2, font=f)
    tw = (b1[2] - b1[0]) + (b2[2] - b2[0])
    tx = (W - tw) / 2
    ty = tag_y0 + 17
    clip_alpha = clamp(255 * tag_p)
    d.text((tx + 2, ty + 2), text1, font=f, fill=(3, 20, 38, clamp(75 * tag_p)))
    d.text((tx + b1[2] - b1[0] + 2, ty + 2), text2, font=f, fill=(3, 20, 38, clamp(75 * tag_p)))
    d.text((tx, ty), text1, font=f, fill=(6, 48, 83, clip_alpha))
    d.text((tx + b1[2] - b1[0], ty), text2, font=f, fill=(*ORANGE, clip_alpha))


def render_frame(i: int) -> Image.Image:
    t = i / FPS
    im = make_background(t)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))

    card_p = ease_out(t / 0.95)
    float_y = math.sin(t * math.tau * 0.45) * 6
    draw_profile_card(layer, 53 - 18 * (1 - card_p), 186 + float_y, 242, 164, BLUE, "CANDIDATE", card_p)
    draw_profile_card(layer, 785 + 18 * (1 - card_p), 225 - float_y, 244, 165, ORANGE, "MATCH", card_p)
    draw_profile_card(layer, 58 - 22 * (1 - card_p), 728 - float_y, 262, 180, ORANGE, "", card_p)
    draw_profile_card(layer, 764 + 22 * (1 - card_p), 752 + float_y, 266, 183, BLUE, "ROLE", card_p)

    draw_main_panel(layer, t)

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
    thumbnail = None
    try:
        for i in range(FRAMES):
            frame = render_frame(i)
            if i == int(FPS * 3.0):
                thumbnail = frame
            writer.append_data(np.asarray(frame))
    finally:
        writer.close()

    if thumbnail is None:
        thumbnail = render_frame(int(FPS * 3.0))
    thumbnail.save(THUMB_PATH, optimize=True)
    print(f"video={VIDEO_PATH}")
    print(f"thumbnail={THUMB_PATH}")


if __name__ == "__main__":
    main()
