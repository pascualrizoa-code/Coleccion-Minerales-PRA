import os
from PIL import Image

def generate_icons(source_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    sizes = [
        (72, 72),
        (96, 96),
        (128, 128),
        (144, 144),
        (152, 152),
        (192, 192),
        (384, 384),
        (512, 512)
    ]

    try:
        with Image.open(source_path) as img:
            # Ensure transparency is preserved if available
            img = img.convert("RGBA")
            
            for size in sizes:
                resized_img = img.resize(size, Image.Resampling.LANCZOS)
                output_filename = f"icon-{size[0]}x{size[1]}.png"
                output_path = os.path.join(output_dir, output_filename)
                resized_img.save(output_path, "PNG")
                print(f"Generated: {output_path}")

            # Also generate the .ico file (72x72)
            ico_path = os.path.join(output_dir, "icon-72x72.ico")
            ico_img = img.resize((72, 72), Image.Resampling.LANCZOS)
            ico_img.save(ico_path, format="ICO")
            print(f"Generated: {ico_path}")

    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    source = r"C:\Users\Pascual\.gemini\antigravity\brain\71ccd90b-cc01-4891-9056-7da5bc9a34b1\uploaded_media_1769509459499.png"
    output = r"c:\Colección Minerales\icons"
    generate_icons(source, output)
