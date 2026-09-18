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

      if (index > 0) text.classList.add("item-subline");

      text.textContent = line;
      item.appendChild(text);
    });

    list.appendChild(item);
  });

  return list;
}

function buildSchedule(section) {
  const wrapper = document.createElement("div");
  wrapper.className = "schedule-wrapper";

  const table = document.createElement("table");
  table.className = "schedule-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  section.headers.forEach(header => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  section.rows.forEach(row => {
    const tr = document.createElement("tr");

    tr.appendChild(createScheduleCell(row.time, "time-cell"));
    tr.appendChild(createScheduleCell(row.saturday, "saturday-cell"));
    tr.appendChild(createScheduleCell(row.sunday, "sunday-cell"));

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);

  return wrapper;
}

function createScheduleCell(value, className) {
  const cell = document.createElement("td");
  cell.className = className;

  if (!value) {
    cell.innerHTML = "&nbsp;";
    return cell;
  }

  const values = Array.isArray(value) ? value : [value];

  values.forEach((text, index) => {
    const line = document.createElement("div");

    if (index > 0) line.className = "schedule-note";

    line.textContent = text;
    cell.appendChild(line);
  });

  return cell;
}
