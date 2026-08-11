import sys
from PIL import Image

def process_logo(input_path, light_output, dark_output, icon_output):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # Process for light logo (transparent background)
    light_img = Image.new("RGBA", img.size)
    dark_img = Image.new("RGBA", img.size)
    
    light_data = []
    dark_data = []
    
    for pixel in img.getdata():
        r, g, b, a = pixel
        # transparent if near white
        if r > 240 and g > 240 and b > 240:
            light_data.append((255, 255, 255, 0))
            dark_data.append((255, 255, 255, 0))
        else:
            light_data.append(pixel)
            # For dark mode, convert dark pixels (text) to white
            if r < 40 and g < 40 and b < 60:
                dark_data.append((255, 255, 255, a))
            else:
                dark_data.append(pixel)
                
    light_img.putdata(light_data)
    dark_img.putdata(dark_data)
    
    bbox = light_img.getbbox()
    if bbox:
        light_img = light_img.crop(bbox)
        dark_img = dark_img.crop(bbox)
        
    light_img.save(light_output)
    dark_img.save(dark_output)
    
    # For icon, crop out the text
    width, height = light_img.size
    gap_y = None
    for y in range(int(height*0.4), int(height*0.8)):
        row_has_pixels = False
        for x in range(width):
            if light_img.getpixel((x, y))[3] > 0:
                row_has_pixels = True
                break
        if not row_has_pixels:
            gap_y = y
            break
            
    if not gap_y:
        gap_y = int(height * 0.7)
        
    icon = light_img.crop((0, 0, width, gap_y))
    icon_bbox = icon.getbbox()
    if icon_bbox:
        icon = icon.crop(icon_bbox)
    
    icon.save(icon_output)
    print("Logos generated successfully.")
    
if __name__ == "__main__":
    process_logo(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
