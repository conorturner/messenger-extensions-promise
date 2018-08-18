import fs from "fs";
const pkg = JSON.parse(fs.readFileSync("./package.json"));

export default {
	entry: "src/index.js",
	moduleName: pkg.name,
	dest: "dist/main.min.js",
	format: "umd",
	sourceMap: "inline"
};