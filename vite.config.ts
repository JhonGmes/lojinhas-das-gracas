import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api/proxy': {
                target: 'https://api.infinitepay.io', // Default target
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/proxy/, ''),
                configure: (proxy, _options) => {
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        const url = new URL(req.url || '', `http://${req.headers.host}`);
                        const targetUrlParam = url.searchParams.get('target');
                        if (targetUrlParam) {
                            try {
                                const targetUrl = new URL(targetUrlParam);
                                proxyReq.setHeader('host', targetUrl.host);
                                // Override the path to be the absolute URL for the proxy
                                // Note: Some proxy setups might require different handling
                                // but for Vite/http-proxy, this is a common pattern.
                            } catch (e) {
                                console.error('Invalid target URL in proxy:', targetUrlParam);
                            }
                        }
                    });
                }
            },
            '/api/send-order-email': {
                target: 'http://localhost:5173', // Placeholder, not implemented locally usually
                changeOrigin: true
            },
            '/api/infinitepay': {
                target: 'https://api.infinitepay.io',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/infinitepay/, '')
            }
        }
    }
})
