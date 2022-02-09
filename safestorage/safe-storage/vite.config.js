const {defineConfig} = require("vite");
module.exports = defineConfig({
    build: {
        cssCodeSplit: false,
        rollupOptions: {
            output: {
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`
            },
            external: ""
        },
        watch: {
            clearScreen: true,
            buildDelay: 100,
            chokidar: {
                awaitWriteFinish: true,
                useFsEvents: false,
                usePolling: false,
                atomic: 300
            }
        }
    },
})