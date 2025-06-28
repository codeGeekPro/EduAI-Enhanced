// IndexedDB pour EduAI Enhanced
const dbName = "EduAI_DB";
const dbVersion = 1;

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("user_data")) {
                db.createObjectStore("user_data", { keyPath: "id" });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function saveData(storeName, data) {
    return openDatabase().then((db) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        store.put(data);
    });
}

function getData(storeName, id) {
    return openDatabase().then((db) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        return store.get(id);
    });
}

export { openDatabase, saveData, getData };
