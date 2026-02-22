import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	optimizeDeps: {
		// Leaflet and AntPath must be excluded from SSR
		exclude: ['leaflet', 'leaflet-ant-path']
	}
});
