const guideFiles = import.meta.glob('/guides/**/*.md', {
	eager: true,
	import: 'default',
	query: '?raw'
}) as Record<string, string>;

export interface GuideNode {
	title: string;
	slug: string;
	path: string;
	children?: GuideNode[];
}

const pathMap = new Map<string, string>();
const contentMap = new Map<string, string>();
let cachedStructure: GuideNode[] | null = null;

function slugify(name: string): string {
	return name
		.replace(/\.md$/, '')
		.toLowerCase()
		.replace(/\+\+/g, 'pp')
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

function titleFromContent(content: string, fallback: string): string {
	const match = content.match(/^#\s+(.+)/m);
	if (match) return match[1].trim();
	return fallback.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function sortOrderFromContent(content: string): number | null {
	const firstLine = content.split('\n')[0].trim();
	if (/^\d+$/.test(firstLine)) return parseInt(firstLine, 10);
	return null;
}

type NodeKind = 'article' | 'category';

type RawNode = GuideNode & { order?: number | null; kind: NodeKind };

interface TreeEntry {
	actualName: string;
	cleanName: string;
	slug: string;
	cleanPath: string;
	realPath: string;
	order: number | null;
	directories: Map<string, TreeEntry>;
	files: RawNode[];
}

function stripOrder(n: RawNode): GuideNode {
	const { order: _, kind: __, ...rest } = n;
	return rest;
}

function titleFromFolderName(name: string): string {
	return name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function createDirectoryNode(actualName: string, cleanBase: string, realBase: string): TreeEntry {
	const orderMatch = actualName.match(/^(\d+)\.\s+(.*)$/);
	const order = orderMatch ? parseInt(orderMatch[1], 10) : null;
	const cleanName = orderMatch ? orderMatch[2] : actualName;
	const slug = slugify(cleanName);
	const cleanPath = cleanBase ? `${cleanBase}/${slug}` : slug;
	const realPath = realBase ? `${realBase}/${actualName}` : actualName;
	pathMap.set(cleanPath, realPath);

	return {
		actualName,
		cleanName,
		slug,
		cleanPath,
		realPath,
		order,
		directories: new Map(),
		files: []
	};
}

function sortNodes(a: RawNode, b: RawNode): number {
	if (a.kind !== b.kind) return a.kind === 'article' ? -1 : 1;
	if (a.order != null && b.order != null) return a.order - b.order;
	if (a.order != null) return -1;
	if (b.order != null) return 1;
	return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
}

function buildNode(entry: TreeEntry): RawNode {
	const children: RawNode[] = [];

	for (const directory of entry.directories.values()) {
		const child = buildNode(directory);
		if (child.children && child.children.length > 0) {
			children.push(child);
		}
	}

	children.push(...entry.files);
	children.sort(sortNodes);

	return {
		title: titleFromFolderName(entry.cleanName),
		slug: entry.slug,
		path: entry.cleanPath,
		order: entry.order,
		kind: 'category',
		children: children.map(stripOrder)
	};
}

function buildGuideIndex(): GuideNode[] {
	if (cachedStructure) return cachedStructure;

	pathMap.clear();
	contentMap.clear();

	const root: TreeEntry = {
		actualName: '',
		cleanName: '',
		slug: '',
		cleanPath: '',
		realPath: '',
		order: null,
		directories: new Map(),
		files: []
	};

	for (const [filePath, content] of Object.entries(guideFiles)) {
		const relativePath = filePath.replace(/^\/guides\//, '');
		const segments = relativePath.split('/');
		const fileName = segments.pop();

		if (!fileName) continue;

		let current = root;
		let cleanBase = '';
		let realBase = '';

		for (const segment of segments) {
			let directory = current.directories.get(segment);
			if (!directory) {
				directory = createDirectoryNode(segment, cleanBase, realBase);
				current.directories.set(segment, directory);
			}
			current = directory;
			cleanBase = current.cleanPath;
			realBase = current.realPath;
		}

		const slug = slugify(fileName);
		const cleanPath = cleanBase ? `${cleanBase}/${slug}` : slug;
		const realPath = realBase ? `${realBase}/${fileName}` : fileName;
		const article: RawNode = {
			title: titleFromContent(content, slug),
			slug,
			path: cleanPath,
			order: sortOrderFromContent(content),
			kind: 'article'
		};

		pathMap.set(cleanPath, realPath);
		contentMap.set(cleanPath, content);
		current.files.push(article);
	}

	cachedStructure = Array.from(root.directories.values())
		.map((directory) => buildNode(directory))
		.filter((node) => node.children && node.children.length > 0)
		.map(stripOrder);

	return cachedStructure;
}

export function getGuideStructure(): GuideNode[] {
	return buildGuideIndex();
}

export function getGuideContent(relativePath: string): string | null {
	buildGuideIndex();
	return contentMap.get(relativePath) || null;
}

export function getGuideRealPath(relativePath: string): string | null {
	buildGuideIndex();
	return pathMap.get(relativePath) || null;
}
