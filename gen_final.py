import os
B="d:/flowcv/src/blocks"
os.makedirs(B,exist_ok=True)
def w(n,c):
 with open(os.path.join(B,n),"w",encoding="utf-8") as ff:ff.write(c.lstrip(chr(10)))
 print("Created:",n)
# Block content will be appended via base64 encoding
import base64
