class ColorPicker {
    constructor() {
        this.colors = this.generateColorPalette();
    }

    generateColorPalette() {
        // Generate a palette of colors that are visually distinct
        const colors = [];
        const baseColors = [
            ['#FF6B6B', 'Red'],
            ['#4ECDC4', 'Turquoise'],
            ['#45B7D1', 'Blue'],
            ['#96CEB4', 'Mint'],
            ['#FFEEAD', 'Yellow'],
            ['#FF6F61', 'Pink'],
            ['#4ECDC4', 'Cyan'],
            ['#45B7D1', 'Azure'],
            ['#96CEB4', 'Teal'],
            ['#FFEEAD', 'Gold']
        ];

        // Add variations of each base color
        baseColors.forEach(([hex, name]) => {
            colors.push({
                hex,
                name,
                rgb: this.hexToRgb(hex)
            });
        });

        return colors;
    }

    hexToRgb(hex) {
        hex = hex.replace('#', '');
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b, sum: r + g + b };
    }

    createColorOptions() {
        const container = document.createElement('div');
        container.className = 'color-options';

        this.colors.forEach(color => {
            const colorOption = document.createElement('button');
            colorOption.className = 'color-button';
            colorOption.style.backgroundColor = color.hex;
            colorOption.title = color.name;
            colorOption.innerHTML = `
                <span class="color-name">${color.name}</span>
                <span class="color-preview" style="background-color: ${color.hex}"></span>
            `;
            container.appendChild(colorOption);
        });

        return container;
    }

    showColorPicker(callback) {
        const modal = document.createElement('div');
        modal.className = 'color-picker-modal';

        const header = document.createElement('div');
        header.className = 'color-picker-header';
        header.innerHTML = '<h3>Select a Color</h3>';

        const colorOptions = this.createColorOptions();
        colorOptions.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-button')) {
                const color = e.target.style.backgroundColor;
                callback(color);
                modal.remove();
            }
        });

        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.textContent = '×';
        closeButton.onclick = () => modal.remove();

        modal.appendChild(header);
        modal.appendChild(colorOptions);
        modal.appendChild(closeButton);

        document.body.appendChild(modal);
    }
}
