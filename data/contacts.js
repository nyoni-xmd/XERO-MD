// data/contacts.js - XERO-MD Contact Storage
const fs = require('fs');
const path = require('path');

const CONTACTS_FILE = path.join(__dirname, 'contacts.json');

// Ensure contacts file exists
if (!fs.existsSync(CONTACTS_FILE)) {
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify({}, null, 2));
}

// ========== GET ALL CONTACTS ==========
function getContacts() {
    try {
        const data = fs.readFileSync(CONTACTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

// ========== SAVE CONTACT ==========
function saveContact(jid, name) {
    const contacts = getContacts();
    contacts[jid] = {
        name: name,
        savedAt: new Date().toISOString()
    };
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
    return true;
}

// ========== GET CONTACT BY JID ==========
function getContact(jid) {
    const contacts = getContacts();
    return contacts[jid] || null;
}

// ========== GET CONTACT BY NAME ==========
function getContactByName(name) {
    const contacts = getContacts();
    for (const [jid, data] of Object.entries(contacts)) {
        if (data.name.toLowerCase() === name.toLowerCase()) {
            return { jid, ...data };
        }
    }
    return null;
}

// ========== GET ALL SAVED NAMES ==========
function getAllContacts() {
    return getContacts();
}

// ========== DELETE CONTACT ==========
function deleteContact(jid) {
    const contacts = getContacts();
    if (contacts[jid]) {
        delete contacts[jid];
        fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
        return true;
    }
    return false;
}

module.exports = {
    getContacts,
    saveContact,
    getContact,
    getContactByName,
    getAllContacts,
    deleteContact
};
