<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster />

<svelte:head
	><link rel="icon" href="/favicon.svg" />
	<title>liteguide</title>
	<meta name="color-scheme" content="dark light" />
	<meta name="title" content="liteguide" />
	<meta name="description" content="LEARN EVERYTHING ABT COMPUTERS SUPER FAST + FUN" />
	
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://liteguide.vercel.app/" />
	<meta property="og:title" content="liteguide" />
	<meta property="og:description" content="LEARN EVERYTHING ABT COMPUTERS SUPER FAST + FUN" />
	<meta property="og:image" content="/banner.webp" />

	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://liteguide.vercel.app/" />
	<meta property="twitter:title" content="liteguide" />
	<meta property="twitter:description" content="LEARN EVERYTHING ABT COMPUTERS SUPER FAST + FUN" />
</svelte:head>
{@render children()}
