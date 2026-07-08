import { error } from '@sveltejs/kit';
import { getGuideContent, getGuideStructure, getGuideRealPath, type GuideNode } from '$lib/server/guides';
import { marked } from 'marked';

const GITHUB_EDIT_BASE = 'https://github.com/yuckdevchan/liteguide/edit/main/guides';

interface Heading {
	id: string;
	text: string;
	level: number;
}

interface GuideReferenceEntry {
	routeHref: string;
	cleanPath: string;
	basename: string;
	titleSlug: string;
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

function escapeHtmlAttribute(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function slugifyReference(text: string): string {
	return text
		.toLowerCase()
		.replace(/\.[^.\/]+$/, '')
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9/\-]/g, '')
		.replace(/\/+/g, '/')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

function normalizeReferencePath(href: string): string {
	let normalized = href.trim().replace(/\\/g, '/');

	try {
		normalized = decodeURIComponent(normalized);
	} catch {
	}

	normalized = normalized
		.replace(/^\.\/+/, '')
		.replace(/^\/+/, '')
		.replace(/^guides\//i, '')
		.replace(/\.md$/i, '')
		.replace(/\/+$/, '');

	return slugifyReference(normalized);
}

function splitReferenceSuffix(href: string): { path: string; suffix: string } {
	const hashIndex = href.indexOf('#');
	const queryIndex = href.indexOf('?');
	let splitIndex = -1;

	if (hashIndex >= 0 && queryIndex >= 0) {
		splitIndex = Math.min(hashIndex, queryIndex);
	} else if (hashIndex >= 0) {
		splitIndex = hashIndex;
	} else if (queryIndex >= 0) {
		splitIndex = queryIndex;
	}

	if (splitIndex === -1) {
		return { path: href, suffix: '' };
	}

	return {
		path: href.slice(0, splitIndex),
		suffix: href.slice(splitIndex)
	};
}

function buildGuideReferenceEntries(nodes: GuideNode[]): GuideReferenceEntry[] {
	const entries: GuideReferenceEntry[] = [];

	function walk(currentNodes: GuideNode[]) {
		for (const node of currentNodes) {
			if (node.children && node.children.length > 0) {
				walk(node.children);
				continue;
			}

			const basename = node.path.split('/').at(-1) || node.path;
			entries.push({
				routeHref: `/guides/${node.path}`,
				cleanPath: normalizeReferencePath(node.path),
				basename: slugifyReference(basename),
				titleSlug: slugifyReference(node.title)
			});
		}
	}

	walk(nodes);
	return entries;
}

function isExternalHref(href: string): boolean {
	return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
}

function resolveGuideHref(href: string, entries: GuideReferenceEntry[]): string {
	const trimmed = href.trim();
	if (!trimmed || trimmed.startsWith('#') || isExternalHref(trimmed)) {
		return href;
	}

	const { path, suffix } = splitReferenceSuffix(trimmed);
	const normalized = normalizeReferencePath(path);
	if (!normalized) return href;

	const exactMatch = entries.find(
		(entry) => entry.cleanPath === normalized || entry.basename === normalized || entry.titleSlug === normalized
	);
	if (exactMatch) {
		return `${exactMatch.routeHref}${suffix}`;
	}

	const partialMatches = entries.filter(
		(entry) =>
			entry.cleanPath.endsWith(`/${normalized}`) ||
			entry.basename.endsWith(normalized) ||
			entry.titleSlug.endsWith(normalized)
	);

	if (partialMatches.length === 1) {
		return `${partialMatches[0].routeHref}${suffix}`;
	}

	return `https://en.wikipedia.org/wiki/${normalized.replace(/_/g, '-')}${suffix}`;
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
	const guideReferenceEntries = buildGuideReferenceEntries(structure);
	const renderer = new marked.Renderer();
	renderer.link = ({ href, title, tokens }) => {
		const resolvedHref = resolveGuideHref(href, guideReferenceEntries);
		const renderedText = renderer.parser.parseInline(tokens);
		let html = `<a href="${escapeHtmlAttribute(resolvedHref)}"`;
		if (resolvedHref.startsWith('http')) {
			html += ` target="_blank" rel="noreferrer"`;
		}
		if (title) {
			html += ` title="${escapeHtmlAttribute(title)}"`;
		}
		html += `>${renderedText}</a>`;
		return html;
	};
	const rawHtml = await marked(convertDoubleBacktickCodeSpans(bodyContent), { renderer });
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
