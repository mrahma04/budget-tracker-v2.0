let db

// version number 1
const request = indexedDB.open('budget_tracker', 1)

// assign the db variable and create a ObjectStore
// ObjectStore === table in SQL === collection in MongoDB
// this events fires first and then moves to either 'onsuccess' or 'onerror'
request.onupgradeneeded = function (event) {
    const db = event.target.result
    db.createObjectStore('new_transaction', { autoIncrement: true })
}

// assign the db variable on successful connection
request.onsuccess = function (event) {
    db = event.target.result

    // if the app is online then upload all transactions stored in IndexedDB
    if (navigator.onLine) {
        uploadTransaction()
    }
}

// if the request is unsuccessful
request.onerror = function (event) {
    console.log(event.target.errorCode)
}

// this function will execute when app is offline
function saveRecord(record) {
    // open a transaction with the database with rw permissions
    // IndexedDB does not maintain a persistent connection to the DB
    // it has to open a new transaction for every (or bundle of) operation(s)
    const transaction = db.transaction(['new_transaction'], 'readwrite')

    // access the ObjectStore/Collection/Table
    const transactionObjectStore = transaction.objectStore('new_transaction')
    // add record to the ObjectStore/Collection/Table with the add method
    transactionObjectStore.add(record)
}

function uploadTransaction() {
    // open a transaction on your db
    const transaction = db.transaction(['new_transaction'], 'readwrite')

    // access object store
    const transactionObjectstore = transaction.objectStore('new_transaction')

    // get all records from store and set to a variable
    const getAll = transactionObjectstore.getAll()

    // call 'onsuccess' method on getAll
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse)
                    }
                    // open one more transaction
                    const transaction = db.transaction(['new_transaction'], 'readwrite')
                    // access the 'new_transaction' object store
                    const transactionObjectStore = transaction.objectStore('new_transaction')
                    // clear all items in your store
                    transactionObjectStore.clear()

                    alert('All saved transactions has been submitted!')
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }
}

window.addEventListener('online', uploadTransaction)