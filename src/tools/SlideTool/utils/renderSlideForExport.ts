
import { Slide, Theme } from '../types';

export const renderSlideForExport = (slide: Slide, appTheme: Theme): string => {
  const isAppDark = appTheme === 'dark';
  
  // Slide specific colors override app theme defaults
  const slideBgColor = slide.backgroundColor || (isAppDark ? '#1E293B' : '#FFFFFF'); // slate-800 default dark, white default light
  const slideTextColor = slide.textColor || (isAppDark ? '#E2E8F0' : '#1E293B'); // slate-200 default dark, slate-800 default light

  let contentItemsHtml = '';
  slide.content.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('- ')) {
      contentItemsHtml += `<li style="color: ${slideTextColor}; margin-left: 30px; list-style-type: disc; font-size: 22px; line-height: 1.5;">${trimmedLine.substring(2)}</li>`;
    } else if (trimmedLine) {
      contentItemsHtml += `<p style="color: ${slideTextColor}; font-size: 22px; line-height: 1.5; margin-bottom: 10px;">${trimmedLine}</p>`;
    }
  });

  const titleHtml = `<h1 style="color: ${slideTextColor}; font-size: 48px; font-weight: bold; text-align: center; margin-bottom: 30px; word-break: break-word; padding: 0 20px;">${slide.title || "Untitled Slide"}</h1>`;
  const contentHtml = `<div style="text-align: left; width: 100%; max-width: 800px; max-height: 50vh; overflow-y: auto;"><ul>${contentItemsHtml}</ul></div>`;
  const imageHtml = slide.imageUrl ? `<img src="${slide.imageUrl}" alt="${slide.imageDescription || slide.title || 'Slide image'}" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block; margin: auto;" />` : '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#E0E0E0; color:#9E9E9E; font-size:18px;">No Image</div>';

  let layoutStructure = '';

  switch (slide.layout) {
    case 'text-image-right':
      layoutStructure = `
        <div style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: space-between;">
          <div style="width: 48%; display: flex; flex-direction: column; justify-content: center; padding-right:2%;">
            ${titleHtml}
            ${contentHtml}
          </div>
          <div style="width: 48%; height: 80%; display:flex; align-items:center; justify-content:center;">${imageHtml}</div>
        </div>`;
      break;
    case 'text-image-left':
      layoutStructure = `
        <div style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: space-between;">
          <div style="width: 48%; height: 80%; display:flex; align-items:center; justify-content:center;">${imageHtml}</div>
          <div style="width: 48%; display: flex; flex-direction: column; justify-content: center; padding-left:2%;">
            ${titleHtml}
            ${contentHtml}
          </div>
        </div>`;
      break;
    case 'image-only':
      layoutStructure = `<div style="width: 100%; height: 100%; display:flex; align-items:center; justify-content:center;">${imageHtml}</div>`;
      break;
    case 'title-only':
      layoutStructure = `<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width:100%; height:100%;">${titleHtml}</div>`;
      break;
    case 'image-title-overlay':
       // For PDF, overlay might be tricky with html2canvas; simpler to put title below or above.
       // Here, image as background and title on top.
      layoutStructure = `
        <div style="position: relative; width: 100%; height: 100%; display:flex; align-items:center; justify-content:center;">
          ${slide.imageUrl ? `<img src="${slide.imageUrl}" alt="${slide.imageDescription || slide.title || 'Slide image'}" style="position: absolute; top:0; left:0; width: 100%; height: 100%; object-fit: cover; z-index: 1;" />` : ''}
          <div style="position: relative; z-index: 2; background-color: rgba(0,0,0,0.3); padding: 20px; border-radius: 5px;">
             <h1 style="color: #FFFFFF; font-size: 52px; font-weight: bold; text-align: center; margin:0; word-break: break-word;">${slide.title || "Untitled Slide"}</h1>
          </div>
        </div>`;
      break;
    case 'text-only':
    default:
      layoutStructure = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width:100%; height:100%; padding: 0 40px;">
          ${titleHtml}
          ${contentHtml}
        </div>`;
      break;
  }

  return `
    <div style="width: 1280px; height: 720px; background-color: ${slideBgColor}; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; overflow: hidden; position: relative;">
      ${layoutStructure}
    </div>
  `;
};
