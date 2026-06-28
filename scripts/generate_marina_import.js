// Generates database/004_import_csv_marinas.sql from database/marinas_com_south_florida.csv
// Run: node scripts/generate_marina_import.js

const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "../database/marinas_com_south_florida.csv");
const outPath = path.join(__dirname, "../database/004_import_csv_marinas.sql");

const lines = fs.readFileSync(csvPath, "utf8").split("\n").filter(Boolean);
const header = lines[0].split("|");
const rows = lines.slice(1);

function col(row, name) {
  return row[header.indexOf(name)] ?? "";
}

function sqlStr(val) {
  if (!val || val.trim() === "") return "NULL";
  return `'${val.replace(/'/g, "''").trim()}'`;
}

function sqlNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? "NULL" : n.toString();
}

function parseAmenities(val) {
  if (!val || val.trim() === "") return "'{}'";
  const items = val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/'/g, "''"));
  return `ARRAY[${items.map((i) => `'${i}'`).join(", ")}]`;
}

const inserts = rows.map((line) => {
  const row = line.split("|");
  const name = col(row, "name");
  if (!name.trim()) return null;

  const address = col(row, "street");
  const city = col(row, "city");
  const state = col(row, "state");
  const zip = col(row, "zip");
  const phone = col(row, "phone");
  const website = col(row, "website");
  const lat = col(row, "lat");
  const lon = col(row, "lon");
  const amenities = col(row, "amenities");

  return `INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES (${sqlStr(name)}, ${sqlStr(address)}, ${sqlStr(city)}, ${sqlStr(state)}, ${sqlStr(zip)}, ${sqlStr(phone)}, ${sqlStr(website)}, ${sqlNum(lat)}, ${sqlNum(lon)}, ${parseAmenities(amenities)}, FALSE, 'csv_import')
ON CONFLICT DO NOTHING;`;
});

const validInserts = inserts.filter(Boolean);

const sql = `-- EasyDock v1.2 - CSV Marina Import
-- Run AFTER database/003_marina_claim_flow.sql
-- Imports ${validInserts.length} unclaimed marinas from marinas.com South Florida dataset
-- All records: owner_id = NULL (unclaimed), is_active = FALSE, source = 'csv_import'

${validInserts.join("\n\n")}
`;

fs.writeFileSync(outPath, sql, "utf8");
console.log(`Wrote ${validInserts.length} INSERT statements to ${outPath}`);
