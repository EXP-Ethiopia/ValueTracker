// Drag selection functionality
let dragSelection = {
    isDragging: false,
    startX: 0,
    startY: 0,
    selectionRect: null,
    selectedBoxes: new Set(),

    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    },

    handleMouseDown(e) {
        if (e.button !== 0) return; // Only left click
        this.isDragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.createSelectionRect();
    },

    createSelectionRect() {
        this.selectionRect = document.createElement('div');
        this.selectionRect.classList.add('selection-rect');
        document.body.appendChild(this.selectionRect);
    },

    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const width = Math.abs(e.clientX - this.startX);
        const height = Math.abs(e.clientY - this.startY);
        
        this.selectionRect.style.width = `${width}px`;
        this.selectionRect.style.height = `${height}px`;
        this.selectionRect.style.left = Math.min(e.clientX, this.startX) + 'px';
        this.selectionRect.style.top = Math.min(e.clientY, this.startY) + 'px';

        // Select boxes within the rectangle
        const boxes = document.querySelectorAll('.box');
        boxes.forEach(box => {
            const boxRect = box.getBoundingClientRect();
            const isSelected = this.isBoxInRect(boxRect);
            
            if (isSelected) {
                this.selectBox(box);
            } else {
                this.deselectBox(box);
            }
        });
    },

    isBoxInRect(boxRect) {
        const selectionRect = this.selectionRect.getBoundingClientRect();
        return (
            boxRect.left >= selectionRect.left &&
            boxRect.right <= selectionRect.right &&
            boxRect.top >= selectionRect.top &&
            boxRect.bottom <= selectionRect.bottom
        );
    },

    selectBox(box) {
        if (!this.selectedBoxes.has(box)) {
            this.selectedBoxes.add(box);
            box.classList.add('selected');
            boxContainer.toggleInArray();
        }
    },

    deselectBox(box) {
        if (this.selectedBoxes.has(box)) {
            this.selectedBoxes.delete(box);
            box.classList.remove('selected');
            boxContainer.toggleInArray();
        }
    },

    handleMouseUp() {
        this.isDragging = false;
        if (this.selectionRect) {
            this.selectionRect.remove();
            this.selectionRect = null;
        }
    }
};
