import { error } from '@sveltejs/kit';
import { getGuideContent, getGuideStructure, getGuideRealPath, type GuideNode } from '$lib/server/guides';
import { marked } from 'marked';

const GITHUB_EDIT_BASE = 'https://github.com/yuckdevchan/liteguide/edit/main/guides';

interface Heading {
	id: string;
	text: string;
	level: number;
}

function headingSlug(text: string): string {
	return text
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

function extractHeadings(content: string): Heading[] {
	const headings: Heading[] = [];
	const lines = content.split('\n');
	const counts = new Map<string, number>();

	for (const line of lines) {
		const match = line.match(/^(#{1,6})\s+(.+)/);
		if (match) {
			const level = match[1].length;
			let text = match[2].trim();
			text = text.replace(/[`*_~]/g, '').trim();
			const base = headingSlug(text);
			const count = counts.get(base) || 0;
			counts.set(base, count + 1);
			const id = count === 0 ? base : `${base}-${count}`;
			headings.push({ id, text, level });
		}
	}

	return headings;
}

function addHeadingIds(html: string, headings: Heading[]): string {
	let idx = 0;
	return html.replace(/<h([1-6])(.*?)>(.*?)<\/h\1>/g, (match, level, attrs, text) => {
		const heading = headings[idx];
		idx++;
		if (heading) {
			return `<h${level} id="${heading.id}"${attrs}>${text}</h${level}>`;
		}
		return match;
	});
}

function convertDoubleBacktickCodeSpans(content: string): string {
	return content.replace(/```[\s\S]*?```|([^`]|^)``([^`\n]+?)``/g, (match, prefix, code) => {
		if (match.startsWith('```')) return match;
		return `${prefix}<code>${code}</code>`;
	});
}

export async function load({ params }) {
	const path = params.path || '';

	const structure = getGuideStructure();

	let content = getGuideContent(path);
	if (content && content.match(/^\d+\n/)) {
		content = content.replace(/^\d+\n/, '');
	}

	if (!content) {
		error(404, 'Guide not found');
	}

	const titleMatch = content.match(/^#\s+(.+)/m);
	const title = titleMatch ? titleMatch[1].trim() : path.split('/').pop() || path;

	const bodyContent = content.replace(/^#\s+(.+)/m, '').trim();
	const headings = extractHeadings(bodyContent);
	const rawHtml = await marked(convertDoubleBacktickCodeSpans(bodyContent));
	const html = addHeadingIds(rawHtml, headings);

	const realPath = getGuideRealPath(path);
	const sourceUrl = `${GITHUB_EDIT_BASE}/${realPath || path}.md`;

	const pathTitleMap = new Map<string, string>();
	function walk(nodes: GuideNode[]) {
		for (const node of nodes) {
			pathTitleMap.set(node.path, node.title);
			if (node.children) walk(node.children);
		}
	}
	walk(structure);

	const parts = path.split('/');
	const breadcrumbs = parts.map((_, i) => {
		const segmentPath = parts.slice(0, i + 1).join('/');
		return pathTitleMap.get(segmentPath) || segmentPath;
	});

	return {
		html,
		title,
		path,
		structure,
		headings,
		sourceUrl,
		breadcrumbs
	};
}
