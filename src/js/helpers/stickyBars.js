// class StickyBars {
//     constructor(stickies) {
//         this.stickies = Array.from(stickies);
//         this.window = window;
//         this.init();
//     }

//     init() {
       
//         this.window.addEventListener('scroll', () => this.onScroll());
//     }

//     onScroll() {
//         this.stickies.forEach((sticky, i) => {
//             sticky.dataset.pos = sticky.getBoundingClientRect().top + this.window.scrollY;
//             const pos = parseFloat(sticky.dataset.pos);
//             const nextSticky = this.stickies[i + 1];
//             const prevSticky = this.stickies[i - 1];
            
//             if (pos <= this.window.scrollY) {
                
//                 if (nextSticky) {
                    
//                     const nextPos = parseFloat(nextSticky.dataset.pos) - sticky.offsetHeight;

//                     if (sticky.getBoundingClientRect().top >= nextPos) {
//                         sticky.classList.add('--absolute');
//                         sticky.style.top = `${nextPos}px`;
//                     }
//                 }
//             } else {
                
//                 if (prevSticky) {
//                     const prevPos = parseFloat(sticky.dataset.pos) - prevSticky.offsetHeight;

//                     if (this.window.scrollY <= prevPos) {
//                         prevSticky.classList.remove('--absolute');
//                         prevSticky.style.removeProperty('top');
//                     }
//                 }
//             }
//         });
//     }
// }




// const stickyBarElements = document.querySelectorAll('[sticky-bar]');
// if(stickyBarElements.length > 1){
//     new StickyBars(stickyBarElements)
// }