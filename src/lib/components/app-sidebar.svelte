<script lang="ts">
	import { onMount } from 'svelte';
	import SidebarTree from './sidebar-tree.svelte';
	import CommandPalette from './command-palette.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/context.svelte.js';
	import GalleryVerticalEndIcon from '@lucide/svelte/icons/gallery-vertical-end';
	import GithubIcon from '@lucide/svelte/icons/github';
	import SearchIcon from '@lucide/svelte/icons/search';
	import type { ComponentProps } from 'svelte';

	interface GuideNode {
		title: string;
		slug: string;
		path: string;
		children?: GuideNode[];
	}

	const WIDTH_KEY = 'sidebar-pixel-width';
	const MIN_WIDTH = 280;
	const MAX_WIDTH = 640;

	let commandPaletteOpen = $state(false);
	let isResizing = $state(false);

	const sidebar = useSidebar();

	let {
		ref = $bindable(null),
		structure = [] as GuideNode[],
		activePath = '',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		structure?: GuideNode[];
		activePath?: string;
	} = $props();

	function loadWidth(): number | null {
		try {
			if (typeof localStorage === 'undefined') return null;
			const raw = localStorage.getItem(WIDTH_KEY);
			if (!raw) return null;
			return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parseInt(raw, 10)));
		} catch {
			return null;
		}
	}

	function saveWidth(px: number) {
		try {
			if (typeof localStorage === 'undefined') return;
			localStorage.setItem(WIDTH_KEY, String(px));
		} catch {}
	}

	function setWidth(px: number) {
		const rem = px / 16;
		const wrapper = document.querySelector<HTMLElement>('[data-slot="sidebar-wrapper"]');
		if (wrapper) {
			wrapper.style.setProperty('--sidebar-width', `${rem}rem`);
		}
	}

	function handleResizeStart(e: MouseEvent) {
		e.preventDefault();
		isResizing = true;
	}

	function handleResizeMove(e: MouseEvent) {
		if (!isResizing) return;
		const px = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, e.clientX));
		setWidth(px);
	}

	function handleResizeEnd() {
		if (!isResizing) return;
		isResizing = false;
		const wrapper = document.querySelector<HTMLElement>('[data-slot="sidebar-wrapper"]');
		if (wrapper) {
			const computed = getComputedStyle(wrapper).getPropertyValue('--sidebar-width').trim();
			const px = parseFloat(computed) * 16;
			if (!isNaN(px)) saveWidth(Math.round(px));
		}
	}

	onMount(() => {
		const saved = loadWidth();
		if (saved) setWidth(saved);
	});
</script>

<svelte:window onmousemove={handleResizeMove} onmouseup={handleResizeEnd} />

<Sidebar.Root bind:ref {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/" {...props}>
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="text-lg font-bold font-mono text-white">liteguide</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>

			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="default" onclick={() => (commandPaletteOpen = true)}>
					{#snippet child({ props })}
						<button {...props}>
							<SearchIcon class="size-4 mr-2 text-white!" />
							<span class="text-white!">Search</span>
							<kbd
								class="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 px-1.5 font-mono text-[10px] font-medium text-white/60"
							>
								ctrl+k
							</kbd>
						</button>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>

			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="default">
					{#snippet child({ props })}
						<a
							href="https://github.com/yuckdevchan/liteguide"
							target="_blank"
							rel="noreferrer"
							{...props}
						>
							<GithubIcon class="size-4 mr-2 text-white!" />
							<span class="text-white!">Source Code</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content class="flex flex-col overflow-hidden">
		<Sidebar.Group class="relative flex-1 overflow-y-auto">
			<Sidebar.Menu>
				<SidebarTree nodes={structure} {activePath} />
			</Sidebar.Menu>
			<div
				class="pointer-events-none sticky bottom-0 h-6 bg-gradient-to-t from-sidebar to-transparent"
			/>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>

<CommandPalette bind:open={commandPaletteOpen} />

{#if !sidebar.isMobile}
	<div
		class="fixed inset-y-0 z-50 w-1 cursor-col-resize transition-colors select-none touch-none
			{sidebar.state === 'expanded' ? '' : 'hidden'}
			hover:bg-sidebar-border/80 active:bg-sidebar-border/80"
		style="left: calc(var(--sidebar-width) - 4px)"
		onmousedown={handleResizeStart}
		role="separator"
		tabindex={-1}
	/>
{/if}
