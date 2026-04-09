// Scroll animations for homepage sections
document.addEventListener('DOMContentLoaded', function() {
  // Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('opacity-0', 'translate-y-20', 'translate-y-10');
        entry.target.classList.add('opacity-100', 'translate-y-0');
        
        // Trigger animations for child elements
        const animatedChildren = entry.target.querySelectorAll('[style*="animation-delay"]');
        animatedChildren.forEach((child, index) => {
          setTimeout(() => {
            child.classList.remove('opacity-0', 'translate-y-10');
            child.classList.add('opacity-100', 'translate-y-0');
          }, index * 100);
        });
      }
    });
  }, observerOptions);

  // Observe sections with animations
  const animatedSections = document.querySelectorAll('.opacity-0');
  animatedSections.forEach(section => {
    observer.observe(section);
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Parallax effect for floating elements
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const floatingElements = document.querySelectorAll('.animate-float');
    
    floatingElements.forEach((element, index) => {
      const speed = 0.5 + (index * 0.1);
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  });
});
