#!/usr/bin/env python3
import os
D="d:/flowcv/src/blocks"
os.makedirs(D,exist_ok=True)
def w(n,c):
 p=os.path.join(D,n)
 with open(p,"w",encoding="utf-8") as ff:ff.write(c)
 print("Created:",n)

