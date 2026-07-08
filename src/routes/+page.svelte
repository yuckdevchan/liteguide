<script lang="ts">
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	let { data } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar structure={data.structure} />
	<Sidebar.Inset>
		<div class="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
			<h1 class="text-3xl font-bold font-mono text-white">learn computers</h1>
			<p class="text-muted-foreground">Select a guide from the sidebar or click below.</p>
			<Button href="/guides/learn-computers/home" class="text-black!">Home</Button>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
