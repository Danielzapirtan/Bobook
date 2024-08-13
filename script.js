// Polyfill for Object.values
if (!Object.values) {
  Object.values = function(obj) {
    return Object.keys(obj).map((key) => obj[key]);
  };
}

function notify(message) {
  const consoleContent = document.getElementById("consoleContent");
  consoleContent.innerHTML = `<p>${message}</p>`;
}

let bookList = [];

// Function to convert array of objects to CSV
function convertToCSV(data) {
  const header = Object.keys(data[0]).join(",");
  const rows = data.map((obj) => Object.values(obj || {}).join(","));
  return `${header}\n${rows.join("\n")}`;
}

function saveCSV(data, fileName) {
  try {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    if (navigator.msSaveBlob) {
      // For Internet Explorer
      navigator.msSaveBlob(blob, fileName);
    } else {
      // For other browsers
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.style.display = "none"; // Hide the link
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    notify(`Error in saveCSV: ${error.message}\n`);
  }
}

// Function to export book list to CSV
function saveToCSV() {
  try {
    saveCSV(bookList, "bookList.csv");
  } catch (error) {
    notify(`Error in saveToCSV: ${error.message}\n`);
  }
}

function clearBookList() {
  bookList = [];
  displayBookList();
}

function handleParsedData(parsedData) {
  try {
    // Clear existing bookList
    bookList = [];

    // Add the new data to bookList
    parsedData.forEach((data) => {
      const newBook = {
        bookid: data.bookid || "",
        authors: data.authors || "",
        title: data.title || "", // Handle possible undefined values
        genre: data.genre || "",
        subgenre: data.subgenre || "",
        publisher: data.publisher || "",
        year: data.year || ""
        // Add other properties as needed
      };
      if (newBook.title) {
        bookList.push(newBook);
      }
    });

    displayBookList(); // Display the updated bookList
  } catch (error) {
    notify(`Error in handleParsedData: ${error.message}\n`);
  }
}

function loadFromCSV() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".csv";
  fileInput.addEventListener("change", function() {
    const selectedFile = this.files[0];
    loadCSV(selectedFile, handleParsedData);
  });
  fileInput.click();
}

// Function to parse CSV content
function parseCSV(content) {
  const rows = content.split("\n");
  const header = rows[0].split(",").map((column) => column.trim()); // Trim spaces around column names
  const parsedData = [];

  for (let i = 1; i < rows.length; i++) {
    const columns = rows[i].split(",").map((column) => column.trim()); // Trim spaces around values
    const rowData = {};

    for (let j = 0; j < header.length; j++) {
      rowData[header[j]] = columns[j] || ""; // Handle possible undefined values
    }

    parsedData.push(rowData);
  }

  return parsedData;
}

// Function to load book list from CSV
function loadCSV(file, callback) {
  try {
    if (!(file instanceof Blob)) {
      throw new Error(
        "Invalid file parameter. Please provide a valid File object."
      );
    }
    const reader = new FileReader();
    reader.onload = function(event) {
      const content = event.target.result;
      // Parse CSV content
      const parsedData = parseCSV(content);
      // Debugging: Log parsed data
      callback(parsedData);
    };
    reader.readAsText(file);
  } catch (error) {
    notify(`Error in loadCSV: ${error.message}\n`);
  }
}

