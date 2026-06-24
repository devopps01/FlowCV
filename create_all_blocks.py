# Python script to create all block files
import os
BASE=r"d:/flowcv/src/blocks"
os.makedirs(BASE,exist_ok=True)
def w(n,c):
 with open(os.path.join(BASE,n),"w",encoding="utf-8") as ff:ff.write(c.lstrip("\n"))
 print("Created:",n)

print("Script ready, call this file to create blocks")