import React from "react";

// Small inline script to set theme class before React hydrates.
// Keeps default at system if no user preference exists.
const themeInitScript = `(function(){try{var theme=localStorage.getItem('theme');if(theme==='system'){theme=null;}if(theme){document.documentElement.classList.add(theme);document.documentElement.style.colorScheme = theme;}else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.add('light');document.documentElement.style.colorScheme='light';}}catch(e){}})();`;

export default function Head() {
  return (
    <>
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
    </>
  );
}
