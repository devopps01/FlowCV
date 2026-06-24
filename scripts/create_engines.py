import os,base64,json

def wf(fp,c):
    os.makedirs(os.path.dirname(fp),exist_ok=True)
    with open(fp,"w",encoding="utf-8") as f:f.write(c)
    print("OK: "+fp)

with open("scripts/files_b64.json","r") as f:files=json.load(f)
for fp,b64_data in files.items():
    wf(fp,base64.b64decode(b64_data).decode("utf-8"))
print("All done!")