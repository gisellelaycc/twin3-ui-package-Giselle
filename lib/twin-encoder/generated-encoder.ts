export function computeSignalByte(signalId: string, attrKey: string, val: any, uiType: string, optionsStr: string): number {
  if (val === undefined || val === null || val === '') return 0;
  
  if (uiType === 'S') {
    return Math.round(Math.min(Math.max(val / 100, 0), 1) * 255);
  } else if (uiType === '1') {
    
    const opts = optionsStr.split('|').map(o=>o.trim());
    const idx = opts.indexOf(val as string);
    if(idx===-1) return 0;
    if(opts.length >= 5) return [0x00, 0x40, 0x80, 0xC0, 0xFF][Math.min(idx, 4)];
    if(opts.length === 4) return [0x00, 0x55, 0xAA, 0xFF][idx];
    if(opts.length === 3) return [0x20, 0x80, 0xE0][idx];
    if(opts.length === 2) return [0x00, 0xFF][idx];
    return 0;

  } else if (uiType === 'M') {
    
    const opts = optionsStr.split('|').map(o=>o.trim());
    let mask = 0;
    if(Array.isArray(val)) {
        val.forEach(v => {
            const idx = opts.indexOf(v);
            if (idx !== -1) mask |= (1 << idx);
        });
    }
    return mask & 255;

  } else if (uiType === 'R' || attrKey.includes('Hash') || attrKey.includes('Affinity')) {
    
    const s = Array.isArray(val) ? val.sort().join(',') : String(val);
    let h = 0;
    for(let i=0;i<s.length;i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return Math.abs(h) % 256;

  }

  return 0;
}
