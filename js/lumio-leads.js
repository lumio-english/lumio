/*!
 * Lumio Leads — prospective students who took the placement test but
 * aren't enrolled yet. Separate from lumio-profiles.js on purpose: a lead
 * is not a roster student and can't log into the gamified dashboard —
 * it's just contact info + a suggested level for the teacher to follow
 * up on and, if they choose, convert into a real roster student.
 *
 * Storage (this device only, unless synced):
 *   localStorage["lumio_leads_v1"] = {
 *     leads: [{
 *       id, name, phone, age,
 *       suggestedLevel, testScore, testTotal,
 *       status,      // "new" | "contacted" | "enrolled" | "dismissed"
 *       notes,
 *       createdAt, updatedAt
 *     }],
 *     updatedAt
 *   }
 *
 * ---- Syncing ----
 * Shares the same sync config as lumio-profiles.js / lumio-schedule.js
 * (localStorage["lumio_sync_cfg_v1"]). syncNow() here:
 *   POST <url>?action=pushLeads   body: { leads }
 *   GET  <url>?action=pullLeads   expects: { leads }
 * Same additive, updatedAt-based merge as the other modules — a lead
 * edited on one device (e.g. marked "contacted") won't get silently
 * reverted by a sync from another device.
 */
(function (global) {
  "use strict";

  const LEADS_KEY = "lumio_leads_v1";
  const SYNC_KEY = "lumio_sync_cfg_v1"; // same key the other modules use

  const memory = {};
  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return memory[key] || null; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { memory[key] = val; }
  }

  function load() {
    let data;
    try { data = JSON.parse(safeGet(LEADS_KEY) || "null"); } catch (e) { data = null; }
    if (!data || typeof data !== "object") data = {};
    if (!Array.isArray(data.leads)) data.leads = [];
    return data;
  }
  function save(data) {
    data.updatedAt = new Date().toISOString();
    safeSet(LEADS_KEY, JSON.stringify(data));
    return data;
  }
  function genId() {
    return "lead_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function listLeads(filter) {
    filter = filter || {};
    let out = load().leads.slice();
    if (filter.status) out = out.filter(l => l.status === filter.status);
    out.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return out;
  }
  function getLead(id) {
    return load().leads.find(l => l.id === id) || null;
  }
  function addLead({ name, phone, age, suggestedLevel, testScore, testTotal } = {}) {
    name = (name || "").trim();
    phone = (phone || "").trim();
    if (!name) throw new Error("Name is required.");
    if (!phone) throw new Error("Phone number is required.");
    const data = load();
    const record = {
      id: genId(),
      name,
      phone,
      age: age ? Number(age) : null,
      suggestedLevel: suggestedLevel || null,
      testScore: typeof testScore === "number" ? testScore : null,
      testTotal: typeof testTotal === "number" ? testTotal : null,
      status: "new",
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.leads.push(record);
    save(data);
    return record;
  }
  function updateLead(id, patch) {
    const data = load();
    const l = data.leads.find(x => x.id === id);
    if (!l) throw new Error("Lead not found.");
    ["name", "phone", "status", "notes", "suggestedLevel"].forEach(k => {
      if (patch[k] !== undefined) l[k] = patch[k];
    });
    if (patch.age !== undefined) l.age = patch.age ? Number(patch.age) : null;
    l.updatedAt = new Date().toISOString();
    save(data);
    return l;
  }
  function removeLead(id) {
    const data = load();
    data.leads = data.leads.filter(l => l.id !== id);
    save(data);
  }
  function countNew() {
    return load().leads.filter(l => l.status === "new").length;
  }

  // ---- sync ----
  function getSyncConfig() {
    try { return JSON.parse(safeGet(SYNC_KEY) || "null") || { url: "", enabled: false }; }
    catch (e) { return { url: "", enabled: false }; }
  }
  // Same "whoever edited more recently wins" rule as the other modules —
  // e.g. marking a lead "contacted" on one device shouldn't get quietly
  // undone by a sync from a device that hadn't seen that update yet.
  function mergeById(localList, remoteList) {
    const byId = {};
    localList.forEach(r => { byId[r.id] = r; });
    remoteList.forEach(r => {
      const local = byId[r.id];
      if (!local) { byId[r.id] = r; return; }
      const localTime = local.updatedAt ? Date.parse(local.updatedAt) : 0;
      const remoteTime = r.updatedAt ? Date.parse(r.updatedAt) : 0;
      byId[r.id] = localTime > remoteTime ? local : r;
    });
    return Object.values(byId);
  }
  async function syncNow() {
    const cfg = getSyncConfig();
    if (!cfg.enabled || !cfg.url) return { ok: false, reason: "not-configured" };
    const data = load();
    try {
      const res = await fetch(cfg.url + "?action=pullLeads");
      const remote = await res.json();
      if (remote && Array.isArray(remote.leads)) {
        data.leads = mergeById(data.leads, remote.leads);
        save(data);
      }
      await fetch(cfg.url + "?action=pushLeads", {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids a CORS preflight against Apps Script
        body: JSON.stringify({ leads: data.leads }),
      });
      return { ok: true, at: new Date().toISOString() };
    } catch (e) {
      return { ok: false, reason: "network", error: e && e.message };
    }
  }

  global.LumioLeads = {
    listLeads, getLead, addLead, updateLead, removeLead, countNew,
    getSyncConfig, syncNow,
  };
})(window);
