// Static adapter for a MESL URL profile. Rules are updated separately by Mihomo.
// No network calls, logging, credentials, DNS, TUN, or existing selection changes.
const main = (config) => {
  const provider = 'user-bulk';
  const group = '大文件下载';
  const url = 'https://raw.githubusercontent.com/yyj1186688023/network-rules/main/shared-rules.yaml';
  if (!config || !Array.isArray(config.proxies) || !Array.isArray(config['proxy-groups']) || !Array.isArray(config.rules)) {
    throw new Error('Expected the original MESL proxy, group, and rule lists');
  }
  const names = new Set(config.proxies.map(p => p.name).concat(config['proxy-groups'].map(p => p.name)));
  const candidates = ['🇯🇵 日本 01 [0.3X]', '🇯🇵 日本 02', 'MESL'];
  if (!candidates.every(name => names.has(name))) {
    throw new Error('MESL node names changed; adapter needs review');
  }
  config['rule-providers'] = config['rule-providers'] || {};
  const old = config['rule-providers'][provider];
  if (old && old.url !== url) throw new Error('Provider name already used');
  const existing = config['proxy-groups'].find(p => p.name === group);
  if (existing && (existing.type !== 'select' || JSON.stringify(existing.proxies) !== JSON.stringify(candidates))) {
    throw new Error('Group name already used');
  }
  config['rule-providers'][provider] = {
    type: 'http', behavior: 'classical', format: 'yaml',
    path: './rule-providers/user-bulk.yaml', url, interval: 86400, proxy: 'MESL'
  };
  if (!existing) config['proxy-groups'].push({name: group, type: 'select', proxies: candidates});
  const rule = 'RULE-SET,' + provider + ',' + group;
  config.rules = [rule].concat(config.rules.filter(r => r !== rule));
  return config;
};
