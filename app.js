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
