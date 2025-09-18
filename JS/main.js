// Ruta al audio
const clickSound = new Audio("../AUDIO/click.mp3");
clickSound.preload = "auto"; 
clickSound.volume = 1.0; // asegúrate que no está en mute

// Función delay
const wait = (ms) => new Promise(r => setTimeout(r, ms));

document.querySelectorAll("nav a").forEach(link => {
  link.addEventListener("click", async (e) => {
    e.preventDefault(); // detener navegación inmediata
    const href = link.getAttribute("href");

    try {
      clickSound.currentTime = 0;
      await clickSound.play();
      console.log("🔊 Sonido reproducido");
    } catch (err) {
      console.warn("⚠️ No se pudo reproducir el audio:", err);
    }

    // Espera 800ms para que se escuche antes de navegar
    await wait(800);
    window.location.href = href;
  });
});


/* ==== Staggered reveal: curriculum items one-by-one in visual order ==== */
(function(){
  const section = document.querySelector('#curriculum');
  if (!section) return;

  // recoge todas las tarjetas dentro del curriculum
  const items = Array.from(section.querySelectorAll('.item'));
  if (!items.length) return;

  // cuando la sección entre en vista, ordena por posición visual (top, left)
  function revealItems() {
    const ordered = items
      .map(el => {
        const rect = el.getBoundingClientRect();
        // coordenadas relativas al documento
        const top = rect.top + window.scrollY;
        const left = rect.left + window.scrollX;
        return { el, top, left };
      })
      .sort((a, b) => {
        // si están en la misma fila (diferencia < 12px) ordenar por left
        if (Math.abs(a.top - b.top) < 12) return a.left - b.left;
        return a.top - b.top;
      });

    const baseDelay = 120; // ms antes de la primera tarjeta
    const step = 200;      // ms entre tarjetas (ajustable)

    ordered.forEach((obj, i) => {
      // aplicar delay en línea y añadir clase que dispara la animación
      obj.el.style.animationDelay = `${baseDelay + step * i}ms`;
      // force reflow no estrictamente necesario pero evita glitches:
      // void obj.el.offsetWidth;
      obj.el.classList.add('animate');
    });
  }

  // Observador: revela cuando la sección curriculum entra en viewport
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealItems();
        obs.disconnect(); // solo una vez
      }
    });
  }, { threshold: 0.18 });

  observer.observe(section);
})();


/* ==== Animación de intereses con caída + shake ==== */
(function(){
  const intereses = document.querySelectorAll('.sobremi .interes');
  if (!intereses.length) return;

  function revealIntereses() {
    intereses.forEach((el, i) => {
      el.style.animationDelay = `${i * 180}ms`; // escalonado
      el.classList.add('animate');
    });
  }

  const section = document.querySelector('#sobremi');
  if (section) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealIntereses();
          obs.disconnect();
        }
      });
    }, { threshold: 0.2 });

    observer.observe(section);
  }
})();

/* ==== reveal secuencial para portafolio (añadir al main.js) ==== */
(function(){
  const proyectos = Array.from(document.querySelectorAll('.portafolio .proyecto'));
  if (!proyectos.length) return;

  function reveal() {
    proyectos.forEach((el, i) => {
      el.style.animationDelay = `${i * 120}ms`;
      el.classList.add('animate');
    });
  }

  const section = document.querySelector('#portafolio');
  if (!section) return;
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        reveal();
        o.disconnect();
      }
    });
  }, { threshold: 0.18 });

  obs.observe(section);
})();


/* === Notificación de contacto — reemplaza el bloque anterior === */
(function(){
  function initNotification() {
    const form = document.querySelector('#contactForm') || document.querySelector('.contacto form');
    let notificacion = document.getElementById('notificacion');

    if (!form) {
      console.warn('[notify] Formulario no encontrado (selector #contactForm o .contacto form).');
      return;
    }

    // Si por alguna razón no existe el div #notificacion lo creamos como fallback
    if (!notificacion) {
      notificacion = document.createElement('div');
      notificacion.id = 'notificacion';
      notificacion.className = 'notificacion';
      notificacion.textContent = '¡Sumercé lo ha enviado!';
      document.body.appendChild(notificacion);
      console.info('[notify] Elemento #notificacion creado dinámicamente como fallback.');
    }

    // A11y
    notificacion.setAttribute('role', 'status');
    notificacion.setAttribute('aria-live', 'polite');
    notificacion.setAttribute('aria-hidden', 'true');

    let hideTimeout = null;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Limpia timeouts previos
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      // Reinicia la animación (remove -> reflow -> add)
      notificacion.classList.remove('mostrar');
      // fuerza reflow para asegurar animación en todos los navegadores
      void notificacion.offsetWidth;
      notificacion.classList.add('mostrar');
      notificacion.setAttribute('aria-hidden', 'false');

      // Fallback: si por CSS algo lo oculta, también forzamos estilos inline (opcional)
      notificacion.style.transform = 'translateY(0)';
      notificacion.style.opacity = '1';
      notificacion.style.pointerEvents = 'auto';

      // Sonido de confirmación (opcional, si existe el archivo)
      try {
        if (!window._notifyClickSound) {
          window._notifyClickSound = new Audio('../AUDIO/click.mp3');
          window._notifyClickSound.preload = 'auto';
        }
        window._notifyClickSound.currentTime = 0;
        // play puede fallar si el navegador bloquea autoplay; lo atrapamos
        window._notifyClickSound.play().catch(()=>{/* silencio si bloqueo */});
      } catch (err) {
        console.warn('[notify] Error audio', err);
      }

      // Ocultar después de 3s
      hideTimeout = setTimeout(() => {
        notificacion.classList.remove('mostrar');
        notificacion.setAttribute('aria-hidden', 'true');

        // revertimos estilos inline (por si usamos fallback inline)
        notificacion.style.transform = '';
        notificacion.style.opacity = '';
        notificacion.style.pointerEvents = '';

        hideTimeout = null;
      }, 3000);

      // Resetea formulario sin errores
      try { form.reset(); } catch (err) { console.warn('[notify] form.reset fallo', err); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotification);
  } else {
    initNotification();
  }
})();
