let currentSlide = 0;  
const slides = document.querySelectorAll('.slide');  

function showSlide(index) {  
    slides[currentSlide].classList.remove('active');  
    currentSlide = (index + slides.length) % slides.length; 
    slides[currentSlide].classList.add('active');  
}  

setInterval(() => {  
    showSlide(currentSlide + 1);  
}, 5000);  

showSlide(currentSlide);