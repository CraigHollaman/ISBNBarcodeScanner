// dummy ISBN : 9780552549776   https://www.googleapis.com/books/v1/volumes?q=isbn:9780552549776
const bookArray = []
let bookObj = {}
document.getElementById('isbn_number').onkeypress = function () {
  const value = document.getElementById('isbn_number').value
  if (value.length === 13) {
    renderBook()
  }
}

const getBook = async () => {
  const ISBN = document.getElementById('isbn_number').value
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${ISBN}`
  try {
    const res = await fetch(url)
    return await res.json()
  } catch (error) {
    console.log('Error: ' + error)
  }
}

const upsert = (array, item) => { // (1)
  const i = array.findIndex(_item => _item.ISBN === item.ISBN)
  if (i > -1) array[i].Count = array[i].Count + 1// (2)
  else array.push(item)
}

const renderBook = async () => {
  const book = await getBook()
  const tbodyRef = document.getElementById('bookTable').getElementsByTagName('tbody')[0]
  if (book.items.length > 0) {
    bookObj = {
      Title: book.items[0].volumeInfo.title,
      ISBN: document.getElementById('isbn_number').value,
      Author: book.items[0].volumeInfo.authors[0],
      Count: 1
    }
    upsert(bookArray, bookObj)
    for (let i = document.getElementById('bookTable').rows.length; i > 1; i--) {
      document.getElementById('bookTable').deleteRow(i - 1)
    }
    for (let i = 0; i < bookArray.length; i++) {
      const newRow = tbodyRef.insertRow()
      newRow.insertCell().appendChild(document.createTextNode(`${bookArray[i].Title}`))
      newRow.insertCell().appendChild(document.createTextNode(`${bookArray[i].Author}`))
      newRow.insertCell().appendChild(document.createTextNode(`${bookArray[i].ISBN}`))
      newRow.insertCell().appendChild(document.createTextNode(`${bookArray[i].Count}`))
    }
  }
  resetEverything()
}

const resetEverything = () => {
  document.getElementById('isbn_number').value = ''
  document.getElementById('isbn_number').focus()
}

const downloadCsv = (csv, filename) => {
  const csvFile = new Blob([csv], { type: 'text/csv' })
  const downloadLink = document.createElement('a')
  downloadLink.download = filename
  downloadLink.href = window.URL.createObjectURL(csvFile)
  downloadLink.style.display = 'none'
  document.body.appendChild(downloadLink)
  downloadLink.click()
}

const exportTableToCsv = (html, filename) => {
  const csv = []
  const rows = document.querySelectorAll('table tr')

  for (let i = 0; i < rows.length; i++) {
    const row = []; const cols = rows[i].querySelectorAll('td, th')
    for (let j = 0; j < 5; j++) { row.push(cols[j].innerText) }
    csv.push(row.join(','))
  }
  downloadCsv(csv.join('\n'), filename)
}

document.querySelector('button').addEventListener('click', function () {
  const html = document.querySelector('table').outerHTML
  exportTableToCsv(html, 'Books.csv')
})
