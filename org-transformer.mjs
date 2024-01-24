import { Transformer } from '@parcel/plugin';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'path';

export default new Transformer({
	async transform({ asset }) {

		const filename = asset.filePath;
		const bn = path.basename(filename, ".org");

		execSync(`emacs ${filename} --eval '(setq org-export-with-toc nil)' --eval '(setq org-html-link-org-files-as-html nil)' --batch -f org-html-export-to-html`)

		const stdout = readFileSync(`${bn}.html`);

		asset.type = 'html';
		asset.setCode(stdout)

		return [asset];
	}
});
