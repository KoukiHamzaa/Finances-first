const fs = require('fs');

const CACHE_KEY_PREFIX = 'intigo_nid_';
const isValidName = (name) => {
   if (!name || typeof name !== 'string') return false;
   const t = name.trim().toLowerCase();
   if (!t) return false;
   const invalid = ["منتج بدون اسم","منتج غير معروف","بدون اسم","غير معروف","unknown","n/a","na","-","—"];
   return !invalid.includes(t);
};

console.log(isValidName(""));
console.log(isValidName("Colis"));
console.log(isValidName("منتج بدون اسم"));

