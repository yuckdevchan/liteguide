<script lang="ts">
	import { Dialog } from 'bits-ui';
	import Search from '@lucide/svelte/icons/search';
	import { cn } from '$lib/utils.js';
	import type { GuideNode } from '$lib/server/guides.js';

	type FlatItem = {
		title: string;
		path: string;
		breadcrumb: string;
	};

	let {
		open = $bindable(false)
	}: {
		open: boolean;
	} = $props();

	let query = $state('');
	let selectedIndex = $state(0);
	let structure = $state<GuideNode[]>([]);
	let loading = $state(false);

	$effect(() => {
		if (open) {
			query = '';
			selectedIndex = 0;
			if (structure.length === 0) {
				loading = true;
				fetch('/api/guides')
					.then((r) => r.json())
					.then((data) => {
						structure = data;
						loading = false;
					});
			}
		}
	});

	function flattenTree(nodes: GuideNode[], breadcrumb = ''): FlatItem[] {
		const result: FlatItem[] = [];
		for (const node of nodes) {
			if (node.children) {
				result.push(
					...flattenTree(node.children, breadcrumb ? `${breadcrumb} > ${node.title}` : node.title)
				);
			} else {
				result.push({
					title: node.title,
					path: node.path,
					breadcrumb
				});
			}
		}
		return result;
	}

	let items = $derived(flattenTree(structure));

	let filtered = $derived.by(() => {
		if (!query.trim()) return items;
		const q = query.toLowerCase();
		return items.filter(
			(e) => i.title.toLowerCase().includes(q) || i.breadcrumb.toLowerCase().includes(q)
		);
	});

	$effect(() => {
		if (selectedIndex >= filtered.length) {
			selectedIndex = Math.max(0, filtered.length - 1);
		}
	});

	function navigateTo(path: string) {
		open = false;
		query = '';
		window.location.href = `/guides/${path}`;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			const next = selectedIndex + 1;
			if (next < filtered.length) selectedIndex = next;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const prev = selectedIndex - 1;
			if (prev >= 0) selectedIndex = prev;
		} else if (e.key === 'Enter' && filtered[selectedIndex] && !e.isComposing) {
			e.preventDefault();
			navigateTo(filtered[selectedIndex].path);
		}
	}

	function onGlobalKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			open = !open;
		}
	}

	function onCustomToggle() {
		open = !open;
	}
</script>

<svelte:window onkeydown={onGlobalKeydown} />

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50" onclick={() => (open = false)} />
		<Dialog.Content
			class="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 rounded-lg border bg-background shadow-lg"
			onkeydown={handleKeydown}
			oninteractoutside={() => (open = false)}
		>
			<div class="flex items-center border-b px-3">
				<Search class="mr-2 size-4 shrink-0 text-muted-foreground" />
				<!-- svelte-ignore a11y_autofocus -->
				<input
					type="text"
					placeholder="Search guides..."
					class="flex h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
					bind:value={query}
					autofocus
				/>
				<kbd
					class="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex"
				>
					<span class="text-xs">ESC</span>
				</kbd>
			</div>
			<div class="max-h-80 overflow-y-auto p-1">
				{#if loading}
					<div class="py-6 text-center text-sm text-muted-foreground">Loading...</div>
				{:else if filtered.length === 0}
					<div class="py-6 text-center text-sm text-muted-foreground">
						{query ? 'No results found.' : 'No guides available.'}
					</div>
				{:else}
					{#each filtered as item, i}
						<button
							class={cn(
								'flex w-full flex-col gap-0.5 rounded-sm px-3 py-2 text-left text-sm transition-colors',
								i === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
							)}
							onmouseenter={() => (selectedIndex = i)}
							onclick={() => navigateTo(item.path)}
							onpointerdown={(e) => e.stopPropagation()}
						>
							<span class="font-medium">{item.title}</span>
							{#if item.breadcrumb}
								<span class="text-xs text-muted-foreground">{item.breadcrumb}</span>
							{/if}
						</button>
					{/each}
					<div class="border-t px-3 py-1.5 text-xs text-muted-foreground">
						{filtered.length} result{filtered.length === 1 ? '' : 's'}
					</div>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
