document.addEventListener("DOMContentLoaded", () => {
  const data = window.CONFERENCE_CONTENT;

  if (!data) {
    console.error("找不到 content.js");
    return;
  }

  document.getElementById("page-title").textContent = data.pageTitle;
  document.querySelector(".notice-tag").textContent = data.noticeTitle;

  const accordion = document.getElementById("accordion");

  data.sections.forEach((section, index) => {
    const details = document.createElement("details");
    const summary = document.createElement("summary");

    const number = document.createElement("span");
    number.className = "number";
    number.textContent = String(index + 1).padStart(2, "0");

    const title = document.createElement("span");
    title.className = "section-title";
    title.textContent = section.title;

    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.setAttribute("aria-hidden", "true");

    summary.append(number, title, arrow);
    details.appendChild(summary);

    const content = document.createElement("div");
    content.className = "content";

    if (section.type === "schedule") {
      content.appendChild(buildSchedule(section));
    } else {
      content.appendChild(buildList(section.items));

      if (section.media?.type === "image") {
        content.appendChild(buildImageThumbnail(section.media));
      }
    }

    details.appendChild(content);
    accordion.appendChild(details);
  });

  const detailsItems = accordion.querySelectorAll("details");

  detailsItems.forEach(item => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      detailsItems.forEach(otherItem => {
        if (otherItem !== item) otherItem.open = false;
      });
    });
  });

  createImageModal();
});

function buildList(items) {
  const list = document.createElement("ol");

  items.forEach(lines => {
    const item = document.createElement("li");

    lines.forEach((line, index) => {
      const text = document.createElement("div");
      text.className = "item-line";

      if (index > 0) {
        text.classList.add("item-subline");
      }

      appendRichText(text, line);
      item.appendChild(text);
    });

    list.appendChild(item);
  });

  return list;
}

function appendRichText(container, value) {
  if (typeof value === "string") {
    container.textContent = value;
    return;
  }

  if (value && Array.isArray(value.parts)) {
    value.parts.forEach(part => {
      const span = document.createElement("span");
      span.textContent = part.text || "";

      if (part.red) {
        span.classList.add("text-red");
      }

      if (part.bold) {
        span.classList.add("text-bold");
      }

      container.appendChild(span);
    });
    return;
  }

  container.textContent = "";
}

