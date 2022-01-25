export const server = () => {
    app.plugins.browsersync.init({
        server: {
            baseDir: `${app.path.build.html}`,
        },
        notify: false,
        // browser: 'google chrome',
        port: 3000,
        tunnel: true,
    })
}