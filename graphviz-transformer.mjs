import { Transformer } from '@parcel/plugin';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'path';

export default new Transformer({
	async transform({ asset }) {

		const filename = asset.filePath;
		const bn = path.basename(filename, ".dot");

		execSync(`dot -T svg ${filename} -O`)

		const stdout = readFileSync(`${bn}.svg`);

		asset.type = 'svg';
		asset.setCode(stdout)

		return [asset];
	}
});
