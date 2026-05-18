import os
import glob
import re

frontend_dir = r"c:\Users\madrid\Desktop\TCGTemple\frontend\app"
files_to_check = glob.glob(os.path.join(frontend_dir, "**", "*.tsx"), recursive=True)

for file in files_to_check:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = re.sub(
        r"'http://localhost:3000/api(.*?)'",
        r"`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}\1`",
        content
    )
    
    new_content = re.sub(
        r"`http://localhost:3000/api(.*?)`",
        r"`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}\1`",
        new_content
    )
    
    new_content = re.sub(
        r'"http://localhost:3000/api(.*?)"',
        r"`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}\1`",
        new_content
    )

    if content != new_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
