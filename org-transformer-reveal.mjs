import { Transformer } from '@parcel/plugin';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'path';

export default new Transformer({
	async transform({ asset }) {

		const filename = asset.filePath;
		const bn = path.basename(filename, ".reveal.org");
		// const stdout =
		// execSync(`pandoc ${filename} -s --highlight-style=espresso -t html5`);
		// execSync(`emacsclient -e '(progn (find-file "index.org") (org-html-export-to-html))'`);
// 
	    execSync(`emacs -l ~/.emacs.d/init.el ${filename} --eval '(setq org-export-with-toc nil)' --eval '(setq org-html-link-org-files-as-html nil)' --eval "(setq org-re-reveal-plugins '(search highlight zoom))"  --eval '(setq org-re-reveal-root "node_modules/reveal.js/")' --batch -f org-re-reveal-export-to-html`)

		const stdout = readFileSync(`${bn}.reveal.html`);

		asset.type = 'html';
		asset.setCode(stdout)

		return [asset];
	}
});