// Function to display the book list
function displayBookList() {
  notify("");
  const bookListContainer = document.getElementById("bookList");
  bookListContainer.innerHTML = "";
  let id = 1;

  bookList.forEach((book) => {
    const bookRow = document.createElement("tr");
    bookRow.className = "book-item";

    // Create table cells for each book property
    const idCell = document.createElement("td");
    idCell.innerHTML = `${id}`;
    bookRow.appendChild(idCell);

    const bookidCell = document.createElement("td");
    bookidCell.textContent = book.bookid;
    bookRow.appendChild(bookidCell);

    const authorCell = document.createElement("td");
    authorCell.textContent = book.authors;
    bookRow.appendChild(authorCell);

    const titleCell = document.createElement("td");
    titleCell.innerHTML = book.title;
    bookRow.appendChild(titleCell);

    const genreCell = document.createElement("td");
    genreCell.textContent = book.genre;
    bookRow.appendChild(genreCell);

    const subgenreCell = document.createElement("td");
    subgenreCell.textContent = book.subgenre;
    bookRow.appendChild(subgenreCell);

    const publisherCell = document.createElement("td");
    publisherCell.textContent = book.publisher;
    bookRow.appendChild(publisherCell);

    const yearCell = document.createElement("td");
    yearCell.textContent = book.year;
    bookRow.appendChild(yearCell);

    // Append the table row to the container
    bookListContainer.appendChild(bookRow);
    id++;
  });
  displayLabels();
  // listAuthors();
  // Assuming bookList is an array of book objects with a subgenre field

  const labelList = document.getElementById("labelList");

  labelList.addEventListener("click", function(event) {
    // Check if the clicked element is a list item (label)
    if (event.target.tagName.toLowerCase() === "li") {
      const clickedLabel = event.target.textContent;
      let substring = clickedLabel;
      showSearchForm();
      document.getElementById("substring").value = substring;
      filterResults();
      // You can replace console.log with your desired action on the clicked label
    }
  });
  bookListContainer.addEventListener("click", function(event) {
    let substring = event.target.textContent;
    if (!parseInt(substring)) {
      showSearchForm();
      document.getElementById("substring").value = substring;
      filterResults();
    } else {
      const edit = document.getElementById("edit");
      edit.value = substring;
    }
  });
}

function deleteBook() {
  const edit = document.getElementById("edit");
  if (!edit.value) {
    notify("Vă rugăm apăsați un id de carte în lista de cărți sau în filtru!");
    return;
  }
  let ix = parseInt(edit.value) - 1;
  for (let iy = ix; iy < bookList.length - 1; iy++) {
    [bookList[iy], bookList[iy + 1]] = [bookList[iy + 1], bookList[iy]];
  }
  let removedBook = bookList.pop();
  displayBookList();
  resetForm();
}

function editBook() {
  const edit = document.getElementById("edit");
  if (!edit.value) {
    notify("Vă rugăm apăsați un id de carte în lista de cărți sau în filtru!");
    return;
  }
  let ix = parseInt(edit.value) - 1;
  document.getElementById("bookid").value = bookList[ix].bookid;
  document.getElementById("authors").value = bookList[ix].authors;
  document.getElementById("title").value = bookList[ix].title;
  document.getElementById("genre").value = bookList[ix].genre;
  document.getElementById("subgenre").value = bookList[ix].subgenre;
  document.getElementById("publisher").value = bookList[ix].publisher;
  document.getElementById("year").value = bookList[ix].year;
}

// Function to add a new book
function addBook() {
  const bookidInput = document.getElementById("bookid");
  const authorsInput = document.getElementById("authors");
  const titleInput = document.getElementById("title");
  const genreInput = document.getElementById("genre");
  const subgenreInput = document.getElementById("subgenre");
  const publisherInput = document.getElementById("publisher");
  const yearInput = document.getElementById("year");

  const newBook = {
    bookid: bookidInput.value,
    authors: authorsInput.value,
    title: titleInput.value,
    genre: genreInput.value,
    subgenre: subgenreInput.value,
    publisher: publisherInput.value,
    year: yearInput.value
    // Add other properties as needed
  };

  bookList.push(newBook);
  const edit = document.getElementById("edit");
  if (edit.value) {
    let ix = parseInt(edit.value) - 1;
    for (let iy = bookList.length - 1; iy > ix; iy--) {
      [bookList[iy], bookList[iy - 1]] = [bookList[iy - 1], bookList[iy]];
    }
  }
  displayBookList();
  resetForm();
}

