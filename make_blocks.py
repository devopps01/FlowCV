import os,base64,sys
B="d:/flowcv/src/blocks"
os.makedirs(B,exist_ok=True)
def W(n,b):
 with open(os.path.join(B,n),"w",encoding="utf-8") as ff:ff.write(base64.b64decode(b).decode())
 print("OK",n)
