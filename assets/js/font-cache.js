(function applyEarlyFontCache() {
      try {
        const raw = localStorage.getItem('notelab_font_settings_cache');
        if (!raw) return;
        const cfg = JSON.parse(raw);
        const root = document.documentElement;
        const stacks = {
          'system': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          'Times New Roman': '"Times New Roman", Times, Georgia, serif',
          'Inter': '"Inter", system-ui, -apple-system, sans-serif',
          'Roboto': '"Roboto", system-ui, -apple-system, sans-serif',
          'Noto Sans': '"Noto Sans", system-ui, -apple-system, sans-serif',
          'Be Vietnam Pro': '"Be Vietnam Pro", system-ui, -apple-system, sans-serif',
          'Source Sans 3': '"Source Sans 3", system-ui, -apple-system, sans-serif',
          'Merriweather': '"Merriweather", "Times New Roman", Georgia, serif',
          'Lora': '"Lora", "Times New Roman", Georgia, serif',
          'Noto Serif': '"Noto Serif", "Times New Roman", Georgia, serif',
          'JetBrains Mono': '"JetBrains Mono", Consolas, monospace',
          'Fira Code': '"Fira Code", Consolas, monospace',
          'Source Code Pro': '"Source Code Pro", Consolas, monospace',
          'IBM Plex Mono': '"IBM Plex Mono", Consolas, monospace'
        };
        const googleFonts = new Set([
          'Inter', 'Roboto', 'Noto Sans', 'Be Vietnam Pro', 'Source Sans 3',
          'Merriweather', 'Lora', 'Noto Serif',
          'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono'
        ]);
        const buildFamily = (groupCfg, defaultFallback) => {
          if (!groupCfg) return defaultFallback;
          const presetStack = stacks[groupCfg.preset] || defaultFallback;
          const custom = (groupCfg.custom || '').trim().replace(/["']/g, '');
          if (custom) return `"${custom}", ${presetStack}`;
          return presetStack;
        };
        const ensureGoogleFont = (fontName) => {
          if (!googleFonts.has(fontName)) return;
          const id = 'gf-' + fontName.toLowerCase().replace(/\s+/g, '-');
          if (document.getElementById(id)) return;
          const link = document.createElement('link');
          link.id = id;
          link.rel = 'stylesheet';
          link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fontName) + ':ital,wght@0,400;0,600;0,700;1,400&display=swap';
          document.head.appendChild(link);
        };
        ['ui', 'editor', 'preview', 'code'].forEach((k) => {
          if (cfg[k] && cfg[k].preset) ensureGoogleFont(cfg[k].preset);
        });
        if (cfg.ui) {
          root.style.setProperty('--font-ui', buildFamily(cfg.ui, stacks['Times New Roman']));
          root.style.setProperty('--size-ui', (cfg.ui.size || 15) + 'px');
          root.style.setProperty('--lh-ui', String(cfg.ui.lh || 1.55));
        }
        if (cfg.editor) {
          root.style.setProperty('--font-editor', buildFamily(cfg.editor, stacks['Times New Roman']));
          root.style.setProperty('--size-editor', (cfg.editor.size || 17) + 'px');
          root.style.setProperty('--lh-editor', String(cfg.editor.lh || 1.7));
        }
        if (cfg.preview) {
          root.style.setProperty('--font-preview', buildFamily(cfg.preview, stacks['Times New Roman']));
          root.style.setProperty('--size-preview', (cfg.preview.size || 17) + 'px');
          root.style.setProperty('--lh-preview', String(cfg.preview.lh || 1.75));
          if (cfg.preview.fullWidth) {
            root.style.setProperty('--note-content-max-width', '100%');
          } else if (cfg.preview.maxWidth) {
            root.style.setProperty('--note-content-max-width', cfg.preview.maxWidth + 'px');
          }
        }
        if (cfg.code) {
          root.style.setProperty('--font-code', buildFamily(cfg.code, stacks['JetBrains Mono']));
          root.style.setProperty('--size-code', (cfg.code.size || 14) + 'px');
          root.style.setProperty('--lh-code', String(cfg.code.lh || 1.5));
        }
      } catch (e) {
        console.warn('Không thể nạp cache font sớm:', e);
      }
    })();