function buildSchedule(section) {
  const wrapper = document.createElement("div");
  wrapper.className = "schedule-days";

  section.days.forEach(day => {
    const dayBlock = document.createElement("section");
    dayBlock.className = "schedule-day";

    const dayTitle = document.createElement("div");
    dayTitle.className = "schedule-day-title";

    const date = document.createElement("strong");
    date.textContent = day.date;

    const weekday = document.createElement("span");
    weekday.textContent = day.weekday;

    dayTitle.append(date, weekday);
    dayBlock.appendChild(dayTitle);

    const table = document.createElement("table");
    table.className = "schedule-table";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["時間", "行程"].forEach(header => {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    day.rows.forEach(row => {
      const tr = document.createElement("tr");

      const timeCell = document.createElement("td");
      timeCell.className = "time-cell";
      timeCell.textContent = row.time;

      const eventCell = document.createElement("td");
      eventCell.className = "event-cell";
      appendScheduleContent(eventCell, row.event);

      tr.append(timeCell, eventCell);
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    dayBlock.appendChild(table);
    wrapper.appendChild(dayBlock);
  });

  return wrapper;
}

function appendScheduleContent(cell, value) {
  const values = Array.isArray(value) ? value : [value];

  values.forEach((lineValue, index) => {
    const line = document.createElement("div");

    if (index > 0) {
      line.className = "schedule-note";
    }

    appendRichText(line, lineValue);
    cell.appendChild(line);
  });
}

function buildImageThumbnail(media) {
  const wrapper = document.createElement("div");
  wrapper.className = "section-image";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "image-thumb-button";
  button.setAttribute("aria-label", `${media.caption || media.alt || "查看圖片"}，點選放大`);

  const image = document.createElement("img");
  image.className = "image-thumb";
  image.src = media.src;
  image.alt = media.alt || "";
  image.loading = "lazy";

  const caption = document.createElement("span");
  caption.className = "image-thumb-caption";

  const captionText = document.createElement("span");
  captionText.textContent = media.caption || "點選放大";

  const icon = document.createElement("span");
  icon.className = "image-thumb-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "＋";

  caption.append(captionText, icon);
  button.append(image, caption);
  wrapper.appendChild(button);

  button.addEventListener("click", () => {
    openImageModal(media.src, media.alt || media.caption || "圖片");
  });

  return wrapper;
}


let imageModalState = {
  zoom: 1,
  min: 0.5,
  max: 4,
  step: 0.25
};


function createImageModal() {
  if (document.getElementById("image-modal")) return;

  const modal = document.createElement("div");
  modal.id = "image-modal";
  modal.className = "image-modal";
  modal.setAttribute("aria-hidden", "true");

  modal.innerHTML = `
    <div class="image-modal-backdrop" data-image-close></div>

    <div class="image-modal-dialog" role="dialog" aria-modal="true" aria-label="圖片預覽">
      <div class="image-modal-toolbar">
        <div class="image-modal-title">圖片預覽</div>

        <div class="image-modal-actions">
          <button type="button" class="image-tool-button" data-image-zoom-out aria-label="縮小">−</button>
          <button type="button" class="image-tool-button image-zoom-value" data-image-reset aria-label="恢復原始縮放">100%</button>
          <button type="button" class="image-tool-button" data-image-zoom-in aria-label="放大">＋</button>
          <button type="button" class="image-tool-button image-close-button" data-image-close aria-label="關閉">×</button>
        </div>
      </div>

      <div class="image-modal-viewer">
        <img class="image-modal-image" alt="">
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelectorAll("[data-image-close]").forEach(button => {
    button.addEventListener("click", closeImageModal);
  });

  modal.querySelector("[data-image-zoom-in]").addEventListener("click", () => {
    setImageZoom(imageModalState.zoom + imageModalState.step);
  });

  modal.querySelector("[data-image-zoom-out]").addEventListener("click", () => {
    setImageZoom(imageModalState.zoom - imageModalState.step);
  });

  modal.querySelector("[data-image-reset]").addEventListener("click", () => {
    setImageZoom(1);
    modal.querySelector(".image-modal-viewer").scrollTo({ top: 0, left: 0 });
  });

  const viewer = modal.querySelector(".image-modal-viewer");

  viewer.addEventListener("wheel", event => {
    if (!modal.classList.contains("is-open")) return;

    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    setImageZoom(imageModalState.zoom + direction * imageModalState.step);
  }, { passive: false });

  document.addEventListener("keydown", event => {
    if (!modal.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeImageModal();
    } else if (event.key === "+" || event.key === "=") {
      setImageZoom(imageModalState.zoom + imageModalState.step);
    } else if (event.key === "-") {
      setImageZoom(imageModalState.zoom - imageModalState.step);
    } else if (event.key === "0") {
      setImageZoom(1);
    }
  });
}


function openImageModal(src, alt) {
  const modal = document.getElementById("image-modal");
  if (!modal) return;

  const image = modal.querySelector(".image-modal-image");
  const viewer = modal.querySelector(".image-modal-viewer");

  image.src = src;
  image.alt = alt || "";
  imageModalState.zoom = 1;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  setImageZoom(1);
  viewer.scrollTo({ top: 0, left: 0 });
}


function closeImageModal() {
  const modal = document.getElementById("image-modal");
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}


function setImageZoom(value) {
  const modal = document.getElementById("image-modal");
  if (!modal) return;

  const zoom = Math.min(
    imageModalState.max,
    Math.max(imageModalState.min, value)
  );

  imageModalState.zoom = Math.round(zoom * 100) / 100;

  const image = modal.querySelector(".image-modal-image");
  const zoomValue = modal.querySelector(".image-zoom-value");

  image.style.width = `${imageModalState.zoom * 100}%`;
  zoomValue.textContent = `${Math.round(imageModalState.zoom * 100)}%`;
}

