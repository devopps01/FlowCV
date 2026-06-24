import os
import base64
D = "d:/flowcv/src/blocks"
os.makedirs(D, exist_ok=True)
def w(n, b):
    p = os.path.join(D, n)
    with open(p, "w", encoding="utf-8") as ff:
        ff.write(base64.b64decode(b).decode("utf-8"))
    print("Created:", n)

