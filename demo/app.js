const CANVAS_WIDTH = 1242;
const CANVAS_HEIGHT = 1660;
const COVER_TITLE_BOX_WIDTH = 950;
const BODY_MAX_WIDTH = 1024;
const BODY_FONT_SIZE = 56;
const BODY_LINE_HEIGHT = 90;
const BODY_PARAGRAPH_SPACING = 42;
const BODY_TOP = 220;
const BODY_BOTTOM = 1492;
const READING_SPEED = 430;
const TITLE_CHAR_LIMIT = 18;
const STORAGE_KEY = "xhs-editorial-studio-demo-v1";

const sampleData = {
  title: "真正厉害的人，往往这样写内容",
  meta: "全文 1380 字 | 阅读约 4 分钟",
  article: `很多人写内容时，容易一上来就把所有观点一次性倒出来，所以最后看起来像一段很长的说明书，而不是一组愿意被读完、愿意被转发的图文。

真正适合小红书的表达，不是把文章切碎，而是把阅读节奏重新设计。封面负责让人停下来，第一页负责把问题说清楚，后面几页负责层层推进，让读者在每一张图里都有继续往下翻的理由。

如果你要做的是知识类图文，最重要的不是词藻，而是结构。先确定读者为什么要看，再决定每一页要承担什么任务。有人负责抛问题，有人负责解释误区，有人负责给方法，有人负责收束结论。

把这种结构做成一个工具，会比每次手工排版省很多时间。用户只需要输入标题、导语和正文，工具就应该自动分页、自动预览，并且支持导出成一组可以直接发布的图片。

这也是这个 demo 的目的。它不是一个大型系统，而是一个可公开部署、可继续扩展、可直接交给普通用户使用的小工具骨架。`
};

const state = {
  pages: [],
  backgroundColor: "#f7efe3",
  backgroundImage: null,
  backgroundImageName: "",
  overlayOpacity: 0.42
};

const refs = {
  titleInput: document.getElementById("titleInput"),
  metaInput: document.getElementById("metaInput"),
  articleInput: document.getElementById("articleInput"),
  backgroundColorInput: document.getElementById("backgroundColorInput"),
  backgroundImageInput: document.getElementById("backgroundImageInput"),
  backgroundImageNameLabel: document.getElementById("backgroundImageNameLabel"),
  overlayOpacityInput: document.getElementById("overlayOpacityInput"),
  overlayOpacityValue: document.getElementById("overlayOpacityValue"),
  backgroundStatus: document.getElementById("backgroundStatus"),
  clearBackgroundImageButton: document.getElementById("clearBackgroundImageButton"),
  swatchRow: document.getElementById("swatchRow"),
  generateButton: document.getElementById("generateButton"),
  downloadAllButton: document.getElementById("downloadAllButton"),
  previewGrid: document.getElementById("previewGrid"),
  pageMeta: document.getElementById("pageMeta")
};

function loadSample() {
  refs.titleInput.value = sampleData.title;
  refs.metaInput.value = sampleData.meta;
  refs.articleInput.value = sampleData.article;
}

function limitDisplayChars(text, maxChars) {
  return Array.from(text).slice(0, maxChars).join("");
}

function enforceTitleLimit() {
  const limited = limitDisplayChars(refs.titleInput.value, TITLE_CHAR_LIMIT);
  if (limited !== refs.titleInput.value) {
    refs.titleInput.value = limited;
  }
}

function savePersistedState() {
  const payload = {
    title: refs.titleInput.value,
    meta: refs.metaInput.value,
    article: refs.articleInput.value,
    backgroundColor: state.backgroundColor,
    overlayOpacity: state.overlayOpacity,
    backgroundImageName: state.backgroundImageName,
    backgroundImageDataUrl: state.backgroundImage?.src || ""
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Persist state failed.", error);
  }
}

function loadPersistedState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Load persisted state failed.", error);
    return null;
  }
}

function countChineseFriendlyChars(text) {
  return text.replace(/\s+/g, "").length;
}

function getReadingMinutes(text) {
  return Math.max(1, Math.ceil(countChineseFriendlyChars(text) / READING_SPEED));
}

