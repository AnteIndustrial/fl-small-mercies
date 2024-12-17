/* eslint-disable */
// @ts-nocheck
'use strict';

export class SortableTable {
    constructor(tableNode) {
        if (!document.getElementById("bone-table-style")) {
            var styles = `table.sortable td,
table.sortable th {
    padding: 0.125em 0.25em;
}

table.sortable th {
    font-weight: bold;
    border-bottom: thin solid #888;
    position: relative;
}

table.sortable th.no-sort {
    padding-top: 0.35em;
}

table.sortable th button {
    padding: 4px;
    margin: 1px;
    font-size: 100%;
    font-weight: bold;
    background: transparent;
    border: none;
    display: inline;
    right: 0;
    left: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    text-align: left;
    outline: none;
    cursor: pointer;
}

    table.sortable th button span {
        position: absolute;
        right: 4px;
    }

table.sortable th[aria-sort="descending"] span::after {
    content: "▼";
    color: currentcolor;
    font-size: 100%;
    top: 0;
}

table.sortable th[aria-sort="ascending"] span::after {
    content: "▲";
    color: currentcolor;
    font-size: 100%;
    top: 0;
}

table.show-unsorted-icon th:not([aria-sort]) button span::after {
    content: "♢";
    color: currentcolor;
    font-size: 100%;
    position: relative;
    top: -3px;
    left: -4px;
}

table.sortable td.num {
    text-align: right;
}

table.sortable tbody tr:nth-child(odd) {
    background-color: #ddd;
}

/* Focus and hover styling */

table.sortable th button:focus,
table.sortable th button:hover {
    padding: 2px;
    border: 2px solid currentcolor;
    background-color: #e5f4ff;
}

    table.sortable th button:focus span,
    table.sortable th button:hover span {
        right: 2px;
    }

table.sortable th:not([aria-sort]) button:focus span::after,
table.sortable th:not([aria-sort]) button:hover span::after {
    content: "▼";
    color: currentcolor;
    font-size: 100%;
    top: 0;
}`;
            var styleSheet = document.createElement("style");
            styleSheet.id = "bone-table-style";
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
        
    this.tableNode = tableNode;

    this.columnHeaders = tableNode.querySelectorAll('thead th');

    this.sortColumns = [];

    for (var i = 0; i < this.columnHeaders.length; i++) {
      var ch = this.columnHeaders[i];
      var buttonNode = ch.querySelector('button');
      if (buttonNode) {
        this.sortColumns.push(i);
        buttonNode.setAttribute('data-column-index', i);
        buttonNode.addEventListener('click', this.handleClick.bind(this));
      }
    }

    this.optionCheckbox = document.querySelector(
      'input[type="checkbox"][value="show-unsorted-icon"]'
    );

    if (this.optionCheckbox) {
      this.optionCheckbox.addEventListener(
        'change',
        this.handleOptionChange.bind(this)
      );
      if (this.optionCheckbox.checked) {
        this.tableNode.classList.add('show-unsorted-icon');
      }
    }
  }

  setColumnHeaderSort(columnIndex) {
    if (typeof columnIndex === 'string') {
      columnIndex = parseInt(columnIndex);
    }

    for (var i = 0; i < this.columnHeaders.length; i++) {
      var ch = this.columnHeaders[i];
      var buttonNode = ch.querySelector('button');
      if (i === columnIndex) {
        var value = ch.getAttribute('aria-sort');
        if (value === 'descending') {
          ch.setAttribute('aria-sort', 'ascending');
          this.sortColumn(
            columnIndex,
            'ascending',
            ch.classList.contains('num')
          );
        } else {
          ch.setAttribute('aria-sort', 'descending');
          this.sortColumn(
            columnIndex,
            'descending',
            ch.classList.contains('num')
          );
        }
      } else {
        if (ch.hasAttribute('aria-sort') && buttonNode) {
          ch.removeAttribute('aria-sort');
        }
      }
    }
  }

  sortColumn(columnIndex, sortValue, isNumber) {
    function compareValues(a, b) {
      if (sortValue === 'ascending') {
        if (a.value === b.value) {
          return 0;
        } else {
          if (isNumber) {
            return a.value - b.value;
          } else {
            return a.value < b.value ? -1 : 1;
          }
        }
      } else {
        if (a.value === b.value) {
          return 0;
        } else {
          if (isNumber) {
            return b.value - a.value;
          } else {
            return a.value > b.value ? -1 : 1;
          }
        }
      }
    }

    if (typeof isNumber !== 'boolean') {
      isNumber = false;
    }

    var tbodyNode = this.tableNode.querySelector('tbody');
    var rowNodes = [];
    var dataCells = [];

    var rowNode = tbodyNode.firstElementChild;

    var index = 0;
    while (rowNode) {
      rowNodes.push(rowNode);
      var rowCells = rowNode.querySelectorAll('th, td');
      var dataCell = rowCells[columnIndex];

      var data = {};
      data.index = index;
      data.value = dataCell.textContent.toLowerCase().trim();
      if (isNumber) {
        data.value = parseFloat(data.value);
      }
      dataCells.push(data);
      rowNode = rowNode.nextElementSibling;
      index += 1;
    }

    dataCells.sort(compareValues);

    // remove rows
    while (tbodyNode.firstChild) {
      tbodyNode.removeChild(tbodyNode.lastChild);
    }

    // add sorted rows
    for (var i = 0; i < dataCells.length; i += 1) {
      tbodyNode.appendChild(rowNodes[dataCells[i].index]);
    }
  }

  /* EVENT HANDLERS */

  handleClick(event) {
    var tgt = event.currentTarget;
    this.setColumnHeaderSort(tgt.getAttribute('data-column-index'));
  }

  handleOptionChange(event) {
    var tgt = event.currentTarget;

    if (tgt.checked) {
      this.tableNode.classList.add('show-unsorted-icon');
    } else {
      this.tableNode.classList.remove('show-unsorted-icon');
    }
  }
}