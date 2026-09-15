import os
import glob

html_files = glob.glob("*.html")
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Logo fetchpriority
    content = content.replace(
        '<img src="assets/logo-footer.webp?v=20260911" alt="Artesana del Barro" width="260" height="76">',
        '<img src="assets/logo-footer.webp?v=20260911" alt="Artesana del Barro" width="260" height="76" fetchpriority="high">'
    )

    # Favicon sizes
    content = content.replace(
        '<link rel="icon" href="assets/favicon.webp?v=20260831">',
        '<link rel="icon" href="assets/favicon.webp?v=20260831" sizes="32x32">'
    )

    # Facebook pixel noscript
    content = content.replace(
        '<noscript><img height="1" width="1" style="display:none"\nsrc="https://www.facebook.com/tr?id=1002053692646882&ev=PageView&noscript=1"\n/></noscript>',
        '<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1002053692646882&ev=PageView&noscript=1" alt=""></noscript>'
    )

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
print("Done replacing attributes")
