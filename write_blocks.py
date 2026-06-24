import os, base64, sys
B="d:/flowcv/src/blocks"
os.makedirs(B,exist_ok=True)
def w(n,c):
 p=os.path.join(B,n)
 with open(p,"w",encoding="utf-8") as ff:ff.write(c)
 print(n)
# Blocks will be written below
D={}
