export  function htmlBuilder(elements, parent) {
    const listOfElements = [];
    const fragment = document.createDocumentFragment();
  
    elements.forEach((element) => {
      const tagObject = document.createElement(element.tag);
      const entries = Object.entries(element);
  
      entries.forEach(([key, value]) => {
        switch (key) {
          case "class":
            tagObject.className = value;
            break;
          case "text":
            tagObject.innerHTML = value;
            break;
          case "style":
            Object.entries(value).forEach(([styleKey, styleValue]) => {
              tagObject.style[styleKey] = styleValue;
            });
            break;
          case "attributes":
            Object.entries(value).forEach(([attrKey, attrValue]) => {
              tagObject.setAttribute(attrKey, attrValue);
            });
            break;
          case "colspan":
            tagObject.colSpan = value;
            break;
          case "children":
            htmlBuilder(value, tagObject);
            break;
        }
      });
  
      if (parent === undefined) {
        listOfElements.push(tagObject);
      } else {
        fragment.appendChild(tagObject);
      }
    });
  
    if (parent !== undefined) {
      parent.appendChild(fragment);
    }
  
    return listOfElements;
  }