function deleteLastBook() {
  let removedBook = bookList.pop();
  displayBookList();
}

function shiftBookList() {
  bookList = bookList.slice(1).concat(bookList[0]);
  displayBookList();
}

function swapBooks() {
  let book0 = bookList.pop();
  let book1 = bookList.pop();
  bookList.push(book0);
  bookList.push(book1);
  displayBookList();
}

function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivotIndex = partition(arr, low, high);
    quickSort(arr, low, pivotIndex - 1); // Sort left subarray
    quickSort(arr, pivotIndex + 1, high); // Sort right subarray
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high].authors;
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j].authors <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]; // Put pivot in its final place
  return i + 1;
}

function sortBookList() {
  quickSort(bookList);
  displayBookList();
}

// Function to reset the form after adding a book
function resetForm() {
  const bookForm = document.getElementById("bookForm");
  bookForm.reset();
}

// Initial display of the book list
displayBookList();

function showSearchForm() {
  document.getElementById("search-form").classList.remove("hidden");
}

function filterResults() {
  const substring = document.getElementById("substring").value;
  // Update the content in the filter-container div
  const filterContainer = document.getElementById("filterContainer");
  filterContainer.innerHTML = "";
  let id = 0;
  const bookTable = document.createElement("table");
  bookTable.className = "book-table";

  bookList.forEach((book) => {
    id++;
    if (
      book.bookid.includes(substring) ||
      book.authors.includes(substring) ||
      book.title.includes(substring) ||
      book.genre.includes(substring) ||
      book.subgenre.includes(substring) ||
      book.publisher.includes(substring) ||
      book.year.includes(substring)
    ) {
      const bookRow = document.createElement("tr");
      bookRow.className = "book-item";

      // Create table cells for each book property
      const idCell = document.createElement("td");
      idCell.textContent = `${id}`;
      bookRow.appendChild(idCell);

      const bookidCell = document.createElement("td");
      bookidCell.textContent = book.bookid;
      bookRow.appendChild(bookidCell);

      const authorsCell = document.createElement("td");
      authorsCell.textContent = book.authors;
      bookRow.appendChild(authorsCell);

      const titleCell = document.createElement("td");
      titleCell.innerHTML = book.title;
      bookRow.appendChild(titleCell);

      const genreCell = document.createElement("td");
      genreCell.textContent = book.genre;
      bookRow.appendChild(genreCell);

      const subgenreCell = document.createElement("td");
      subgenreCell.textContent = book.subgenre;
      bookRow.appendChild(subgenreCell);

      const publisherCell = document.createElement("td");
      publisherCell.textContent = book.publisher;
      bookRow.appendChild(publisherCell);

      const yearCell = document.createElement("td");
      yearCell.textContent = book.year;
      bookRow.appendChild(yearCell);

      // Append the table row to the container
      bookTable.appendChild(bookRow);
    }
  });
  filterContainer.appendChild(bookTable);
  filterContainer.addEventListener("click", function(event) {
    let substring = event.target.textContent;
    if (!parseInt(substring)) {
      showSearchForm();
      document.getElementById("substring").value = substring;
    } else {
      const edit = document.getElementById("edit");
      edit.value = substring;
    }
  });
}

function closeSearchForm() {
  const filterContainer = document.getElementById("filterContainer");
  filterContainer.innerHTML = "";
  const searchForm = document.getElementById("search-form");
  //searchForm.reset();
  searchForm.classList.add("hidden");
}

function deleteFilterBooks() {
  const substring = document.getElementById("substring").value;
  let id = 0;
  let bookList1 = [];
  bookList.forEach((book) => {
    id++;
    let delFlag = 0;
    if (
      book.bookid.includes(substring) ||
      book.authors.includes(substring) ||
      book.title.includes(substring) ||
      book.genre.includes(substring) ||
      book.subgenre.includes(substring) ||
      book.publisher.includes(substring) ||
      book.year.includes(substring)
    ) {
      delFlag = 1;
    }
    if (delFlag == 0) {
      bookList1.push(bookList[id - 1]);
    }
  });
  bookList = bookList1;
  closeSearchForm();
  displayBookList();
}

