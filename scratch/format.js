const fs = require('fs');
const file = 'c:/Users/User/.gemini/antigravity/scratch/stayunikl/docs/use_case_specification.md';
let content = fs.readFileSync(file, 'utf8');

const parts = content.split('## 2. Detailed Use Case Specifications');
const header = parts[0] + '## 2. Detailed Use Case Specifications\n\n';
const rawUseCases = parts[1].split('### ').filter(x => x.trim().length > 0);

let finalHtml = '';

rawUseCases.forEach(uc => {
    const lines = uc.split('\n');
    const titleLine = lines[0].trim();
    const id = titleLine.split(':')[0];
    const name = titleLine.split(': ')[1];
    
    let actor = '-', desc = '-', pre = '-', post = '-', alt = '-', robust = '-';
    let steps = [];
    
    let currentSection = '';
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('*   **Actor:**')) {
            actor = line.replace('*   **Actor:**', '').trim();
        } else if (line.startsWith('*   **Description:**')) {
            desc = line.replace('*   **Description:**', '').trim();
        } else if (line.startsWith('*   **Preconditions:**')) {
            pre = line.replace('*   **Preconditions:**', '').trim();
        } else if (line.startsWith('*   **Postconditions:**')) {
            post = line.replace('*   **Postconditions:**', '').trim();
        } else if (line.startsWith('*   **Alternative Flow') || line.startsWith('*   **Alternate Flow')) {
            alt = line.replace(/\*\s*\*\*Alternative Flow.*?:\*\*\s*/, '').replace(/\*\s*\*\*Alternate Flow.*?:\*\*\s*/, '').trim();
        } else if (line.startsWith('*   **Basic Flow:**')) {
            currentSection = 'steps';
        } else if (currentSection === 'steps') {
            if (line.match(/^\d+\./)) {
                steps.push(line.replace(/^\d+\.\s*/, '').trim());
            } else if (line.startsWith('*')) {
                currentSection = '';
                i--; // re-evaluate
            }
        }
    }

    const rowSpan = steps.length + 3;

    let table = `<table border="1" style="width:100%; border-collapse: collapse; margin-bottom: 2rem;">
  <tr>
    <td style="width:20%;"><strong>Use Case ID</strong></td>
    <td colspan="2">UC_${id.replace('UC', '')}</td>
  </tr>
  <tr>
    <td><strong>Use Case Name</strong></td>
    <td colspan="2">${name}</td>
  </tr>
  <tr>
    <td><strong>Description</strong></td>
    <td colspan="2">${desc}</td>
  </tr>
  <tr>
    <td><strong>Primary Actor</strong></td>
    <td colspan="2">${actor}</td>
  </tr>
  <tr>
    <td><strong>Include use cases</strong></td>
    <td colspan="2">-</td>
  </tr>
  <tr>
    <td><strong>Pre-Condition</strong></td>
    <td colspan="2">${pre}</td>
  </tr>
  <tr>
    <td><strong>Post-Condition</strong></td>
    <td colspan="2">${post}</td>
  </tr>
  <tr>
    <td rowspan="${rowSpan}"><strong>Main Flow</strong></td>
    <td style="width:15%;"><strong>Step</strong></td>
    <td><strong>Action</strong></td>
  </tr>
  <tr>
    <td>Pre-Condition</td>
    <td>${pre}</td>
  </tr>`;

    steps.forEach((step, idx) => {
        table += `\n  <tr>
    <td>1.${idx + 1}</td>
    <td>${step}</td>
  </tr>`;
    });

    table += `\n  <tr>
    <td>Post-Condition</td>
    <td>${post}</td>
  </tr>
  <tr>
    <td><strong>Alternate Flow</strong></td>
    <td colspan="2">${alt !== '-' ? alt : '-'}</td>
  </tr>
  <tr>
    <td><strong>Robust Flow</strong></td>
    <td colspan="2">-</td>
  </tr>
</table>

`;

    finalHtml += table;
});

fs.writeFileSync(file, header + finalHtml);
console.log('Done rendering tables');
