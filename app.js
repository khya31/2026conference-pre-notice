document.addEventListener(
  "DOMContentLoaded",
  () => {

    const data =
      window.CONFERENCE_CONTENT;


    if (!data) {

      console.error(
        "找不到 content.js 的內容"
      );

      return;
    }



    /* ========================================
       標題
    ======================================== */

    const pageTitle =
      document.getElementById(
        "page-title"
      );


    const noticeTag =
      document.querySelector(
        ".notice-tag"
      );


    if (pageTitle) {

      pageTitle.textContent =
        data.pageTitle;

    }


    if (noticeTag) {

      noticeTag.textContent =
        data.noticeTitle;

    }



    /* ========================================
       Accordion
    ======================================== */

    const accordion =
      document.getElementById(
        "accordion"
      );


    data.sections.forEach(
      (section, index) => {

        const details =
          document.createElement(
            "details"
          );


        /*
         * 進入頁面時
         * 全部維持收合
         */

        details.open = false;



        /* ------------------------------------
           標題列
        ------------------------------------ */

        const summary =
          document.createElement(
            "summary"
          );


        const number =
          document.createElement(
            "span"
          );


        number.className =
          "number";


        number.textContent =
          String(index + 1)
            .padStart(2, "0");


        const title =
          document.createElement(
            "span"
          );


        title.className =
          "section-title";


        title.textContent =
          section.title;


        const arrow =
          document.createElement(
            "span"
          );


        arrow.className =
          "arrow";


        arrow.setAttribute(
          "aria-hidden",
          "true"
        );


        summary.append(
          number,
          title,
          arrow
        );


        details.appendChild(
          summary
        );



        /* ------------------------------------
           內容
        ------------------------------------ */

        const content =
          document.createElement(
            "div"
          );


        content.className =
          "content";


        if (
          section.type ===
          "schedule"
        ) {

          content.appendChild(
            buildSchedule(
              section
            )
          );

        }

        else {

          content.appendChild(
            buildList(
              section.items
            )
          );

        }


        details.appendChild(
          content
        );


        accordion.appendChild(
          details
        );

      }
    );



    /* ========================================
       一次只展開一項
    ======================================== */

    const detailsItems =
      accordion.querySelectorAll(
        "details"
      );


    detailsItems.forEach(
      (item) => {

        item.addEventListener(
          "toggle",
          () => {

            if (!item.open) {
              return;
            }


            detailsItems.forEach(
              (otherItem) => {

                if (
                  otherItem !== item
                ) {

                  otherItem.open = false;

                }

              }
            );

          }
        );

      }
    );

  }
);



/* ==========================================
   建立一般文字項目
========================================== */

function buildList(items) {

  const list =
    document.createElement(
      "ol"
    );


  items.forEach(
    (lines) => {

      const item =
        document.createElement(
          "li"
        );


      lines.forEach(
        (line, index) => {

          const paragraph =
            document.createElement(
              "div"
            );


          paragraph.className =
            "item-line";


          if (index > 0) {

            paragraph.classList.add(
              "item-subline"
            );

          }


          paragraph.textContent =
            line;


          item.appendChild(
            paragraph
          );

        }
      );


      list.appendChild(
        item
      );

    }
  );


  return list;
}



/* ==========================================
   建立時間表
========================================== */

function buildSchedule(section) {

  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "schedule-wrapper";


  const table =
    document.createElement(
      "table"
    );


  table.className =
    "schedule-table";


  /* ----------------------------------------
     表頭
  ---------------------------------------- */

  const thead =
    document.createElement(
      "thead"
    );


  const headerRow =
    document.createElement(
      "tr"
    );


  section.headers.forEach(
    (header) => {

      const th =
        document.createElement(
          "th"
        );


      th.textContent =
        header;


      headerRow.appendChild(
        th
      );

    }
  );


  thead.appendChild(
    headerRow
  );


  table.appendChild(
    thead
  );



  /* ----------------------------------------
     內容
  ---------------------------------------- */

  const tbody =
    document.createElement(
      "tbody"
    );


  /*
   * mergedUntil：
   * 用來追蹤目前是否仍在 rowspan 裡。
   */

  let saturdayMergedUntil = -1;

  let sundayMergedUntil = -1;


  section.rows.forEach(
    (row, rowIndex) => {

      const tr =
        document.createElement(
          "tr"
        );


      /* 時間 */

      const timeCell =
        document.createElement(
          "td"
        );


      timeCell.className =
        "time-cell";


      timeCell.textContent =
        row.time;


      tr.appendChild(
        timeCell
      );



      /* ==============================
         10/3 週六
      ============================== */

      if (
        rowIndex >
        saturdayMergedUntil
      ) {

        const saturdayCell =
          document.createElement(
            "td"
          );


        saturdayCell.className =
          "saturday-cell";


        appendCellContent(
          saturdayCell,
          row.saturday
        );


        if (
          row.saturdaySpan &&
          row.saturdaySpan > 1
        ) {

          saturdayCell.rowSpan =
            row.saturdaySpan;


          saturdayMergedUntil =
            rowIndex +
            row.saturdaySpan -
            1;

        }


        tr.appendChild(
          saturdayCell
        );

      }



      /* ==============================
         10/4 主日
      ============================== */

      if (
        rowIndex >
        sundayMergedUntil
      ) {

        const sundayCell =
          document.createElement(
            "td"
          );


        sundayCell.className =
          "sunday-cell";


        appendCellContent(
          sundayCell,
          row.sunday
        );


        if (
          row.sundaySpan &&
          row.sundaySpan > 1
        ) {

          sundayCell.rowSpan =
            row.sundaySpan;


          sundayMergedUntil =
            rowIndex +
            row.sundaySpan -
            1;

        }


        tr.appendChild(
          sundayCell
        );

      }


      tbody.appendChild(
        tr
      );

    }
  );


  table.appendChild(
    tbody
  );


  wrapper.appendChild(
    table
  );


  return wrapper;
}



/* ==========================================
   儲存格內多行文字
========================================== */

function appendCellContent(
  cell,
  value
) {

  if (!value) {

    cell.innerHTML = "&nbsp;";

    return;
  }


  const values =
    Array.isArray(value)
      ? value
      : [value];


  values.forEach(
    (text, index) => {

      const line =
        document.createElement(
          "div"
        );


      line.textContent =
        text;


      if (index > 0) {

        line.className =
          "schedule-note";

      }


      cell.appendChild(
        line
      );

    }
  );

}
