/*!
 * Lumio Backup — export/import everything this site keeps in localStorage
 * as one downloadable JSON file. This is deliberately generic: it grabs
 * every key on this origin (not just roster/schedule) so it also protects
 * whatever js/app.js stores for lesson progress, even though this file
 * doesn't know that data's internal shape.
 *
 * Use:
 *   LumioBackup.downloadBackup()          // triggers a .json file download
 *   LumioBackup.restoreFromFile(fileObj)  // reads a File and restores it
 *   LumioBackup.restoreFromObject(obj)    // restores an already-parsed object
 */
(function (global) {
  "use strict";

  const FORMAT_VERSION = 1;

  function safeKeys() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
      return keys;
    } catch (e) {
      return [];
    }
  }

  function snapshot() {
    const data = {};
    safeKeys().forEach(key => {
      try { data[key] = localStorage.getItem(key); } catch (e) { /* skip unreadable key */ }
    });
    return {
      app: "lumio-english",
      formatVersion: FORMAT_VERSION,
      exportedAt: new Date().toISOString(),
      data,
    };
  }

  function downloadBackup(filename) {
    const payload = snapshot();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `lumio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return payload;
  }

  function restoreFromObject(obj) {
    if (!obj || typeof obj !== "object" || !obj.data || typeof obj.data !== "object") {
      throw new Error("That doesn't look like a Lumio backup file.");
    }
    let restored = 0;
    Object.keys(obj.data).forEach(key => {
      try {
        localStorage.setItem(key, obj.data[key]);
        restored++;
      } catch (e) { /* skip key that can't be written */ }
    });
    return { restored, exportedAt: obj.exportedAt || null };
  }

  function restoreFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) { reject(new Error("No file selected.")); return; }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const obj = JSON.parse(reader.result);
          resolve(restoreFromObject(obj));
        } catch (e) {
          reject(new Error("Couldn't read that file — is it a Lumio backup .json?"));
        }
      };
      reader.onerror = () => reject(new Error("Couldn't read that file."));
      reader.readAsText(file);
    });
  }

  global.LumioBackup = { snapshot, downloadBackup, restoreFromObject, restoreFromFile };
})(window);