function displayLabels() {
  // Get references to the details element and the list element
  const labelDetails = document.getElementById("labelDetails");
  const labelList = document.getElementById("labelList");
  labelList.innerHTML = "";
  // Replace this with your actual logic to fetch labels
  // Assuming bookList is an array of book objects with a subgenre field

  const labelSet = new Set(); // Use Set to store unique values efficiently

  bookList.forEach(book => {
    if (book.subgenre) {
      labelSet.add(book.subgenre); // Add unique subgenre values to the Set
    }
  });

  // Convert the Set to an array (optional)
  const labels = Array.from(labelSet);
  //labelSet.destroy();
  labels.sort();
  //const labels = ["Label 1", "Label 2", "Label 3"];
  // Add each label to the list
  labels.forEach(label => {
    const labelElement = createLabel(label);
    labelList.appendChild(labelElement);
  });

}

// Function to create a new label element
function createLabel(labelText) {
  const newLabel = document.createElement("li");
  newLabel.textContent = labelText;
  return newLabel;
}
const letterSelect = document.getElementById("letterSelect");
const authorList = document.getElementById("authorList");

// Generate letter options (A-Z) dynamically
for (let i = 65; i <= 90; i++) { // Use char codes for A-Z
  addLetterOption(String.fromCharCode(i));
}

// Add event listener to the dropdown
letterSelect.addEventListener("change", function() {
  updateAuthorList(this.value);
});

// Function to create and add a new option element
function addLetterOption(letter) {
  const newOption = document.createElement("option");
  newOption.value = letter;
  newOption.text = letter;
  letterSelect.appendChild(newOption);
}

function updateAuthorList(selectedLetter) {
  let authorsSet = getAuthorsByFirstLetter(selectedLetter);
  let authorsArray = Array.from(authorsSet);
  //authorsSet.destroy();
  authorsArray.sort();

  // Update author list content
  authorList.innerHTML = "";
  for (let i = 0; i < authorsArray.length; i++) {
    authorList.innerHTML += `<a href="#">${authorsArray[i]}</a><br>`;
  }

  // Add event listener to each author link
  const authorLinks = authorList.querySelectorAll("a");
  authorLinks.forEach(link => {
    link.addEventListener("click", function(event) {
      event.preventDefault(); // Prevent default link behavior
      const clickedAuthor = this.textContent; // Get clicked author name
      notify(`Clicked Author: ${clickedAuthor}`); // Your notification function
      let substring = clickedAuthor;
      showSearchForm();
      document.getElementById("substring").value = substring;
      filterResults();
    });
  });
}

function getAuthorsByFirstLetter(letter) {
  const authorSet = new Set();

  // Check if the letter is valid (A-Z)
  if (letter.length !== 1 || letter.toUpperCase() < "A" || letter.toUpperCase() > "Z") {
    notify("Invalid letter provided. Please use a capital letter (A-Z).");
    return authorSet; // Return empty set if invalid letter
  }

  bookList.forEach(book => {
    if (book.authors) { // Check if book has authors field
      if (book.authors.charAt(0).toUpperCase() === letter) {
        authorSet.add(book.authors);
      }
    }
  });


  return authorSet;
}

function localStorageSave() {
  localStorage.setItem('bookList', JSON.stringify(bookList));
  notify('bookList saved to localStorage');
}

function localStorageLoad() {
  let value = localStorage.getItem('bookList');
  if (value === null) {
    loadFromCSV();
    localStorageSave();
  } else {
    bookList = JSON.parse(value);
  }
  displayBookList();
  notify('bookList loaded from localStorage');
}

localStorageLoad();