function buildMetaLine(meta, article) {
  const trimmed = meta.trim();
  if (trimmed) {
    return trimmed;
  }

  const charCount = countChineseFriendlyChars(article);
  const minutes = getReadingMinutes(article);
  return `全文 ${charCount} 字 | 阅读约 ${minutes} 分钟`;
}

function normalizeTitle(rawTitle, rawArticle) {
  const title = limitDisplayChars(rawTitle.trim(), TITLE_CHAR_LIMIT);
  if (title) {
    return title;
  }

  const lines = rawArticle
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return limitDisplayChars(lines[0] || "未命名标题", TITLE_CHAR_LIMIT);
}

function normalizeArticle(rawArticle, title) {
  const text = rawArticle.replace(/\r/g, "").trim();
  if (!text) {
    return "";
  }

  if (text.startsWith(title)) {
    return text.slice(title.length).trim();
  }

  return text;
}

function splitLongParagraph(paragraph) {
  if (paragraph.length <= 150) {
    return [paragraph];
  }

  const sentences = paragraph.match(/[^。！？!?]+[。！？!?]?/g) || [paragraph];
  const chunks = [];
  let current = "";

  sentences.forEach((sentence) => {
    if ((current + sentence).length > 120 && current) {
      chunks.push(current.trim());
      current = sentence;
      return;
    }

    current += sentence;
  });

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

function splitParagraphs(article) {
  const byBlankLines = article
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (byBlankLines.length > 1) {
    return byBlankLines;
  }

  return article
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .flatMap((part) => splitLongParagraph(part));
}

function buildTeaser(paragraphs) {
  const joined = paragraphs.join(" ").replace(/\s+/g, "");
  if (joined.length <= 110) {
    return joined;
  }

  return `${joined.slice(0, 110)}……`;
}

function createMeasureContext() {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  return canvas.getContext("2d");
}

function wrapText(context, text, maxWidth) {
  const lines = [];
  let current = "";

  for (const char of text) {
    const testLine = current + char;
    if (context.measureText(testLine).width <= maxWidth || !current) {
      current = testLine;
      continue;
    }

    lines.push(current);
    current = char;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function paginateBody(paragraphs, title) {
  const context = createMeasureContext();
  context.font = `400 ${BODY_FONT_SIZE}px "Songti SC", "STSong", "Noto Serif SC", serif`;

  const pages = [];
  let currentPage = [];
  let currentHeight = BODY_TOP;
  const freshPageLineCapacity = Math.floor(
    (BODY_BOTTOM - BODY_TOP - BODY_PARAGRAPH_SPACING) / BODY_LINE_HEIGHT
  );

  function flushPage() {
    if (currentPage.length === 0) {
      currentHeight = BODY_TOP;
      return;
    }

    pages.push(currentPage);
    currentPage = [];
    currentHeight = BODY_TOP;
  }

  paragraphs.forEach((paragraph) => {
    const lines = wrapText(context, paragraph, BODY_MAX_WIDTH);
    let cursor = 0;

    while (cursor < lines.length) {
      const availableHeight = BODY_BOTTOM - currentHeight - BODY_PARAGRAPH_SPACING;
      let availableLines = Math.floor(availableHeight / BODY_LINE_HEIGHT);

      if (availableLines <= 0) {
        flushPage();
        availableLines = freshPageLineCapacity;
      }

      const takeCount = Math.max(1, Math.min(lines.length - cursor, availableLines));
      currentPage.push({
        type: "paragraph",
        lines: lines.slice(cursor, cursor + takeCount)
      });
      currentHeight += takeCount * BODY_LINE_HEIGHT + BODY_PARAGRAPH_SPACING;
      cursor += takeCount;

      if (cursor < lines.length) {
        flushPage();
      }
    }
  });

  flushPage();

  return pages.map((content) => ({
    type: "body",
    title,
    content
  }));
}

function fitTitle(context, title) {
  const sizes = [182, 168, 154, 142, 130, 120];

  for (const size of sizes) {
    context.font = `700 ${size}px "Iowan Old Style", "Baskerville", "Songti SC", "STSong", serif`;
    const lines = wrapText(context, title, COVER_TITLE_BOX_WIDTH);
    if (lines.length <= 4) {
      return { size, lines };
    }
  }

  context.font = `700 120px "Iowan Old Style", "Baskerville", "Songti SC", "STSong", serif`;
  return { size: 120, lines: wrapText(context, title, COVER_TITLE_BOX_WIDTH).slice(0, 4) };
}

function clampChannel(value) {
  return Math.max(0, Math.min(255, value));
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const safeHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;

  return {
    r: Number.parseInt(safeHex.slice(0, 2), 16),
    g: Number.parseInt(safeHex.slice(2, 4), 16),
    b: Number.parseInt(safeHex.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (value) => clampChannel(value).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lightenHex(hex, amount) {
  const rgb = hexToRgb(hex);
  return rgbToHex({ r: rgb.r + amount, g: rgb.g + amount, b: rgb.b + amount });
}

function darkenHex(hex, amount) {
  const rgb = hexToRgb(hex);
  return rgbToHex({ r: rgb.r - amount, g: rgb.g - amount, b: rgb.b - amount });
}

function hexToRgba(hex, alpha) {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function drawImageCover(context, image) {
  const imageRatio = image.width / image.height;
  const canvasRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
  let drawWidth;
  let drawHeight;
  let offsetX;
  let offsetY;

  if (imageRatio > canvasRatio) {
    drawHeight = CANVAS_HEIGHT;
    drawWidth = drawHeight * imageRatio;
    offsetX = (CANVAS_WIDTH - drawWidth) / 2;
    offsetY = 0;
  } else {
    drawWidth = CANVAS_WIDTH;
    drawHeight = drawWidth / imageRatio;
    offsetX = 0;
    offsetY = (CANVAS_HEIGHT - drawHeight) / 2;
  }

  context.save();
  context.globalAlpha = 0.56;
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  context.restore();
}

function drawBackground(context) {
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const gradient = context.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  gradient.addColorStop(0, lightenHex(state.backgroundColor, 16));
  gradient.addColorStop(0.55, state.backgroundColor);
  gradient.addColorStop(1, darkenHex(state.backgroundColor, 8));

  if (state.backgroundImage) {
    drawImageCover(context, state.backgroundImage);
    context.fillStyle = `rgba(255, 253, 248, ${state.overlayOpacity})`;
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  } else {
    context.save();
    context.globalAlpha = Math.max(0.08, state.overlayOpacity);
    context.fillStyle = gradient;
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.restore();

    const glow = context.createRadialGradient(1030, 160, 0, 1030, 160, 320);
    glow.addColorStop(
      0,
      hexToRgba(lightenHex(state.backgroundColor, 6), Math.min(0.8, state.overlayOpacity + 0.18))
    );
    glow.addColorStop(1, hexToRgba(state.backgroundColor, 0));
    context.fillStyle = glow;
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  context.strokeStyle = "rgba(24, 24, 24, 0.08)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(86, 166);
  context.lineTo(CANVAS_WIDTH - 86, 166);
  context.stroke();
}

function drawCover(context, page) {
  drawBackground(context);

  context.fillStyle = "#8a857b";
  context.font = '500 30px "Avenir Next", "PingFang SC", sans-serif';
  context.textBaseline = "top";
  context.fillText(page.meta, 84, 108);

  const titleLayout = fitTitle(context, page.title);
  const startY = 320;
  const highlightHeight = Math.max(26, titleLayout.size * 0.2);
  const lineHeight = titleLayout.size * 1.26;

  context.font = `700 ${titleLayout.size}px "Iowan Old Style", "Baskerville", "Songti SC", "STSong", serif`;

  titleLayout.lines.forEach((line, index) => {
    const y = startY + index * lineHeight;
    const width = context.measureText(line).width;
    context.fillStyle = "rgba(210, 210, 210, 0.48)";
    context.fillRect(84, y + titleLayout.size * 0.8, width + 26, highlightHeight);
    context.fillStyle = "#191919";
    context.fillText(line, 84, y);
  });

  context.fillStyle = "#222222";
  context.font = '400 56px "Songti SC", "STSong", "Noto Serif SC", serif';
  const teaserLines = wrapText(context, page.teaser, 1040).slice(0, 4);
  const titleBlockBottom =
    startY + (titleLayout.lines.length - 1) * lineHeight + titleLayout.size * 1.12;
  let teaserY = Math.max(1160, titleBlockBottom + 110);

  teaserLines.forEach((line) => {
    context.fillText(line, 84, teaserY);
    teaserY += 92;
  });
}

function drawBody(context, page) {
  drawBackground(context);

  context.fillStyle = "#8a857b";
  context.font = '600 26px "Avenir Next", "PingFang SC", sans-serif';
  context.textBaseline = "top";
  context.fillText(page.title, 84, 108);

  context.fillStyle = "#191919";
  context.font = '400 56px "Songti SC", "STSong", "Noto Serif SC", serif';
  let cursorY = BODY_TOP;

  page.content.forEach((paragraph) => {
    paragraph.lines.forEach((line) => {
      context.fillText(line, 84, cursorY);
      cursorY += BODY_LINE_HEIGHT;
    });
    cursorY += BODY_PARAGRAPH_SPACING;
  });
}

function renderEmptyState(message) {
  refs.previewGrid.innerHTML = "";
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = message;
  refs.previewGrid.appendChild(empty);
}

function sanitizeFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, "-").slice(0, 40) || "xhs-post";
}

function downloadCanvas(canvas, pageNumber) {
  const link = document.createElement("a");
  const title = sanitizeFileName(refs.titleInput.value || "xhs-post");
  link.href = canvas.toDataURL("image/png");
  link.download = `${title}-${String(pageNumber).padStart(2, "0")}.png`;
  link.click();
}

function wait(duration) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

async function downloadAll() {
  const canvases = refs.previewGrid.querySelectorAll("canvas");
  if (canvases.length === 0) {
    return;
  }

  for (let index = 0; index < canvases.length; index += 1) {
    downloadCanvas(canvases[index], index + 1);
    await wait(180);
  }
}

function setBackgroundStatus() {
  refs.overlayOpacityValue.textContent = `${Math.round(state.overlayOpacity * 100)}%`;

  if (state.backgroundImageName) {
    refs.backgroundStatus.textContent = `当前背景图：${state.backgroundImageName}`;
    refs.backgroundImageNameLabel.textContent = state.backgroundImageName;
    return;
  }

  refs.backgroundStatus.textContent = `当前纯色背景：${state.backgroundColor}`;
  refs.backgroundImageNameLabel.textContent = "未选择图片";
}

function syncSwatches() {
  const buttons = refs.swatchRow.querySelectorAll(".swatch-button");
  buttons.forEach((button) => {
    const isActive = button.dataset.color.toLowerCase() === state.backgroundColor.toLowerCase();
    button.classList.toggle("active", isActive);
  });
}

function renderPages() {
  refs.previewGrid.innerHTML = "";
  const total = state.pages.length;
  refs.pageMeta.textContent = `共 ${total} 张，点击可逐张保存`;

  state.pages.forEach((page, index) => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const context = canvas.getContext("2d");
    if (page.type === "cover") {
      drawCover(context, page);
    } else {
      drawBody(context, page);
    }

    const card = document.createElement("article");
    card.className = "preview-card";

    const frame = document.createElement("div");
    frame.className = "preview-frame";
    frame.appendChild(canvas);

    const meta = document.createElement("div");
    meta.className = "preview-meta";

    const label = document.createElement("div");
    label.className = "preview-label";
    label.textContent = index === 0 ? "封面页" : `正文第 ${index} 张`;

    const button = document.createElement("button");
    button.className = "card-download";
    button.type = "button";
    button.textContent = "下载 PNG";
    button.addEventListener("click", () => {
      downloadCanvas(canvas, index + 1);
    });

    meta.append(label, button);
    card.append(frame, meta);
    refs.previewGrid.append(card);
  });
}

function buildPages() {
  const rawTitle = refs.titleInput.value;
  const rawArticle = refs.articleInput.value.trim();

  if (!rawArticle) {
    state.pages = [];
    renderEmptyState("请输入正文后再生成。");
    refs.pageMeta.textContent = "缺少正文";
    savePersistedState();
    return;
  }

  const title = normalizeTitle(rawTitle, rawArticle);
  const article = normalizeArticle(rawArticle, title);
  const paragraphs = splitParagraphs(article || rawArticle);
  const meta = buildMetaLine(refs.metaInput.value, article || rawArticle);
  const teaser = buildTeaser(paragraphs);
  const bodyPages = paginateBody(paragraphs, title);

  state.pages = [{ type: "cover", title, meta, teaser }, ...bodyPages];
  renderPages();
  savePersistedState();
}

function loadBackgroundImageFromDataUrl(dataUrl, fileName = "") {
  return new Promise((resolve) => {
    if (!dataUrl) {
      state.backgroundImage = null;
      state.backgroundImageName = "";
      resolve(false);
      return;
    }

    const image = new Image();
    image.onload = () => {
      state.backgroundImage = image;
      state.backgroundImageName = fileName || "已上传背景图";
      resolve(true);
    };
    image.onerror = () => {
      state.backgroundImage = null;
      state.backgroundImageName = "";
      resolve(false);
    };
    image.src = dataUrl;
  });
}

async function initializeFormState() {
  const persisted = loadPersistedState();

  if (!persisted) {
    loadSample();
    refs.backgroundColorInput.value = state.backgroundColor;
    refs.overlayOpacityInput.value = String(Math.round(state.overlayOpacity * 100));
    setBackgroundStatus();
    syncSwatches();
    buildPages();
    return;
  }

  refs.titleInput.value = persisted.title ?? sampleData.title;
  refs.metaInput.value = persisted.meta ?? sampleData.meta;
  refs.articleInput.value = persisted.article ?? sampleData.article;
  state.backgroundColor = persisted.backgroundColor || state.backgroundColor;
  state.overlayOpacity =
    typeof persisted.overlayOpacity === "number" ? persisted.overlayOpacity : state.overlayOpacity;
  refs.backgroundColorInput.value = state.backgroundColor;
  refs.overlayOpacityInput.value = String(Math.round(state.overlayOpacity * 100));

  if (persisted.backgroundImageDataUrl) {
    await loadBackgroundImageFromDataUrl(
      persisted.backgroundImageDataUrl,
      persisted.backgroundImageName || ""
    );
  }

  setBackgroundStatus();
  syncSwatches();
  buildPages();
}

refs.generateButton.addEventListener("click", buildPages);
refs.downloadAllButton.addEventListener("click", downloadAll);
refs.titleInput.addEventListener("input", () => {
  enforceTitleLimit();
  savePersistedState();
});
refs.metaInput.addEventListener("input", savePersistedState);
refs.articleInput.addEventListener("input", savePersistedState);
refs.backgroundColorInput.addEventListener("input", (event) => {
  state.backgroundColor = event.target.value;
  syncSwatches();
  setBackgroundStatus();
  savePersistedState();
  if (state.pages.length > 0) {
    renderPages();
  }
});
refs.backgroundImageInput.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    loadBackgroundImageFromDataUrl(reader.result, file.name).then(() => {
      setBackgroundStatus();
      savePersistedState();
      if (state.pages.length > 0) {
        renderPages();
      }
    });
  };
  reader.readAsDataURL(file);
});
refs.clearBackgroundImageButton.addEventListener("click", () => {
  state.backgroundImage = null;
  state.backgroundImageName = "";
  refs.backgroundImageInput.value = "";
  setBackgroundStatus();
  savePersistedState();
  if (state.pages.length > 0) {
    renderPages();
  }
});
refs.swatchRow.addEventListener("click", (event) => {
  const button = event.target.closest(".swatch-button");
  if (!button) {
    return;
  }

  state.backgroundColor = button.dataset.color;
  refs.backgroundColorInput.value = state.backgroundColor;
  syncSwatches();
  setBackgroundStatus();
  savePersistedState();
  if (state.pages.length > 0) {
    renderPages();
  }
});
refs.overlayOpacityInput.addEventListener("input", (event) => {
  state.overlayOpacity = Number(event.target.value) / 100;
  setBackgroundStatus();
  savePersistedState();
  if (state.pages.length > 0) {
    renderPages();
  }
});

initializeFormState();
