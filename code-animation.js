// Animación de código escribiéndose
(function() {
  'use strict';

  const codeLines = [
    '// Proyecto JK - Innovación en código',
    '',
    '<span class="keyword">class</span> <span class="function">ProyectoJK</span> {',
    '  <span class="keyword">constructor</span>() {',
    '    <span class="keyword">this</span>.<span class="variable">innovacion</span> = <span class="keyword">true</span>;',
    '    <span class="keyword">this</span>.<span class="variable">creatividad</span> = <span class="string">"∞"</span>;',
    '    <span class="keyword">this</span>.<span class="variable">tecnologias</span> = [',
    '      <span class="string">"React"</span>, <span class="string">"Node.js"</span>, <span class="string">"Three.js"</span>',
    '    ];',
    '  }',
    '',
    '  <span class="function">construirProducto</span>() {',
    '    <span class="keyword">const</span> <span class="variable">idea</span> = <span class="keyword">this</span>.<span class="function">capturarVision</span>();',
    '    <span class="keyword">const</span> <span class="variable">prototipo</span> = <span class="keyword">this</span>.<span class="function">diseñarRapido</span>(<span class="variable">idea</span>);',
    '    ',
    '    <span class="comment">// Iteración ágil y entregas frecuentes</span>',
    '    <span class="keyword">while</span> (<span class="variable">prototipo</span>.<span class="variable">mejorando</span>) {',
    '      <span class="keyword">this</span>.<span class="function">iterar</span>(<span class="variable">prototipo</span>);',
    '      <span class="keyword">this</span>.<span class="function">testear</span>(<span class="variable">prototipo</span>);',
    '      <span class="keyword">this</span>.<span class="function">optimizar</span>(<span class="variable">prototipo</span>);',
    '    }',
    '',
    '    <span class="keyword">return</span> <span class="keyword">this</span>.<span class="function">lanzarProducto</span>(<span class="variable">prototipo</span>);',
    '  }',
    '',
    '  <span class="function">lanzarProducto</span>(<span class="variable">producto</span>) {',
    '    <span class="function">console</span>.<span class="function">log</span>(<span class="string">"🚀 Producto lanzado!"</span>);',
    '    <span class="keyword">return</span> {',
    '      <span class="variable">calidad</span>: <span class="string">"premium"</span>,',
    '      <span class="variable">performance</span>: <span class="string">"optimizado"</span>,',
    '      <span class="variable">escalabilidad</span>: <span class="keyword">true</span>',
    '    };',
    '  }',
    '}',
    '',
    '<span class="comment">// Iniciando nuevo proyecto...</span>',
    '<span class="keyword">const</span> <span class="variable">proyecto</span> = <span class="keyword">new</span> <span class="function">ProyectoJK</span>();',
    '<span class="variable">proyecto</span>.<span class="function">construirProducto</span>();'
  ];

  let currentLine = 0;
  let currentChar = 0;
  let isDeleting = false;
  let isPaused = false;

  function initCodeAnimation() {
    const codeElement = document.querySelector('#animated-code code');
    const cursor = document.querySelector('.cursor');
    
    if (!codeElement || !cursor) return;

    function typeCode() {
      if (isPaused) {
        setTimeout(typeCode, 100);
        return;
      }

      const currentLineText = codeLines[currentLine];
      
      if (!isDeleting) {
        // Escribiendo
        if (currentChar <= currentLineText.length) {
          const textToShow = codeLines.slice(0, currentLine).join('\n') + 
                           (currentLine > 0 ? '\n' : '') + 
                           currentLineText.substring(0, currentChar);
          
          codeElement.innerHTML = textToShow;
          currentChar++;
          
          // Velocidad variable según el carácter
          let speed = 50;
          if (currentLineText[currentChar - 1] === ' ') speed = 30;
          if (currentLineText[currentChar - 1] === '\n') speed = 100;
          if (currentLineText.includes('//')) speed = 80; // Comentarios más lentos
          
          setTimeout(typeCode, speed + Math.random() * 50);
        } else {
          // Línea completada
          currentLine++;
          currentChar = 0;
          
          if (currentLine >= codeLines.length) {
            // Animación completada, pausar y reiniciar
            setTimeout(() => {
              currentLine = 0;
              currentChar = 0;
              codeElement.innerHTML = '';
              setTimeout(typeCode, 2000);
            }, 3000);
          } else {
            setTimeout(typeCode, 200); // Pausa entre líneas
          }
        }
      }
    }

    // Posicionar cursor
    function updateCursor() {
      const codeRect = codeElement.getBoundingClientRect();
      const lines = codeElement.innerHTML.split('\n');
      const currentLineIndex = Math.min(currentLine, lines.length - 1);
      
      // Calcular posición aproximada del cursor
      const lineHeight = 22;
      const charWidth = 8.4;
      
      cursor.style.top = (currentLineIndex * lineHeight + 5) + 'px';
      
      if (lines[currentLineIndex]) {
        // Remover tags HTML para calcular posición real
        const cleanLine = lines[currentLineIndex].replace(/<[^>]*>/g, '');
        cursor.style.left = (Math.min(currentChar, cleanLine.length) * charWidth + 5) + 'px';
      }
    }

    // Actualizar cursor cada frame
    setInterval(updateCursor, 100);

    // Pausar animación cuando no está visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isPaused = !entry.isIntersecting;
      });
    });

    observer.observe(codeElement);

    // Iniciar animación
    setTimeout(typeCode, 1000);
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeAnimation);
  } else {
    initCodeAnimation();
  }
})();
