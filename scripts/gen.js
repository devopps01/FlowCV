const fs = require("fs"); const path = require("path"); function wf(fp, c) { fs.mkdirSync(path.dirname(fp), {recursive: true}); fs.writeFileSync(fp, c, "utf-8"); console.log("Created: " + fp); }
