<script lang="ts">
	import { closeModal } from '$lib/stores/ui';
	import { currentTheme, THEMES } from '$lib/stores/theme';
	import { saveSetting } from '$lib/services/db';
	import type { Theme } from '$lib/types';

	async function selectTheme(themeId: Theme) {
		currentTheme.set(themeId);
		await saveSetting('theme', themeId);
	}
</script>

<div class="modal-overlay" onclick={closeModal} role="dialog" aria-label="Theme wählen">
	<div class="modal-panel" onclick={(e) => e.stopPropagation()} style="max-width: 560px;">
		<div class="modal-header">
			<h2 class="font-bold text-base">🎨 Design-Theme</h2>
			<button class="btn btn-ghost" onclick={closeModal} aria-label="Schließen">✕</button>
		</div>

		<div class="modal-body">
			<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
				{#each THEMES as theme}
					<button
						class="rounded-xl p-4 text-left transition-all"
						style="
							background: {theme.colors.bgCard};
							border: 2px solid {$currentTheme === theme.id ? theme.colors.accentPrimary : theme.colors.border};
							cursor: pointer;
							position: relative;
						"
						onclick={() => selectTheme(theme.id)}
					>
						{#if theme.pro}
							<span
								class="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full font-bold"
								style="background: {theme.colors.accentPrimary}; color: {theme.colors.bgMain};"
							>PRO</span>
						{/if}

						<div class="text-2xl mb-1">{theme.emoji}</div>
						<div class="font-semibold text-sm" style="color: {theme.colors.textMain};">{theme.name}</div>

						<!-- Color preview -->
						<div class="flex gap-1 mt-2">
							<div class="w-4 h-4 rounded-full" style="background: {theme.colors.accentPrimary};"></div>
							<div class="w-4 h-4 rounded-full" style="background: {theme.colors.accentSecondary};"></div>
							<div class="w-4 h-4 rounded-full" style="background: {theme.colors.mustSee};"></div>
						</div>

						{#if $currentTheme === theme.id}
							<div
								class="absolute bottom-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs"
								style="background: {theme.colors.accentPrimary}; color: {theme.colors.bgMain};"
							>✓</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>
