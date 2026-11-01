"""Rewrites an 8-bit RGB PNG as RGBA (fully opaque): Play wants a 32-bit PNG for the app icon.

Usage: python -I tools/store/png_add_alpha.py <in.png> <out.png>
"""
import struct
import sys
import zlib


def chunks(data: bytes):
    pos = 8
    while pos < len(data):
        length, kind = struct.unpack(">I4s", data[pos:pos + 8])
        yield kind, data[pos + 8:pos + 8 + length]
        pos += 12 + length


def paeth(a: int, b: int, c: int) -> int:
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    return a if pa <= pb and pa <= pc else b if pb <= pc else c


def main(src: str, dst: str) -> None:
    data = open(src, "rb").read()
    ihdr = next(body for kind, body in chunks(data) if kind == b"IHDR")
    width, height, depth, color, _, _, interlace = struct.unpack(">IIBBBBB", ihdr)
    if color == 6:
        open(dst, "wb").write(data)
        print("already RGBA")
        return
    assert depth == 8 and color == 2 and interlace == 0, "only 8-bit, non-interlaced RGB is supported"
    raw = zlib.decompress(b"".join(body for kind, body in chunks(data) if kind == b"IDAT"))
    stride, bpp = width * 3, 3
    prev = bytearray(stride)
    out = bytearray()
    pos = 0
    for _ in range(height):
        kind = raw[pos]
        line = bytearray(raw[pos + 1:pos + 1 + stride])
        pos += 1 + stride
        for i in range(stride):
            left = line[i - bpp] if i >= bpp else 0
            up = prev[i]
            corner = prev[i - bpp] if i >= bpp else 0
            if kind == 1:
                line[i] = (line[i] + left) & 0xFF
            elif kind == 2:
                line[i] = (line[i] + up) & 0xFF
            elif kind == 3:
                line[i] = (line[i] + (left + up) // 2) & 0xFF
            elif kind == 4:
                line[i] = (line[i] + paeth(left, up, corner)) & 0xFF
        prev = line
        out.append(0)
        for x in range(width):
            out += line[x * 3:x * 3 + 3] + b"\xff"

    def chunk(kind: bytes, body: bytes) -> bytes:
        return struct.pack(">I", len(body)) + kind + body + struct.pack(">I", zlib.crc32(kind + body) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(out), 9)) + chunk(b"IEND", b"")
    open(dst, "wb").write(png)
    print(f"{width}x{height} RGBA, {len(png)} bytes")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
