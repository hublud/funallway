const fs = require('fs');
let data = fs.readFileSync('src/lib/mockData.ts', 'utf8');
// Fix empty gender
data = data.replace(/gender: "",/g, 'gender: "female",'); // I will just assume all female for now, except 1 or 2 I will manually fix to male.
// And make sure one of them is "international"
data = data.replace(/state: "Lagos",\n    bio: "Fashion model and content creator/, 'locationType: "international",\n    state: "United Kingdom",\n    bio: "Fashion model and content creator');
fs.writeFileSync('src/lib/mockData.ts', data);
