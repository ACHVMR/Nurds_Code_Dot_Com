// Utilities to turn agent objects (matching src/schemas/agentSchema.json)
// into CSV or JSONL for exports.

function escapeCsv(value){
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n')){
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function keysFromSchema(){
  // Order fields for CSV export
  return [
    'agentName','prefix','framework','type','persona','backstory','goals','skills','prompts','training_sources','evaluation_metrics','tags','notes','created_by','created_at'
  ];
}

function arrayToCsvField(arr){
  if (!arr) return '';
  if (Array.isArray(arr)) return arr.map(a => String(a)).join(' | ');
  return String(arr);
}

function objectToCsvField(obj){
  if (!obj) return '';
  try {
    return JSON.stringify(obj);
  } catch(e){
    return String(obj);
  }
}

function generateAgentCSV(agents){
  // agents: array of agent objects
  const keys = keysFromSchema();
  const header = keys.join(',') + '\n';
  const lines = agents.map(agent => {
    const row = keys.map(k => {
      const v = agent[k];
      if (k === 'goals' || k === 'skills' || k === 'training_sources' || k === 'evaluation_metrics' || k === 'tags'){
        return escapeCsv(arrayToCsvField(v));
      }
      if (k === 'prompts' || k === 'demographics'){
        return escapeCsv(objectToCsvField(v));
      }
      return escapeCsv(v);
    });
    return row.join(',');
  });
  return header + lines.join('\n');
}

function generateAgentJSONL(agents){
  return agents.map(a => JSON.stringify(a)).join('\n');
}

function downloadBlob(filename, content, mime='text/csv'){
  const blob = new Blob([content], { type: mime + ';charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export { generateAgentCSV, generateAgentJSONL, downloadBlob };
