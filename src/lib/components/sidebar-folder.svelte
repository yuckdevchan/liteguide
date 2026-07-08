<script lang="ts" module>
	const STORAGE_KEY = 'sidebar-open-states';

	const RAINBOW = ['#22C55E', '#3B82F6', '#A855F7', '#EF4444', '#F97316', '#EAB308', '#7DD3FC'];
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import SidebarTree from './sidebar-tree.svelte';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import PlusIcon from '@lucide/svelte/icons/plus';

	interface GuideNode {
		title: string;
		slug: string;
		path: string;
		children?: GuideNode[];
	}

	let {
		node,
		depth = 0,
		activePath = ''
	}: {
		node: GuideNode;
		depth?: number;
		activePath?: string;
	} = $props();

	let open = $state(depth === 0 || activePath.startsWith(node.path + '/'));

	function loadSaved() {
		try {
			if (typeof localStorage === 'undefined') return;
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			const saved = JSON.parse(raw);
			if (saved[node.path] !== undefined) {
				open = saved[node.path];
			}
		} catch {}
	}

	function save() {
		try {
			if (typeof localStorage === 'undefined') return;
			const raw = localStorage.getItem(STORAGE_KEY);
			const saved = raw ? JSON.parse(raw) : {};
			saved[node.path] = open;
			localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
		} catch {}
	}

	onMount(loadSaved);

	$effect(() => {
		save();
	});
</script>

<Collapsible.Root bind:open class="group/collapsible">
	<Sidebar.MenuItem>
		<Collapsible.Trigger>
			{#snippet child({ props })}
				<Sidebar.MenuButton {...props} class="overflow-visible!">
					<span class="truncate min-w-0">{node.title}</span>
					<span class="ms-auto flex shrink-0" style="translate: {depth * 1.5}rem 0">
						<PlusIcon class={open ? 'hidden' : ''} />
						<MinusIcon class={open ? '' : 'hidden'} />
					</span>
				</Sidebar.MenuButton>
			{/snippet}
		</Collapsible.Trigger>
		<Collapsible.Content>
			<Sidebar.MenuSub
				class={'border-l-[3px]' + (depth > 0 ? ' ps-3' : '')}
				style="--sidebar-border: {RAINBOW[depth % RAINBOW.length]}"
			>
				<SidebarTree nodes={node.children!} depth={depth + 1} {activePath} />
			</Sidebar.MenuSub>
		</Collapsible.Content>
	</Sidebar.MenuItem>
</Collapsible.Root>
