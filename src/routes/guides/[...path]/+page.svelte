<script lang="ts">
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import TableOfContents from '$lib/components/table-of-contents.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Copy from '@lucide/svelte/icons/copy';

	let { data } = $props();

	let html = $derived.by(() => {
		let currentHtml = data.html || '';
		currentHtml = currentHtml.replaceAll(
			'(i)',
			'<svg style="display: inline" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hotpink" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
		);
		currentHtml = currentHtml.replaceAll(
			'(e)',
			'<svg style="display: inline" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fce40a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lightbulb-icon lucide-lightbulb"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>'
		);
		currentHtml = currentHtml.replaceAll(
			'(w)',
			'<svg style="display: inline" class="h-5 w-5 -translate-y-0.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert-icon lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
		);
		return currentHtml;
	});
</script>

<svelte:head>
	<title>{data.title} - liteguide</title>
</svelte:head>

<Sidebar.Provider>
	<AppSidebar structure={data.structure} activePath={data.path} />
	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
			<Sidebar.Trigger class="-ms-1" />
			<Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4" />
			<Breadcrumb.Root>
				<Breadcrumb.List>
					{@const parts = data.path.split('/')}
					{#each data.breadcrumbs as crumb, i}
						{#if i > 0}<Breadcrumb.Separator class="hidden md:block" />{/if}
						<Breadcrumb.Item>
							{#if i < parts.length - 1}
								{crumb}
							{:else}
								<Breadcrumb.Page>{data.title}</Breadcrumb.Page>
							{/if}
						</Breadcrumb.Item>
					{/each}
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</header>
		<div class="flex flex-1 gap-4 p-4">
			<div class="mx-auto w-full min-w-0 max-w-4xl gap-3 flex flex-col">
				<div class="flex justify-between gap-4 flex-row items-center">
					<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
						{data.title}
					</h1>
					<div class="flex gap-3 items-center">
						<Button variant="ghost" class="rounded-full">
							<Copy class="h-4 w-4" />
						</Button>
						<Button variant="outline" class="rounded-full" href={data.sourceUrl} target="_blank"
							><Pencil class="h-4 w-4" />edit this page</Button
						>
					</div>
				</div>
				<div class="prose prose-lg dark:prose-invert">
					{@html html}
				</div>
				<span class="text-zinc-600 font-bold"
					><a href="https://github.com/yuckdevchan/liteguide/blob/main/LICENSE">License: GPLv3</a
					></span
				>
			</div>
			{#if data.headings.length > 0}
				<TableOfContents headings={data.headings} />
			{/if}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
