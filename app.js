document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('nav button');
    const sections = document.querySelectorAll('.page-section');

    // Плавный скролл при клике на кнопки навигации
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // IntersectionObserver для автоматической подсветки активного пункта меню при скролле
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px', // Срабатывает, когда секция пересекает середину экрана
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Убираем активный класс у всех
                navButtons.forEach(btn => btn.classList.remove('active-nav'));
                // Добавляем текущему видимому блоку
                const activeBtn = document.querySelector(`nav button[data-target="${entry.target.id}"]`);
                if (activeBtn) activeBtn.classList.add('active-nav');
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Логика каталога
    let products = [];
    const grid = document.getElementById('productsGrid');
    const searchInput = document.getElementById('searchInput');

    async function loadProducts() {
        try {
            const response = await fetch('products.json');
            if (!response.ok) throw new Error('Ошибка сети');
            products = await response.json();
            renderProducts(products);
            
            // Инициализация плавающих картинок на фоне всего сайта
            initFloatingBackground(products);
            
        } catch (error) {
            console.error('Ошибка загрузки JSON:', error);
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: #ff4444;">
                    Не удалось загрузить товары. <br>
                    Убедитесь, что сайт запущен через локальный сервер (Live Server).
                </div>`;
        }
    }

    function renderProducts(items) {
        grid.innerHTML = '';
        if (items.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Товары не найдены.</p>';
            return;
        }
        
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'product-card glass-panel';
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="product-image" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxMTEiLz48L3N2Zz4='">
                <h3>${item.name}</h3>
                <div class="product-info">
                    <span class="product-price">${item.price} €</span>
                    <button class="btn-primary" onclick="openModal('Заказ: ${item.name}')">Купить</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Генерация плавающих картинок (теперь по всему экрану)
    function initFloatingBackground(items) {
        const bgContainer = document.getElementById('floating-background');
        if (!bgContainer || items.length === 0) return;

        const imgCount = 15; // Увеличили количество картинок, так как площадь стала больше

        for (let i = 0; i < imgCount; i++) {
            const img = document.createElement('img');
            const randomItem = items[Math.floor(Math.random() * items.length)];
            
            img.src = randomItem.image;
            img.className = 'floating-img';
            
            const size = Math.random() * 90 + 50; // Размер от 50px до 140px
            const leftPos = Math.random() * 95; // Позиция по горизонтали (0 - 95%)
            const duration = Math.random() * 20 + 15; // Длительность полета (15s - 35s)
            const delay = Math.random() * 30; // Отрицательная задержка

            img.style.width = `${size}px`;
            img.style.height = `${size}px`;
            img.style.left = `${leftPos}%`;
            img.style.animationDuration = `${duration}s`;
            img.style.animationDelay = `-${delay}s`;

            img.onerror = function() {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48L3N2Zz4=';
            };

            bgContainer.appendChild(img);
        }
    }

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(term));
        renderProducts(filtered);
    });

    loadProducts();
});

window.openModal = function(titleText = 'Для заказа свяжитесь с нами') {
    document.getElementById('modalTitle').innerText = titleText;
    document.getElementById('modal').classList.add('active');
    document.body.style.overflow = 'hidden'; 
};

window.closeModal = function() {
    document.getElementById('modal').classList.remove('active');
    document.body.style.overflow = ''; 
};

document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) {
        closeModal();
    }
});