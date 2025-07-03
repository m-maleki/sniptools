
window.App = window.App || {};

document.addEventListener('DOMContentLoaded', () => {
    const App = window.App;

    App.initNavigation = () => {
        const navButtons = {
            jwt: document.getElementById('nav-jwt'),
            json: document.getElementById('nav-json'),
            crypto: document.getElementById('nav-crypto'),
            password: document.getElementById('nav-password'),
            diff: document.getElementById('nav-diff'),
            url: document.getElementById('nav-url'),
            units: document.getElementById('nav-units'),
            uuid: document.getElementById('nav-uuid')
        };
        const views = {
            jwt: document.getElementById('view-jwt'),
            json: document.getElementById('view-json'),
            crypto: document.getElementById('view-crypto'),
            password: document.getElementById('view-password'),
            diff: document.getElementById('view-diff'),
            url: document.getElementById('view-url'),
            units: document.getElementById('view-units'),
            uuid: document.getElementById('view-uuid')
        };

        const switchView = (viewName) => {
            Object.values(views).forEach(v => v && v.classList.add('hidden'));
            document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

            if (views[viewName]) {
                views[viewName].classList.remove('hidden');
            }
            const activeNavButton = document.querySelector(`.nav-item[data-view="${viewName}"]`);
            if (activeNavButton) {
                activeNavButton.classList.add('active');
            }

            const initFunctionName = `init${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`;
            if (typeof App[initFunctionName] === 'function') {
                App[initFunctionName]();
            }
        };

        const handleHashChange = () => {
            const hash = window.location.hash.substring(1);
            const viewToLoad = (hash && views[hash]) ? hash : 'jwt';
            switchView(viewToLoad);
        };

        window.addEventListener('hashchange', handleHashChange);
        
        Object.keys(navButtons).forEach(key => {
            const navButton = navButtons[key];
            if (navButton) {
                navButton.addEventListener('click', () => {
                    window.location.hash = key;
                });
            }
        });

        handleHashChange();
    };

    App.initNavigation();
});
