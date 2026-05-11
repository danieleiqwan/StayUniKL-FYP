const fs = require('fs');

const rooms = [];
for (let f = 1; f <= 7; f++) {
    for (let r = 1; r <= 5; r++) {
        rooms.push(`${f}0${r}`);
    }
}

let sql = "USE stayunikl_db;\n\n";
sql += "DELETE FROM maintenance_logs;\n";
sql += "DELETE FROM assets;\n\n";
sql += "INSERT INTO assets (id, name, type, status, location_id, value) VALUES \n";

const assetValues = [];

rooms.forEach(roomId => {
    // 4 Study Desks
    for (let i = 1; i <= 4; i++) {
        assetValues.push(`('AST-${roomId}-DSK-${i}', 'Study Desk', 'Furniture', 'Good', '${roomId}', 150.00)`);
    }
    // 4 Study Chairs
    for (let i = 1; i <= 4; i++) {
        assetValues.push(`('AST-${roomId}-CHR-${i}', 'Study Chair', 'Furniture', 'Good', '${roomId}', 80.00)`);
    }
    // 4 Mattresses
    for (let i = 1; i <= 4; i++) {
        assetValues.push(`('AST-${roomId}-MAT-${i}', 'Mattress', 'Furniture', 'Good', '${roomId}', 120.00)`);
    }
    // 4 Wardrobes
    for (let i = 1; i <= 4; i++) {
        assetValues.push(`('AST-${roomId}-WRD-${i}', 'Wardrobe', 'Furniture', 'Good', '${roomId}', 250.00)`);
    }
    // 1 Ceiling Fan
    assetValues.push(`('AST-${roomId}-FAN', 'Ceiling Fan', 'Fixture', 'Good', '${roomId}', 200.00)`);
    // 1 Air Conditioner
    assetValues.push(`('AST-${roomId}-AC', 'Air Conditioner', 'Appliance', 'Good', '${roomId}', 1200.00)`);
});

sql += assetValues.join(',\n') + ';\n';

fs.writeFileSync('assets_population.sql', sql);
console.log('assets_population.sql generated with ' + assetValues.length + ' assets!');
